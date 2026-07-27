<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Index', [
            'staff' => User::orderBy('name')->get([
                'id', 'name', 'email', 'role', 'phone', 'is_active', 'permissions', 'created_at',
            ]),
            'roles' => User::ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:120',
            'email'       => 'required|email|unique:users,email',
            'role'        => 'required|in:owner,manager,cashier,waiter,kitchen,storekeeper',
            'phone'       => 'nullable|string|max:30',
            'password'    => 'required|string|min:6',
            'is_active'   => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:payments,pos,kitchen,manage,reservations,reports',
        ]);

        User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'role'        => $data['role'],
            'phone'       => $data['phone'] ?? null,
            'password'    => Hash::make($data['password']),
            'is_active'   => $data['is_active'] ?? true,
            'permissions' => !empty($data['permissions']) ? $data['permissions'] : null,
        ]);

        return back()->with('success', "{$data['name']} has been added as {$data['role']}.");
    }

    public function update(Request $request, User $user)
    {
        if ($user->id === $request->user()->id && $request->role !== $user->role) {
            return back()->withErrors(['role' => 'You cannot change your own role.']);
        }

        $data = $request->validate([
            'name'          => 'required|string|max:120',
            'role'          => 'required|in:owner,manager,cashier,waiter,kitchen,storekeeper',
            'phone'         => 'nullable|string|max:30',
            'is_active'     => 'required|boolean',
            'password'      => 'nullable|string|min:6',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|in:payments,pos,kitchen,manage,reservations,reports',
        ]);

        $update = [
            'name'        => $data['name'],
            'role'        => $data['role'],
            'phone'       => $data['phone'] ?? null,
            'is_active'   => $data['is_active'],
            'permissions' => !empty($data['permissions']) ? $data['permissions'] : null,
        ];

        if (!empty($data['password'])) {
            $update['password'] = Hash::make($data['password']);
        }

        $user->update($update);

        return back()->with('success', "{$user->name} updated.");
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }
        $user->delete();
        return back()->with('success', "{$user->name} removed.");
    }
}
