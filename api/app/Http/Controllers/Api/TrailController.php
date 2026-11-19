<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TrailController extends Controller
{
    /**
     * Get all active trails for public browsing.
     */
    public function index(): JsonResponse
    {
        $trails = Trail::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'trails' => $trails,
        ]);
    }

    /**
     * Get all trails for Admin management.
     */
    public function adminIndex(): JsonResponse
    {
        $trails = Trail::query()
            ->withCount([
                'reservations as approved_reservations_count' => fn ($query) =>
                    $query->where('status', 'APPROVED'),

                'packageBookings as approved_package_bookings_count' => fn ($query) =>
                    $query
                        ->where('status', 'APPROVED')
                        ->where('denr_status', 'APPROVED'),
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'trails' => $trails,
        ]);
    }

    /**
     * Create a trail. Admin-only route.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:trails,name',
            ],
            'description' => ['required', 'string'],
            'difficulty' => ['required', 'string', 'max:100'],
            'max_capacity' => ['required', 'integer', 'min:1', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')
                ->store('trails', 'public');
        }

        $trail = Trail::create([
            'name' => trim($validated['name']),
            'description' => trim($validated['description']),
            'difficulty' => trim($validated['difficulty']),
            'max_capacity' => $validated['max_capacity'],
            'is_active' => $validated['is_active'] ?? true,
            'image' => $imagePath,
        ]);

        return response()->json([
            'message' => 'Trail created successfully.',
            'trail' => $trail,
        ], 201);
    }

    /**
     * Update a trail. Admin-only route.
     *
     * Uses POST because the frontend submits multipart form data.
     */
    public function update(Request $request, Trail $trail): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('trails', 'name')->ignore($trail->id),
            ],
            'description' => ['required', 'string'],
            'difficulty' => ['required', 'string', 'max:100'],
            'max_capacity' => ['required', 'integer', 'min:1', 'max:500'],
            'image' => ['nullable', 'image', 'max:5120'],
            'remove_image' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            if ($trail->image) {
                Storage::disk('public')->delete($trail->image);
            }

            $validated['image'] = $request->file('image')
                ->store('trails', 'public');
        } elseif (($validated['remove_image'] ?? false) && $trail->image) {
            Storage::disk('public')->delete($trail->image);
            $validated['image'] = null;
        }

        $trail->update([
            'name' => trim($validated['name']),
            'description' => trim($validated['description']),
            'difficulty' => trim($validated['difficulty']),
            'max_capacity' => $validated['max_capacity'],
            'image' => $validated['image'] ?? $trail->image,
        ]);

        return response()->json([
            'message' => 'Trail updated successfully.',
            'trail' => $trail->fresh(),
        ]);
    }

    /**
     * Activate or deactivate a trail. Admin-only route.
     */
    public function updateStatus(Request $request, Trail $trail): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $trail->update([
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'message' => $trail->is_active
                ? 'Trail activated successfully.'
                : 'Trail deactivated successfully.',
            'trail' => $trail->fresh(),
        ]);
    }

    /**
     * Delete a trail only when it has no booking records.
     */
    public function destroy(Trail $trail): JsonResponse
    {
        $result = DB::transaction(function () use ($trail) {
            $lockedTrail = Trail::query()
                ->whereKey($trail->id)
                ->lockForUpdate()
                ->first();

            if (!$lockedTrail) {
                return 'not_found';
            }

            if (
                $lockedTrail->reservations()->exists() ||
                $lockedTrail->packageBookings()->exists()
            ) {
                return 'has_bookings';
            }

            $image = $lockedTrail->image;

            $lockedTrail->delete();

            return $image;
        });

        if ($result === 'not_found') {
            return response()->json([
                'message' => 'Trail not found.',
            ], 404);
        }

        if ($result === 'has_bookings') {
            return response()->json([
                'message' => 'This trail cannot be deleted because booking records exist. Deactivate it instead.',
            ], 422);
        }

        if ($result) {
            Storage::disk('public')->delete($result);
        }

        return response()->json([
            'message' => 'Trail deleted successfully.',
        ]);
    }

    /**
     * Get a single active trail.
     */
    public function show(Trail $trail): JsonResponse
    {
        if (!$trail->is_active) {
            return response()->json([
                'message' => 'Trail not found.',
            ], 404);
        }

        return response()->json([
            'trail' => $trail,
        ]);
    }
}
