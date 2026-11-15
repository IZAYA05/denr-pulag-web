<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use Carbon\Carbon;
use App\Services\BookingCapacityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockedDateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $query = BlockedDate::query()->orderBy('date');

        if (!empty($validated['from'])) {
            $query->whereDate('date', '>=', $validated['from']);
        }

        if (!empty($validated['to'])) {
            $query->whereDate('date', '<=', $validated['to']);
        }

        return response()->json([
            'blocked_dates' => $query->get(['id', 'date', 'reason', 'created_by', 'created_at']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today', 'unique:blocked_dates,date'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $blockedDate = BlockedDate::create([
            'date' => $validated['date'],
            'reason' => isset($validated['reason']) ? trim($validated['reason']) : null,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Date marked as unavailable.',
            'blocked_date' => $blockedDate,
        ], 201);
    }

    public function destroy(BlockedDate $blockedDate): JsonResponse
    {
        $blockedDate->delete();

        return response()->json([
            'message' => 'Blocked date removed. The date is available for booking subject to remaining capacity.',
        ]);
    }

    public function availability(
        Request $request,
        BookingCapacityService $capacityService
    ): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $from = Carbon::createFromFormat('Y-m-d', $validated['from'], 'Asia/Manila')->startOfDay();
        $to = Carbon::createFromFormat('Y-m-d', $validated['to'], 'Asia/Manila')->startOfDay();

        if ($from->diffInDays($to) > 92) {
            return response()->json([
                'message' => 'Availability can be requested for a maximum range of 93 days.',
            ], 422);
        }

        $availability = $capacityService->getRangeSummary(
            $from->toDateString(),
            $to->toDateString()
        );

        return response()->json([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'availability' => $availability,
        ]);
    }
}
