<?php

namespace App\Services;

use App\Models\BlockedDate;
use App\Models\PackageBooking;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonPeriod;
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
        $lockRecord = DB::table('booking_capacity_locks')
            ->where('id', 1)
            ->lockForUpdate()
            ->first();

        if (!$lockRecord) {
            throw new RuntimeException(
                'The booking capacity lock record is missing. Run the pending database migrations.'
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

        $blockedDate = BlockedDate::query()
            ->whereDate('date', $date)
            ->first(['date', 'reason']);

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
            'is_blocked' => $blockedDate !== null,
            'blocked_reason' => $blockedDate?->reason,
        ];
    }


    /**
     * Return capacity and DENR availability for every date in a range.
     * Aggregate queries keep the calendar request efficient.
     */
    public function getRangeSummary(string $from, string $to): array
    {
        $directTotals = Reservation::query()
            ->selectRaw('hiking_date, SUM(total_participants) as visitor_total')
            ->whereBetween('hiking_date', [$from, $to])
            ->whereNotIn('status', ['CANCELLED', 'REJECTED'])
            ->groupBy('hiking_date')
            ->pluck('visitor_total', 'hiking_date');

        $packageTotals = PackageBooking::query()
            ->selectRaw('hiking_date, SUM(tourist_count) as visitor_total')
            ->whereBetween('hiking_date', [$from, $to])
            ->whereNotIn('status', ['CANCELLED', 'REJECTED'])
            ->where(function ($query) {
                $query->whereNull('denr_status')
                    ->orWhere('denr_status', '!=', 'REJECTED');
            })
            ->groupBy('hiking_date')
            ->pluck('visitor_total', 'hiking_date');

        $blockedDates = BlockedDate::query()
            ->whereBetween('date', [$from, $to])
            ->get(['date', 'reason'])
            ->keyBy(fn (BlockedDate $blockedDate) => $blockedDate->date->format('Y-m-d'));

        $availability = [];

        foreach (CarbonPeriod::create($from, $to) as $day) {
            $date = $day->format('Y-m-d');
            $currentCapacity = (int) ($directTotals[$date] ?? 0)
                + (int) ($packageTotals[$date] ?? 0);
            $remainingCapacity = max(0, self::MAXIMUM_CAPACITY - $currentCapacity);
            $blockedDate = $blockedDates->get($date);

            $availability[] = [
                'date' => $date,
                'current_capacity' => $currentCapacity,
                'maximum_capacity' => self::MAXIMUM_CAPACITY,
                'remaining_capacity' => $remainingCapacity,
                'is_full' => $remainingCapacity === 0,
                'is_blocked' => $blockedDate !== null,
                'blocked_reason' => $blockedDate?->reason,
                'is_available' => $blockedDate === null && $remainingCapacity > 0,
            ];
        }

        return $availability;
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

        return !$summary['is_blocked'] && (
            $summary['current_capacity'] + $requestedVisitors
        ) <= self::MAXIMUM_CAPACITY;
    }
}
