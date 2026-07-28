import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n ?? 0) + ' RWF';
const compact = (n) => new Intl.NumberFormat('en-RW', { notation: 'compact' }).format(n ?? 0);

const PERIODS = [
    { key: 'today', label: 'Today' },
    { key: 'week',  label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year',  label: 'This Year' },
    { key: 'all',   label: 'All Time' },
];

const METHOD_LABEL = {
    cash:         '💵 Cash',
    mtn_momo:     '📱 MTN MoMo',
    airtel_money: '📶 Airtel Money',
    card:         '💳 Card',
    bank:         '🏦 Bank Transfer',
};

const ROLE_META = {
    owner:       { emoji: '👑', label: 'Super Manager' },
    manager:     { emoji: '🎯', label: 'Manager' },
    cashier:     { emoji: '💰', label: 'Cashier' },
    waiter:      { emoji: '🍽️', label: 'Servant' },
    receptionist:{ emoji: '📞', label: 'Receptionist' },
    kitchen:     { emoji: '👨‍🍳', label: 'Kitchen' },
};

const STATUS_COLOR = {
    paid:      'text-green-600',
    pending:   'text-orange-500',
    confirmed: 'text-blue-600',
    seated:    'text-green-700',
    delivered: 'text-teal-600',
    cancelled: 'text-red-500',
    open:      'text-indigo-500',
};

function StatCard({ emoji, label, value, sub, color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-700',
        green:  'bg-green-50 text-green-700',
        amber:  'bg-amber-50 text-amber-700',
        purple: 'bg-purple-50 text-purple-700',
        red:    'bg-red-50 text-red-600',
        gray:   'bg-gray-50 text-gray-600',
        teal:   'bg-teal-50 text-teal-700',
    };
    return (
        <div className={`rounded-2xl p-4 ${colors[color]}`}>
            <p className="text-2xl mb-1">{emoji}</p>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-xl font-extrabold mt-0.5">{value}</p>
            {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
    );
}

function MiniBar({ value, max, color = 'bg-indigo-500' }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="h-2 w-full rounded-full bg-gray-100">
            <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
    );
}

function fmtTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-RW', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// Bar chart using CSS
function TrendChart({ trend }) {
    const maxRev = Math.max(...trend.map(d => d.revenue), 1);
    return (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
            <div className="flex items-end gap-1 h-32">
                {trend.map((d, i) => {
                    const pct = d.revenue / maxRev;
                    return (
                        <div key={i} className="flex flex-1 flex-col items-center gap-1 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10
                                bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap pointer-events-none">
                                {rwf(d.revenue)}<br />{d.orders} order{d.orders !== 1 ? 's' : ''}
                            </div>
                            <div
                                className={`w-full rounded-t-md transition-all ${d.revenue > 0 ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-100'}`}
                                style={{ height: `${Math.max(pct * 112, d.revenue > 0 ? 4 : 0)}px` }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-1 mt-2">
                {trend.map((d, i) => (
                    <div key={i} className="flex-1 text-center">
                        <p className="text-xs text-gray-400 truncate">{d.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Food vs Drinks donut (CSS only)
function FoodDrinkSplit({ foodTotal, drinkTotal }) {
    const total = foodTotal + drinkTotal;
    const foodPct = total > 0 ? Math.round((foodTotal / total) * 100) : 0;
    const drinkPct = 100 - foodPct;
    return (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Food vs Drinks</h4>
            {total === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No sales yet</p>
            ) : (
                <>
                    {/* Visual bar */}
                    <div className="flex h-6 rounded-full overflow-hidden mb-3">
                        {foodPct > 0 && (
                            <div className="bg-orange-400 flex items-center justify-center text-xs font-bold text-white"
                                style={{ width: `${foodPct}%` }}>
                                {foodPct > 10 ? `${foodPct}%` : ''}
                            </div>
                        )}
                        {drinkPct > 0 && (
                            <div className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                                style={{ width: `${drinkPct}%` }}>
                                {drinkPct > 10 ? `${drinkPct}%` : ''}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-orange-50 p-3">
                            <p className="text-xs font-bold text-orange-700 mb-0.5">🍽️ Food</p>
                            <p className="text-lg font-extrabold text-orange-800">{rwf(foodTotal)}</p>
                            <p className="text-xs text-orange-600">{foodPct}% of revenue</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3">
                            <p className="text-xs font-bold text-blue-700 mb-0.5">🍺 Drinks</p>
                            <p className="text-lg font-extrabold text-blue-800">{rwf(drinkTotal)}</p>
                            <p className="text-xs text-blue-600">{drinkPct}% of revenue</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const SOURCE_LABEL = { qr_scan: 'QR self-order', phone_call: 'Phone call', walk_in: 'Walk-in' };

export default function Index({ period, revenue, orders, byCategory, foodTotal, drinkTotal, byMethod, bySource, topItems, trend, workerPerf, activity }) {
    const maxMethod  = Math.max(...(byMethod?.map(m => m.total) ?? []), 1);
    const maxSource  = Math.max(...(bySource?.map(s => s.count) ?? []), 1);
    const maxItemQty = Math.max(...(topItems?.map(i => i.qty) ?? []), 1);
    const today = new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const periodRevenue = revenue[period] ?? revenue.period ?? 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Reports & Analytics</h2>
                    <div className="flex items-center gap-2 print:hidden">
                        <a href={route('reports.export', { period })}
                            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                            Download Excel (CSV)
                        </a>
                        <button onClick={() => window.print()}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            Print Report
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Reports" />

            {/* Print header */}
            <div className="hidden print:block px-6 pt-4 pb-2 border-b">
                <h1 className="text-2xl font-extrabold">Isaro Rubengera — Revenue Report</h1>
                <p className="text-sm text-gray-500">{today} · Period: {PERIODS.find(p => p.key === period)?.label}</p>
            </div>

            <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">

                {/* ── Period tabs ── */}
                <div className="flex gap-2 overflow-x-auto pb-1 print:hidden">
                    {PERIODS.map(p => (
                        <button key={p.key}
                            onClick={() => router.get(route('reports.index'), { period: p.key }, { preserveScroll: true })}
                            className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                                period === p.key
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                            }`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* ── Revenue overview for selected period ── */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                        Revenue — {PERIODS.find(p => p.key === period)?.label}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard emoji="💰" label="Total Revenue"  value={rwf(revenue.period)} color="indigo" sub="selected period" />
                        <StatCard emoji="📅" label="Today"          value={rwf(revenue.today)}  color="green" />
                        <StatCard emoji="📆" label="This Week"      value={rwf(revenue.week)}   color="purple" />
                        <StatCard emoji="🗓️" label="This Month"     value={rwf(revenue.month)}  color="amber" />
                    </div>
                </section>

                {/* ── Orders summary ── */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Orders</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard emoji="📋" label="Total Orders"  value={orders.total}     color="gray" />
                        <StatCard emoji="✅" label="Paid"          value={orders.paid}      color="green" />
                        <StatCard emoji="⏳" label="Still Open"   value={orders.open}      color="amber" />
                        <StatCard emoji="✕"  label="Cancelled"    value={orders.cancelled} color="red" />
                    </div>
                </section>

                {/* ── Trend chart ── */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Revenue Trend</h3>
                    <TrendChart trend={trend} />
                </section>

                {/* ── Food vs Drinks + Payment methods ── */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <FoodDrinkSplit foodTotal={foodTotal} drinkTotal={drinkTotal} />

                    <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Payment Methods</h4>
                        {byMethod.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No payments yet</p>
                        ) : (
                            <div className="space-y-3">
                                {byMethod.map((m) => (
                                    <div key={m.method}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{METHOD_LABEL[m.method] ?? m.method}</span>
                                            <span className="font-bold text-gray-900">{rwf(m.total)}</span>
                                        </div>
                                        <MiniBar value={m.total} max={maxMethod} color="bg-green-500" />
                                        <p className="text-xs text-gray-400 mt-0.5">{m.count} transaction{m.count !== 1 ? 's' : ''}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Order source ── */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                        Where Orders Come From
                    </h3>
                    <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
                        {(!bySource || bySource.length === 0) ? (
                            <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {bySource.map((s) => (
                                    <div key={s.source}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{SOURCE_LABEL[s.source] ?? s.source}</span>
                                            <span className="font-bold text-gray-900">{s.count} order{s.count !== 1 ? 's' : ''}</span>
                                        </div>
                                        <MiniBar value={s.count} max={maxSource} color="bg-purple-500" />
                                        <p className="text-xs text-gray-400 mt-0.5">{rwf(s.revenue)} paid revenue</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Category breakdown ── */}
                {byCategory.length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Revenue by Category</h3>
                        <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-4 space-y-3">
                            {byCategory.map((c, i) => {
                                const maxCat = Math.max(...byCategory.map(x => x.revenue), 1);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">
                                                {c.kind === 'drink' ? '🍺' : '🍽️'} {c.name}
                                            </span>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900">{rwf(c.revenue)}</span>
                                                <span className="text-xs text-gray-400 ml-2">{c.qty} items</span>
                                            </div>
                                        </div>
                                        <MiniBar value={c.revenue} max={maxCat}
                                            color={c.kind === 'drink' ? 'bg-blue-500' : 'bg-orange-400'} />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Top items ── */}
                {topItems.length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Top Selling Items</h3>
                        <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-4 space-y-3">
                            {topItems.map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700 truncate flex-1 mr-2">
                                            <span className="text-gray-400 mr-1">#{i + 1}</span>
                                            {item.name}
                                        </span>
                                        <span className="text-xs text-gray-400 shrink-0">{item.qty} sold · {rwf(item.revenue)}</span>
                                    </div>
                                    <MiniBar value={item.qty} max={maxItemQty} color="bg-purple-500" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Worker performance ── */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                        Staff Contributions — {PERIODS.find(p => p.key === period)?.label}
                    </h3>
                    {workerPerf.length === 0 ? (
                        <div className="rounded-2xl bg-gray-50 py-8 text-center text-sm text-gray-400">
                            No staff activity recorded for this period
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            <th className="px-4 py-2.5 text-left">Staff Member</th>
                                            <th className="px-4 py-2.5 text-center">Orders Taken</th>
                                            <th className="px-4 py-2.5 text-center">Bookings Confirmed</th>
                                            <th className="px-4 py-2.5 text-center">Payments</th>
                                            <th className="px-4 py-2.5 text-right">Revenue Generated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {workerPerf.map((s, i) => {
                                            const rm = ROLE_META[s.role] ?? { emoji: '👤', label: s.role };
                                            return (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{rm.emoji}</span>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{s.name}</p>
                                                                <p className="text-xs text-gray-400">{rm.label}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-0.5 text-xs font-bold">
                                                            {s.orders}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs font-bold">
                                                            {s.reservations}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-bold">
                                                            {s.payments}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                        {rwf(s.revenue)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── Activity log ── */}
                {activity.length > 0 && (
                    <section className="print:block">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Full Activity Log</h3>
                        <div className="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden divide-y divide-gray-50">
                            {activity.map((a, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                                    <span className="text-lg shrink-0">{a.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{a.text}</p>
                                        <p className="text-xs font-semibold text-indigo-600 mt-0.5">👤 {a.by}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-gray-500 font-medium">{fmtTime(a.time)}</p>
                                        <span className={`text-xs font-semibold capitalize ${STATUS_COLOR[a.status] ?? 'text-gray-500'}`}>
                                            {a.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
