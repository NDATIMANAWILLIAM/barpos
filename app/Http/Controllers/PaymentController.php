<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function show(Order $order)
    {
        if ($order->status === 'paid') {
            return redirect()->route('pos.index')
                ->with('info', "Order #{$order->order_number} is already paid.");
        }

        $order->load(['items', 'table']);

        // Load all payment method settings
        $settings = Setting::all_as_array();

        $methods = [];
        if ($settings['momo_enabled'] ?? false) {
            $methods[] = [
                'key'    => 'mtn_momo',
                'label'  => 'MTN MoMo',
                'number' => $settings['momo_number'] ?? '',
                'name'   => $settings['momo_name'] ?? '',
                'icon'   => 'momo',
            ];
        }
        if ($settings['airtel_enabled'] ?? false) {
            $methods[] = [
                'key'    => 'airtel_money',
                'label'  => 'Airtel Money',
                'number' => $settings['airtel_number'] ?? '',
                'name'   => $settings['airtel_name'] ?? '',
                'icon'   => 'airtel',
            ];
        }
        if ($settings['cash_enabled'] ?? true) {
            $methods[] = ['key' => 'cash', 'label' => 'Cash', 'icon' => 'cash'];
        }
        if ($settings['bank_enabled'] ?? false) {
            $methods[] = [
                'key'          => 'bank',
                'label'        => 'Bank Transfer',
                'bank_name'    => $settings['bank_name'] ?? '',
                'bank_account' => $settings['bank_account'] ?? '',
                'account_name' => $settings['bank_account_name'] ?? '',
                'icon'         => 'bank',
            ];
        }
        if ($settings['card_enabled'] ?? false) {
            $methods[] = ['key' => 'card', 'label' => 'Card / POS Machine', 'icon' => 'card'];
        }

        return Inertia::render('Payment/Index', [
            'order' => [
                'id'           => $order->id,
                'order_number' => $order->order_number,
                'type'         => $order->type,
                'table'        => $order->table?->label,
                'status'       => $order->status,
                'subtotal'     => $order->subtotal,
                'tax'          => $order->tax ?? 0,
                'discount'     => $order->discount ?? 0,
                'total'        => $order->total,
                'items'        => $order->items->map(fn ($i) => [
                    'id'             => $i->id,
                    'name_snapshot'  => $i->name_snapshot,
                    'price_snapshot' => $i->price_snapshot,
                    'quantity'       => $i->quantity,
                    'line_total'     => $i->line_total,
                ]),
            ],
            'paymentMethods' => $methods,
        ]);
    }

    public function store(Request $request, Order $order)
    {
        if ($order->status === 'paid') {
            return back()->withErrors(['order' => 'This order has already been paid.']);
        }

        $data = $request->validate([
            'method'       => 'required|in:cash,mtn_momo,airtel_money,card,bank',
            'amount_given' => 'required|integer|min:0',
            'reference'    => 'nullable|string|max:80',
            'ebm_number'   => 'nullable|string|max:50',
        ]);

        if ($data['amount_given'] < $order->total) {
            return back()->withErrors(['amount_given' => 'Amount given is less than the order total of ' . number_format($order->total) . ' RWF.']);
        }

        $payment = null;
        DB::transaction(function () use ($order, $data, $request, &$payment) {
            $payment = Payment::create([
                'order_id'     => $order->id,
                'method'       => $data['method'],
                'amount'       => $order->total,
                'status'       => 'confirmed',
                'reference'    => $data['reference'] ?? null,
                'ebm_number'   => $data['ebm_number'] ?? null,
                'cashier_id'   => $request->user()->id,
                'confirmed_at' => now(),
            ]);
            $order->update(['status' => 'paid']);
        });

        return redirect()->route('payments.receipt', ['order' => $order->id]);
    }

    public function receipt(Order $order)
    {
        $order->load(['items', 'table']);
        $payment = $order->payments()->latest()->first();
        $business = \App\Models\BusinessProfile::first();
        $cashier  = $payment?->cashier;

        $methodLabels = [
            'cash'         => 'Cash',
            'mtn_momo'     => 'MTN Mobile Money',
            'airtel_money' => 'Airtel Money',
            'card'         => 'Card / POS Machine',
            'bank'         => 'Bank Transfer',
        ];

        return Inertia::render('Payment/Receipt', [
            'order' => [
                'id'           => $order->id,
                'order_number' => $order->order_number,
                'type'         => $order->type,
                'table'        => $order->table?->label,
                'notes'        => $order->notes,
                'subtotal'     => $order->subtotal,
                'tax'          => $order->tax ?? 0,
                'discount'     => $order->discount ?? 0,
                'total'        => $order->total,
                'placed_at'    => $order->placed_at?->toDateTimeString(),
                'items'        => $order->items->map(fn ($i) => [
                    'name_snapshot'  => $i->name_snapshot,
                    'price_snapshot' => $i->price_snapshot,
                    'quantity'       => $i->quantity,
                    'line_total'     => $i->line_total,
                ]),
            ],
            'payment' => $payment ? [
                'method'       => $payment->method,
                'method_label' => $methodLabels[$payment->method] ?? $payment->method,
                'amount'       => $payment->amount,
                'reference'    => $payment->reference,
                'ebm_number'   => $payment->ebm_number,
                'confirmed_at' => $payment->confirmed_at?->toDateTimeString(),
            ] : null,
            'cashier'  => $cashier?->name,
            'business' => $business ? [
                'name'    => $business->name,
                'phone'   => $business->phone,
                'address' => $business->address,
                'tin'     => $business->tin,
            ] : ['name' => config('app.name', 'Isaro Rubengera'), 'phone' => null, 'address' => null, 'tin' => null],
        ]);
    }
}
