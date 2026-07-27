<?php

namespace Database\Seeders;

use App\Models\DiningTable;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(BusinessSeeder::class);

        // ── Staff users ───────────────────────────────────────────────────
        $staffUsers = [
            ['email' => 'admin@barpos.rw',   'name' => 'Admin',        'role' => 'owner'],
            ['email' => 'manager@barpos.rw',  'name' => 'Manager',      'role' => 'manager'],
            ['email' => 'cashier@barpos.rw',  'name' => 'Cashier',      'role' => 'cashier'],
            ['email' => 'waiter@barpos.rw',   'name' => 'Waiter',       'role' => 'waiter'],
            ['email' => 'kitchen@barpos.rw',  'name' => 'Kitchen Staff','role' => 'kitchen'],
        ];

        foreach ($staffUsers as $s) {
            $user = User::firstOrCreate(
                ['email' => $s['email']],
                [
                    'name'      => $s['name'],
                    'password'  => Hash::make('password'),
                    'role'      => $s['role'],
                    'is_active' => true,
                ]
            );
            // Ensure role is set correctly even for pre-existing accounts
            $user->update(['role' => $s['role'], 'is_active' => true]);
        }

        // ── Dining tables ─────────────────────────────────────────────────
        $tables = [
            ['label' => 'T1',  'zone' => 'Main Hall',  'capacity' => 4],
            ['label' => 'T2',  'zone' => 'Main Hall',  'capacity' => 4],
            ['label' => 'T3',  'zone' => 'Main Hall',  'capacity' => 6],
            ['label' => 'T4',  'zone' => 'Main Hall',  'capacity' => 2],
            ['label' => 'T5',  'zone' => 'Main Hall',  'capacity' => 4],
            ['label' => 'T6',  'zone' => 'Main Hall',  'capacity' => 4],
            ['label' => 'B1',  'zone' => 'Bar',        'capacity' => 2],
            ['label' => 'B2',  'zone' => 'Bar',        'capacity' => 2],
            ['label' => 'B3',  'zone' => 'Bar',        'capacity' => 2],
            ['label' => 'VIP1','zone' => 'VIP Room',   'capacity' => 8],
            ['label' => 'VIP2','zone' => 'VIP Room',   'capacity' => 10],
            ['label' => 'P1',  'zone' => 'Terrace',    'capacity' => 4],
            ['label' => 'P2',  'zone' => 'Terrace',    'capacity' => 4],
        ];

        foreach ($tables as $t) {
            DiningTable::firstOrCreate(['label' => $t['label']], [
                'zone'     => $t['zone'],
                'capacity' => $t['capacity'],
                'status'   => 'free',
            ]);
        }

        // ── Menu categories ───────────────────────────────────────────────
        $categories = [
            ['name' => 'Starters',    'kind' => 'food',  'sort_order' => 1],
            ['name' => 'Main Dishes', 'kind' => 'food',  'sort_order' => 2],
            ['name' => 'Grills',      'kind' => 'food',  'sort_order' => 3],
            ['name' => 'Sides',       'kind' => 'food',  'sort_order' => 4],
            ['name' => 'Desserts',    'kind' => 'food',  'sort_order' => 5],
            ['name' => 'Beers',       'kind' => 'drink', 'sort_order' => 6],
            ['name' => 'Spirits',     'kind' => 'drink', 'sort_order' => 7],
            ['name' => 'Wines',       'kind' => 'drink', 'sort_order' => 8],
            ['name' => 'Cocktails',   'kind' => 'drink', 'sort_order' => 9],
            ['name' => 'Soft Drinks', 'kind' => 'drink', 'sort_order' => 10],
            ['name' => 'Hot Drinks',  'kind' => 'drink', 'sort_order' => 11],
        ];

        $catMap = [];
        foreach ($categories as $c) {
            $cat = MenuCategory::firstOrCreate(['name' => $c['name']], [
                'kind'       => $c['kind'],
                'sort_order' => $c['sort_order'],
            ]);
            $catMap[$c['name']] = $cat->id;
        }

        // ── Menu items ────────────────────────────────────────────────────
        $items = [
            // Starters
            ['category' => 'Starters',    'name' => 'Spring Rolls (4pcs)',     'price' => 3000,  'station' => 'kitchen', 'desc' => 'Crispy vegetable spring rolls with dipping sauce'],
            ['category' => 'Starters',    'name' => 'Chicken Wings (6pcs)',    'price' => 5000,  'station' => 'kitchen', 'desc' => 'Spicy grilled wings with blue cheese dip'],
            ['category' => 'Starters',    'name' => 'Fries',                   'price' => 2000,  'station' => 'kitchen', 'desc' => 'Seasoned golden fries'],
            ['category' => 'Starters',    'name' => 'Samosas (4pcs)',          'price' => 2500,  'station' => 'kitchen', 'desc' => 'Beef samosas with chilli sauce'],

            // Main Dishes
            ['category' => 'Main Dishes', 'name' => 'Grilled Tilapia',        'price' => 8000,  'station' => 'kitchen', 'desc' => 'Whole tilapia grilled with herbs, served with ugali & greens'],
            ['category' => 'Main Dishes', 'name' => 'Chicken Stew',           'price' => 6000,  'station' => 'kitchen', 'desc' => 'Slow-cooked chicken stew with rice'],
            ['category' => 'Main Dishes', 'name' => 'Beef Stew',              'price' => 7000,  'station' => 'kitchen', 'desc' => 'Tender beef in tomato sauce with chips or rice'],
            ['category' => 'Main Dishes', 'name' => 'Goat Brochette',         'price' => 9000,  'station' => 'kitchen', 'desc' => 'Grilled goat skewers, chips & salad', 'special' => true],
            ['category' => 'Main Dishes', 'name' => 'Vegetable Curry',        'price' => 5000,  'station' => 'kitchen', 'desc' => 'Seasonal vegetables in coconut curry sauce'],
            ['category' => 'Main Dishes', 'name' => 'Mixed Rice Plate',       'price' => 4500,  'station' => 'kitchen', 'desc' => 'Rice with beans, matoke & greens'],

            // Grills
            ['category' => 'Grills',      'name' => 'Beef Brochette (5pcs)',  'price' => 10000, 'station' => 'kitchen', 'desc' => '5 beef skewers with chips'],
            ['category' => 'Grills',      'name' => 'Mixed Grill Platter',    'price' => 18000, 'station' => 'kitchen', 'desc' => 'Beef, chicken & goat with chips & salad'],
            ['category' => 'Grills',      'name' => 'Half Chicken Grilled',   'price' => 9000,  'station' => 'kitchen', 'desc' => 'Marinated half chicken, roasted'],

            // Sides
            ['category' => 'Sides',       'name' => 'Steamed Rice',           'price' => 1500,  'station' => 'kitchen', 'desc' => ''],
            ['category' => 'Sides',       'name' => 'Ugali',                  'price' => 1000,  'station' => 'kitchen', 'desc' => ''],
            ['category' => 'Sides',       'name' => 'Chips',                  'price' => 2000,  'station' => 'kitchen', 'desc' => ''],
            ['category' => 'Sides',       'name' => 'Matoke',                 'price' => 1500,  'station' => 'kitchen', 'desc' => ''],
            ['category' => 'Sides',       'name' => 'Coleslaw Salad',         'price' => 1500,  'station' => 'kitchen', 'desc' => ''],

            // Desserts
            ['category' => 'Desserts',    'name' => 'Chocolate Cake Slice',   'price' => 3000,  'station' => 'kitchen', 'desc' => ''],
            ['category' => 'Desserts',    'name' => 'Fresh Fruit Salad',      'price' => 2500,  'station' => 'kitchen', 'desc' => ''],
            ['category' => 'Desserts',    'name' => 'Ice Cream (2 scoops)',   'price' => 2000,  'station' => 'kitchen', 'desc' => 'Vanilla or chocolate'],

            // Beers
            ['category' => 'Beers',       'name' => 'Primus (600ml)',         'price' => 1500,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Beers',       'name' => 'Mutzig (600ml)',         'price' => 1500,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Beers',       'name' => 'Heineken (330ml)',       'price' => 2500,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Beers',       'name' => 'Guinness (450ml)',       'price' => 2000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Beers',       'name' => 'Turbo King (600ml)',     'price' => 1500,  'station' => 'bar', 'desc' => ''],

            // Spirits
            ['category' => 'Spirits',     'name' => 'Konyagi (50ml)',         'price' => 1500,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Spirits',     'name' => 'Konyagi (250ml)',        'price' => 4000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Spirits',     'name' => 'Johnnie Walker Red',     'price' => 5000,  'station' => 'bar', 'desc' => '50ml measure'],
            ['category' => 'Spirits',     'name' => 'Jameson Irish Whiskey',  'price' => 6000,  'station' => 'bar', 'desc' => '50ml measure'],
            ['category' => 'Spirits',     'name' => 'Smirnoff Vodka (50ml)', 'price' => 3000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Spirits',     'name' => 'Bacardi Rum (50ml)',     'price' => 3000,  'station' => 'bar', 'desc' => ''],

            // Wines
            ['category' => 'Wines',       'name' => 'Red Wine (glass)',       'price' => 4000,  'station' => 'bar', 'desc' => 'House red'],
            ['category' => 'Wines',       'name' => 'White Wine (glass)',     'price' => 4000,  'station' => 'bar', 'desc' => 'House white'],
            ['category' => 'Wines',       'name' => 'Red Wine (bottle)',      'price' => 18000, 'station' => 'bar', 'desc' => ''],
            ['category' => 'Wines',       'name' => 'White Wine (bottle)',    'price' => 18000, 'station' => 'bar', 'desc' => ''],

            // Cocktails
            ['category' => 'Cocktails',   'name' => 'Mojito',                 'price' => 5000,  'station' => 'bar', 'desc' => 'Rum, lime, mint, soda'],
            ['category' => 'Cocktails',   'name' => 'Dawa',                   'price' => 5000,  'station' => 'bar', 'desc' => 'Vodka, honey, lime — Kenyan classic'],
            ['category' => 'Cocktails',   'name' => 'Gin & Tonic',            'price' => 4500,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Cocktails',   'name' => 'Pina Colada',            'price' => 5500,  'station' => 'bar', 'desc' => 'Rum, coconut, pineapple'],
            ['category' => 'Cocktails',   'name' => 'Margarita',              'price' => 5000,  'station' => 'bar', 'desc' => 'Tequila, triple sec, lime'],

            // Soft Drinks
            ['category' => 'Soft Drinks', 'name' => 'Coca-Cola (300ml)',      'price' => 1000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Soft Drinks', 'name' => 'Fanta Orange (300ml)',   'price' => 1000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Soft Drinks', 'name' => 'Sprite (300ml)',         'price' => 1000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Soft Drinks', 'name' => 'Still Water (500ml)',    'price' => 800,   'station' => 'bar', 'desc' => ''],
            ['category' => 'Soft Drinks', 'name' => 'Sparkling Water (500ml)','price' => 1200, 'station' => 'bar', 'desc' => ''],
            ['category' => 'Soft Drinks', 'name' => 'Fresh Juice (orange)',   'price' => 2000,  'station' => 'bar', 'desc' => 'Freshly squeezed'],
            ['category' => 'Soft Drinks', 'name' => 'Fresh Juice (passion)',  'price' => 2000,  'station' => 'bar', 'desc' => 'Freshly squeezed'],
            ['category' => 'Soft Drinks', 'name' => 'Mineral Water (1.5L)',   'price' => 1500,  'station' => 'bar', 'desc' => ''],

            // Hot Drinks
            ['category' => 'Hot Drinks',  'name' => 'Coffee (black)',         'price' => 1500,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Hot Drinks',  'name' => 'Coffee (with milk)',     'price' => 2000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Hot Drinks',  'name' => 'Tea (black)',            'price' => 1000,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Hot Drinks',  'name' => 'Tea (with milk)',        'price' => 1200,  'station' => 'bar', 'desc' => ''],
            ['category' => 'Hot Drinks',  'name' => 'Hot Chocolate',          'price' => 2500,  'station' => 'bar', 'desc' => ''],
        ];

        foreach ($items as $i) {
            MenuItem::firstOrCreate(
                ['name' => $i['name'], 'category_id' => $catMap[$i['category']]],
                [
                    'price'        => $i['price'],
                    'prep_station' => $i['station'],
                    'description'  => $i['desc'] ?: null,
                    'is_available' => true,
                    'is_special'   => $i['special'] ?? false,
                ]
            );
        }
    }
}
