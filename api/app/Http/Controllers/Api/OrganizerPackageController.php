<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizerPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizerPackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $packages = OrganizerPackage::with('services')
            ->where('organizer_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'packages' => $packages,
        ]);
    }

    public function show(
        Request $request,
        OrganizerPackage $package
    ): JsonResponse {
        if ($package->organizer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Package not found.',
            ], 404);
        }

        $package->load(['services', 'bookings']);

        return response()->json([
            'package' => $package,
        ]);
    }

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

        $package = DB::transaction(function () use ($validated, $request) {
            $package = OrganizerPackage::create([
                'organizer_id' => $request->user()->id,
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

            return $package;
        });

        $package->load('services');

        return response()->json([
            'message' => 'Package created successfully.',
            'package' => $package,
        ], 201);
    }

    public function update(
        Request $request,
        OrganizerPackage $package
    ): JsonResponse {
        if ($package->organizer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Package not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'max_tourists' => ['required', 'integer', 'min:1', 'max:12'],
            'services' => ['required', 'array', 'min:1'],
            'services.*' => ['required', 'string', 'max:255'],
        ]);

        // Do not reduce capacity below the number of tourists in an
        // existing booking that has not been cancelled or rejected.
        $largestExistingBooking = $package->bookings()
            ->whereNotIn('status', ['CANCELLED', 'REJECTED'])
            ->max('tourist_count');

        if (
            $largestExistingBooking !== null &&
            (int) $validated['max_tourists'] < (int) $largestExistingBooking
        ) {
            return response()->json([
                'message' => sprintf(
                    'Capacity cannot be reduced below %d because an existing booking has that many tourists.',
                    (int) $largestExistingBooking
                ),
            ], 422);
        }

        DB::transaction(function () use ($validated, $package) {
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
        });

        $package->load('services');

        return response()->json([
            'message' => 'Package updated successfully.',
            'package' => $package,
        ]);
    }

    public function toggleStatus(
        Request $request,
        OrganizerPackage $package
    ): JsonResponse {
        if ($package->organizer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Package not found.',
            ], 404);
        }

        $package->status = $package->status === 'ACTIVE'
            ? 'INACTIVE'
            : 'ACTIVE';

        $package->save();

        return response()->json([
            'message' => $package->status === 'ACTIVE'
                ? 'Package activated successfully.'
                : 'Package deactivated successfully.',
            'package' => $package,
        ]);
    }

    public function destroy(
        Request $request,
        OrganizerPackage $package
    ): JsonResponse {
        if ($package->organizer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Package not found.',
            ], 404);
        }

        $deleted = DB::transaction(function () use ($package) {
            // Lock the package while checking bookings and deleting it.
            $lockedPackage = OrganizerPackage::whereKey($package->id)
                ->lockForUpdate()
                ->first();

            if (!$lockedPackage) {
                return 'not_found';
            }

            // Any booking record blocks deletion, including cancelled
            // or completed bookings.
            if ($lockedPackage->bookings()->exists()) {
                return 'has_bookings';
            }

            $lockedPackage->services()->delete();
            $lockedPackage->delete();

            return 'deleted';
        });

        if ($deleted === 'not_found') {
            return response()->json([
                'message' => 'Package not found.',
            ], 404);
        }

        if ($deleted === 'has_bookings') {
            return response()->json([
                'message' => 'This package cannot be deleted because bookings exist. Deactivate it instead.',
            ], 422);
        }

        return response()->json([
            'message' => 'Package deleted successfully.',
        ]);
    }
}
