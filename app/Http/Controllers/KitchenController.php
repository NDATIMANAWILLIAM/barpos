<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\OrderReady;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class KitchenController extends Controller
{
    public function index()
    {
        // Kitchen-only — bar/drink items never appear here. Bar prep is
        // simple enough that waiters track it themselves from POS, and
        // mixing the two confused kitchen staff about what was actually
        // theirs to act on.
        $orders = Order::with(['items' => fn ($q) => $q->where('prep_station', 'kitchen'), 'table'])
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->whereHas('items', fn ($q) => $q->where('prep_station', 'kitchen'))
            ->orderBy('placed_at')
            ->get()
            ->map(fn ($order) => [
                'id'            => $order->id,
                'order_number'  => $order->order_number,
                'type'          => $order->type,
                'table'         => $order->table?->label,
                'placed_at'     => $order->placed_at,
                'status'        => $order->status,
                'kitchen_items' => $order->items->values(),
            ]);

        return Inertia::render('Kitchen/Index', [
            'orders' => $orders,
        ]);
    }

    public function markReady(OrderItem $orderItem)
    {
        $orderItem->update(['status' => 'ready']);

        // If all items on the order are ready, bump order status to ready
        // and let the floor staff know — otherwise they only find out by
        // polling or happening to look at the POS screen. Notify every
        // active waiter/owner/manager, not just the order's own waiter —
        // self-orders (QR scan) have no assigned waiter at all, and
        // whoever's free to serve it may not be the one who took it.
        $order = $orderItem->order()->with(['items', 'table', 'waiter'])->first();
        $allReady = $order->items->every(fn ($i) => in_array($i->status, ['ready', 'served']));
        if ($allReady && $order->status !== 'ready') {
            $order->update(['status' => 'ready']);

            $recipients = User::where('is_active', true)
                ->whereIn('role', ['waiter', 'owner', 'manager'])
                ->get();
            Notification::send($recipients, new OrderReady($order));
        }

        return back();
    }
}
