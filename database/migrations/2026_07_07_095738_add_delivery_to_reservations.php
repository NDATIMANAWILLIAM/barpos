<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add delivery to kind enum
        $this->alterKindEnum("'table','room','delivery'");

        Schema::table('reservations', function (Blueprint $table) {
            $table->string('delivery_address', 300)->nullable()->after('party_size');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('delivery_address');
        });
        $this->alterKindEnum("'table','room'");
    }

    private function alterKindEnum(string $values): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            \DB::statement("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_kind_check");
            \DB::statement("ALTER TABLE reservations ADD CONSTRAINT reservations_kind_check CHECK (kind IN ({$values}))");
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            \DB::statement("ALTER TABLE reservations MODIFY COLUMN kind ENUM({$values}) NOT NULL DEFAULT 'table'");
        }
        // sqlite: enum is unenforced (plain varchar) — nothing to alter
    }
};
