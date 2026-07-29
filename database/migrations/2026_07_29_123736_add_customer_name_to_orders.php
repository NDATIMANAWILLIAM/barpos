<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * customer_name/phone were previously stuffed into the free-text notes
     * field as a "[From: X | Y]" prefix, which meant the name never showed
     * up anywhere it was actually needed (order lists, kitchen tickets) —
     * it was just buried in a notes string nobody read.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_name', 100)->nullable()->after('waiter_id');
            $table->string('customer_phone', 30)->nullable()->after('customer_name');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'customer_phone']);
        });
    }
};
