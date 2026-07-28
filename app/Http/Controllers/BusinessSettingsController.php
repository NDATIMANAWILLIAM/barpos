<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusinessSettingsController extends Controller
{
    public function edit()
    {
        $business = BusinessProfile::firstOrFail();
        $settings = Setting::all_as_array();

        return Inertia::render('Settings/Business', [
            'business' => $business,
            'payment'  => [
                'momo_enabled'      => (bool) ($settings['momo_enabled'] ?? false),
                'momo_number'       => $settings['momo_number'] ?? '',
                'momo_name'         => $settings['momo_name'] ?? '',
                'airtel_enabled'    => (bool) ($settings['airtel_enabled'] ?? false),
                'airtel_number'     => $settings['airtel_number'] ?? '',
                'airtel_name'       => $settings['airtel_name'] ?? '',
                'bank_enabled'      => (bool) ($settings['bank_enabled'] ?? false),
                'bank_name'         => $settings['bank_name'] ?? '',
                'bank_account'      => $settings['bank_account'] ?? '',
                'bank_account_name' => $settings['bank_account_name'] ?? '',
                'card_enabled'      => (bool) ($settings['card_enabled'] ?? false),
                'cash_enabled'      => (bool) ($settings['cash_enabled'] ?? true),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'type'        => 'required|in:bar,restaurant,lodge,guest_house,hotel',
            'phone'       => 'nullable|string|max:30',
            'address'     => 'nullable|string|max:255',
            'tin'         => 'nullable|string|max:30',
            'tax_rate_bp' => 'required|integer|min:0|max:10000',
        ]);

        BusinessProfile::firstOrFail()->update($data);

        return back()->with('success', 'Business details updated.');
    }

    public function updatePayment(Request $request)
    {
        $data = $request->validate([
            'momo_enabled'      => 'boolean',
            'momo_number'       => 'nullable|string|max:30',
            'momo_name'         => 'nullable|string|max:100',
            'airtel_enabled'    => 'boolean',
            'airtel_number'     => 'nullable|string|max:30',
            'airtel_name'       => 'nullable|string|max:100',
            'bank_enabled'      => 'boolean',
            'bank_name'         => 'nullable|string|max:100',
            'bank_account'      => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:100',
            'card_enabled'      => 'boolean',
            'cash_enabled'      => 'boolean',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, is_bool($value) ? ($value ? '1' : '0') : $value);
        }

        return back()->with('success', 'Payment settings updated.');
    }
}
