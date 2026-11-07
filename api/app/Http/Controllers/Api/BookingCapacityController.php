<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookingCapacityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingCapacityController extends Controller
{
    /**
     * Return the shared visitor capacity for a selected hiking date.
     */
    public function show(
        Request $request,
        BookingCapacityService $capacityService
    ): JsonResponse {
        $validated = $request->validate([
            'date' => [
                'required',
                'date_format:Y-m-d',
            ],
        ]);

        return response()->json(
            $capacityService->getSummary($validated['date'])
        );
    }
}
