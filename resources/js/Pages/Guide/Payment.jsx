import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

/* ── tiny helpers ───────────────────────────────────────────────── */
const rwf = (n) => new Intl.NumberFormat('en-RW').format(n ?? 0) + ' RWF';

function TabBtn({ active, onClick, emoji, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-center text-xs font-bold transition sm:flex-row sm:gap-2 sm:text-sm ${
                active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-indigo-50 ring-1 ring-gray-100'
            }`}
        >
            <span className="text-lg sm:text-xl">{emoji}</span>
            <span>{label}</span>
        </button>
    );
}

function Step({ n, text }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-extrabold text-white">
                {n}
            </span>
            <p className="mt-0.5 text-sm text-gray-700">{text}</p>
        </div>
    );
}

function InfoBox({ icon, title, children, color = 'blue' }) {
    const colors = {
        blue:   'bg-blue-50 border-blue-200 text-blue-800',
        green:  'bg-green-50 border-green-200 text-green-800',
        amber:  'bg-amber-50 border-amber-200 text-amber-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800',
        red:    'bg-red-50 border-red-200 text-red-800',
    };
    return (
        <div className={`rounded-2xl border p-4 ${colors[color]}`}>
            <p className="font-bold mb-2">{icon} {title}</p>
            {children}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 1 — SETUP & DEPLOYMENT
══════════════════════════════════════════════════════════════════ */
function TabSetup() {
    return (
        <div className="space-y-6">

            {/* Super Admin */}
            <div className="rounded-2xl bg-amber-50 ring-2 ring-amber-400 p-5">
                <h3 className="text-base font-extrabold text-amber-900 mb-1">👑 Step 1 — Create the Owner (Super Admin) Account</h3>
                <p className="text-sm text-amber-800 mb-4">
                    The first time you set up Isaro Rubengera, you need to create the owner account that controls everything.
                    Open a terminal/command prompt inside the barpos folder and run:
                </p>
                <div className="rounded-xl bg-gray-900 px-4 py-3 font-mono text-sm text-green-400 mb-3">
                    php artisan barpos:make-admin
                </div>
                <p className="text-xs text-amber-700">
                    The system will ask you for name, email, phone, and password.
                    After that, you can log in at <span className="font-mono font-bold">/login</span> with those details.
                    The owner account can do everything — add staff, menu, tables, payments.
                </p>
            </div>

            {/* Local Network Deployment */}
            <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-5 space-y-5">
                <div>
                    <h3 className="text-base font-extrabold text-gray-900 mb-1">
                        🌐 Step 2 — Make it work on all devices in your bar (Local Network)
                    </h3>
                    <p className="text-sm text-gray-600">
                        By default the system only works on the computer it's installed on.
                        To make customers scan QR codes from their phones and to use the system on tablets/phones at
                        your counter, follow these steps. All devices must be on the same WiFi.
                    </p>
                </div>

                <div className="space-y-4">
                    <Step n="1" text={"Find your computer's local IP address. Open Command Prompt and type: ipconfig — look for IPv4 Address under your WiFi adapter. It looks like 192.168.1.100 or 192.168.0.50."} />

                    <Step n="2" text="Open the file called .env in the barpos folder with Notepad. Find the line APP_URL=http://localhost:8000 and change it to use your IP, for example: APP_URL=http://192.168.1.100:8000" />

                    <div>
                        <Step n="3" text="Now start the server with this command so all devices on the WiFi can connect:" />
                        <div className="ml-10 mt-2 rounded-xl bg-gray-900 px-4 py-3 font-mono text-sm text-green-400">
                            php artisan serve --host=0.0.0.0 --port=8000
                        </div>
                    </div>

                    <Step n="4" text="Go to the Tables page in the admin panel and click Regenerate QR on each table. This updates the QR codes to point to your new IP address." />

                    <Step n="5" text="Print the QR codes from the Tables page and stick them on the physical tables. Now customers can scan with their phone camera and reach your menu." />
                </div>

                <InfoBox icon="💡" title="Important: Every time you restart the server, use the same command (--host=0.0.0.0). If your computer's IP changes, repeat from Step 2." color="blue">
                    <p className="text-sm mt-1">To keep the same IP: set a static IP on your router for this computer, or use a router with DHCP reservation.</p>
                </InfoBox>
            </div>

            {/* Adding more staff */}
            <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-5">
                <h3 className="text-base font-extrabold text-gray-900 mb-3">👤 Step 3 — Add Staff (Managers, Waiters, Cashiers)</h3>
                <div className="space-y-3">
                    <Step n="1" text="Log in as Owner, then click Staff in the left sidebar." />
                    <Step n="2" text="Click Add Staff Member and fill in their name, email, role, and a temporary password they can change later." />
                    <Step n="3" text="Staff log in at your-ip:8000/login using that email and password." />
                </div>
                <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-bold text-gray-500 mb-2">ROLES AT A GLANCE</p>
                    <div className="grid gap-1.5 text-xs">
                        {[
                            ['👑 Owner',       'Full access — everything'],
                            ['🎯 Manager',     'Full access except deleting owner accounts'],
                            ['💰 Cashier',     'POS, payments, receipts'],
                            ['🍽 Waiter',      'POS, take orders, see reservations'],
                            ['👨‍🍳 Kitchen',    'See and update order status (display screen)'],
                            ['📦 Storekeeper', 'Inventory only'],
                        ].map(([role, desc]) => (
                            <div key={role} className="flex gap-2">
                                <span className="w-32 shrink-0 font-semibold text-gray-700">{role}</span>
                                <span className="text-gray-500">{desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Client booking link */}
            <div className="rounded-2xl bg-indigo-50 ring-1 ring-indigo-200 p-5">
                <h3 className="text-base font-extrabold text-indigo-900 mb-2">📅 Client Online Booking</h3>
                <p className="text-sm text-indigo-800 mb-3">
                    Share this link with clients so they can book a table themselves — no login needed.
                    Their booking appears in the Reservations page as <strong>Pending</strong> until you confirm it.
                </p>
                <div className="rounded-xl bg-white border border-indigo-200 px-4 py-3 font-mono text-sm text-indigo-700 mb-3 break-all">
                    your-ip:8000/book
                </div>
                <p className="text-xs text-indigo-600">
                    Share via WhatsApp, print on menus, or add to your social media. Clients pick date, time, party size, and any special requests.
                </p>
            </div>

        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 2 — CUSTOMER QR FLOW
══════════════════════════════════════════════════════════════════ */
function TabQR() {
    return (
        <div className="space-y-6">

            <InfoBox icon="📱" title="How it works in one sentence" color="green">
                <p className="text-sm">Customer scans the QR code on the table with their phone camera → menu opens in the browser → they browse and order → kitchen gets the order → waiter delivers it.</p>
            </InfoBox>

            {/* Flow diagram */}
            <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-5">
                <h3 className="text-base font-extrabold text-gray-900 mb-4">Step-by-step: Customer Experience</h3>
                <div className="space-y-0">
                    {[
                        {
                            step: 'Customer sits at the table',
                            detail: 'They see a QR code sticker on the table (printed from the Tables page in your admin panel).',
                            icon: '🪑',
                        },
                        {
                            step: 'Customer scans the QR code',
                            detail: 'Open phone camera app → point it at the QR code → a link appears at the top of the screen → tap it. No app to download!',
                            icon: '📷',
                        },
                        {
                            step: 'Menu opens in the browser',
                            detail: 'The customer sees your full menu — categories, items, prices, descriptions. The table number is already detected automatically.',
                            icon: '🍽️',
                        },
                        {
                            step: 'Customer adds items to cart',
                            detail: 'Tap any item to add it to the order. They can add multiple items from different categories (food, drinks, etc.) on the same order.',
                            icon: '🛒',
                        },
                        {
                            step: 'Customer places the order',
                            detail: 'Scroll down → tap "Place order" → enter their name → confirm. The order is sent to your system immediately.',
                            icon: '✅',
                        },
                        {
                            step: 'Staff receives the order',
                            detail: 'The order appears on the Kitchen display and the POS screen. Kitchen staff can see it and start preparing.',
                            icon: '👨‍🍳',
                        },
                        {
                            step: 'Waiter delivers the order',
                            detail: 'When ready, kitchen marks items as done. Waiter picks up and delivers to the table.',
                            icon: '🏃',
                        },
                        {
                            step: 'Customer pays',
                            detail: 'Customer pays at the counter or the waiter processes payment at the table using POS → Pay.',
                            icon: '💳',
                        },
                    ].map((s, i, arr) => (
                        <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                                    {s.icon}
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-indigo-200 my-1" style={{ minHeight: 20 }} />
                                )}
                            </div>
                            <div className="pb-5 pt-1.5 flex-1">
                                <p className="font-bold text-gray-900 text-sm">{s.step}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* For staff */}
            <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-5">
                <h3 className="text-base font-extrabold text-gray-900 mb-3">What staff need to do to set up QR codes</h3>
                <div className="space-y-3">
                    <Step n="1" text="Go to Tables in the sidebar. Add each physical table with a label (e.g. Table 1, VIP A) and zone." />
                    <Step n="2" text="Click the QR code icon on any table card. A QR code image appears." />
                    <Step n="3" text="Click Print QR — a print window opens with just the QR code and table name. Print it." />
                    <Step n="4" text="Laminate the QR code and place it on the physical table. Done — customers can now scan." />
                </div>
            </div>

            <InfoBox icon="⚠️" title="QR codes only work if the system is running" color="amber">
                <p className="text-sm">The server must be started with <span className="font-mono font-bold">php artisan serve --host=0.0.0.0 --port=8000</span> every time you use the system. QR codes also stop working if your computer's IP address changes — see the Setup tab.</p>
            </InfoBox>

        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 3 — MENU & TABLES MANAGEMENT
══════════════════════════════════════════════════════════════════ */
function TabManage() {
    const [open, setOpen] = useState(null);

    const sections = [
        {
            key: 'menu',
            emoji: '🍽️',
            title: 'How to add menu items',
            color: 'bg-green-50 ring-green-200',
            steps: [
                'Click "Menu" in the left sidebar (only Owner and Manager can do this).',
                'First create a Category — click "+ Add Category" and give it a name like "Drinks", "Food", "Breakfast", "Accommodation".',
                'Then add items: click "+ Add Item", pick the category, enter the name, price (in RWF), and optional description.',
                'Set the "prep station": Bar (for drinks), Kitchen (for food), None (for room charges).',
                'Toggle items on/off using the Available switch — hidden items won\'t show to customers.',
                'Customers will see your full menu automatically the next time they scan a QR code.',
            ],
        },
        {
            key: 'tables',
            emoji: '🪑',
            title: 'How to manage tables and QR codes',
            color: 'bg-blue-50 ring-blue-200',
            steps: [
                'Click "Tables" in the left sidebar (Owner and Manager only).',
                'Click "+ Add Table" and give it a label (e.g. "Table 1"), zone (e.g. "Indoor", "Terrace"), and capacity.',
                'Each table gets its own unique QR code automatically.',
                'Click the QR icon on a table card to see and print the QR code.',
                'To assign a waiter to a table: click "Edit" on the table, then choose a servant from the dropdown. Customers will see who their waiter is.',
                'If you move or rearrange tables, click "Regenerate QR" to get a new QR code if needed.',
            ],
        },
        {
            key: 'orders',
            emoji: '📋',
            title: 'How to see what customers ordered on a table',
            color: 'bg-purple-50 ring-purple-200',
            steps: [
                'Go to "Reservations" in the sidebar. When a table has been seated, you\'ll see all active orders for that table below the reservation.',
                'In the POS page, the "Open orders" panel on the right shows all active orders. Each order shows the table, item count, and total.',
                'In the Kitchen display, orders are shown grouped by table so kitchen staff can see exactly what each table needs.',
                'To mark an order as paid: click "Pay" next to the order in POS, choose a payment method, confirm.',
                'Once paid, the order disappears from the active list. You can print a receipt immediately after payment.',
            ],
        },
        {
            key: 'rooms',
            emoji: '🏠',
            title: 'How to add room / accommodation charges',
            color: 'bg-amber-50 ring-amber-200',
            steps: [
                'Go to POS. Start or open an order for the guest.',
                'In the cart panel on the right, click the purple "🛏 Add Room / Custom Charge" button.',
                'Choose "Room" mode: enter the room type (e.g. "Double Room"), price per night, and number of nights.',
                'The system calculates the total automatically. Click "+ Add to order".',
                'You can mix food, drinks, and room charges on the same bill.',
                'When checking out, click "Pay" and the receipt will show all charges itemized.',
            ],
        },
        {
            key: 'reservations',
            emoji: '📅',
            title: 'How to book / reserve a table',
            color: 'bg-indigo-50 ring-indigo-200',
            steps: [
                'Click "Reservations" in the sidebar.',
                'Click "+ New reservation" and fill in guest name, phone, date/time, party size, and optionally pick a table.',
                'The reservation appears in "Today" or "Upcoming" sections.',
                'When the guest arrives, click "Seat now" — this moves them to active status.',
                'You can see all their table orders in the reservation card while they are seated.',
                'When they leave, process payment in POS → Pay, then the order is closed.',
            ],
        },
    ];

    return (
        <div className="space-y-3">
            {sections.map((s) => (
                <div key={s.key} className={`rounded-2xl ring-1 p-4 transition ${s.color}`}>
                    <button
                        className="flex w-full items-center justify-between gap-3 text-left"
                        onClick={() => setOpen(open === s.key ? null : s.key)}
                    >
                        <span className="flex items-center gap-2 font-bold text-gray-900 text-sm sm:text-base">
                            <span className="text-xl">{s.emoji}</span>
                            {s.title}
                        </span>
                        <span className="shrink-0 text-gray-400 text-lg">{open === s.key ? '▲' : '▼'}</span>
                    </button>

                    {open === s.key && (
                        <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
                            {s.steps.map((step, i) => (
                                <Step key={i} n={i + 1} text={step} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 4 — PAYMENTS & EBM
══════════════════════════════════════════════════════════════════ */
const METHODS = [
    {
        key: 'momo', title: 'MTN Mobile Money (MoMo)', emoji: '📱', tag: '⭐ Most Popular',
        tagClass: 'bg-yellow-400 text-yellow-900',
        steps: [
            'Open the order in POS → click "Pay".',
            'Select MTN MoMo as the payment method.',
            'Show the customer your MoMo merchant number.',
            'Customer dials *182# → Transfer → Pay Merchant → enters exact amount.',
            'Customer shows you the SMS confirmation.',
            'Enter the 10-digit Transaction ID from the SMS into the Reference field.',
            'Click "Confirm" — order is marked Paid and receipt appears.',
        ],
    },
    {
        key: 'airtel', title: 'Airtel Money', emoji: '📶', tag: 'Common',
        tagClass: 'bg-red-500 text-white',
        steps: [
            'Open the order in POS → click "Pay".',
            'Select Airtel Money.',
            'Show customer your Airtel merchant number.',
            'Customer dials *185# → Send Money → Pay Bill → enters exact amount.',
            'Customer shows SMS confirmation.',
            'Enter Transaction ID into Reference field → Confirm.',
        ],
    },
    {
        key: 'cash', title: 'Cash (Amafaranga)', emoji: '💵', tag: 'Always Works',
        tagClass: 'bg-green-600 text-white',
        steps: [
            'Open the order in POS → click "Pay".',
            'Select Cash.',
            'Tap a quick amount button (5,000 / 10,000 / 20,000 / 50,000 RWF) or type the amount given.',
            'The screen shows the exact change to return.',
            'Return the change to customer.',
            'Click "Confirm" — receipt is printed.',
        ],
    },
    {
        key: 'ebm', title: 'EBM / RRA Fiscal Receipt', emoji: '🧾', tag: 'RRA Required',
        tagClass: 'bg-blue-600 text-white',
        steps: [
            'After the customer pays (any method), your EBM machine generates a fiscal receipt number.',
            'On the payment screen, scroll to the blue "EBM Number" field.',
            'Enter the number from your EBM machine (e.g. 0780000000001234).',
            'Click "Confirm" — the receipt will show the EBM number and RRA verification link.',
            'Give the printed receipt to the customer. They can verify at www.rra.gov.rw.',
            'EBM is required by law in Rwanda for all taxable businesses.',
        ],
    },
];

function TabPayments() {
    const [open, setOpen] = useState(null);
    return (
        <div className="space-y-3">
            {METHODS.map((m) => (
                <div key={m.key} className="rounded-2xl bg-white ring-1 ring-gray-200 p-4">
                    <button
                        className="flex w-full items-center justify-between gap-3 text-left"
                        onClick={() => setOpen(open === m.key ? null : m.key)}
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-2xl">{m.emoji}</span>
                            <span>
                                <span className="font-bold text-gray-900 text-sm sm:text-base block">{m.title}</span>
                                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${m.tagClass}`}>{m.tag}</span>
                            </span>
                        </span>
                        <span className="shrink-0 text-gray-400 text-lg">{open === m.key ? '▲' : '▼'}</span>
                    </button>
                    {open === m.key && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                            {m.steps.map((s, i) => <Step key={i} n={i + 1} text={s} />)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 5 — STAFF ROLES
══════════════════════════════════════════════════════════════════ */
function TabRoles() {
    const roles = [
        {
            role: 'Owner', emoji: '👑', color: 'bg-amber-500', label: 'Super Admin',
            can: [
                'Everything the manager can do',
                'Add / edit / delete any staff account',
                'Change system settings and business profile',
                'See all reports and revenue data',
                'Create the first account using: php artisan barpos:make-admin',
            ],
        },
        {
            role: 'Manager', emoji: '🎯', color: 'bg-blue-600', label: 'Manager',
            can: [
                'Add / edit menu items and categories',
                'Add / edit / delete tables and QR codes',
                'Add / edit staff (except owner)',
                'Process orders and payments',
                'View all reservations and orders',
            ],
        },
        {
            role: 'Cashier', emoji: '💰', color: 'bg-green-600', label: 'Cashier',
            can: [
                'See and process payments on the POS screen',
                'Print receipts and enter EBM numbers',
                'View open orders',
                'Cannot add menu items or staff',
            ],
        },
        {
            role: 'Waiter', emoji: '🍽️', color: 'bg-purple-600', label: 'Waiter',
            can: [
                'Take orders via POS',
                'See and manage reservations',
                'Cannot process payments',
                'Cannot access menu/table management',
            ],
        },
        {
            role: 'Kitchen', emoji: '👨‍🍳', color: 'bg-orange-500', label: 'Kitchen / Bar',
            can: [
                'See the kitchen display screen with all pending orders',
                'Mark items as ready when prepared',
                'Cannot access POS or payments',
            ],
        },
        {
            role: 'Storekeeper', emoji: '📦', color: 'bg-gray-600', label: 'Storekeeper',
            can: [
                'Access inventory management',
                'Cannot access POS, payments, or kitchen',
            ],
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {roles.map((r) => (
                <div key={r.role} className="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${r.color} text-xl text-white`}>
                            {r.emoji}
                        </div>
                        <div>
                            <p className="font-extrabold text-gray-900">{r.role}</p>
                            <p className="text-xs text-gray-400">{r.label}</p>
                        </div>
                    </div>
                    <ul className="space-y-1">
                        {r.can.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="mt-0.5 text-green-500 shrink-0">✓</span>
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════ */
const TABS = [
    { key: 'setup',    emoji: '🚀', label: 'Setup',         component: TabSetup },
    { key: 'qr',       emoji: '📱', label: 'Customer QR',   component: TabQR },
    { key: 'manage',   emoji: '🍽️', label: 'Menu & Tables', component: TabManage },
    { key: 'payments', emoji: '💳', label: 'Payments',      component: TabPayments },
    { key: 'roles',    emoji: '👥', label: 'Staff Roles',   component: TabRoles },
];

export default function Payment() {
    const [tab, setTab] = useState('setup');
    const Active = TABS.find(t => t.key === tab)?.component ?? TabSetup;

    return (
        <>
            <Head title="Isaro Rubengera Guide" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-16">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-10 text-center text-white">
                    <div className="text-5xl mb-3">📖</div>
                    <h1 className="text-2xl font-extrabold sm:text-3xl">Isaro Rubengera Complete Guide</h1>
                    <p className="mt-2 text-indigo-200 text-sm">Everything you need to run your bar or guest house</p>
                    <Link href="/" className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/30">
                        ← Back to Menu
                    </Link>
                </div>

                {/* Tabs */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm">
                    <div className="mx-auto max-w-4xl overflow-x-auto">
                        <div className="flex gap-2 p-3 min-w-max sm:justify-center">
                            {TABS.map(t => (
                                <TabBtn key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}
                                    emoji={t.emoji} label={t.label} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-4xl px-4 pt-6">
                    <Active />
                </div>

            </div>
        </>
    );
}
