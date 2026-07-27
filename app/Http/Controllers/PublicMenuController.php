<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use App\Models\DiningTable;
use App\Models\MenuCategory;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PublicMenuController extends Controller
{
    public function show(?string $token = null)
    {
        $table = null;
        if ($token) {
            $table = DiningTable::with('servant:id,name,phone')->where('qr_token', $token)->first();
        }

        $business = BusinessProfile::first();

        $categories = MenuCategory::where('is_active', true)
            ->with(['items' => fn ($q) => $q->where('is_available', true)->orderBy('sort_order')->orderBy('name')])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->filter(fn ($c) => $c->items->isNotEmpty())
            ->map(fn ($c) => [
                'id'    => $c->id,
                'name'  => $c->name,
                'kind'  => $c->kind,
                'slug'  => Str::slug($c->name),
                'items' => $c->items->map(fn ($i) => [
                    'id'          => $i->id,
                    'name'        => $i->name,
                    'description' => $i->description,
                    'price'       => $i->price,
                    'is_special'  => (bool) $i->is_special,
                ])->values(),
            ])
            ->values();

        return Inertia::render('Public/Menu', [
            'categories' => $categories,
            'table'      => $table ? [
                'label'   => $table->label,
                'zone'    => $table->zone,
                'token'   => $table->qr_token,
                'servant' => $table->servant ? [
                    'name'  => $table->servant->name,
                    'phone' => $table->servant->phone,
                ] : null,
            ] : null,
            'business'   => $business ? [
                'name'    => $business->name,
                'phone'   => $business->phone,
                'address' => $business->address,
            ] : null,
        ]);
    }
}
