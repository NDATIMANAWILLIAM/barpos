<?php

namespace App\Http\Middleware;

use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'info'    => $request->session()->get('info'),
                'booked'  => $request->session()->get('booked'),
            ],
            'business' => (function () {
                $b = BusinessProfile::first();
                return [
                    'name'     => $b?->name ?? config('app.name', 'BarPOS'),
                    'currency' => 'RWF',
                    'phone'    => $b?->phone,
                    'address'  => $b?->address,
                ];
            })(),
            'notifications' => $request->user()
                ? $request->user()->unreadNotifications()->limit(10)->get(['id', 'data', 'created_at'])
                : [],
        ];
    }
}
