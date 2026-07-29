<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * dining_tables.qr_token was declared as a native uuid column, but the
     * app has only ever generated it with Str::random(12) — not a valid
     * UUID. MySQL tolerated this silently (loosely-typed char(36)), but
     * Postgres enforces real UUID format and throws "invalid input syntax
     * for type uuid" on every read/write, causing every QR scan to 500.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE dining_tables ALTER COLUMN qr_token TYPE VARCHAR(40) USING qr_token::text');
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement('ALTER TABLE dining_tables MODIFY COLUMN qr_token VARCHAR(40) NULL');
        }
        // sqlite: columns are dynamically typed regardless of declaration — nothing to do
    }

    public function down(): void
    {
        // Not reversible: existing Str::random(12) tokens aren't valid UUIDs,
        // so reverting to a uuid column would immediately break again.
    }
};
