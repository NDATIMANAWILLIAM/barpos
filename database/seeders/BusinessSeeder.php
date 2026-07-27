<?php

namespace Database\Seeders;

use App\Models\BusinessProfile;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class BusinessSeeder extends Seeder
{
    public function run(): void
    {
        // ── Business Profile ──────────────────────────────────────────────
        BusinessProfile::firstOrCreate(
            ['id' => 1],
            [
                'name'        => 'My Bar & Restaurant',
                'type'        => 'bar',
                'phone'       => '078 000 0000',
                'address'     => 'KG 123 St, Kigali',
                'tin'         => '',
                'currency'    => 'RWF',
                'tax_rate_bp' => 0,          // 0% tax — change to 1800 for 18% VAT
            ]
        );

        // ── Payment settings ──────────────────────────────────────────────
        $settings = [
            // MTN Mobile Money
            'momo_enabled'       => '1',
            'momo_number'        => '078 000 0000',   // ← change to your MTN MoMo number
            'momo_name'          => 'My Bar',         // ← name registered on MoMo

            // Airtel Money
            'airtel_enabled'     => '1',
            'airtel_number'      => '073 000 0000',   // ← change to your Airtel number
            'airtel_name'        => 'My Bar',

            // Bank transfer
            'bank_enabled'       => '1',
            'bank_name'          => 'Bank of Kigali', // ← your bank
            'bank_account'       => '000 123 456 789',// ← your account number
            'bank_account_name'  => 'My Bar Ltd',

            // Card / POS machine
            'card_enabled'       => '1',

            // Cash (always enabled)
            'cash_enabled'       => '1',
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value, 'updated_at' => now()]);
        }
    }
}
