<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trail;
use Illuminate\Http\JsonResponse;

class TrailController extends Controller
{
    /**
     * Get all active trails.
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
     * Get a single trail.
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