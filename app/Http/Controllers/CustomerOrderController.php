<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerOrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:80',
            'phone'         => 'required|string|max:30',
            'notes'         => 'nullable|string|max:300',
            'table_token'   => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.id'    => 'required|exists:menu_items,id',
            'items.*.qty'   => 'required|integer|min:1|max:20',
        ]);

        $table = null;
        if (!empty($data['table_token'])) {
            $table = DiningTable::where('qr_token', $data['table_token'])->first();
        }

        $order = DB::transaction(function () use ($data, $table) {
            $seq = Order::whereDate('created_at', today())->count() + 1;

            $order = Order::create([
                'order_number'   => now()->format('Ymd') . '-' . str_pad($seq, 3, '0', STR_PAD_LEFT),
                'type'           => 'dine_in',
                'source'         => 'qr_scan',
                'table_id'       => $table?->id,
                'waiter_id'      => null,   // self-order — no waiter assigned yet
                'customer_name'  => $data['customer_name'],
                'customer_phone' => $data['phone'],
                'status'         => 'open',
                'notes'          => $data['notes'] ?? null,
                'placed_at'      => now(),
                'subtotal'       => 0,
                'tax'            => 0,
                'discount'       => 0,
                'total'          => 0,
            ]);

            $subtotal = 0;
            foreach ($data['items'] as $line) {
                $item      = MenuItem::findOrFail($line['id']);
                $lineTotal = $item->price * $line['qty'];
                $subtotal += $lineTotal;

                $order->items()->create([
                    'menu_item_id'   => $item->id,
                    'name_snapshot'  => $item->name,
                    'price_snapshot' => $item->price,
                    'quantity'       => $line['qty'],
                    'line_total'     => $lineTotal,
                    'prep_station'   => $item->prep_station,
                    'status'         => 'new',
                ]);
            }

            $order->update(['subtotal' => $subtotal, 'total' => $subtotal]);
            return $order;
        });

        return response()->json([
            'order_number' => $order->order_number,
            'total'        => $order->total,
            'table'        => $table?->label,
        ]);
    }
}
