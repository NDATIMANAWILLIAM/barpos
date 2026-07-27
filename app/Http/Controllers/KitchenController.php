<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Inertia\Inertia;

class KitchenController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items', 'table'])
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->orderBy('placed_at')
            ->get()
            ->map(function ($order) {
                return [
                    'id'           => $order->id,
                    'order_number' => $order->order_number,
                    'type'         => $order->type,
                    'table'        => $order->table?->label,
                    'placed_at'    => $order->placed_at,
                    'status'       => $order->status,
                    'kitchen_items' => $order->items->where('prep_station', 'kitchen')->values(),
                    'bar_items'     => $order->items->where('prep_station', 'bar')->values(),
                ];
            });

        return Inertia::render('Kitchen/Index', [
            'orders' => $orders,
        ]);
    }

    public function markReady(OrderItem $orderItem)
    {
        $orderItem->update(['status' => 'ready']);

        // If all items on the order are ready, bump order status to ready
        $order = $orderItem->order()->with('items')->first();
        $allReady = $order->items->every(fn ($i) => in_array($i->status, ['ready', 'served']));
        if ($allReady) {
            $order->update(['status' => 'ready']);
        }

        return back();
    }
}
