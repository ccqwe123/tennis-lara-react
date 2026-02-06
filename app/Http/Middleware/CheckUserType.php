<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserType
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$types  The allowed user types (e.g., 'admin', 'staff')
     */
    public function handle(Request $request, Closure $next, string ...$types): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Convert string types to UserType enum values
        $allowedTypes = array_map(function ($type) {
            return UserType::tryFrom($type);
        }, $types);

        // Filter out any invalid types
        $allowedTypes = array_filter($allowedTypes);

        if (empty($allowedTypes)) {
            // If no valid types specified, deny access
            abort(403, 'Unauthorized action.');
        }

        // Check if user has any of the allowed types
        if (!$user->hasAnyRole($allowedTypes)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
