<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'today');

        [$start, $end, $chartDays] = match ($period) {
            'week'  => [now()->startOfWeek(),  now()->endOfDay(), 7],
            'month' => [now()->startOfMonth(), now()->endOfDay(), (int) now()->format('d')],
            'year'  => [now()->startOfYear(),  now()->endOfDay(), 12],
            'all'   => [now()->subYears(10),   now()->endOfDay(), 12],
            default => [now()->startOfDay(),   now()->endOfDay(), 24],
        };

        // ── Revenue summary ──────────────────────────────────────────────────
        $baseQ = fn () => Order::where('status', 'paid')
            ->whereBetween('created_at', [$start, $end]);

        $revenue = [
            'period'  => (int) $baseQ()->sum('total'),
            'today'   => (int) Order::where('status', 'paid')->whereDate('created_at', today())->sum('total'),
            'week'    => (int) Order::where('status', 'paid')->where('created_at', '>=', now()->startOfWeek())->sum('total'),
            'month'   => (int) Order::where('status', 'paid')->where('created_at', '>=', now()->startOfMonth())->sum('total'),
            'year'    => (int) Order::where('status', 'paid')->where('created_at', '>=', now()->startOfYear())->sum('total'),
            'all'     => (int) Order::where('status', 'paid')->sum('total'),
        ];

        // ── Order counts ─────────────────────────────────────────────────────
        $orders = [
            'total'     => Order::whereBetween('created_at', [$start, $end])->count(),
            'paid'      => Order::whereBetween('created_at', [$start, $end])->where('status', 'paid')->count(),
            'open'      => Order::whereNotIn('status', ['paid', 'cancelled'])->count(),
            'cancelled' => Order::whereBetween('created_at', [$start, $end])->where('status', 'cancelled')->count(),
        ];

        // ── Category revenue breakdown ───────────────────────────────────────
        $byCategory = OrderItem::join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('menu_categories', 'menu_items.category_id', '=', 'menu_categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'paid')
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('order_items.menu_item_id')
            ->select(
                'menu_categories.name',
                'menu_categories.kind',
                DB::raw('SUM(order_items.line_total) as revenue'),
                DB::raw('SUM(order_items.quantity) as qty')
            )
            ->groupBy('menu_categories.id', 'menu_categories.name', 'menu_categories.kind')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($c) => [
                'name'    => $c->name,
                'kind'    => $c->kind,
                'revenue' => (int) $c->revenue,
                'qty'     => (int) $c->qty,
            ]);

        // Food vs Drinks totals
        $foodTotal  = $byCategory->where('kind', 'food')->sum('revenue');
        $drinkTotal = $byCategory->where('kind', 'drink')->sum('revenue');

        // ── Payment method breakdown ─────────────────────────────────────────
        $byMethod = Payment::where('status', 'confirmed')
            ->whereBetween('created_at', [$start, $end])
            ->select('method', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('method')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($p) => [
                'method' => $p->method,
                'total'  => (int) $p->total,
                'count'  => (int) $p->count,
            ]);

        // ── Top selling items ────────────────────────────────────────────────
        $topItems = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'paid')
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('order_items.menu_item_id')
            ->select('order_items.name_snapshot', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.line_total) as revenue'))
            ->groupBy('order_items.name_snapshot')
            ->orderByDesc('qty')
            ->limit(10)
            ->get()
            ->map(fn ($i) => [
                'name'    => $i->name_snapshot,
                'qty'     => (int) $i->qty,
                'revenue' => (int) $i->revenue,
            ]);

        // ── Trend chart (varies by period) ──────────────────────────────────
        if ($period === 'today') {
            // Hourly for today
            $trend = collect(range(0, 23))->map(function ($h) {
                $s = today()->setHour($h);
                $e = (clone $s)->setHour($h)->setMinute(59)->setSecond(59);
                return [
                    'label'   => str_pad($h, 2, '0', STR_PAD_LEFT) . ':00',
                    'revenue' => (int) Order::where('status', 'paid')->whereBetween('created_at', [$s, $e])->sum('total'),
                    'orders'  => (int) Order::where('status', 'paid')->whereBetween('created_at', [$s, $e])->count(),
                ];
            });
        } elseif ($period === 'year' || $period === 'all') {
            // Monthly
            $trend = collect(range(1, 12))->map(function ($m) use ($start) {
                $yr = $start->year;
                $s  = \Carbon\Carbon::create($yr, $m, 1)->startOfDay();
                $e  = (clone $s)->endOfMonth();
                return [
                    'label'   => $s->format('M'),
                    'revenue' => (int) Order::where('status', 'paid')->whereBetween('created_at', [$s, $e])->sum('total'),
                    'orders'  => (int) Order::where('status', 'paid')->whereBetween('created_at', [$s, $e])->count(),
                ];
            });
        } else {
            // Daily for week/month
            $days = $period === 'week' ? 7 : now()->daysInMonth;
            $trend = collect(range($days - 1, 0))->map(function ($d) {
                $date = today()->subDays($d);
                return [
                    'label'   => $date->format('D d/M'),
                    'revenue' => (int) Order::where('status', 'paid')->whereDate('created_at', $date)->sum('total'),
                    'orders'  => (int) Order::where('status', 'paid')->whereDate('created_at', $date)->count(),
                ];
            });
        }

        // ── Worker performance ───────────────────────────────────────────────
        $workerPerf = User::where('is_active', true)
            ->whereIn('role', ['owner', 'manager', 'cashier', 'waiter', 'receptionist'])
            ->get(['id', 'name', 'role'])
            ->map(function ($u) use ($start, $end) {
                $orders       = Order::where('waiter_id', $u->id)->whereBetween('created_at', [$start, $end])->count();
                $revenue      = (int) Order::where('waiter_id', $u->id)->whereBetween('created_at', [$start, $end])->where('status', 'paid')->sum('total');
                $reservations = Reservation::where('confirmed_by', $u->id)->whereBetween('created_at', [$start, $end])->count();
                $payments     = Payment::where('cashier_id', $u->id)->where('status', 'confirmed')->whereBetween('created_at', [$start, $end])->count();
                return [
                    'name'         => $u->name,
                    'role'         => $u->role,
                    'orders'       => $orders,
                    'revenue'      => $revenue,
                    'reservations' => $reservations,
                    'payments'     => $payments,
                ];
            })
            ->filter(fn ($u) => $u['orders'] + $u['reservations'] + $u['payments'] > 0)
            ->sortByDesc('revenue')
            ->values();

        // ── Activity log ─────────────────────────────────────────────────────
        $recentOrders = Order::with('waiter', 'table')
            ->latest()->limit(20)->get()
            ->map(fn ($o) => [
                'type'   => 'order',
                'icon'   => '🛒',
                'time'   => $o->created_at->toISOString(),
                'text'   => "Order #{$o->order_number}" . ($o->table ? " — {$o->table->label}" : ''),
                'by'     => $o->waiter?->name ?? 'Client (self-order)',
                'status' => $o->status,
            ]);

        $recentPayments = Payment::with('cashier', 'order')
            ->where('status', 'confirmed')->latest()->limit(15)->get()
            ->map(fn ($p) => [
                'type'   => 'payment',
                'icon'   => '💰',
                'time'   => ($p->confirmed_at ?? $p->created_at)->toISOString(),
                'text'   => 'Payment ' . number_format((int) $p->amount) . ' RWF' . ($p->order ? " — #{$p->order->order_number}" : ''),
                'by'     => $p->cashier?->name ?? 'Cashier',
                'status' => 'paid',
            ]);

        $recentReservations = Reservation::with('creator', 'confirmedBy')
            ->latest()->limit(15)->get()
            ->map(fn ($r) => [
                'type'   => 'reservation',
                'icon'   => $r->kind === 'delivery' ? '🚚' : '📅',
                'time'   => $r->created_at->toISOString(),
                'text'   => ($r->kind === 'delivery' ? 'Delivery: ' : 'Booking: ') . $r->customer_name . ' (' . $r->phone . ')',
                'by'     => $r->confirmedBy?->name
                                ? 'Confirmed by ' . $r->confirmedBy->name
                                : ($r->creator?->name ? 'Created by ' . $r->creator->name : 'Client (online)'),
                'status' => $r->status,
            ]);

        $activity = collect($recentOrders)
            ->merge($recentPayments)
            ->merge($recentReservations)
            ->sortByDesc('time')
            ->values()
            ->take(50);

        return Inertia::render('Reports/Index', compact(
            'period', 'revenue', 'orders', 'byCategory', 'foodTotal', 'drinkTotal',
            'byMethod', 'topItems', 'trend', 'workerPerf', 'activity'
        ));
    }
}
