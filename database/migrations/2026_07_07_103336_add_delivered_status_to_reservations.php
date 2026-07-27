<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        \DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending','confirmed','seated','cancelled','no_show','delivered') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        \DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending','confirmed','seated','cancelled','no_show') NOT NULL DEFAULT 'pending'");
    }
};
