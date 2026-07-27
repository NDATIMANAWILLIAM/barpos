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
        \DB::statement("ALTER TABLE reservations MODIFY COLUMN kind ENUM('table','room','delivery') NOT NULL DEFAULT 'table'");

        Schema::table('reservations', function (Blueprint $table) {
            $table->string('delivery_address', 300)->nullable()->after('party_size');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('delivery_address');
        });
        \DB::statement("ALTER TABLE reservations MODIFY COLUMN kind ENUM('table','room') NOT NULL DEFAULT 'table'");
    }
};
