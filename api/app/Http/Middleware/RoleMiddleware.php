<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next,
        ...$roles
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $userRole = strtoupper(trim($user->role));

        $allowedRoles = array_map(
            fn ($role) => strtoupper(trim($role)),
            $roles
        );

        if (!in_array($userRole, $allowedRoles, true)) {
            return response()->json([
                'message' => 'You do not have permission to access this resource.',
                'role' => $userRole,
            ], 403);
        }

        return $next($request);
    }
}