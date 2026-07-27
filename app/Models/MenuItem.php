<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'description', 'price',
        'prep_station', 'photo_path', 'is_available', 'is_special', 'sort_order',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_special'   => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class, 'category_id');
    }
}
