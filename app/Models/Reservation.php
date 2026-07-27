<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'kind', 'customer_id', 'customer_name', 'phone',
        'table_id', 'party_size', 'delivery_address',
        'room_id', 'room_type_id', 'check_in', 'check_out',
        'scheduled_at', 'status', 'notes', 'created_by', 'confirmed_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'check_in'     => 'date',
        'check_out'    => 'date',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(DiningTable::class, 'table_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
