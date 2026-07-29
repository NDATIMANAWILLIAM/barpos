<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hospitality POS — full database schema (v1)
 *
 * Builds every domain table on top of the app's existing Breeze auth.
 * It does NOT recreate the `users` table — it adds staff fields to it,
 * so login/registration keep working exactly as they do now.
 *
 * Money is stored as plain integers in RWF (no minor unit, never floats).
 * Run with:  php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        // -- Extend Breeze's existing users table with staff fields --------
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['owner', 'manager', 'cashier', 'waiter', 'kitchen', 'storekeeper'])
                  ->default('waiter')->after('email');
            $table->string('phone', 30)->nullable()->after('role');
            $table->string('pin')->nullable()->after('phone'); // hashed PIN for fast tablet login
            $table->boolean('is_active')->default(true)->after('pin');
        });

        // -- Business profile & settings (single venue in v1) --------------
        Schema::create('business_profile', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->enum('type', ['bar', 'restaurant', 'lodge', 'guest_house', 'hotel']);
            $table->string('phone', 30)->nullable();
            $table->string('address')->nullable();
            $table->string('tin', 30)->nullable();                       // tax ID for receipts
            $table->char('currency', 3)->default('RWF');
            $table->unsignedSmallInteger('tax_rate_bp')->default(1800);  // 18% in basis points
            $table->string('logo_path')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        // -- Rooms (lodge / guest house / hotel) ---------------------------
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);                                  // Single, Double, Suite
            $table->unsignedInteger('base_price');                       // RWF per night
            $table->unsignedTinyInteger('capacity')->default(2);
            $table->string('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_type_id')->constrained('room_types');
            $table->string('number', 20)->unique();
            $table->enum('status', ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'])
                  ->default('available');
            $table->timestamps();
            $table->softDeletes();
        });

        // -- Dining tables -------------------------------------------------
        Schema::create('dining_tables', function (Blueprint $table) {
            $table->id();
            $table->string('label', 40)->unique();                       // T-04, Terrace 2
            $table->string('zone', 60)->nullable();                      // Indoor, Terrace, Bar
            $table->unsignedTinyInteger('capacity')->default(4);
            $table->enum('status', ['free', 'occupied', 'reserved', 'out_of_service'])->default('free');
            $table->string('qr_token', 40)->nullable()->unique();        // token embedded in the table QR
            $table->timestamps();
            $table->softDeletes();
        });

        // -- Menu ----------------------------------------------------------
        Schema::create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->enum('kind', ['food', 'drink']);
            $table->smallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('menu_categories');
            $table->string('name', 120);
            $table->string('description')->nullable();
            $table->unsignedInteger('price');                            // RWF
            $table->enum('prep_station', ['kitchen', 'bar', 'none'])->default('kitchen');
            $table->string('photo_path')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_special')->default(false);              // today's specials / promos
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index('is_available');
            $table->index('is_special');
        });

        // -- Inventory -----------------------------------------------------
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->enum('category', ['food', 'drink', 'supply'])->default('food');
            $table->string('unit', 20);                                  // kg, l, piece, crate
            $table->decimal('quantity', 12, 3)->default(0);
            $table->decimal('reorder_level', 12, 3)->default(0);         // low-stock threshold
            $table->unsignedInteger('cost_price')->default(0);          // RWF per unit
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index('expiry_date');
        });

        Schema::create('menu_item_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('quantity_per_unit', 12, 3);                 // stock used per 1 item sold
            $table->unique(['menu_item_id', 'inventory_item_id']);
        });

        // -- Customers & loyalty -------------------------------------------
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('phone', 30)->unique();
            $table->string('email', 150)->nullable();
            $table->unsignedInteger('visit_count')->default(0);
            $table->unsignedBigInteger('total_spent')->default(0);      // lifetime RWF
            $table->integer('loyalty_points')->default(0);
            $table->timestamp('last_visit_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // -- Reservations (table & room bookings in one table) -------------
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->enum('kind', ['table', 'room']);
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name', 120);
            $table->string('phone', 30);
            // table booking
            $table->foreignId('table_id')->nullable()->constrained('dining_tables')->nullOnDelete();
            $table->unsignedTinyInteger('party_size')->nullable();
            // room booking
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->foreignId('room_type_id')->nullable()->constrained('room_types')->nullOnDelete();
            $table->date('check_in')->nullable();
            $table->date('check_out')->nullable();
            $table->unsignedInteger('deposit_paid')->default(0);
            $table->unsignedInteger('balance_due')->default(0);
            // common
            $table->dateTime('scheduled_at')->nullable();               // arrival time for table bookings
            $table->enum('status', ['pending', 'confirmed', 'seated', 'checked_in', 'checked_out', 'cancelled', 'no_show'])
                  ->default('pending');
            $table->string('notes', 500)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index('status');
            $table->index('scheduled_at');
            $table->index('check_in');
        });

        // -- Orders (POS) --------------------------------------------------
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique();               // daily human sequence
            $table->enum('type', ['dine_in', 'takeaway', 'room_service'])->default('dine_in');
            $table->foreignId('table_id')->nullable()->constrained('dining_tables')->nullOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('waiter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['open', 'sent', 'preparing', 'ready', 'served', 'paid', 'cancelled'])->default('open');
            $table->unsignedInteger('subtotal')->default(0);
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('tax')->default(0);
            $table->unsignedInteger('total')->default(0);
            $table->string('notes', 500)->nullable();
            $table->dateTime('placed_at')->nullable();
            $table->timestamps();
            $table->index('status');
            $table->index('placed_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->string('name_snapshot', 120);                       // name AT TIME OF ORDER
            $table->unsignedInteger('price_snapshot');                  // unit price AT TIME OF ORDER
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->unsignedInteger('line_total');
            $table->enum('prep_station', ['kitchen', 'bar', 'none'])->default('kitchen');
            $table->enum('status', ['new', 'preparing', 'ready', 'served', 'void'])->default('new');
            $table->string('notes')->nullable();
            $table->timestamps();
            $table->index(['prep_station', 'status']);                  // powers the kitchen/bar screen
        });

        // -- Payments (split / part payments allowed) ----------------------
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->enum('method', ['cash', 'mtn_momo', 'airtel_money', 'card', 'bank']);
            $table->unsignedInteger('amount');                          // RWF
            $table->enum('status', ['pending', 'confirmed', 'failed', 'refunded'])->default('confirmed');
            $table->string('reference', 80)->nullable();                // MoMo / Airtel txn id
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('confirmed_at')->nullable();
            $table->timestamps();
            $table->index('method');
            $table->index('status');
        });

        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->enum('type', ['earn', 'redeem', 'adjust']);
            $table->integer('points');                                  // + earned, - spent
            $table->string('note')->nullable();
            $table->timestamps();
        });

        // -- Inventory movement ledger -------------------------------------
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->enum('type', ['purchase', 'sale_usage', 'waste', 'adjustment', 'transfer']);
            $table->decimal('quantity_change', 12, 3);                  // + in, - out
            $table->string('reason')->nullable();
            $table->string('reference', 80)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index('type');
        });

        // -- Expenses (revenue is DERIVED from payments, not stored) -------
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['salary', 'purchase', 'utility', 'rent', 'maintenance', 'other']);
            $table->unsignedInteger('amount');                          // RWF
            $table->string('description')->nullable();
            $table->date('paid_at');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index('category');
            $table->index('paid_at');
        });

        // -- Audit log (privileged actions) --------------------------------
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 80);                               // order.void, price.change...
            $table->string('entity_type', 60)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->nullable();
            $table->index(['entity_type', 'entity_id']);
        });

        // -- Sync outbox (for future cloud backup/sync) --------------------
        Schema::create('sync_outbox', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type', 60);
            $table->unsignedBigInteger('entity_id');
            $table->enum('operation', ['create', 'update', 'delete']);
            $table->json('payload');
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->string('last_error')->nullable();
            $table->dateTime('synced_at')->nullable();
            $table->timestamps();
            $table->index(['synced_at', 'created_at']);
        });
    }

    public function down(): void
    {
        // Drop in reverse dependency order
        Schema::dropIfExists('sync_outbox');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('menu_item_ingredients');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menu_categories');
        Schema::dropIfExists('dining_tables');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('room_types');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('business_profile');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'pin', 'is_active']);
        });
    }
};
