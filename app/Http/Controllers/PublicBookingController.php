<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicBookingController extends Controller
{
    public function show()
    {
        return Inertia::render('Public/Book', [
            'business' => [
                'name'    => config('app.business_name', config('app.name', 'BarPOS')),
                'phone'   => config('app.business_phone', ''),
                'address' => config('app.business_address', ''),
            ],
            'tables' => DiningTable::where('status', 'available')
                ->orderBy('zone')->orderBy('label')
                ->get(['id', 'label', 'zone', 'capacity']),
            'minDate' => now()->format('Y-m-d\TH:i'),
            'maxDate' => now()->addDays(30)->format('Y-m-d\TH:i'),
        ]);
    }

    public function store(Request $request)
    {
        $kind = $request->input('kind', 'table');

        $rules = [
            'kind'             => 'required|in:table,delivery',
            'customer_name'    => 'required|string|max:120',
            'phone'            => 'required|string|max:30',
            'party_size'       => 'required|integer|min:1|max:50',
            'scheduled_at'     => 'required|date|after:now',
            'notes'            => 'nullable|string|max:500',
        ];

        if ($kind === 'table') {
            $rules['table_id'] = 'nullable|exists:dining_tables,id';
        } else {
            $rules['delivery_address'] = 'required|string|max:300';
        }

        $data = $request->validate($rules);

        Reservation::create([
            'kind'             => $data['kind'],
            'customer_name'    => $data['customer_name'],
            'phone'            => $data['phone'],
            'party_size'       => $data['party_size'],
            'scheduled_at'     => $data['scheduled_at'],
            'table_id'         => $kind === 'table' ? ($data['table_id'] ?? null) : null,
            'delivery_address' => $kind === 'delivery' ? $data['delivery_address'] : null,
            'notes'            => $data['notes'] ?? null,
            'status'           => 'pending',
            'created_by'       => null,
        ]);

        return back()->with('booked', true);
    }
}
