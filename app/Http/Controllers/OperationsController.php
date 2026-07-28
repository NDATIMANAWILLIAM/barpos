<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\TableAssigned;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperationsController extends Controller
{
    public function index()
    {
        $servants = User::where('is_active', true)
            ->whereIn('role', ['waiter', 'manager', 'owner'])
            ->orderBy('name')
            ->get(['id', 'name', 'role'])
            ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'role' => $u->role]);

        // Table grid with active orders
        $tables = DiningTable::with([
            'orders' => fn ($q) => $q->whereNotIn('status', ['paid', 'cancelled'])
                ->with(['items', 'waiter']),
            'servant',
        ])->orderBy('zone')->orderBy('label')->get()
        ->map(function ($t) {
            $orders         = $t->orders;
            $allItems       = $orders->flatMap->items;
            $newItems       = $allItems->where('status', 'new')->count();
            $preparingItems = $allItems->where('status', 'preparing')->count();
            $readyItems     = $allItems->whereIn('status', ['ready', 'served'])->count();

            // Determine table state
            $state = 'free';
            if ($orders->count() > 0) {
                if ($newItems > 0) {
                    // How old is the oldest new item?
                    $oldest = $orders->flatMap->items
                        ->where('status', 'new')
                        ->sortBy('created_at')
                        ->first();
                    $state = ($oldest && now()->diffInMinutes($oldest->created_at) >= 15)
                        ? 'urgent'
                        : 'waiting';
                } elseif ($preparingItems > 0) {
                    $state = 'preparing';
                } else {
                    $state = 'served';
                }
            }

            return [
                'id'              => $t->id,
                'label'           => $t->label,
                'zone'            => $t->zone,
                'capacity'        => $t->capacity,
                'servant_id'      => $t->servant_id,
                'servant'         => $t->servant?->name,
                'state'           => $state,
                'active_orders'   => $orders->count(),
                'new_items'       => $newItems,
                'preparing_items' => $preparingItems,
                'ready_items'     => $readyItems,
                'orders'          => $orders->map(fn ($o) => [
                    'id'            => $o->id,
                    'order_number'  => $o->order_number,
                    'status'        => $o->status,
                    'total'         => (int) $o->total,
                    'waiter'        => $o->waiter?->name ?? 'Client',
                    'placed_at'     => $o->placed_at?->toISOString() ?? $o->created_at->toISOString(),
                    'items_total'   => $o->items->count(),
                    'new_items'     => $o->items->where('status', 'new')->count(),
                    'preparing'     => $o->items->where('status', 'preparing')->count(),
                    'ready'         => $o->items->whereIn('status', ['ready', 'served'])->count(),
                ])->values(),
            ];
        });

        // All open orders (for queue view)
        $orderQueue = Order::with(['items', 'table', 'waiter'])
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->latest()
            ->limit(40)
            ->get()
            ->map(fn ($o) => [
                'id'            => $o->id,
                'order_number'  => $o->order_number,
                'type'          => $o->type,
                'table'         => $o->table?->label,
                'waiter'        => $o->waiter?->name ?? 'Client (self-order)',
                'status'        => $o->status,
                'total'         => (int) $o->total,
                'placed_at'     => $o->placed_at?->toISOString() ?? $o->created_at->toISOString(),
                'items_total'   => $o->items->count(),
                'new_items'     => $o->items->where('status', 'new')->count(),
                'preparing'     => $o->items->where('status', 'preparing')->count(),
                'ready'         => $o->items->whereIn('status', ['ready', 'served'])->count(),
                'notes'         => $o->notes,
            ]);

        // Pending booking requests (need call-back)
        $pendingBookings = Reservation::where('status', 'pending')
            ->with('creator')
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id'               => $r->id,
                'kind'             => $r->kind,
                'customer_name'    => $r->customer_name,
                'phone'            => $r->phone,
                'party_size'       => $r->party_size,
                'scheduled_at'     => $r->scheduled_at,
                'delivery_address' => $r->delivery_address,
                'notes'            => $r->notes,
                'created_at'       => $r->created_at,
                'created_by'       => $r->creator?->name ?? 'Client (online)',
            ]);

        // Active deliveries
        $deliveries = Reservation::where('kind', 'delivery')
            ->whereIn('status', ['confirmed', 'seated'])
            ->with('confirmedBy')
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id'               => $r->id,
                'customer_name'    => $r->customer_name,
                'phone'            => $r->phone,
                'delivery_address' => $r->delivery_address,
                'status'           => $r->status,
                'scheduled_at'     => $r->scheduled_at,
                'notes'            => $r->notes,
                'confirmed_by'     => $r->confirmedBy?->name,
            ]);

        $summary = [
            'open_orders'       => Order::whereNotIn('status', ['paid', 'cancelled'])->count(),
            'paid_today'        => Order::whereDate('created_at', today())->where('status', 'paid')->count(),
            'pending_bookings'  => Reservation::where('status', 'pending')->count(),
            'active_deliveries' => Reservation::where('kind', 'delivery')->whereIn('status', ['confirmed', 'seated'])->count(),
            'tables_occupied'   => $tables->where('state', '!=', 'free')->count(),
            'tables_total'      => $tables->count(),
            'urgent_tables'     => $tables->where('state', 'urgent')->count(),
        ];

        return Inertia::render('Operations/Index', compact(
            'tables', 'orderQueue', 'pendingBookings', 'deliveries', 'summary', 'servants'
        ));
    }

    public function assignServant(Request $request, DiningTable $table)
    {
        $request->validate(['servant_id' => 'nullable|exists:users,id']);
        $table->update(['servant_id' => $request->servant_id]);

        if ($request->servant_id) {
            $servant = User::find($request->servant_id);
            $servant?->notify(new TableAssigned($table, $request->user()));
        }

        return back()->with('success', 'Table assigned.');
    }
}
