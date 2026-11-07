<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Display activity logs according to the authenticated user's role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = strtoupper(trim($user->role ?? ''));

        if (!in_array($role, ['ADMIN', 'EMPLOYEE'], true)) {
            return response()->json([
                'message' => 'You are not authorized to view activity logs.',
            ], 403);
        }

        $query = ActivityLog::with([
            'user:id,first_name,last_name,email,role',
        ]);

        // Employees can only see USER and ORGANIZER activities.
        if ($role === 'EMPLOYEE') {
            $query->whereIn('role', ['USER', 'ORGANIZER']);
        }

        // Optional filters.
        if ($request->filled('action')) {
            $query->where('action', strtoupper($request->action));
        }

        if ($request->filled('module')) {
            $query->where('module', strtoupper($request->module));
        }

        if ($request->filled('role')) {
            $requestedRole = strtoupper($request->role);

            if (
                $role === 'EMPLOYEE' &&
                !in_array($requestedRole, ['USER', 'ORGANIZER'], true)
            ) {
                return response()->json([
                    'message' => 'You are not authorized to view this role\'s activities.',
                ], 403);
            }

            $query->where('role', $requestedRole);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('description', 'ILIKE', "%{$search}%")
                    ->orWhere('module', 'ILIKE', "%{$search}%")
                    ->orWhere('action', 'ILIKE', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('first_name', 'ILIKE', "%{$search}%")
                            ->orWhere('last_name', 'ILIKE', "%{$search}%")
                            ->orWhere('email', 'ILIKE', "%{$search}%");
                    });
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = min(
            max((int) $request->input('per_page', 20), 1),
            100
        );

        $logs = $query
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'message' => 'Activity logs retrieved successfully.',
            'data' => $logs,
        ]);
    }
}
