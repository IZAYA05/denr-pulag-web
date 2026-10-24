<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display all registered users.
     */
    public function index()
    {
        $users = User::select([
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
            'status',
            'created_at',
            'updated_at',
        ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Update a user.
     */
    public function update(
        Request $request,
        User $user
    ) {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'min:2',
            ],

            'last_name' => [
                'required',
                'string',
                'min:2',
            ],

            'email' => [
                'required',
                'email',
                Rule::unique(
                    'users',
                    'email'
                )->ignore($user->id),
            ],

            'phone' => [
                'required',
                'string',
                'min:11',
            ],

            'role' => [
                'required',
                Rule::in([
                    'ADMIN',
                    'EMPLOYEE',
                    'ORGANIZER',
                    'USER',
                ]),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Administrator Protection
        |--------------------------------------------------------------------------
        */

        if (
            $user->role === 'ADMIN' &&
            $validated['role'] !== 'ADMIN'
        ) {
            return response()->json([
                'message' =>
                    'The Administrator cannot be changed. Assign another user as Administrator first.',
            ], 422);
        }

        DB::transaction(function () use (
            $user,
            $validated
        ) {
            /*
            |--------------------------------------------------------------------------
            | Transfer Administrator Role
            |--------------------------------------------------------------------------
            */

            if (
                $validated['role'] === 'ADMIN' &&
                $user->role !== 'ADMIN'
            ) {
                User::where(
                    'role',
                    'ADMIN'
                )
                    ->where(
                        'id',
                        '!=',
                        $user->id
                    )
                    ->update([
                        'role' =>
                            'EMPLOYEE',
                    ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Update User
            |--------------------------------------------------------------------------
            */

            $user->update([
                'first_name' =>
                    $validated['first_name'],

                'last_name' =>
                    $validated['last_name'],

                'email' =>
                    $validated['email'],

                'phone' =>
                    $validated['phone'],

                'role' =>
                    $validated['role'],
            ]);
        });

        $user->refresh();

        return response()->json([
            'message' =>
                'User updated successfully.',

            'user' => [
                'id' =>
                    $user->id,

                'first_name' =>
                    $user->first_name,

                'last_name' =>
                    $user->last_name,

                'email' =>
                    $user->email,

                'phone' =>
                    $user->phone,

                'role' =>
                    $user->role,

                'status' =>
                    $user->status,

                'created_at' =>
                    $user->created_at,

                'updated_at' =>
                    $user->updated_at,
            ],
        ]);
    }

    /**
     * Enable or disable a user account.
     */
    public function toggleStatus(User $user)
    {
        /*
        |--------------------------------------------------------------------------
        | Administrator Protection
        |--------------------------------------------------------------------------
        |
        | The administrator account cannot be disabled.
        |
        */

        if (
            $user->role === 'ADMIN' &&
            $user->status === 'ACTIVE'
        ) {
            return response()->json([
                'message' =>
                    'The Administrator account cannot be disabled.',
            ], 422);
        }

        $user->status =
            $user->status === 'ACTIVE'
                ? 'INACTIVE'
                : 'ACTIVE';

        $user->save();

        return response()->json([
            'message' =>
                $user->status === 'ACTIVE'
                    ? 'User account enabled successfully.'
                    : 'User account disabled successfully.',

            'user' => [
                'id' =>
                    $user->id,

                'status' =>
                    $user->status,
            ],
        ]);
    }
}