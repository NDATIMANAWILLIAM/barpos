<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessProfile extends Model
{
    protected $table    = 'business_profile';
    protected $fillable = ['name', 'type', 'phone', 'address', 'tin', 'currency', 'tax_rate_bp', 'logo_path'];
}
