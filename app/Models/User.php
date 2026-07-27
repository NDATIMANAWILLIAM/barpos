<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
        'role', 'phone', 'pin', 'is_active', 'permissions',
    ];

    protected $hidden = [
        'password', 'remember_token', 'pin',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'permissions'       => 'array',
        ];
    }

    public function hasPermission(string $perm): bool
    {
        $perms = $this->permissions ?? [];
        return in_array($perm, $perms);
    }

    // ── Role helpers ──────────────────────────────────────────────────────

    const ROLES = [
        'owner'        => 'Super Manager',
        'manager'      => 'Manager',
        'cashier'      => 'Cashier',
        'waiter'       => 'Servant',
        'receptionist' => 'Receptionist',
        'kitchen'      => 'Kitchen Staff',
        'storekeeper'  => 'Storekeeper',
    ];

    public function hasRole(string|array $roles): bool
    {
        return in_array($this->role, (array) $roles);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['owner', 'manager']);
    }

    public function canAccessPOS(): bool
    {
        return $this->hasRole(['owner', 'manager', 'cashier', 'waiter']);
    }

    public function canManageMenu(): bool
    {
        return $this->isAdmin();
    }

    public function canViewKitchen(): bool
    {
        return $this->hasRole(['owner', 'manager', 'kitchen']);
    }
}
