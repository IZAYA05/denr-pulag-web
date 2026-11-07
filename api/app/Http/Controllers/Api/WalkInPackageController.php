<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizerPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class WalkInPackageController extends Controller
{
    /**
     * Retrieve the single shared Walk-in Package.
     */
    public function show(): JsonResponse
    {
        $package = OrganizerPackage::with('services')
            ->where('is_walk_in', true)
            ->first();

        return response()->json([
            'package' => $package,
        ]);
    }

    /**
     * Create the Walk-in Package if it does not already exist.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'max_tourists' => ['required', 'integer', 'min:1', 'max:12'],
            'services' => ['required', 'array', 'min:1'],
            'services.*' => ['required', 'string', 'max:255'],
        ]);

        $existing = OrganizerPackage::where('is_walk_in', true)->first();

        if ($existing) {
            return response()->json([
                'message' => 'The Walk-in Package already exists. Edit the existing package instead.',
                'package' => $existing->load('services'),
            ], 409);
        }

        try {
            $package = DB::transaction(function () use ($validated) {
                $package = OrganizerPackage::create([
                    'organizer_id' => null,
                    'is_walk_in' => true,
                    'name' => $validated['name'],
                    'description' => $validated['description'],
                    'price' => $validated['price'],
                    'max_tourists' => $validated['max_tourists'],
                    'status' => 'ACTIVE',
                ]);

                $package->services()->createMany(
                    collect($validated['services'])
                        ->unique()
                        ->map(fn ($service) => ['service' => $service])
                        ->values()
                        ->all()
                );

                return $package->load('services');
            });
        } catch (QueryException $exception) {
            // The unique database index prevents simultaneous duplicate creation.
            if ($exception->getCode() === '23505') {
                return response()->json([
                    'message' => 'The Walk-in Package was created by another staff member. Please refresh and edit the existing package.',
                ], 409);
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'Walk-in Package created successfully.',
            'package' => $package,
        ], 201);
    }

    /**
     * Update the existing shared Walk-in Package.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'max_tourists' => ['required', 'integer', 'min:1', 'max:12'],
            'services' => ['required', 'array', 'min:1'],
            'services.*' => ['required', 'string', 'max:255'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $package = OrganizerPackage::where('is_walk_in', true)
                ->lockForUpdate()
                ->first();

            if (!$package) {
                return null;
            }

            // Preserve the maximum size of any existing valid booking.
            $largestExistingBooking = $package->bookings()
                ->whereNotIn('status', ['CANCELLED', 'REJECTED'])
                ->where(function ($query) {
                    $query->whereNull('denr_status')
                        ->orWhere('denr_status', '!=', 'REJECTED');
                })
                ->max('tourist_count');

            if (
                $largestExistingBooking !== null &&
                (int) $validated['max_tourists'] < (int) $largestExistingBooking
            ) {
                return [
                    'error' => sprintf(
                        'Capacity cannot be reduced below %d because an existing booking has that many tourists.',
                        (int) $largestExistingBooking
                    ),
                ];
            }

            $package->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'max_tourists' => $validated['max_tourists'],
            ]);

            $package->services()->delete();

            $package->services()->createMany(
                collect($validated['services'])
                    ->unique()
                    ->map(fn ($service) => ['service' => $service])
                    ->values()
                    ->all()
            );

            return [
                'package' => $package->load('services'),
            ];
        });

        if ($result === null) {
            return response()->json([
                'message' => 'The Walk-in Package has not been created yet.',
            ], 404);
        }

        if (isset($result['error'])) {
            return response()->json([
                'message' => $result['error'],
            ], 422);
        }

        return response()->json([
            'message' => 'Walk-in Package updated successfully.',
            'package' => $result['package'],
        ]);
    }
}