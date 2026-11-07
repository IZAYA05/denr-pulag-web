<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Retrieve the authenticated user's profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'image' => $user->image,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Update the authenticated user's personal information.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            'phone' => [
                'required',
                'string',
                'min:11',
                'max:50',
            ],
        ]);

        $user->update($validated);

        $user->refresh();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'image' => $user->image,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => [
                'required',
                'string',
            ],

            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = $request->user();

        if (
            !$user->password ||
            !Hash::check(
                $validated['current_password'],
                $user->password
            )
        ) {
            return response()->json([
                'message' => 'The current password is incorrect.',
                'errors' => [
                    'current_password' => [
                        'The current password is incorrect.',
                    ],
                ],
            ], 422);
        }

        // The User model's hashed cast hashes this value automatically.
        $user->password = $validated['new_password'];
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Retrieve only the authenticated user's login history.
     */
    public function loginActivity(Request $request): JsonResponse
    {
        $logs = ActivityLog::query()
            ->where('user_id', $request->user()->id)
            ->where('module', 'AUTH')
            ->whereIn('action', [
                'LOGIN',
                'LOGOUT',
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Login activity retrieved successfully.',
            'data' => $logs,
        ]);
    }
}
