<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new USER account.
     */
    public function register(Request $request, ActivityLogger $logger)
    {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'min:2',
                'regex:/^[^\p{N}]+$/u',
            ],

            'last_name' => [
                'required',
                'string',
                'min:2',
                'regex:/^[^\p{N}]+$/u',
            ],

            'email' => [
                'required',
                'string',
                'email',
                'unique:users,email',
            ],

            'phone' => [
                'required',
                'string',
                'regex:/^[0-9]{11}$/',
            ],

            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                'confirmed',
            ],
            'terms_accepted' => ['required', 'accepted'],
            'terms_version' => ['required', 'in:2026-11-07'],
        ], [
            'first_name.regex' => 'First name must not contain numbers.',
            'last_name.regex' => 'Last name must not contain numbers.',
            'phone.regex' => 'Phone number must contain exactly 11 digits.',
        ]);

        $user = User::create([
            'first_name' => trim($validated['first_name']),
            'last_name' => trim($validated['last_name']),
            'email' => strtolower($validated['email']),
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'USER',
            'status' => 'ACTIVE',
            'terms_version' => $validated['terms_version'],
             'terms_accepted_at' => now('Asia/Manila'),
        ]);

        // Record account registration.
        $logger->log(
            $user,
            'REGISTER',
            'AUTH',
            'New user account registered.',
            $request
        );

        return response()->json([
            'message' => 'Account created successfully.',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ], 201);
    }

    /**
     * Authenticate a user and generate a Sanctum token.
     */
    public function login(Request $request, ActivityLogger $logger)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (
            !$user ||
            !$user->password ||
            !Hash::check($credentials['password'], $user->password)
        ) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if ($user->status === 'INACTIVE') {
            return response()->json([
                'message' => 'Your account has been disabled. Please contact the administrator.',
            ], 403);
        }

        $token = $user->createToken('nextjs')->plainTextToken;

        // Record successful login.
        $logger->log(
            $user,
            'LOGIN',
            'AUTH',
            'User logged in successfully.',
            $request
        );

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'image' => $user->image,
            ],
        ]);
    }

    /**
     * Log out the authenticated user and revoke the current token.
     */
    public function logout(Request $request, ActivityLogger $logger)
    {
        $user = $request->user();

        // Record logout before deleting the token.
        $logger->log(
            $user,
            'LOGOUT',
            'AUTH',
            'User logged out successfully.',
            $request
        );

        $user->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
