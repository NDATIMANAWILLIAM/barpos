<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\OrderReady;
use App\Notifications\StationReady;
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
        $station = $orderItem->prep_station;
        $orderItem->update(['status' => 'ready']);

        $order = $orderItem->order()->with(['items', 'table.servant', 'waiter'])->first();

        $allReady = $order->items->every(fn ($i) => in_array($i->status, ['ready', 'served']));
        $stationItems = $order->items->where('prep_station', $station);
        $stationAllReady = $stationItems->isNotEmpty()
            && $stationItems->every(fn ($i) => in_array($i->status, ['ready', 'served']));

        if ($allReady && $order->status !== 'ready') {
            $order->update(['status' => 'ready']);
            Notification::send($this->readyRecipients($order), new OrderReady($order));
        } elseif ($stationAllReady && $station !== 'none') {
            // The order isn't fully ready yet, but this station's part of
            // it is — tell the assigned waiter now instead of making them
            // wait for every station, so drinks don't sit while food is
            // still cooking (or vice versa).
            Notification::send($this->readyRecipients($order), new StationReady($order, $station));
        }

        return back();
    }

    /**
     * Who should hear about this order's readiness. Target the order's own
     * waiter (or, for self-orders with no assigned waiter, the table's
     * assigned servant) so one specific person is pinged instead of every
     * waiter on shift — with many waiters on the floor, a broadcast to all
     * of them just causes everyone to wonder "is this mine?" Owners and
     * managers always get a copy too, since they want visibility into every
     * ticket regardless of who's serving it.
     */
    private function readyRecipients(Order $order)
    {
        $targetWaiter = $order->waiter ?? $order->table?->servant;

        $recipients = $targetWaiter
            ? collect([$targetWaiter])
            : User::where('is_active', true)->where('role', 'waiter')->get();

        $managers = User::where('is_active', true)
            ->whereIn('role', ['owner', 'manager'])
            ->get();

        return $recipients->merge($managers)->unique('id');
    }
}
