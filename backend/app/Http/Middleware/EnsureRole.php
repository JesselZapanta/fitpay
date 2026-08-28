<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        try {
            $user = auth('api')->user() ?? auth()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden. Required role: ' . implode('|', $roles),
            ], 403);
        }

        return $next($request);
    }
}
