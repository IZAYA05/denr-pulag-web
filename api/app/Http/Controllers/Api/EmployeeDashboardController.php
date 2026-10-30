<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PackageBooking;
use App\Models\Reservation;
use App\Models\Trail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EmployeeDashboardController extends Controller
{
    /**
     * Return the employee dashboard summary.
     */
    public function dashboard(): JsonResponse
    {
        $today = Carbon::today();

        $todayReservations = Reservation::query()
            ->whereDate('hiking_date', $today)
            ->withCount('participants')
            ->get();

        $todayPackageBookings = PackageBooking::query()
            ->whereDate('hiking_date', $today)
            ->withCount('tourists')
            ->get();

        $pendingDirect = Reservation::where('status', 'PENDING')->count();

        $pendingPackages = PackageBooking::where('status', 'PENDING')->count();

        $confirmedDirectVisitors = $todayReservations
            ->where('status', 'APPROVED')
            ->sum('participants_count');

        $confirmedPackageVisitors = $todayPackageBookings
            ->where('status', 'APPROVED')
            ->sum('tourists_count');

        return response()->json([
            'date' => $today->toDateString(),
            'pending_direct_reservations' => $pendingDirect,
            'pending_package_bookings' => $pendingPackages,
            'pending_bookings' => $pendingDirect + $pendingPackages,
            'confirmed_visitors_today' =>
                $confirmedDirectVisitors + $confirmedPackageVisitors,
            'trails' => [
                'active' => Trail::where('is_active', true)->count(),
                'inactive' => Trail::where('is_active', false)->count(),
            ],
        ]);
    }

    /**
     * Return direct reservations and package bookings for employees.
     */
    public function bookings(): JsonResponse
    {
        $reservations = Reservation::query()
            ->with(['user', 'trail', 'participants'])
            ->latest()
            ->get()
            ->map(fn (Reservation $reservation) => [
                'id' => $reservation->id,
                'type' => 'DIRECT',
                'booking_number' => $reservation->reservation_number,
                'group_leader_name' => $reservation->group_leader_name,
                'phone' => $reservation->group_leader_phone,
                'hiking_date' => $reservation->hiking_date,
                'total_visitors' => $reservation->participants->count(),
                'status' => $reservation->status,
                'remarks' => $reservation->remarks,
                'trail' => $reservation->trail,
                'user' => $reservation->user,
                'visitors' => $reservation->participants,
            ]);

        $packageBookings = PackageBooking::query()
            ->with([
                'package.organizer',
                'package.services',
                'customer',
                'trail',
                'tourists',
            ])
            ->latest()
            ->get()
            ->map(fn (PackageBooking $booking) => [
                'id' => $booking->id,
                'type' => 'PACKAGE',
                'booking_number' => $booking->booking_number,
                'hiking_date' => $booking->hiking_date,
                'total_visitors' => $booking->tourists->count(),
                'status' => $booking->status,
                'coordination_status' => $booking->coordination_status,
                'remarks' => $booking->remarks,
                'trail' => $booking->trail,
                'customer' => $booking->customer,
                'package' => $booking->package,
                'visitors' => $booking->tourists,
            ]);

        return response()->json([
            'direct_reservations' => $reservations->values(),
            'package_bookings' => $packageBookings->values(),
        ]);
    }

    /**
     * Return visitor records from direct and package bookings.
     */
    public function visitors(): JsonResponse
    {
        $directVisitors = Reservation::query()
            ->with(['trail', 'participants'])
            ->latest()
            ->get()
            ->flatMap(function (Reservation $reservation) {
                return $reservation->participants->map(fn ($visitor) => [
                    'id' => $visitor->id,
                    'source' => 'DIRECT',
                    'booking_id' => $reservation->id,
                    'booking_number' => $reservation->reservation_number,
                    'hiking_date' => $reservation->hiking_date,
                    'booking_status' => $reservation->status,
                    'trail' => $reservation->trail?->name,
                    'full_name' => $visitor->full_name,
                    'age' => $visitor->age,
                    'gender' => $visitor->gender,
                    'nationality' => $visitor->nationality,
                    'contact_number' => $visitor->contact_number,
                    'address' => $visitor->address,
                    'emergency_contact' => $visitor->emergency_contact,
                    'emergency_number' => $visitor->emergency_number,
                ]);
            });

        $packageVisitors = PackageBooking::query()
            ->with(['trail', 'tourists'])
            ->latest()
            ->get()
            ->flatMap(function (PackageBooking $booking) {
                return $booking->tourists->map(fn ($visitor) => [
                    'id' => $visitor->id,
                    'source' => 'PACKAGE',
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                    'hiking_date' => $booking->hiking_date,
                    'booking_status' => $booking->status,
                    'trail' => $booking->trail?->name,
                    'full_name' => $visitor->full_name,
                    'age' => $visitor->age,
                    'gender' => $visitor->gender,
                    'nationality' => $visitor->nationality,
                    'contact_number' => $visitor->contact_number,
                    'address' => $visitor->address,
                    'emergency_contact' => $visitor->emergency_contact,
                    'emergency_number' => $visitor->emergency_number,
                ]);
            });

        return response()->json([
            'visitors' => $directVisitors
                ->concat($packageVisitors)
                ->values(),
        ]);
    }

    /**
     * Return daily confirmed visitor totals for a requested date.
     */
    public function reports(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $date = Carbon::parse($validated['date'] ?? now()->toDateString())
            ->toDateString();

        $directReservations = Reservation::query()
            ->whereDate('hiking_date', $date)
            ->withCount('participants')
            ->get();

        $packageBookings = PackageBooking::query()
            ->whereDate('hiking_date', $date)
            ->withCount('tourists')
            ->get();

        $approvedDirect = $directReservations
            ->where('status', 'APPROVED');

        $approvedPackages = $packageBookings
            ->where('status', 'APPROVED');

        return response()->json([
            'date' => $date,
            'direct_reservations' => [
                'total' => $directReservations->count(),
                'pending' => $directReservations
                    ->where('status', 'PENDING')->count(),
                'approved' => $approvedDirect->count(),
                'rejected' => $directReservations
                    ->where('status', 'REJECTED')->count(),
                'confirmed_visitors' => $approvedDirect
                    ->sum('participants_count'),
            ],
            'package_bookings' => [
                'total' => $packageBookings->count(),
                'pending' => $packageBookings
                    ->where('status', 'PENDING')->count(),
                'approved' => $approvedPackages->count(),
                'rejected' => $packageBookings
                    ->where('status', 'REJECTED')->count(),
                'confirmed_visitors' => $approvedPackages
                    ->sum('tourists_count'),
            ],
            'confirmed_visitors' =>
                $approvedDirect->sum('participants_count')
                + $approvedPackages->sum('tourists_count'),
        ]);
    }

    /**
     * Return trail details and capacity configuration.
     */
    public function trails(): JsonResponse
    {
        return response()->json([
            'trails' => Trail::query()
                ->withCount([
                    'reservations as approved_reservations_count' => fn ($query) =>
                        $query->where('status', 'APPROVED'),
                    'packageBookings as approved_package_bookings_count' => fn ($query) =>
                        $query->where('status', 'APPROVED'),
                ])
                ->orderBy('name')
                ->get(),
        ]);
    }
}
