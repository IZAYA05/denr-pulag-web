<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizerPackage;
use App\Models\PackageBooking;
use App\Models\Reservation;
use App\Models\Trail;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

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
     * Display all package bookings for ADMIN and EMPLOYEE review.
     *
     * This endpoint is protected by the role:ADMIN,EMPLOYEE route middleware.
     * It intentionally does not apply the customer or organizer ownership
     * filters used by the regular package booking index.
     */
    public function adminIndex(): JsonResponse
    {
        $bookings = PackageBooking::with([
            'package.organizer:id,first_name,last_name,email',
            'package.services',
            'customer:id,first_name,last_name,email',
            'trail:id,name',
            'tourists',
        ])
            ->latest()
            ->get();

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
     *
     * Every submitted booking receives its own independent
     * Organizer and DENR approval workflow.
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

        if ($hikingDate < $today->toDateString()) {
            return response()->json([
                'message' => 'The hiking date cannot be earlier than today.',
            ], 422);
        }


        /*
         * Create booking and tourist records
         * inside a database transaction.
         */

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

                // Stage 1: Organizer review.
                'status' => 'PENDING',

                // Stage 2 has not started yet.
                'denr_status' => null,

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

        /*
         * Notify the package organizer after successful booking creation.
         */

        $customerName = trim(
            ($booking->customer?->first_name ?? '') . ' ' .
            ($booking->customer?->last_name ?? '')
        );

        $this->notifySafely(
            $booking->package?->organizer,
            new SystemNotification(
                'New Package Booking',
                "{$customerName} submitted a booking for {$booking->package?->name}.",
                'package_booking',
                null,
                [
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                    'customer_id' => $booking->customer_id,
                    'package_id' => $booking->package_id,
                    'package_name' => $booking->package?->name,
                    'hiking_date' => $booking->hiking_date,
                    'tourist_count' => $booking->tourist_count,
                    'status' => 'PENDING',
                    'denr_status' => null,
                ]
            )
        );

        return response()->json([
            'message' => 'Package booking created successfully.',
            'booking' => $booking,
        ], 201);
    }

    /**
     * Stage 1:
     * Organizer approves or rejects an individual Tourist booking.
     *
     * Only the Organizer who owns the package can perform this action.
     */
    public function updateStatus(
        Request $request,
        PackageBooking $packageBooking
    ): JsonResponse {
        $user = $request->user();

        if ($user->role !== 'ORGANIZER') {
            return response()->json([
                'message' => 'Package booking not found.',
            ], 404);
        }

        // Verify that the Organizer owns this package.
        $ownsBooking = $packageBooking->package()
            ->where('organizer_id', $user->id)
            ->exists();

        if (!$ownsBooking) {
            return response()->json([
                'message' => 'Package booking not found.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:APPROVED,REJECTED',
            ],
        ]);

        // Only pending bookings can be processed by the Organizer.
        if ($packageBooking->status !== 'PENDING') {
            return response()->json([
                'message' =>
                    'Only pending bookings can be approved or rejected.',
            ], 422);
        }

        $packageBooking->loadMissing([
            'customer',
            'package',
        ]);

        $customer = $packageBooking->customer;

        // Organizer decisions are only allowed for Tourist accounts.
        if (!$customer || $customer->role !== 'USER') {
            return response()->json([
                'message' =>
                    'This action is only available for tourist bookings.',
            ], 422);
        }

        $newStatus = $validated['status'];
        $approved = $newStatus === 'APPROVED';

        /*
         * The Organizer's decision is independent
         * for every package booking.
         */

        $packageBooking->update([
            'status' => $newStatus,

            // Only approved bookings proceed to DENR review.
            'denr_status' => $approved ? 'PENDING' : null,
        ]);

        $packageName = $packageBooking->package?->name
            ?? 'your package';

        /*
         * Notify the Tourist of the Organizer's decision.
         */

        $this->notifySafely(
            $customer,
            new SystemNotification(
                $approved
                    ? 'Package Booking Approved by Organizer'
                    : 'Package Booking Rejected by Organizer',
                $approved
                    ? "Your booking for {$packageName} has been approved by the Organizer and forwarded to DENR for final hike approval."
                    : "Your booking for {$packageName} has been rejected by the Organizer. It will not proceed to DENR review.",
                'package_booking',
                null,
                [
                    'booking_id' => $packageBooking->id,
                    'booking_number' => $packageBooking->booking_number,
                    'package_id' => $packageBooking->package_id,
                    'package_name' => $packageName,
                    'status' => $newStatus,
                    'denr_status' => $approved ? 'PENDING' : null,
                ]
            )
        );

        return response()->json([
            'message' => $approved
                ? 'Package booking approved and forwarded to DENR.'
                : 'Package booking rejected successfully.',
            'booking' => $packageBooking->fresh([
                'package.services',
                'package.organizer',
                'customer:id,first_name,last_name,email',
                'trail',
                'tourists',
            ]),
        ]);
    }

    /**
     * Stage 2:
     * ADMIN or EMPLOYEE makes the final DENR hike decision.
     *
     * Only Organizer-approved package bookings awaiting
     * DENR review can be processed.
     */
    public function updateDenrStatus(
        Request $request,
        PackageBooking $packageBooking
    ): JsonResponse {
        $user = $request->user();

        if (!in_array($user->role, ['ADMIN', 'EMPLOYEE'], true)) {
            return response()->json([
                'message' => 'Unauthorized to process DENR approval.',
            ], 403);
        }

        $validated = $request->validate([
            'denr_status' => [
                'required',
                'string',
                'in:APPROVED,REJECTED',
            ],
        ]);

        /*
         * The Organizer must have approved the booking first.
         * DENR cannot process pending or Organizer-rejected requests.
         */

        if (
            $packageBooking->status !== 'APPROVED' ||
            $packageBooking->denr_status !== 'PENDING'
        ) {
            return response()->json([
                'message' =>
                    'Only Organizer-approved bookings awaiting DENR review can be processed.',
            ], 422);
        }

        $packageBooking->loadMissing([
            'customer',
            'package.organizer',
        ]);

        $customer = $packageBooking->customer;

        if (!$customer || $customer->role !== 'USER') {
            return response()->json([
                'message' => 'Tourist account associated with this booking was not found.',
            ], 422);
        }

        $newDenrStatus = $validated['denr_status'];
        $approved = $newDenrStatus === 'APPROVED';

        // Update only the DENR decision.
        $packageBooking->update([
            'denr_status' => $newDenrStatus,
        ]);

        $packageName = $packageBooking->package?->name
            ?? 'your package';

        /*
         * Notify the Tourist of the final DENR decision.
         */

        $this->notifySafely(
            $customer,
            new SystemNotification(
                $approved
                    ? 'Hike Approved by DENR'
                    : 'Hike Rejected by DENR',
                $approved
                    ? "DENR has approved your hike for {$packageName}. Your booking has passed both approval stages."
                    : "DENR has rejected your hike for {$packageName}. Your booking will not proceed.",
                'package_booking',
                null,
                [
                    'booking_id' => $packageBooking->id,
                    'booking_number' => $packageBooking->booking_number,
                    'package_id' => $packageBooking->package_id,
                    'package_name' => $packageName,
                    'status' => $packageBooking->status,
                    'denr_status' => $newDenrStatus,
                ]
            )
        );

        /*
         * Notify the Organizer of DENR's final decision as well.
         */

        $this->notifySafely(
            $packageBooking->package?->organizer,
            new SystemNotification(
                $approved
                    ? 'DENR Approved Package Booking'
                    : 'DENR Rejected Package Booking',
                $approved
                    ? "DENR approved booking {$packageBooking->booking_number} for {$packageName}."
                    : "DENR rejected booking {$packageBooking->booking_number} for {$packageName}.",
                'package_booking',
                null,
                [
                    'booking_id' => $packageBooking->id,
                    'booking_number' => $packageBooking->booking_number,
                    'package_id' => $packageBooking->package_id,
                    'package_name' => $packageName,
                    'customer_id' => $customer->id,
                    'status' => $packageBooking->status,
                    'denr_status' => $newDenrStatus,
                ]
            )
        );

        return response()->json([
            'message' => $approved
                ? 'DENR approved the package booking successfully.'
                : 'DENR rejected the package booking successfully.',
            'booking' => $packageBooking->fresh([
                'package.services',
                'package.organizer',
                'customer:id,first_name,last_name,email',
                'trail',
                'tourists',
            ]),
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

        $packageBooking->loadMissing([
            'package.organizer:id,first_name,last_name,email',
        ]);

        $packageBooking->update([
            'status' => 'CANCELLED',
        ]);

        /*
         * Notify the package Organizer after cancellation.
         */

        $customer = $request->user();

        $customerName = trim(
            $customer->first_name . ' ' . $customer->last_name
        );

        $this->notifySafely(
            $packageBooking->package?->organizer,
            new SystemNotification(
                'Package Booking Cancelled',
                "{$customerName} cancelled package booking {$packageBooking->booking_number}.",
                'package_booking',
                null,
                [
                    'booking_id' => $packageBooking->id,
                    'booking_number' => $packageBooking->booking_number,
                    'customer_id' => $customer->id,
                    'package_id' => $packageBooking->package_id,
                    'package_name' => $packageBooking->package?->name,
                    'hiking_date' => $packageBooking->hiking_date,
                    'status' => 'CANCELLED',
                    'denr_status' => $packageBooking->denr_status,
                ]
            )
        );

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
     * Safely send a notification without rolling back
     * an already-completed booking operation.
     */
    private function notifySafely(
        ?User $recipient,
        SystemNotification $notification
    ): void {
        if (!$recipient) {
            return;
        }

        try {
            $recipient->notify($notification);
        } catch (Throwable $exception) {
            report($exception);
        }
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