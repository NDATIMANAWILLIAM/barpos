<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Where the order came from — lets management see the split
            // between customers self-ordering via QR, staff taking phone
            // orders, and staff entering walk-in orders directly.
            $table->enum('source', ['qr_scan', 'phone_call', 'walk_in'])
                ->default('walk_in')
                ->after('type');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->enum('source', ['online', 'phone_call', 'walk_in'])
                ->default('online')
                ->after('kind');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('source');
        });
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
