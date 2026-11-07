<?php

namespace App\Services;

use App\Models\PackageBooking;
use App\Models\Reservation;
use App\Models\Trail;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BookingCapacityService
{
    public const MAXIMUM_CAPACITY = 500;

    /**
     * Serialize capacity-changing booking requests.
     *
     * Call this inside an active database transaction.
     * Both direct reservations and package bookings use
     * the same lock record.
     */
    public function lockForCapacityCheck(): void
    {
        $lockRecord = Trail::query()
            ->orderBy('id')
            ->lockForUpdate()
            ->first();

        if (!$lockRecord) {
            throw new RuntimeException(
                'No trail record is available for booking capacity checks.'
            );
        }
    }

    /**
     * Calculate shared visitor capacity for a hiking date.
     *
     * Pending and approved bookings reserve capacity.
     * Cancelled and rejected bookings do not.
     */
    public function getSummary(string $date): array
    {
        $directReservations = Reservation::query()
            ->whereDate('hiking_date', $date)
            ->whereNotIn('status', [
                'CANCELLED',
                'REJECTED',
            ])
            ->sum('total_participants');

        $packageBookings = PackageBooking::query()
            ->whereDate('hiking_date', $date)
            ->whereNotIn('status', [
                'CANCELLED',
                'REJECTED',
            ])
            ->where(function ($query) {
                $query
                    ->whereNull('denr_status')
                    ->orWhere('denr_status', '!=', 'REJECTED');
            })
            ->sum('tourist_count');

        $currentCapacity =
            (int) $directReservations +
            (int) $packageBookings;

        $remainingCapacity = max(
            0,
            self::MAXIMUM_CAPACITY - $currentCapacity
        );

        return [
            'date' => $date,
            'current_capacity' => $currentCapacity,
            'maximum_capacity' => self::MAXIMUM_CAPACITY,
            'remaining_capacity' => $remainingCapacity,
            'is_full' => $remainingCapacity === 0,
        ];
    }

    /**
     * Determine whether a requested group fits within
     * the remaining daily park capacity.
     */
    public function canAccommodate(
        string $date,
        int $requestedVisitors
    ): bool {
        $summary = $this->getSummary($date);

        return (
            $summary['current_capacity'] + $requestedVisitors
        ) <= self::MAXIMUM_CAPACITY;
    }
}
