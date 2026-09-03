<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Trail;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    /**
     * Get all reservations belonging to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $reservations = Reservation::with([
            'trail',
            'participants',
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'reservations' => $reservations,
        ]);
    }

    /**
     * Get one reservation belonging to the authenticated user.
     */
    public function show(
        Request $request,
        Reservation $reservation
    ): JsonResponse {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Reservation not found.',
            ], 404);
        }

        $reservation->load([
            'trail',
            'participants',
        ]);

        return response()->json([
            'reservation' => $reservation,
        ]);
    }

    /**
     * Create a new reservation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_leader_name' => ['required', 'string', 'max:255'],
            'group_leader_phone' => ['required', 'string', 'max:50'],
            'hiking_date' => ['required', 'date', 'after:today'],
            'trail_id' => ['required', 'integer', 'exists:trails,id'],
            'remarks' => ['nullable', 'string'],

            'participants' => ['required', 'array', 'min:1', 'max:12'],

            'participants.*.full_name' => [
                'required',
                'string',
                'max:255',
            ],
            'participants.*.age' => [
                'required',
                'integer',
                'min:1',
                'max:120',
            ],
            'participants.*.gender' => [
                'required',
                'in:MALE,FEMALE',
            ],
            'participants.*.nationality' => [
                'required',
                'string',
                'max:100',
            ],
            'participants.*.contact_number' => [
                'nullable',
                'string',
                'max:50',
            ],
            'participants.*.address' => [
                'nullable',
                'string',
            ],
            'participants.*.emergency_contact' => [
                'required',
                'string',
                'max:255',
            ],
            'participants.*.emergency_number' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        /*
         * Check if the hiking date is within
         * one month from today.
         */
        $hikingDate = Carbon::parse(
            $validated['hiking_date']
        )->startOfDay();

        $maximumBookingDate = Carbon::today()
            ->addMonth()
            ->endOfDay();

        if ($hikingDate->gt($maximumBookingDate)) {
            return response()->json([
                'message' =>
                    'Reservations can only be made up to one month in advance.',
            ], 422);
        }

        /*
         * Check if the selected trail exists
         * and is currently active.
         */
        $trail = Trail::where(
            'id',
            $validated['trail_id']
        )
            ->where('is_active', true)
            ->first();

        if (!$trail) {
            return response()->json([
                'message' => 'The selected trail is not available.',
            ], 422);
        }

        /*
         * Count participants in the current
         * reservation.
         */
        $participantCount = count(
            $validated['participants']
        );

        /*
         * Get the total number of participants
         * already reserved for the selected date.
         *
         * Only PENDING and APPROVED reservations
         * consume visitor capacity.
         */
        $currentParticipants = Reservation::where(
            'hiking_date',
            $validated['hiking_date']
        )
            ->whereIn('status', [
                'PENDING',
                'APPROVED',
            ])
            ->sum('total_participants');

        /*
         * Check if adding this reservation would
         * exceed the maximum daily capacity.
         */
        if (
            $currentParticipants + $participantCount >
            $trail->max_capacity
        ) {
            return response()->json([
                'message' =>
                    'The maximum visitor capacity for this date has been reached.',
            ], 422);
        }

        /*
         * Create the reservation and participants
         * inside a database transaction.
         */
        $reservation = DB::transaction(function () use (
            $validated,
            $participantCount,
            $trail,
            $request
        ) {
            $reservationNumber = 'EP-' . strtoupper(
                Str::random(8)
            );

            /*
             * Make sure the reservation number
             * is unique.
             */
            while (
                Reservation::where(
                    'reservation_number',
                    $reservationNumber
                )->exists()
            ) {
                $reservationNumber = 'EP-' . strtoupper(
                    Str::random(8)
                );
            }

            /*
             * Create the reservation.
             */
            $reservation = Reservation::create([
                'reservation_number' => $reservationNumber,
                'group_leader_name' =>
                    $validated['group_leader_name'],
                'group_leader_phone' =>
                    $validated['group_leader_phone'],
                'hiking_date' =>
                    $validated['hiking_date'],
                'total_participants' =>
                    $participantCount,
                'status' => 'PENDING',
                'remarks' =>
                    $validated['remarks'] ?? null,
                'user_id' =>
                    $request->user()->id,
                'trail_id' =>
                    $trail->id,
            ]);

            /*
             * Create all participants belonging
             * to this reservation.
             */
            $reservation->participants()->createMany(
                $validated['participants']
            );

            return $reservation;
        });

        $reservation->load([
            'trail',
            'participants',
        ]);

        return response()->json([
            'message' =>
                'Reservation created successfully.',
            'reservation' => $reservation,
        ], 201);
    }

    /**
     * Cancel a pending reservation belonging
     * to the authenticated user.
     */
    public function destroy(
        Request $request,
        Reservation $reservation
    ): JsonResponse {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Reservation not found.',
            ], 404);
        }

        if ($reservation->status !== 'PENDING') {
            return response()->json([
                'message' =>
                    'Only pending reservations can be cancelled.',
            ], 422);
        }

        $reservation->update([
            'status' => 'CANCELLED',
        ]);

        return response()->json([
            'message' =>
                'Reservation cancelled successfully.',
            'reservation' => $reservation,
        ]);
    }

    /**
     * Get all reservations for DENR staff.
     */
    public function adminIndex(): JsonResponse
    {
        $reservations = Reservation::with([
            'user',
            'trail',
            'participants',
        ])
            ->latest()
            ->get();

        return response()->json([
            'reservations' => $reservations,
        ]);
    }

    /**
     * Update a reservation status for DENR staff.
     */
    public function updateStatus(
        Request $request,
        Reservation $reservation
    ): JsonResponse {
        $validated = $request->validate([
            'status' => [
                'required',
                'in:APPROVED,REJECTED',
            ],
        ]);

        if ($reservation->status !== 'PENDING') {
            return response()->json([
                'message' =>
                    'Only pending reservations can be approved or rejected.',
            ], 422);
        }

        $reservation->update([
            'status' => $validated['status'],
        ]);

        $reservation->load([
            'user',
            'trail',
            'participants',
        ]);

        return response()->json([
            'message' =>
                'Reservation status updated successfully.',
            'reservation' => $reservation,
        ]);
    }
}