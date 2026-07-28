import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const rwf = (n) => 'RWF ' + new Intl.NumberFormat('en-RW').format(n ?? 0);

const ROLE_LABEL = {
    owner: 'Super Manager', manager: 'Manager', cashier: 'Cashier',
    waiter: 'Servant', kitchen: 'Kitchen Staff', storekeeper: 'Storekeeper',
};

// ── Icon set (inline SVG — no emoji) ────────────────────────────────────────
const Icon = {
    receipt:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z"/><path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h4"/></svg>,
    coin:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><circle cx="12" cy="12" r="8.5"/><path strokeLinecap="round" d="M12 7.5v9M9.5 9.5c0-1 .8-1.5 2.5-1.5s2.5.6 2.5 1.5c0 2-5 1.3-5 3.3 0 1 1 1.7 2.5 1.7s2.5-.6 2.5-1.7"/></svg>,
    bell:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z"/><path strokeLinecap="round" d="M10 19a2 2 0 004 0"/></svg>,
    plate:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>,
    calendar: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="3.5" y="5" width="17" height="16" rx="2"/><path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17"/></svg>,
    cart:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-1.8L20 8H6"/><circle cx="9" cy="21" r="1.4"/><circle cx="17.5" cy="21" r="1.4"/></svg>,
    fire:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c1 3-3 4-3 7a3 3 0 006 0c1.5 1 2 2.5 2 4a5 5 0 01-10 0c0-3 2-4 3-7 .5 1 1 1.5 2 1.5-.3-2 0-3.5 0-5.5z"/></svg>,
    users:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><circle cx="9" cy="8" r="3.2"/><path strokeLinecap="round" d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17.5" cy="9" r="2.4"/><path strokeLinecap="round" d="M15.8 14.2c2.3.4 3.7 2 3.7 4.3"/></svg>,
    table:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="3" y="8" width="18" height="2" rx="1"/><path strokeLinecap="round" d="M5 10v8M19 10v8M8 10v3m8-3v3"/></svg>,
    eye:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>,
    book:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z"/><path strokeLinecap="round" d="M4 20.5A2.5 2.5 0 016.5 18H20"/></svg>,
    truck:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>,
    scan:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M20 8V6a2 2 0 00-2-2h-2M4 16v2a2 2 0 002 2h2M20 16v2a2 2 0 01-2 2h-2M4 12h16"/></svg>,
    phone:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5c0-.6.4-1 1-1h2.6c.5 0 .9.3 1 .8l.7 3a1 1 0 01-.3 1L7.4 10.4a12 12 0 006.2 6.2l1.6-1.6a1 1 0 011-.3l3 .7c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1C10.5 20 4 13.5 4 6V5z"/></svg>,
};

const ACTIVITY_ICON = {
    order:       Icon.cart,
    payment:     Icon.coin,
    booking:     Icon.calendar,
    delivery:    Icon.truck,
};

function StatCard({ label, value, sub, icon: IconCmp, tone, highlight }) {
    const tones = {
        blue:  'bg-ink-900 text-white',
        green: 'bg-green-700 text-white',
        red:   'bg-red-600 text-white',
        gray:  'bg-ink-200 text-ink-700',
        brass: 'bg-brass-600 text-white',
    };
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm ${tones[tone]}`}>
            <IconCmp className="mb-3 h-6 w-6 opacity-90" />
            <div className="text-2xl font-extrabold leading-none">{value}</div>
            <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
            {sub && <div className="mt-0.5 text-xs opacity-60">{sub}</div>}
            {highlight && (
                <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white animate-pulse" />
            )}
        </div>
    );
}

function QuickAction({ href, icon: IconCmp, label, description, target }) {
    return (
        <Link href={href} target={target}
            className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100 transition-all hover:shadow-md hover:ring-brass-200">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700 group-hover:bg-brass-50 group-hover:text-brass-600 transition">
                <IconCmp className="h-5 w-5" />
            </div>
            <div>
                <p className="font-bold leading-snug text-ink-900">{label}</p>
                <p className="mt-0.5 text-xs text-ink-400 leading-snug">{description}</p>
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

// ── On-Duty Contact ──────────────────────────────────────────────────────────
// The phone number clients/staff should call right now — changeable per
// shift rather than a fixed business number, since who's available varies.
function OnDutyContact({ contact, canEdit }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ name: contact?.name ?? '', phone: contact?.phone ?? '' });

    const save = (e) => {
        e.preventDefault();
        form.patch(route('dashboard.contact'), { preserveScroll: true, onSuccess: () => setEditing(false) });
    };

    if (editing) {
        return (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-ink-100 p-4">
                <form onSubmit={save} className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-ink-500 mb-1">On-duty contact name</label>
                        <input className="rounded-lg border-ink-200 text-sm" value={form.data.name}
                            onChange={e => form.setData('name', e.target.value)} placeholder="e.g. Jean Pierre" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-ink-500 mb-1">Phone number</label>
                        <input className="rounded-lg border-ink-200 text-sm" value={form.data.phone}
                            onChange={e => form.setData('phone', e.target.value)} placeholder="07X XXX XXXX" />
                    </div>
                    <button type="submit" disabled={form.processing}
                        className="rounded-lg bg-brass-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                        Save
                    </button>
                    <button type="button" onClick={() => setEditing(false)}
                        className="rounded-lg border border-ink-200 px-3 py-2 text-xs text-ink-500">
                        Cancel
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 rounded-2xl bg-white shadow-sm ring-1 ring-ink-100 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <Icon.phone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">On duty now — clients call this number</p>
                {contact?.phone ? (
                    <p className="text-sm font-semibold text-ink-800">
                        {contact.name && `${contact.name} · `}
                        <a href={`tel:${contact.phone}`} className="text-brass-600 hover:underline">{contact.phone}</a>
                    </p>
                ) : (
                    <p className="text-sm text-ink-400">Not set</p>
                )}
            </div>
            {canEdit && (
                <button onClick={() => setEditing(true)}
                    className="shrink-0 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50">
                    Change
                </button>
            )}
        </div>
    );
}

export default function Dashboard({ stats, activity, onDutyContact }) {
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
                <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-brass-400 font-semibold">{greeting},</p>
                            <h1 className="mt-0.5 text-2xl font-extrabold">{user?.name}</h1>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                                <span className="h-2 w-2 rounded-full bg-brass-400 animate-pulse" />
                                <span className="text-xs font-medium text-brass-300">{roleLabel}</span>
                            </div>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-xs text-ink-300">{new Date().toLocaleDateString('en-RW', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                            <p className="text-2xl font-mono font-bold text-white mt-0.5">
                                {new Date().toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── On-duty contact ── */}
                <OnDutyContact contact={onDutyContact} canEdit={has(ADMIN)} />

                {/* ── Stats Grid ── */}
                <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">Today at a glance</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard label="Orders Today" value={stats?.orders_today ?? 0} sub="placed" icon={Icon.receipt} tone="blue" />
                        <StatCard label="Revenue" value={rwf(stats?.revenue_today)} sub="paid orders" icon={Icon.coin} tone="green" />
                        <StatCard
                            label="Open Orders"
                            value={stats?.open_orders ?? 0}
                            sub={(stats?.open_orders ?? 0) > 0 ? 'needs attention' : 'all clear'}
                            icon={Icon.bell}
                            tone={(stats?.open_orders ?? 0) > 0 ? 'red' : 'gray'}
                            highlight={(stats?.open_orders ?? 0) > 0}
                        />
                        <StatCard label="Menu Items" value={stats?.menu_items ?? 0} sub="available" icon={Icon.plate} tone="brass" />
                        <StatCard label="Reservations" value={stats?.reservations_today ?? 0} sub="today" icon={Icon.calendar} tone="blue" />
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">Quick actions</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {has(POS_ROLES) && (
                            <QuickAction href={route('pos.index')} icon={Icon.cart} label="Point of Sale"
                                description="Take orders, send to kitchen, collect payment" />
                        )}
                        {has(KIT_ROLES) && (
                            <QuickAction href={route('kitchen.index')} icon={Icon.fire} label="Kitchen Display"
                                description="Live order tickets for kitchen & bar" />
                        )}
                        {has(RES_ROLES) && (
                            <QuickAction href={route('reservations.index')} icon={Icon.calendar} label="Reservations"
                                description="Manage table bookings and guest arrivals" />
                        )}
                        {has(ADMIN) && (
                            <QuickAction href={route('menu.index')} icon={Icon.plate} label="Menu Management"
                                description="Add, edit and organise all menu items" />
                        )}
                        {has(ADMIN) && (
                            <QuickAction href={route('tables.index')} icon={Icon.scan} label="Tables & QR Codes"
                                description="Manage tables and generate customer QR codes" />
                        )}
                        {has(ADMIN) && (
                            <QuickAction href={route('staff.index')} icon={Icon.users} label="Staff Management"
                                description="Add staff, set roles and permissions" />
                        )}
                        <QuickAction href={route('public.menu')} icon={Icon.eye} label="Customer View"
                            description="Preview what customers see on their phones" target="_blank" />
                        <QuickAction href={route('guide')} icon={Icon.book} label="How-To Guide"
                            description="Payment guide and staff role reference" />
                    </div>
                </div>

                {/* ── Live Activity Feed ── */}
                {activity && activity.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-400">Today's Activity</h2>
                            <span className="flex items-center gap-1.5 text-xs text-ink-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                Live · updates every 30s
                            </span>
                        </div>
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-ink-100 overflow-hidden divide-y divide-ink-50">
                            {activity.map((a, i) => {
                                const ActivityIcon = ACTIVITY_ICON[a.type] ?? Icon.receipt;
                                return (
                                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                                            <ActivityIcon className="h-4 w-4" />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-ink-800 truncate">{a.text}</p>
                                            <p className="text-xs text-brass-600 font-medium truncate">{a.by}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-ink-400 font-medium">{fmtTime(a.time)}</p>
                                            <p className={`text-xs font-bold capitalize ${STATUS_COLOR[a.status] ?? 'text-ink-400'}`}>{a.status}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── QR Info Box ── */}
                <div className="rounded-2xl border border-brass-200 bg-brass-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass-100 text-brass-700">
                            <Icon.scan className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-brass-800">Customer QR Ordering</h3>
                            <p className="mt-1 text-sm text-brass-700">
                                Customers scan a QR code at their table to see your menu and place orders — no app needed.
                                Go to <Link href={route('tables.index')} className="font-semibold underline">Tables & QR</Link> to
                                get each table's unique link.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link href={route('tables.index')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brass-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-brass-700 transition">
                                    Manage Tables
                                </Link>
                                <Link href={route('public.menu')} target="_blank"
                                    className="inline-flex items-center gap-2 rounded-xl border border-brass-300 bg-white px-4 py-2 text-sm font-bold text-brass-700 hover:bg-brass-50 transition">
                                    Preview Menu
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
