<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Pos/Index', [
            'categories' => MenuCategory::orderBy('sort_order')->orderBy('name')->get(),
            'menuItems'  => MenuItem::with('category')
                ->where('is_available', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'tables'     => DiningTable::orderBy('label')->get(),
            'openOrders' => Order::with(['items', 'table'])
                ->whereNotIn('status', ['paid', 'cancelled'])
                // Ready orders need to be picked up and served — surface
                // them above orders still being prepared, regardless of age.
                ->orderByRaw("status = 'ready' desc")
                ->latest()
                ->take(20)
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'                   => 'required|in:dine_in,takeaway,room_service',
            'table_id'               => 'nullable|exists:dining_tables,id',
            'notes'                  => 'nullable|string|max:255',
            'items'                  => 'required|array|min:1',
            // Menu items: menu_item_id provided
            'items.*.menu_item_id'   => 'nullable|exists:menu_items,id',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.notes'          => 'nullable|string|max:255',
            // Custom charges (room, accommodation, etc.): no menu_item_id
            'items.*.custom_name'    => 'nullable|string|max:120',
            'items.*.custom_price'   => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($data, $request) {
            $seq = Order::whereDate('created_at', today())->count() + 1;

            $order = Order::create([
                'order_number' => now()->format('Ymd') . '-' . str_pad($seq, 3, '0', STR_PAD_LEFT),
                'type'         => $data['type'],
                'table_id'     => $data['table_id'] ?? null,
                'waiter_id'    => $request->user()->id,
                'status'       => 'open',
                'notes'        => $data['notes'] ?? null,
                'placed_at'    => now(),
            ]);

            $subtotal = 0;
            foreach ($data['items'] as $line) {
                if (!empty($line['menu_item_id'])) {
                    $menuItem  = MenuItem::findOrFail($line['menu_item_id']);
                    $lineTotal = $menuItem->price * $line['quantity'];
                    $subtotal += $lineTotal;
                    $order->items()->create([
                        'menu_item_id'   => $menuItem->id,
                        'name_snapshot'  => $menuItem->name,
                        'price_snapshot' => $menuItem->price,
                        'quantity'       => $line['quantity'],
                        'line_total'     => $lineTotal,
                        'prep_station'   => $menuItem->prep_station,
                        'status'         => 'new',
                        'notes'          => $line['notes'] ?? null,
                    ]);
                } elseif (!empty($line['custom_name'])) {
                    // Custom charge: room, accommodation, service fee, etc.
                    $price     = (int) ($line['custom_price'] ?? 0);
                    $lineTotal = $price * $line['quantity'];
                    $subtotal += $lineTotal;
                    $order->items()->create([
                        'menu_item_id'   => null,
                        'name_snapshot'  => $line['custom_name'],
                        'price_snapshot' => $price,
                        'quantity'       => $line['quantity'],
                        'line_total'     => $lineTotal,
                        'prep_station'   => 'none',
                        'status'         => 'new',
                        'notes'          => $line['notes'] ?? null,
                    ]);
                }
            }

            $order->update(['subtotal' => $subtotal, 'total' => $subtotal]);
        });

        return back();
    }

    public function cancel(Order $order)
    {
        if ($order->status === 'paid') {
            return back()->withErrors(['order' => 'Cannot cancel a paid order.']);
        }
        $order->update(['status' => 'cancelled']);
        return back();
    }
}
