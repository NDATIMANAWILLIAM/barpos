<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with('table', 'creator', 'confirmedBy')
            ->whereDate('scheduled_at', '>=', today())
            ->orderBy('scheduled_at')
            ->get()
            ->map(function ($r) {
                $tableOrders = [];
                if ($r->table_id && $r->status === 'seated') {
                    $tableOrders = Order::with('items')
                        ->where('table_id', $r->table_id)
                        ->whereNotIn('status', ['paid', 'cancelled'])
                        ->latest()
                        ->get()
                        ->map(fn ($o) => [
                            'id'           => $o->id,
                            'order_number' => $o->order_number,
                            'status'       => $o->status,
                            'total'        => $o->total,
                            'items'        => $o->items->map(fn ($i) => [
                                'name'       => $i->name_snapshot,
                                'quantity'   => $i->quantity,
                                'line_total' => $i->line_total,
                            ]),
                        ])
                        ->values();
                }
                return [
                    'id'               => $r->id,
                    'kind'             => $r->kind,
                    'source'           => $r->source,
                    'customer_name'    => $r->customer_name,
                    'phone'            => $r->phone,
                    'party_size'       => $r->party_size,
                    'scheduled_at'     => $r->scheduled_at,
                    'table'            => $r->table?->label,
                    'table_id'         => $r->table_id,
                    'delivery_address' => $r->delivery_address,
                    'status'           => $r->status,
                    'notes'            => $r->notes,
                    'created_at'       => $r->created_at,
                    'created_by_name'  => $r->creator?->name ?? 'Client (online)',
                    'confirmed_by_name'=> $r->confirmedBy?->name,
                    'table_orders'     => $tableOrders,
                ];
            });

        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
            'tables'       => DiningTable::orderBy('label')->get(['id', 'label', 'zone', 'capacity']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kind'             => 'nullable|in:table,delivery',
            'source'           => 'required|in:phone_call,walk_in',
            'customer_name'    => 'required|string|max:120',
            'phone'            => 'required|string|max:30',
            'party_size'       => 'required|integer|min:1|max:50',
            'scheduled_at'     => 'required|date|after:now',
            'table_id'         => 'nullable|exists:dining_tables,id',
            'delivery_address' => 'nullable|string|max:300',
            'notes'            => 'nullable|string|max:500',
        ]);

        Reservation::create(array_merge($data, [
            'kind'       => $data['kind'] ?? 'table',
            'status'     => 'confirmed',
            'created_by' => $request->user()->id,
        ]));

        return back()->with('success', 'Reservation confirmed for ' . $data['customer_name'] . '!');
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'status'     => 'required|in:confirmed,seated,cancelled,no_show,delivered',
            'table_id'   => 'nullable|exists:dining_tables,id',
            'call_notes' => 'nullable|string|max:500',
        ]);

        $update = [
            'status'       => $data['status'],
            'confirmed_by' => $request->user()->id,
        ];

        if (!empty($data['table_id'])) {
            $update['table_id'] = $data['table_id'];
        }
        if (!empty($data['call_notes'])) {
            $existing = $reservation->notes ? $reservation->notes . "\n" : '';
            $update['notes'] = $existing . '[' . now()->format('H:i') . ' by ' . $request->user()->name . '] ' . $data['call_notes'];
        }

        $reservation->update($update);
        return back()->with('success', 'Reservation updated.');
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->delete();
        return back()->with('success', 'Reservation deleted.');
    }
}
