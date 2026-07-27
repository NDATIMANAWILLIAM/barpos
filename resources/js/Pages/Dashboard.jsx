import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const rwf = (n) => 'RWF ' + new Intl.NumberFormat('en-RW').format(n ?? 0);

const ROLE_LABEL = {
    owner: 'Super Manager', manager: 'Manager', cashier: 'Cashier',
    waiter: 'Servant', kitchen: 'Kitchen Staff', storekeeper: 'Storekeeper',
};

function StatCard({ label, value, sub, icon, gradient, highlight }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -right-2 bottom-0 h-12 w-12 rounded-full bg-white/5" />
            <div className="relative">
                <div className="mb-3 text-3xl">{icon}</div>
                <div className="text-2xl font-extrabold leading-none">{value}</div>
                <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
                {sub && <div className="mt-0.5 text-xs opacity-60">{sub}</div>}
            </div>
            {highlight && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                    <span className="text-xs">!</span>
                </div>
            )}
        </div>
    );
}

function QuickAction({ href, icon, label, description, bg, target }) {
    return (
        <Link href={href} target={target}
            className={`group flex items-start gap-4 rounded-2xl p-5 text-white shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 ${bg}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl group-hover:bg-white/30 transition">
                {icon}
            </div>
            <div>
                <p className="font-bold leading-snug">{label}</p>
                <p className="mt-0.5 text-xs opacity-75 leading-snug">{description}</p>
            </div>
        </Link>
    );
}

const STATUS_COLOR = {
    open:      'text-orange-500',
    paid:      'text-green-600',
    pending:   'text-orange-500',
    confirmed: 'text-blue-600',
    seated:    'text-green-700',
    delivered: 'text-teal-600',
    cancelled: 'text-red-500',
};

function fmtTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard({ stats, activity }) {
    const user = usePage().props.auth.user;
    const role = user?.role ?? '';
    const roleLabel = ROLE_LABEL[role] ?? role;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Auto-refresh every 30 seconds so activity feed stays live
    useEffect(() => {
        const t = setInterval(() => router.reload({ preserveScroll: true }), 30000);
        return () => clearInterval(t);
    }, []);

    const ADMIN     = ['owner', 'manager'];
    const POS_ROLES = ['owner', 'manager', 'cashier', 'waiter'];
    const KIT_ROLES = ['owner', 'manager', 'kitchen'];
    const RES_ROLES = ['owner', 'manager', 'waiter'];
    const has = (roles) => roles.includes(role);

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">

                {/* ── Welcome Banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-xl">
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
                    <div className="absolute right-16 bottom-0 h-24 w-24 rounded-full bg-amber-500/5 blur-xl" />
                    <div className="relative flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-amber-400 font-semibold">{greeting},</p>
                            <h1 className="mt-0.5 text-2xl font-extrabold">{user?.name}</h1>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-xs font-medium text-amber-300">{roleLabel}</span>
                            </div>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-RW', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                            <p className="text-2xl font-mono font-bold text-white mt-0.5">
                                {new Date().toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Today at a glance</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard
                            label="Orders Today"
                            value={stats?.orders_today ?? 0}
                            sub="placed"
                            icon="🧾"
                            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
                        />
                        <StatCard
                            label="Revenue"
                            value={rwf(stats?.revenue_today)}
                            sub="paid orders"
                            icon="💰"
                            gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
                        />
                        <StatCard
                            label="Open Orders"
                            value={stats?.open_orders ?? 0}
                            sub={(stats?.open_orders ?? 0) > 0 ? 'needs attention' : 'all clear'}
                            icon="🔔"
                            gradient={(stats?.open_orders ?? 0) > 0 ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'}
                            highlight={(stats?.open_orders ?? 0) > 0}
                        />
                        <StatCard
                            label="Menu Items"
                            value={stats?.menu_items ?? 0}
                            sub="available"
                            icon="🍽️"
                            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                        />
                        <StatCard
                            label="Reservations"
                            value={stats?.reservations_today ?? 0}
                            sub="today"
                            icon="📅"
                            gradient="bg-gradient-to-br from-purple-500 to-violet-700"
                        />
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Quick actions</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {has(POS_ROLES) && (
                            <QuickAction href={route('pos.index')} icon="🛒" label="Point of Sale"
                                description="Take orders, send to kitchen, collect payment"
                                bg="bg-gradient-to-br from-indigo-600 to-indigo-800" />
                        )}
                        {has(KIT_ROLES) && (
                            <QuickAction href={route('kitchen.index')} icon="👨‍🍳" label="Kitchen Display"
                                description="Live order tickets for kitchen & bar"
                                bg="bg-gradient-to-br from-orange-500 to-red-600" />
                        )}
                        {has(RES_ROLES) && (
                            <QuickAction href={route('reservations.index')} icon="📅" label="Reservations"
                                description="Manage table bookings and guest arrivals"
                                bg="bg-gradient-to-br from-teal-500 to-emerald-700" />
                        )}
                        {has(ADMIN) && (
                            <QuickAction href={route('menu.index')} icon="🍽" label="Menu Management"
                                description="Add, edit and organise all menu items"
                                bg="bg-gradient-to-br from-slate-600 to-slate-800" />
                        )}
                        {has(ADMIN) && (
                            <QuickAction href={route('tables.index')} icon="📱" label="Tables & QR Codes"
                                description="Manage tables and generate customer QR codes"
                                bg="bg-gradient-to-br from-purple-600 to-violet-800" />
                        )}
                        {has(ADMIN) && (
                            <QuickAction href={route('staff.index')} icon="👥" label="Staff Management"
                                description="Add staff, set roles and permissions"
                                bg="bg-gradient-to-br from-pink-500 to-rose-700" />
                        )}
                        <QuickAction href={route('public.menu')} icon="👀" label="Customer View"
                            description="Preview what customers see on their phones"
                            bg="bg-gradient-to-br from-amber-500 to-yellow-600" target="_blank" />
                        <QuickAction href={route('guide')} icon="📋" label="How-To Guide"
                            description="Payment guide and staff role reference"
                            bg="bg-gradient-to-br from-cyan-500 to-blue-700" />
                    </div>
                </div>

                {/* ── Live Activity Feed ── */}
                {activity && activity.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Today's Activity</h2>
                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                Live · updates every 30s
                            </span>
                        </div>
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden divide-y divide-slate-50">
                            {activity.map((a, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                                    <span className="text-lg shrink-0">{a.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{a.text}</p>
                                        <p className="text-xs text-indigo-600 font-medium truncate">👤 {a.by}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-gray-400 font-medium">{fmtTime(a.time)}</p>
                                        <p className={`text-xs font-bold capitalize ${STATUS_COLOR[a.status] ?? 'text-gray-400'}`}>{a.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── QR Info Box ── */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">📲</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-amber-800">Customer QR Ordering</h3>
                            <p className="mt-1 text-sm text-amber-700">
                                Customers scan a QR code at their table to see your menu and place orders — no app needed.
                                Go to <Link href={route('tables.index')} className="font-semibold underline">Tables & QR</Link> to
                                get each table's unique link.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link href={route('tables.index')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600 transition">
                                    Manage Tables →
                                </Link>
                                <Link href={route('public.menu')} target="_blank"
                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 transition">
                                    Preview Menu ↗
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
