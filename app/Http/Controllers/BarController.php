<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;

class BarController extends Controller
{
    public function index()
    {
        // Mirrors KitchenController@index but for drink items — bartenders
        // get their own ticket screen instead of a waiter having to notice
        // a badge in POS and self-report bar items as ready.
        $orders = Order::with(['items' => fn ($q) => $q->where('prep_station', 'bar'), 'table'])
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->whereHas('items', fn ($q) => $q->where('prep_station', 'bar'))
            ->orderBy('placed_at')
            ->get()
            ->map(fn ($order) => [
                'id'           => $order->id,
                'order_number' => $order->order_number,
                'type'         => $order->type,
                'table'        => $order->table?->label,
                'placed_at'    => $order->placed_at,
                'status'       => $order->status,
                'bar_items'    => $order->items->values(),
            ]);

        return Inertia::render('Bar/Index', [
            'orders' => $orders,
        ]);
    }
}
