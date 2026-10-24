<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizerPackage;
use App\Models\PackageBooking;
use App\Models\Reservation;
use App\Models\Trail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PackageBookingController extends Controller
{
    /**
     * Display package bookings for the authenticated user.
     *
     * ORGANIZER:
     * Shows bookings made through the organizer's packages.
     *
     * USER:
     * Shows package bookings made by the authenticated customer.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = PackageBooking::with([
            'package.organizer:id,first_name,last_name,email',
            'package.services',
            'customer:id,first_name,last_name,email',
            'trail:id,name',
            'tourists',
        ]);

        if ($user->role === 'ORGANIZER') {
            $query->whereHas('package', function ($packageQuery) use ($user) {
                $packageQuery->where('organizer_id', $user->id);
            });
        } else {
            $query->where('customer_id', $user->id);
        }

        $bookings = $query->latest()->get();

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    /**
     * Display one package booking accessible to the authenticated user.
     */
    public function show(
        Request $request,
        PackageBooking $packageBooking
    ): JsonResponse {
        $user = $request->user();

        $packageBooking->load([
            'package.organizer:id,first_name,last_name,email',
            'package.services',
            'customer:id,first_name,last_name,email',
            'trail:id,name',
            'tourists',
        ]);

        $isOrganizer =
            $user->role === 'ORGANIZER' &&
            $packageBooking->package?->organizer_id === $user->id;

        $isCustomer =
            $packageBooking->customer_id === $user->id;

        if (!$isOrganizer && !$isCustomer) {
            return response()->json([
                'message' => 'Package booking not found.',
            ], 404);
        }

        return response()->json([
            'booking' => $packageBooking,
        ]);
    }

    /**
     * Create a new package booking.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => [
                'required',
                'integer',
                'exists:organizer_packages,id',
            ],
            'trail_id' => [
                'required',
                'integer',
                'exists:trails,id',
            ],
            'hiking_date' => [
                'required',
                'date',
            ],
            'tourist_count' => [
                'required',
                'integer',
                'min:1',
                'max:12',
            ],
            'remarks' => [
                'nullable',
                'string',
            ],
            'tourists' => [
                'required',
                'array',
                'min:1',
                'max:12',
            ],
            'tourists.*.full_name' => [
                'required',
                'string',
                'max:255',
            ],
            'tourists.*.age' => [
                'required',
                'integer',
                'min:1',
                'max:150',
            ],
            'tourists.*.gender' => [
                'required',
                'string',
                'max:50',
            ],
            'tourists.*.nationality' => [
                'required',
                'string',
                'max:255',
            ],
            'tourists.*.contact_number' => [
                'nullable',
                'string',
                'max:50',
            ],
            'tourists.*.address' => [
                'nullable',
                'string',
            ],
            'tourists.*.emergency_contact' => [
                'required',
                'string',
                'max:255',
            ],
            'tourists.*.emergency_number' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        $package = OrganizerPackage::with([
            'services',
        ])->findOrFail($validated['package_id']);

        if ($package->status !== 'ACTIVE') {
            return response()->json([
                'message' => 'This package is currently inactive.',
            ], 422);
        }

        if ($validated['tourist_count'] > $package->max_tourists) {
            return response()->json([
                'message' =>
                    'The number of tourists exceeds the maximum allowed for this package.',
            ], 422);
        }

        if (count($validated['tourists']) !== $validated['tourist_count']) {
            return response()->json([
                'message' =>
                    'Tourist count does not match the number of tourist records submitted.',
            ], 422);
        }

        if ($validated['tourist_count'] > 12) {
            return response()->json([
                'message' =>
                    'A package booking cannot exceed 12 tourists.',
            ], 422);
        }

        $trail = Trail::findOrFail($validated['trail_id']);

        if (!$trail->is_active) {
            return response()->json([
                'message' => 'The selected trail is inactive.',
            ], 422);
        }

        $hikingDate = $validated['hiking_date'];
        $today = now()->startOfDay();
        $maximumBookingDate = now()->addMonth()->endOfDay();

        if ($hikingDate < $today->toDateString()) {
            return response()->json([
                'message' => 'The hiking date cannot be earlier than today.',
            ], 422);
        }

        if ($hikingDate > $maximumBookingDate->toDateString()) {
            return response()->json([
                'message' =>
                    'Bookings can only be made up to one month in advance.',
            ], 422);
        }

        /*
         * Capacity is shared between:
         * 1. Direct DENR reservations
         * 2. Organizer package bookings
         *
         * Maximum capacity is 500 visitors per hiking date.
         */
        $directReservationCount = Reservation::query()
            ->whereDate('hiking_date', $hikingDate)
            ->whereNotIn('status', [
                'CANCELLED',
                'REJECTED',
            ])
            ->sum('total_participants');

        $packageBookingCount = PackageBooking::query()
            ->whereDate('hiking_date', $hikingDate)
            ->whereNotIn('status', [
                'CANCELLED',
                'REJECTED',
            ])
            ->sum('tourist_count');

        $currentCapacity =
            $directReservationCount + $packageBookingCount;

        $maximumCapacity = 500;

        if (
            $currentCapacity + $validated['tourist_count'] >
            $maximumCapacity
        ) {
            $remainingCapacity = max(
                0,
                $maximumCapacity - $currentCapacity
            );

            return response()->json([
                'message' =>
                    'The selected hiking date has insufficient visitor capacity.',
                'current_capacity' => $currentCapacity,
                'maximum_capacity' => $maximumCapacity,
                'remaining_capacity' => $remainingCapacity,
            ], 422);
        }

        $booking = DB::transaction(function () use (
            $validated,
            $request
        ) {
            $bookingNumber = $this->generateBookingNumber();

            $booking = PackageBooking::create([
                'booking_number' => $bookingNumber,
                'package_id' => $validated['package_id'],
                'customer_id' => $request->user()->id,
                'trail_id' => $validated['trail_id'],
                'hiking_date' => $validated['hiking_date'],
                'tourist_count' => $validated['tourist_count'],
                'status' => 'PENDING',
                'coordination_status' => 'NOT_COORDINATED',
                'remarks' => $validated['remarks'] ?? null,
            ]);

            foreach ($validated['tourists'] as $tourist) {
                $booking->tourists()->create([
                    'full_name' => $tourist['full_name'],
                    'age' => $tourist['age'],
                    'gender' => $tourist['gender'],
                    'nationality' => $tourist['nationality'],
                    'contact_number' => $tourist['contact_number'] ?? null,
                    'address' => $tourist['address'] ?? null,
                    'emergency_contact' => $tourist['emergency_contact'],
                    'emergency_number' => $tourist['emergency_number'],
                ]);
            }

            return $booking;
        });

        $booking->load([
            'package.organizer:id,first_name,last_name,email',
            'package.services',
            'customer:id,first_name,last_name,email',
            'trail:id,name',
            'tourists',
        ]);

        return response()->json([
            'message' => 'Package booking created successfully.',
            'booking' => $booking,
        ], 201);
    }

    /**
     * Update DENR coordination status for an organizer's package booking.
     */
    public function updateCoordination(
        Request $request,
        PackageBooking $packageBooking
    ): JsonResponse {
        $user = $request->user();

        if ($user->role !== 'ORGANIZER') {
            return response()->json([
                'message' => 'Package booking not found.',
            ], 404);
        }

        $ownsBooking = $packageBooking->package()
            ->where('organizer_id', $user->id)
            ->exists();

        if (!$ownsBooking) {
            return response()->json([
                'message' => 'Package booking not found.',
            ], 404);
        }

        $validated = $request->validate([
            'coordination_status' => [
                'required',
                'string',
                'in:NOT_COORDINATED,PENDING,COORDINATED',
            ],
        ]);

        $packageBooking->update([
            'coordination_status' => $validated['coordination_status'],
        ]);

        $packageBooking->load([
            'package.services',
            'trail',
            'tourists',
        ]);

        return response()->json([
            'message' => 'DENR coordination status updated successfully.',
            'booking' => $packageBooking,
        ]);
    }

    /**
     * Cancel a package booking.
     */
    public function destroy(
        Request $request,
        PackageBooking $packageBooking
    ): JsonResponse {
        if ($packageBooking->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Package booking not found.',
            ], 404);
        }

        if (
            in_array(
                $packageBooking->status,
                ['CANCELLED', 'COMPLETED'],
                true
            )
        ) {
            return response()->json([
                'message' =>
                    'This package booking can no longer be cancelled.',
            ], 422);
        }

        $packageBooking->update([
            'status' => 'CANCELLED',
        ]);

        return response()->json([
            'message' => 'Package booking cancelled successfully.',
            'booking' => $packageBooking->fresh([
                'package',
                'trail',
                'tourists',
            ]),
        ]);
    }

    /**
     * Generate a unique package booking number.
     */
    private function generateBookingNumber(): string
    {
        $year = now()->year;

        $latestBooking = PackageBooking::query()
            ->where('booking_number', 'like', "PB-{$year}-%")
            ->latest('id')
            ->first();

        if (!$latestBooking) {
            $nextNumber = 1;
        } else {
            $parts = explode('-', $latestBooking->booking_number);
            $nextNumber = ((int) end($parts)) + 1;
        }

        do {
            $bookingNumber = sprintf(
                'PB-%d-%04d',
                $year,
                $nextNumber
            );

            $exists = PackageBooking::query()
                ->where('booking_number', $bookingNumber)
                ->exists();

            if ($exists) {
                $nextNumber++;
            }
        } while ($exists);

        return $bookingNumber;
    }
}
