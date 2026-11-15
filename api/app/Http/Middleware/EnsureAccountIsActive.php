<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\AuthController;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Allow a disabled account to revoke its own current token.
        $action = $request->route()?->getActionName() ?? '';
        if (str_contains($action, AuthController::class . '@logout')) {
            return $next($request);
        }

        if (strtoupper((string) $user->status) !== 'ACTIVE') {
            $currentToken = $user->currentAccessToken();
            if ($currentToken && method_exists($currentToken, 'delete')) {
                $currentToken->delete();
            }

            return response()->json([
                'message' => 'Your account is inactive. Please contact the DENR administrator.',
            ], 403);
        }

        return $next($request);
    }
}
