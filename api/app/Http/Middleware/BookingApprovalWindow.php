<?php

namespace App\Http\Middleware;

use App\Models\PackageBooking;
use App\Models\Reservation;
use Carbon\Carbon;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BookingApprovalWindow
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $action = $request->route()?->getActionName() ?? '';

        $booking = null;

        // Direct reservation: DENR approval.
        if (
            str_contains($action, 'ReservationController@updateStatus') &&
            strtoupper((string) $request->input('status')) === 'APPROVED'
        ) {
            $booking = $this->findRouteModel(
                $request,
                'reservation',
                Reservation::class
            );
        }

        // Package booking: Organizer approval.
        elseif (
            str_contains($action, 'PackageBookingController@updateStatus') &&
            strtoupper((string) $request->input('status')) === 'APPROVED'
        ) {
            $booking = $this->findRouteModel(
                $request,
                'packageBooking',
                PackageBooking::class
            );
        }

        // Package booking: final DENR approval.
        elseif (
            str_contains($action, 'PackageBookingController@updateDenrStatus') &&
            strtoupper((string) $request->input('denr_status')) === 'APPROVED'
        ) {
            $booking = $this->findRouteModel(
                $request,
                'packageBooking',
                PackageBooking::class
            );
        }

        // Rejections do not require the 30-day approval window.
        if (!$booking) {
            return $next($request);
        }

        $hikingDate = Carbon::parse($booking->hiking_date, 'Asia/Manila')->startOfDay();

        $minimumDate = Carbon::today('Asia/Manila')->addDays(30);

        if ($hikingDate->lt($minimumDate)) {
            return response()->json([
                'message' =>
                    'This booking cannot be approved because the hiking date must be at least 30 days away at the time of approval.',
                'hiking_date' => $hikingDate->toDateString(),
                'minimum_hiking_date' => $minimumDate->toDateString(),
            ], 422);
        }

        return $next($request);
    }

    private function findRouteModel(
        Request $request,
        string $parameter,
        string $modelClass
    ): ?Model {
        $routeValue = $request->route($parameter);

        if ($routeValue instanceof Model) {
            return $routeValue;
        }

        if (!$routeValue) {
            return null;
        }

        return $modelClass::query()->find($routeValue);
    }
}
