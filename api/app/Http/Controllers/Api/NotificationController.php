<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Retrieve the authenticated user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $perPage = min(
            max((int) $request->query('per_page', 10), 1),
            50
        );

        $notifications = $user->notifications()
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'message' => 'Notifications retrieved successfully.',
            'notifications' => $notifications->items(),
            'unread_count' => $user->unreadNotifications()->count(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Mark one of the authenticated user's notifications as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => $notification->fresh(),
            'unread_count' => $request->user()
                ->unreadNotifications()
                ->count(),
        ]);
    }

    /**
     * Mark all of the authenticated user's notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $updated = $request->user()
            ->unreadNotifications()
            ->update([
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
            'updated_count' => $updated,
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete one of the authenticated user's notifications.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.',
            'unread_count' => $request->user()
                ->unreadNotifications()
                ->count(),
        ]);
    }
}
