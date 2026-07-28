<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\User;
use App\Notifications\TableAssigned;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        $tables = DiningTable::with('servant:id,name,phone,role')
            ->withCount([
                'reservations as upcoming_reservations' => fn ($q) =>
                    $q->whereDate('scheduled_at', '>=', today())
                      ->whereIn('status', ['confirmed']),
            ])->orderBy('zone')->orderBy('label')->get();

        $servants = User::whereIn('role', ['waiter', 'manager', 'owner'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'role']);

        return Inertia::render('Tables/Index', [
            'tables'   => $tables,
            'servants' => $servants,
            'appUrl'   => config('app.url'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label'      => 'required|string|max:20|unique:dining_tables,label',
            'zone'       => 'nullable|string|max:60',
            'capacity'   => 'required|integer|min:1',
            'servant_id' => 'nullable|exists:users,id',
        ]);

        $table = DiningTable::create(array_merge($data, [
            'status'   => 'free',
            'qr_token' => Str::random(12),
        ]));

        if ($data['servant_id'] ?? null) {
            User::find($data['servant_id'])?->notify(new TableAssigned($table, $request->user()));
        }

        return back()->with('success', 'Table added.');
    }

    public function update(Request $request, DiningTable $table)
    {
        $data = $request->validate([
            'label'      => 'required|string|max:20|unique:dining_tables,label,' . $table->id,
            'zone'       => 'nullable|string|max:60',
            'capacity'   => 'required|integer|min:1',
            'status'     => 'required|in:free,occupied,reserved,cleaning',
            'servant_id' => 'nullable|exists:users,id',
        ]);

        $servantChanged = ($data['servant_id'] ?? null) && $data['servant_id'] != $table->servant_id;

        $table->update($data);

        if ($servantChanged) {
            User::find($data['servant_id'])?->notify(new TableAssigned($table, $request->user()));
        }

        return back()->with('success', 'Table updated.');
    }

    public function regenerateQr(DiningTable $table)
    {
        $table->update(['qr_token' => Str::random(12)]);
        return back()->with('success', "New QR code generated for {$table->label}.");
    }

    public function destroy(DiningTable $table)
    {
        $table->delete();
        return back()->with('success', 'Table removed.');
    }
}
