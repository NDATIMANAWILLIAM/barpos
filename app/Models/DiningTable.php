<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiningTable extends Model
{
    use SoftDeletes;

    protected $fillable = ['label', 'zone', 'capacity', 'status', 'qr_token', 'servant_id'];

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'table_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(\App\Models\Order::class, 'table_id');
    }

    public function servant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'servant_id');
    }
}