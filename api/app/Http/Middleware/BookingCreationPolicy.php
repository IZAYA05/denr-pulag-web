<?php

namespace App\Http\Middleware;

use App\Services\BookingCapacityService;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class BookingCreationPolicy
{
    public function __construct(
        private BookingCapacityService $capacityService
    ) {
    }

    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $action = $request->route()?->getActionName() ?? '';

        $isDirectReservation = str_contains(
            $action,
            'ReservationController@store'
        );

        $isPackageBooking = str_contains(
            $action,
            'PackageBookingController@store'
        );

        if (!$isDirectReservation && !$isPackageBooking) {
            return $next($request);
        }

        $dateInput = $request->input('hiking_date');

        if (!is_string($dateInput) || trim($dateInput) === '') {
            return $next($request);
        }

        try {
            $hikingDate = Carbon::parse($dateInput, 'Asia/Manila')->startOfDay();
        } catch (\Throwable) {
            // Let the controller's normal date validation handle invalid input.
            return $next($request);
        }

        $minimumDate = Carbon::today('Asia/Manila')->addDays(30);

        if ($hikingDate->lt($minimumDate)) {
            return response()->json([
                'message' =>
                    'Hiking dates must be at least 30 days from today.',
                'minimum_hiking_date' => $minimumDate->toDateString(),
            ], 422);
        }

        $requestedVisitors = $isDirectReservation
            ? (
                is_array($request->input('participants'))
                    ? count($request->input('participants'))
                    : 0
            )
            : (int) $request->input('tourist_count', 0);

        if ($requestedVisitors < 1) {
            // Let the controller validate missing or invalid visitor records.
            return $next($request);
        }

        return DB::transaction(function () use (
            $request,
            $next,
            $hikingDate,
            $requestedVisitors
        ) {
            // Both booking types acquire the same database row lock.
            $this->capacityService->lockForCapacityCheck();

            $summary = $this->capacityService->getSummary(
                $hikingDate->toDateString()
            );

            if (
                $summary['current_capacity'] + $requestedVisitors >
                BookingCapacityService::MAXIMUM_CAPACITY
            ) {
                return response()->json([
                    'message' =>
                        'The selected hiking date does not have enough remaining visitor capacity.',
                    'date' => $summary['date'],
                    'current_capacity' => $summary['current_capacity'],
                    'maximum_capacity' => $summary['maximum_capacity'],
                    'remaining_capacity' => $summary['remaining_capacity'],
                    'requested_visitors' => $requestedVisitors,
                ], 422);
            }

            // Keep the lock until the controller finishes creating the booking.
            return $next($request);
        });
    }
}
