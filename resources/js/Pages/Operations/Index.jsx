import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n ?? 0) + ' RWF';

function fmtTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
}

function fmtAge(iso) {
    if (!iso) return '';
    const mins = Math.round((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ── Table state config ────────────────────────────────────────────────────────
const STATE = {
    free:      { label: 'Free',      emoji: '🟢', bg: 'bg-green-50  ring-green-200',  dot: 'bg-green-400',  text: 'text-green-700' },
    waiting:   { label: 'Waiting',   emoji: '🟡', bg: 'bg-amber-50  ring-amber-300',  dot: 'bg-amber-500',  text: 'text-amber-700' },
    preparing: { label: 'Preparing', emoji: '🟠', bg: 'bg-orange-50 ring-orange-300', dot: 'bg-orange-500', text: 'text-orange-700' },
    served:    { label: 'Served',    emoji: '🔵', bg: 'bg-blue-50   ring-blue-200',   dot: 'bg-blue-500',   text: 'text-blue-700' },
    urgent:    { label: 'Urgent!',   emoji: '🔴', bg: 'bg-red-50    ring-red-400',    dot: 'bg-red-500',    text: 'text-red-700' },
};

function SummaryCard({ emoji, label, value, color = 'gray', urgent }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-700',
        green:  'bg-green-50  text-green-700',
        amber:  'bg-amber-50  text-amber-700',
        red:    'bg-red-50    text-red-600',
        teal:   'bg-teal-50   text-teal-700',
        blue:   'bg-blue-50   text-blue-700',
        gray:   'bg-gray-50   text-gray-600',
    };
    return (
        <div className={`rounded-2xl p-4 ${colors[color]} ${urgent ? 'ring-2 ring-red-400' : ''}`}>
            <p className="text-2xl mb-1">{emoji}</p>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-2xl font-extrabold mt-0.5">{value}</p>
        </div>
    );
}

function AssignPanel({ table, servants, onClose }) {
    const form = useForm({ servant_id: table.servant_id ?? '' });
    const submit = (e) => {
        e.preventDefault();
        form.patch(route('operations.assign', table.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };
    return (
        <div className="mt-2 border-t border-gray-200 pt-2">
            <form onSubmit={submit} className="flex items-center gap-2">
                <select
                    value={form.data.servant_id}
                    onChange={(e) => form.setData('servant_id', e.target.value)}
                    className="flex-1 rounded-lg border-gray-300 text-xs py-1"
                >
                    <option value="">— Unassigned —</option>
                    {servants.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <button type="submit" disabled={form.processing}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50">
                    Save
                </button>
                <button type="button" onClick={onClose}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500">
                    ✕
                </button>
            </form>
        </div>
    );
}

function TableCard({ table, servants }) {
    const [assigning, setAssigning] = useState(false);
    const s = STATE[table.state] ?? STATE.free;

    return (
        <div className={`rounded-xl ring-1 p-3 ${s.bg}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-900 text-sm leading-tight truncate">{table.label}</p>
                    {table.zone && <p className="text-xs text-gray-400">{table.zone}</p>}
                </div>
                <span className={`ml-1 mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${s.dot} ${table.state === 'urgent' ? 'animate-pulse' : ''}`} />
            </div>

            {/* State label */}
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${s.text} bg-white/60 mb-2`}>
                {s.emoji} {s.label}
            </span>

            {table.state === 'free' ? (
                <p className="text-xs text-gray-400">{table.capacity} seats</p>
            ) : (
                <>
                    {/* Item progress */}
                    <div className="flex gap-2 text-xs mb-2">
                        {table.new_items > 0 && (
                            <span className="font-bold text-amber-700">⏳ {table.new_items} waiting</span>
                        )}
                        {table.preparing_items > 0 && (
                            <span className="font-bold text-orange-700">🔥 {table.preparing_items} cooking</span>
                        )}
                        {table.ready_items > 0 && (
                            <span className="font-bold text-blue-700">✓ {table.ready_items} ready</span>
                        )}
                    </div>

                    {/* Orders */}
                    {table.orders.map(o => (
                        <div key={o.id} className="mb-1.5 border-t border-white/50 pt-1.5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-800">#{o.order_number}</p>
                                <p className="text-xs font-bold text-gray-900">{rwf(o.total)}</p>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                                <p className="text-xs text-gray-500">👤 {o.waiter}{o.customer_name && ` for ${o.customer_name}`}</p>
                                <p className="text-xs text-gray-400">{fmtAge(o.placed_at)}</p>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* Servant assignment */}
            <div className="mt-2 pt-1.5 border-t border-white/50">
                {assigning ? (
                    <AssignPanel table={table} servants={servants} onClose={() => setAssigning(false)} />
                ) : (
                    <button onClick={() => setAssigning(true)}
                        className="w-full text-left text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                        {table.servant
                            ? <span>👤 <span className="font-semibold">{table.servant}</span> · <span className="text-indigo-500">Change</span></span>
                            : <span className="text-indigo-500">+ Assign servant</span>
                        }
                    </button>
                )}
            </div>
        </div>
    );
}

function OrderRow({ o }) {
    const stateColor = {
        open:      'border-l-amber-400',
        preparing: 'border-l-orange-400',
        ready:     'border-l-blue-400',
        served:    'border-l-teal-400',
    }[o.status] ?? 'border-l-gray-200';

    return (
        <div className={`rounded-xl bg-white ring-1 ring-gray-100 p-3 border-l-4 ${stateColor}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm">#{o.order_number}</p>
                        {o.table && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-semibold">
                                {o.table}
                            </span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${
                            o.status === 'open'      ? 'bg-amber-100 text-amber-700' :
                            o.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                            o.status === 'ready'     ? 'bg-blue-100 text-blue-700' :
                            o.status === 'served'    ? 'bg-teal-100 text-teal-700' :
                            'bg-gray-100 text-gray-500'
                        }`}>{o.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                        👤 {o.waiter}{o.customer_name && ` for ${o.customer_name}`}
                        {o.new_items > 0 && <span className="ml-2 text-amber-600 font-semibold">⏳ {o.new_items} waiting</span>}
                        {o.preparing > 0 && <span className="ml-2 text-orange-600 font-semibold">🔥 {o.preparing} cooking</span>}
                        {o.ready > 0 && <span className="ml-2 text-blue-600 font-semibold">✓ {o.ready} ready</span>}
                    </p>
                    {o.notes && <p className="text-xs text-gray-400 mt-0.5 italic truncate">{o.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-gray-900">{rwf(o.total)}</p>
                    <p className="text-xs text-gray-400">{fmtAge(o.placed_at)}</p>
                </div>
            </div>
        </div>
    );
}

export default function Index({ tables, orderQueue, pendingBookings, deliveries, summary, servants }) {
    useEffect(() => {
        const timer = setInterval(() => router.reload({ preserveScroll: true }), 20000);
        return () => clearInterval(timer);
    }, []);

    const zones = [...new Set(tables.map(t => t.zone || '').filter(Boolean))];
    const hasZones = zones.length > 1;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Live Operations Control</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Auto-refreshes every 20 seconds</p>
                    </div>
                    <button onClick={() => router.reload({ preserveScroll: true })}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        ↻ Refresh Now
                    </button>
                </div>
            }
        >
            <Head title="Live Operations" />
            <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">

                {/* ── Summary bar ── */}
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    <SummaryCard emoji="⏳" label="Open Orders"      value={summary.open_orders}       color="amber" urgent={summary.open_orders > 0} />
                    <SummaryCard emoji="✅" label="Paid Today"       value={summary.paid_today}        color="green" />
                    <SummaryCard emoji="📋" label="Pending Requests" value={summary.pending_bookings}  color="red"   urgent={summary.pending_bookings > 0} />
                    <SummaryCard emoji="🚚" label="Deliveries"       value={summary.active_deliveries} color="teal" />
                    <SummaryCard emoji="🪑" label="Tables Busy"      value={`${summary.tables_occupied}/${summary.tables_total}`} color="indigo" />
                    {summary.urgent_tables > 0
                        ? <SummaryCard emoji="🚨" label="Urgent Tables"  value={summary.urgent_tables} color="red" urgent />
                        : <SummaryCard emoji="🟢" label="Tables Free"    value={summary.tables_total - summary.tables_occupied} color="gray" />
                    }
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {Object.values(STATE).map(s => (
                        <span key={s.label} className="flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                            {s.label}
                        </span>
                    ))}
                </div>

                {/* ── Pending bookings — URGENT call-back ── */}
                {pendingBookings.length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-red-500 mb-3">
                            🔔 {pendingBookings.length} Pending Request{pendingBookings.length !== 1 ? 's' : ''} — Must Call Back
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {pendingBookings.map(r => (
                                <div key={r.id} className="rounded-2xl bg-red-50 ring-1 ring-red-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">
                                                {r.kind === 'delivery' ? '🚚' : '🪑'} {r.customer_name}
                                            </p>
                                            <a href={`tel:${r.phone}`}
                                                className="text-lg font-extrabold text-red-600 hover:underline">
                                                📞 {r.phone}
                                            </a>
                                        </div>
                                        <div className="text-right text-xs text-gray-500 shrink-0 ml-2">
                                            <p>{r.created_by}</p>
                                            <p className="font-semibold text-red-500">{fmtAge(r.created_at)}</p>
                                        </div>
                                    </div>
                                    {r.party_size && <p className="text-xs text-gray-600 mt-1.5">👥 {r.party_size} guests</p>}
                                    {r.delivery_address && <p className="text-xs text-gray-600 mt-1.5">📍 {r.delivery_address}</p>}
                                    {r.notes && <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>}
                                    <p className="text-xs text-indigo-600 font-semibold mt-2">
                                        → Open Reservations to confirm after calling
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Table grid ── */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                        Table Status &amp; Assignment
                    </h3>
                    {tables.length === 0 ? (
                        <div className="rounded-2xl bg-gray-50 py-10 text-center text-sm text-gray-400">
                            No tables configured — add them in Tables &amp; QR.
                        </div>
                    ) : hasZones ? (
                        zones.map(zone => {
                            const zoneTables = tables.filter(t => (t.zone || '') === zone);
                            return (
                                <div key={zone} className="mb-5">
                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 pl-1">{zone}</p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {zoneTables.map(t => <TableCard key={t.id} table={t} servants={servants} />)}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {tables.map(t => <TableCard key={t.id} table={t} servants={servants} />)}
                        </div>
                    )}
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* ── Open order queue ── */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                            All Open Orders ({orderQueue.length})
                        </h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                            {orderQueue.length === 0 ? (
                                <div className="rounded-2xl bg-green-50 py-8 text-center text-sm text-green-600 font-semibold ring-1 ring-green-100">
                                    ✓ All caught up — no open orders
                                </div>
                            ) : (
                                orderQueue.map(o => <OrderRow key={o.id} o={o} />)
                            )}
                        </div>
                    </section>

                    {/* ── Active deliveries ── */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                            Active Deliveries ({deliveries.length})
                        </h3>
                        <div className="space-y-2">
                            {deliveries.length === 0 ? (
                                <div className="rounded-2xl bg-gray-50 py-8 text-center text-sm text-gray-400">
                                    No active deliveries
                                </div>
                            ) : (
                                deliveries.map(d => (
                                    <div key={d.id} className="rounded-xl bg-white ring-1 ring-gray-100 p-3 border-l-4 border-l-teal-400">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-900 text-sm">🚚 {d.customer_name}</p>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                                        d.status === 'seated' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {d.status === 'seated' ? 'Out for delivery' : 'Confirmed'}
                                                    </span>
                                                </div>
                                                <a href={`tel:${d.phone}`} className="text-xs text-indigo-600 font-semibold hover:underline">
                                                    📞 {d.phone}
                                                </a>
                                                {d.delivery_address && (
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {d.delivery_address}</p>
                                                )}
                                                {d.confirmed_by && (
                                                    <p className="text-xs text-gray-400 mt-0.5">👤 Confirmed by {d.confirmed_by}</p>
                                                )}
                                                {d.notes && <p className="text-xs text-gray-400 mt-0.5 italic truncate">{d.notes}</p>}
                                            </div>
                                            {d.scheduled_at && (
                                                <p className="text-xs text-gray-400 shrink-0">{fmtTime(d.scheduled_at)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
