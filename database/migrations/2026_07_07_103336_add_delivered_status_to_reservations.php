<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->alterStatusEnum("'pending','confirmed','seated','cancelled','no_show','delivered'");
    }

    public function down(): void
    {
        $this->alterStatusEnum("'pending','confirmed','seated','cancelled','no_show'");
    }

    private function alterStatusEnum(string $values): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            \DB::statement("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check");
            \DB::statement("ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (status IN ({$values}))");
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            \DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM({$values}) NOT NULL DEFAULT 'pending'");
        }
        // sqlite: enum is unenforced (plain varchar) — nothing to alter
    }
};
