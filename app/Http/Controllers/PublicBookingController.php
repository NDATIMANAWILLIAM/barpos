<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use App\Models\DiningTable;
use App\Models\Reservation;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicBookingController extends Controller
{
    public function show()
    {
        $business = BusinessProfile::first();

        return Inertia::render('Public/Book', [
            'business' => [
                'name'    => $business?->name ?? config('app.name', 'Isaro Rubengera'),
                'phone'   => $business?->phone,
                'address' => $business?->address,
            ],
            // Whoever's on duty right now — same "who to call" concept as
            // the guest menu, editable by owner/manager from the dashboard.
            'contact' => [
                'name'  => Setting::get('on_duty_contact_name') ?: null,
                'phone' => Setting::get('on_duty_contact_phone') ?: $business?->phone,
            ],
            'tables' => DiningTable::where('status', 'free')
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
            'source'           => 'online',
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
