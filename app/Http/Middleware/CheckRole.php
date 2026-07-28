<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    // Maps the allowed-roles list (sorted) → extra permission slug(s).
    // If a user has any of those slugs in their permissions JSON, they
    // bypass the role check. A key can map to more than one route group
    // (e.g. POS and Payments now share the same role list), so the value
    // is an array.
    private const PERM_MAP = [
        'cashier,manager,owner'                      => ['payments'],
        'cashier,manager,owner,waiter'                => ['pos', 'payments'],
        'kitchen,manager,owner'                       => ['kitchen'],
        'manager,owner'                                => ['manage'],
        'manager,owner,receptionist,waiter'            => ['reservations'],
        'manager,owner,receptionist,waiter,cashier,kitchen' => ['operations'],
    ];

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Inactive account — force logout
        if ($user && !$user->is_active) {
            Auth::logout();
            return redirect()->route('login')
                ->withErrors(['email' => 'Your account has been deactivated. Contact your manager.']);
        }

        if (!empty($roles)) {
            $hasRole = $user && in_array($user->role, $roles);

            if (!$hasRole) {
                // Check if user has an extra permission that covers this route group
                $key   = implode(',', collect($roles)->sort()->values()->all());
                $perms = self::PERM_MAP[$key] ?? [];
                $hasPerm = $user && collect($perms)->contains(fn ($p) => $user->hasPermission($p));

                if (!$hasPerm) {
                    if ($request->header('X-Inertia')) {
                        return back()->with('error', 'You do not have permission to access that page.');
                    }
                    abort(403, 'Access denied.');
                }
            }
        }

        return $next($request);
    }
}
