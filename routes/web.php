<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\PublicMenuController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\OperationsController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\NotificationController;

// ── Public routes (no auth) ────────────────────────────────────────────────
Route::get('/',          [PublicMenuController::class, 'show'])->name('public.menu');
Route::get('/m',         fn () => redirect()->route('public.menu'));
Route::get('/m/{token}', [PublicMenuController::class, 'show'])->name('public.menu.table');

// Customer self-order (JSON API, no auth)
Route::post('/order', [CustomerOrderController::class, 'store'])->name('customer.order');

// Payment usage guide (printable, no auth)
Route::get('/guide', fn () => Inertia::render('Guide/Payment', [
    'appUrl' => config('app.url'),
]))->name('guide');

// Public table booking (no auth — clients book themselves)
Route::get('/book',  [PublicBookingController::class, 'show'])->name('public.book');
Route::post('/book', [PublicBookingController::class, 'store'])->name('public.book.store');

// ── All authenticated staff (active account, any role) ─────────────────────
Route::middleware(['auth', 'role'])->group(function () {

    // Dashboard — every role
    Route::get('/dashboard', function () {
        // Recent activity feed — all roles see this
        $recentOrders = \App\Models\Order::with('waiter', 'table')
            ->whereDate('created_at', today())
            ->latest()->limit(15)->get()
            ->map(fn ($o) => [
                'type'   => 'order',
                'text'   => "Order #{$o->order_number}" . ($o->table ? " — {$o->table->label}" : ''),
                'by'     => $o->waiter?->name ?? 'Client (self-order)',
                'status' => $o->status,
                'time'   => $o->created_at->toISOString(),
            ]);

        $recentPayments = \App\Models\Payment::with('cashier', 'order')
            ->whereDate('created_at', today())
            ->where('status', 'confirmed')->latest()->limit(10)->get()
            ->map(fn ($p) => [
                'type'   => 'payment',
                'text'   => 'Payment ' . number_format((int)$p->amount) . ' RWF' . ($p->order ? " — #{$p->order->order_number}" : ''),
                'by'     => $p->cashier?->name ?? 'Cashier',
                'status' => 'paid',
                'time'   => $p->created_at->toISOString(),
            ]);

        $recentReservations = \App\Models\Reservation::with('creator', 'confirmedBy')
            ->latest()->limit(10)->get()
            ->map(fn ($r) => [
                'type'   => $r->kind === 'delivery' ? 'delivery' : 'booking',
                'text'   => ($r->kind === 'delivery' ? 'Delivery: ' : 'Booking: ') . $r->customer_name,
                'by'     => $r->confirmedBy?->name
                                ? 'Confirmed by ' . $r->confirmedBy->name
                                : ($r->creator?->name ? 'By ' . $r->creator->name : 'Client (online)'),
                'status' => $r->status,
                'time'   => $r->created_at->toISOString(),
            ]);

        $activity = collect($recentOrders)
            ->merge($recentPayments)
            ->merge($recentReservations)
            ->sortByDesc('time')
            ->values()
            ->take(20);

        return Inertia::render('Dashboard', [
            'stats' => [
                'orders_today'       => \App\Models\Order::whereDate('created_at', today())->count(),
                'revenue_today'      => \App\Models\Order::whereDate('created_at', today())->where('status', 'paid')->sum('total'),
                'open_orders'        => \App\Models\Order::whereNotIn('status', ['paid', 'cancelled'])->count(),
                'menu_items'         => \App\Models\MenuItem::where('is_available', true)->count(),
                'reservations_today' => \App\Models\Reservation::whereDate('scheduled_at', today())->count(),
            ],
            'activity' => $activity,
            'onDutyContact' => [
                'name'  => \App\Models\Setting::get('on_duty_contact_name', ''),
                'phone' => \App\Models\Setting::get('on_duty_contact_phone', ''),
            ],
        ]);
    })->name('dashboard');

    // On-duty contact — who clients should call right now (owner/manager only)
    Route::middleware('role:owner,manager')->patch('/dashboard/contact', function (\Illuminate\Http\Request $request) {
        $data = $request->validate([
            'name'  => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
        ]);
        \App\Models\Setting::set('on_duty_contact_name', $data['name'] ?? '');
        \App\Models\Setting::set('on_duty_contact_phone', $data['phone'] ?? '');
        return back()->with('success', 'On-duty contact updated.');
    })->name('dashboard.contact');

    // Profile — every role
    Route::get('/profile',    [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [\App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    // Notifications — every role
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::patch('/notifications/read-all',  [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // ── POS (owner, manager, cashier, waiter) ──────────────────────────────
    Route::middleware('role:owner,manager,cashier,waiter')->group(function () {
        Route::get('/pos',                         [OrderController::class, 'index'])->name('pos.index');
        Route::post('/pos/orders',                 [OrderController::class, 'store'])->name('pos.orders.store');
        Route::patch('/pos/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('pos.orders.cancel');
    });

    // ── Payments (owner, manager, cashier, waiter) ─────────────────────────
    Route::middleware('role:owner,manager,cashier,waiter')->group(function () {
        Route::get('/pos/orders/{order}/pay',      [PaymentController::class, 'show'])->name('payments.show');
        Route::post('/pos/orders/{order}/pay',     [PaymentController::class, 'store'])->name('payments.store');
        Route::get('/pos/orders/{order}/receipt',  [PaymentController::class, 'receipt'])->name('payments.receipt');
    });

    // ── Kitchen & bar display (owner, manager, kitchen) ────────────────────
    Route::middleware('role:owner,manager,kitchen')->group(function () {
        Route::get('/kitchen',                           [KitchenController::class, 'index'])->name('kitchen.index');
        Route::patch('/kitchen/items/{orderItem}/ready', [KitchenController::class, 'markReady'])->name('kitchen.items.ready');
    });

    // ── Live Operations (all operational staff) ────────────────────────────
    Route::middleware('role:owner,manager,cashier,waiter,receptionist,kitchen')->group(function () {
        Route::get('/operations',                             [OperationsController::class, 'index'])->name('operations.index');
        Route::patch('/operations/tables/{table}/assign',     [OperationsController::class, 'assignServant'])->name('operations.assign');
    });

    // ── Reservations (owner, manager, waiter, receptionist) ───────────────
    Route::middleware('role:owner,manager,waiter,receptionist')->group(function () {
        Route::get('/reservations',                 [ReservationController::class, 'index'])->name('reservations.index');
        Route::post('/reservations',                [ReservationController::class, 'store'])->name('reservations.store');
        Route::patch('/reservations/{reservation}', [ReservationController::class, 'updateStatus'])->name('reservations.update');
        Route::delete('/reservations/{reservation}',[ReservationController::class, 'destroy'])->name('reservations.destroy');
    });

    // ── Menu management (owner, manager only) ─────────────────────────────
    Route::middleware('role:owner,manager')->group(function () {
        Route::get('/menu',                         [MenuController::class, 'index'])->name('menu.index');
        Route::post('/menu/categories',             [MenuController::class, 'storeCategory'])->name('menu.categories.store');
        Route::patch('/menu/categories/{category}', [MenuController::class, 'updateCategory'])->name('menu.categories.update');
        Route::delete('/menu/categories/{category}',[MenuController::class, 'destroyCategory'])->name('menu.categories.destroy');
        Route::post('/menu/items',                  [MenuController::class, 'storeItem'])->name('menu.items.store');
        Route::patch('/menu/items/{item}/toggle',   [MenuController::class, 'toggleItem'])->name('menu.items.toggle');
        Route::patch('/menu/items/{item}',          [MenuController::class, 'updateItem'])->name('menu.items.update');
        Route::delete('/menu/items/{item}',         [MenuController::class, 'destroyItem'])->name('menu.items.destroy');

        // Tables & QR (owner, manager only)
        Route::get('/tables',             [TableController::class, 'index'])->name('tables.index');
        Route::post('/tables',            [TableController::class, 'store'])->name('tables.store');
        Route::patch('/tables/{table}',   [TableController::class, 'update'])->name('tables.update');
        Route::patch('/tables/{table}/qr',[TableController::class, 'regenerateQr'])->name('tables.qr');
        Route::delete('/tables/{table}',  [TableController::class, 'destroy'])->name('tables.destroy');

        // Staff management (owner, manager only)
        Route::get('/staff',          [StaffController::class, 'index'])->name('staff.index');
        Route::post('/staff',         [StaffController::class, 'store'])->name('staff.store');
        Route::patch('/staff/{user}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{user}',[StaffController::class, 'destroy'])->name('staff.destroy');

        // Reports (owner, manager only — extras get it via permissions)
        Route::get('/reports', [ReportsController::class, 'index'])->name('reports.index');
        Route::get('/reports/period', [ReportsController::class, 'index'])->name('reports.period');
        Route::get('/reports/export', [ReportsController::class, 'export'])->name('reports.export');

        // Business settings — name, contact info, payment method numbers
        // (owner, manager only)
        Route::get('/settings/business',          [\App\Http\Controllers\BusinessSettingsController::class, 'edit'])->name('settings.business.edit');
        Route::patch('/settings/business',         [\App\Http\Controllers\BusinessSettingsController::class, 'update'])->name('settings.business.update');
        Route::patch('/settings/business/payment', [\App\Http\Controllers\BusinessSettingsController::class, 'updatePayment'])->name('settings.business.payment');
    });
});

require __DIR__ . '/auth.php';
