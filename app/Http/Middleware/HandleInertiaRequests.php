<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type?->value,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                ] : null,
                'permissions' => $user ? [
                    'isAdmin' => $user->isAdmin(),
                    'isStaff' => $user->isStaff(),
                    'isMember' => $user->isMember(),
                    'isNonMember' => $user->isNonMember(),
                    'hasAdminAccess' => $user->hasAdminAccess(),
                    'hasStaffAccess' => $user->hasStaffAccess(),
                    'hasMemberAccess' => $user->hasMemberAccess(),
                ] : null,
            ],
        ];
    }
}
