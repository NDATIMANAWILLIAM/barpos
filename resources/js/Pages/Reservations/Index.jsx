import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n ?? 0) + ' RWF';

const STATUS_STYLES = {
    pending:   'bg-orange-100 text-orange-700 ring-1 ring-orange-300',
    confirmed: 'bg-blue-100 text-blue-700',
    seated:    'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
    no_show:   'bg-gray-100 text-gray-500',
    delivered: 'bg-teal-100 text-teal-700',
};

const SOURCE_LABEL = { online: 'Online', phone_call: 'Phone call', walk_in: 'Walk-in' };
const SOURCE_STYLES = {
    online:     'bg-cyan-100 text-cyan-700',
    phone_call: 'bg-amber-100 text-amber-700',
    walk_in:    'bg-gray-100 text-gray-600',
};

function statusLabel(status, kind) {
    if (status === 'seated')    return kind === 'delivery' ? '🚚 Out for Delivery' : '🪑 Seated';
    if (status === 'delivered') return '✓ Delivered';
    if (status === 'confirmed') return '✓ Confirmed';
    if (status === 'pending')   return '⏳ Pending';
    if (status === 'cancelled') return '✕ Cancelled';
    if (status === 'no_show')   return '— No Show';
    return status;
}

function fmt(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-RW', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function isToday(dt) {
    return dt && new Date(dt).toDateString() === new Date().toDateString();
}

function elapsed(dt) {
    if (!dt) return '';
    const mins = Math.floor((Date.now() - new Date(dt)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
}

function urgencyColor(dt) {
    if (!dt) return 'text-gray-400';
    const mins = Math.floor((Date.now() - new Date(dt)) / 60000);
    if (mins < 6)  return 'text-green-600 font-bold';
    if (mins < 15) return 'text-amber-600 font-bold';
    return 'text-red-600 font-bold';
}

function ReservationCard({ reservation: r, onDelete, tables }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [agreedPrice, setAgreedPrice] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
    const [callNotes, setCallNotes] = useState('');

    const isDelivery = r.kind === 'delivery';
    const deposit = agreedPrice ? Math.round(Number(agreedPrice.replace(/\D/g, '')) * 0.5) : 0;

    const quickStatus = (status) =>
        router.patch(route('reservations.update', r.id), { status }, { preserveScroll: true });

    const submitConfirm = (e) => {
        e.preventDefault();
        const parts = [];
        if (agreedPrice) {
            const price = Number(agreedPrice.replace(/\D/g, ''));
            if (isDelivery) {
                parts.push(`Food total: RWF ${price.toLocaleString()}`);
                if (deliveryFee) {
                    const fee = Number(deliveryFee.replace(/\D/g, ''));
                    parts.push(`Delivery fee: RWF ${fee.toLocaleString()}`);
                } else {
                    parts.push('Delivery fee: to confirm');
                }
            } else {
                parts.push(`Agreed price: RWF ${price.toLocaleString()}`);
                parts.push(`50% deposit required: RWF ${deposit.toLocaleString()}`);
            }
        }
        if (callNotes) parts.push(callNotes);

        router.patch(route('reservations.update', r.id), {
            status:     'confirmed',
            table_id:   isDelivery ? null : (document.getElementById(`tbl-${r.id}`)?.value || null),
            call_notes: parts.join(' | '),
        }, {
            preserveScroll: true,
            onSuccess: () => { setConfirmOpen(false); setAgreedPrice(''); setDeliveryFee(''); setCallNotes(''); },
        });
    };

    return (
        <div className={`rounded-2xl bg-white shadow-sm overflow-hidden ${
            r.status === 'pending' ? 'ring-2 ring-orange-300' : 'ring-1 ring-gray-100'
        }`}>
            {/* Main row */}
            <div className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                    {/* Name + status badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-base">{r.customer_name}</span>
                        {/* kind badge */}
                        {isDelivery
                            ? <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-bold">🚚 Delivery</span>
                            : <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-bold">🪑 Dine-in</span>
                        }
                        {/* status badge */}
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {statusLabel(r.status, r.kind)}
                        </span>
                        {/* source badge */}
                        {r.source && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SOURCE_STYLES[r.source] ?? 'bg-gray-100 text-gray-500'}`}>
                                {SOURCE_LABEL[r.source] ?? r.source}
                            </span>
                        )}
                        {r.status === 'pending' && (
                            <span className={`text-xs ${urgencyColor(r.created_at)}`}>
                                ⏱ Received {elapsed(r.created_at)}
                            </span>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-500">
                        <span>📅 {fmt(r.scheduled_at)}</span>
                        {r.party_size && <span>👥 {r.party_size} guest{r.party_size !== 1 ? 's' : ''}</span>}
                        {!isDelivery && r.table && <span>🪑 {r.table}</span>}
                        <a href={`tel:${r.phone}`} className="text-indigo-600 font-medium hover:underline">📞 {r.phone}</a>
                    </div>

                    {/* Delivery address */}
                    {isDelivery && r.delivery_address && (
                        <div className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-orange-800 bg-orange-50 rounded-lg px-3 py-2">
                            <span className="shrink-0">🏠</span>
                            <span>{r.delivery_address}</span>
                        </div>
                    )}

                    {/* Who created / confirmed */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                        <span>📝 {r.created_by_name}</span>
                        {r.confirmed_by_name && (
                            <span className="text-green-600 font-medium">✓ Confirmed by {r.confirmed_by_name}</span>
                        )}
                    </div>

                    {/* Notes */}
                    {r.notes && (
                        <p className="mt-1.5 text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-1.5">
                            {r.notes}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {r.status === 'pending' && (
                        <button
                            onClick={() => setConfirmOpen(!confirmOpen)}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow"
                        >
                            {confirmOpen ? '✕ Close' : '📞 Call & Confirm'}
                        </button>
                    )}
                    {r.status === 'confirmed' && (
                        <button
                            onClick={() => quickStatus('seated')}
                            className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700"
                        >
                            {isDelivery ? '🚚 Mark Out for Delivery' : '🪑 Seat Now'}
                        </button>
                    )}
                    {/* Delivery: mark delivered once out */}
                    {isDelivery && r.status === 'seated' && (
                        <button
                            onClick={() => quickStatus('delivered')}
                            className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
                        >
                            ✓ Mark Delivered
                        </button>
                    )}
                    {(r.status === 'confirmed' || r.status === 'pending') && (
                        <button
                            onClick={() => quickStatus('no_show')}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                        >
                            No show
                        </button>
                    )}
                    {r.status !== 'cancelled' && r.status !== 'seated' && r.status !== 'delivered' && (
                        <button
                            onClick={() => quickStatus('cancelled')}
                            className="rounded-lg border border-red-100 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button onClick={() => onDelete(r.id)} className="text-xs text-gray-300 hover:text-red-400 mt-1">
                        Delete
                    </button>
                </div>
            </div>

            {/* ── Call & Confirm panel ── */}
            {confirmOpen && r.status === 'pending' && (
                <form onSubmit={submitConfirm} className="border-t-2 border-orange-200 bg-orange-50 px-5 py-4 space-y-4">
                    <div>
                        <p className="text-sm font-extrabold text-orange-900 mb-0.5">📞 Call the client, fill in below, then confirm</p>
                        <p className="text-xs text-orange-700">
                            <a href={`tel:${r.phone}`} className="font-bold underline">{r.phone}</a>
                            {' · '}{fmt(r.scheduled_at)} · {r.party_size} guest{r.party_size !== 1 ? 's' : ''}
                            {isDelivery && r.delivery_address && <span> · 🏠 {r.delivery_address}</span>}
                        </p>
                    </div>

                    {/* Price recording */}
                    <div className={`grid gap-3 ${isDelivery ? 'grid-cols-2' : 'grid-cols-2'}`}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                {isDelivery ? 'Food Total (RWF)' : 'Agreed Total Price (RWF)'}
                                <span className="ml-1 font-normal text-gray-400">confirmed on call</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="w-full rounded-xl border-gray-300 text-sm bg-white"
                                placeholder="e.g. 25000"
                                value={agreedPrice}
                                onChange={e => setAgreedPrice(e.target.value)}
                            />
                            {!isDelivery && agreedPrice && (
                                <p className="mt-1 text-xs text-indigo-700 font-semibold">
                                    50% deposit = RWF {deposit.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                {isDelivery ? 'Delivery Fee (RWF)' : 'Assign Table'}
                                {isDelivery && <span className="ml-1 font-normal text-gray-400">transport cost</span>}
                            </label>
                            {isDelivery ? (
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full rounded-xl border-gray-300 text-sm bg-white"
                                    placeholder="e.g. 2000 (or leave blank)"
                                    value={deliveryFee}
                                    onChange={e => setDeliveryFee(e.target.value)}
                                />
                            ) : (
                                <select
                                    id={`tbl-${r.id}`}
                                    className="w-full rounded-xl border-gray-300 text-sm bg-white"
                                    defaultValue=""
                                >
                                    <option value="">— No specific table yet —</option>
                                    {tables.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.label} — {t.zone} (seats {t.capacity})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Payment terms notice */}
                    <div className={`rounded-xl px-3 py-2 text-xs ${isDelivery ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                        {isDelivery
                            ? '🚚 Delivery payment: client pays when they receive the package (cash on delivery).'
                            : '💰 Dine-in payment: client must pay 50% deposit to confirm the booking.'
                        }
                    </div>

                    {/* Call notes */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Notes from the call
                            <span className="ml-1 font-normal text-gray-400">(what did they request?)</span>
                        </label>
                        <textarea
                            rows={2}
                            className="w-full rounded-xl border-gray-300 text-sm bg-white resize-none"
                            value={callNotes}
                            onChange={e => setCallNotes(e.target.value)}
                            placeholder={isDelivery
                                ? 'e.g. 2 grilled chicken, 1 Mutzig, extra sauce, deliver by 7pm...'
                                : 'e.g. birthday party, window seat, 2 kids need high chairs...'}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-green-700"
                        >
                            ✓ Confirm {isDelivery ? 'Delivery' : 'Reservation'}
                        </button>
                        <button type="button" onClick={() => setConfirmOpen(false)}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-white">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* ── Active orders (seated dine-in) ── */}
            {r.status === 'seated' && !isDelivery && (
                <div className="border-t border-gray-100 px-5 py-3">
                    {r.table_orders?.length > 0 ? (
                        <>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                                Active orders — {r.table ?? 'this table'}
                            </p>
                            <div className="space-y-2">
                                {r.table_orders.map((o) => (
                                    <div key={o.id} className="rounded-xl bg-gray-50 ring-1 ring-gray-100 px-3 py-2.5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-gray-700">#{o.order_number}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-semibold capitalize">{o.status}</span>
                                                <span className="text-xs font-bold text-gray-800">{rwf(o.total)}</span>
                                                <Link href={route('payments.show', o.id)}
                                                    className="rounded-lg bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white hover:bg-green-700">
                                                    Pay
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            {o.items.map((item, i) => (
                                                <div key={i} className="flex justify-between text-xs text-gray-500">
                                                    <span>{item.quantity}× {item.name}</span>
                                                    <span>{rwf(item.line_total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No active orders on this table yet.</p>
                    )}
                </div>
            )}

            {/* ── Delivery out / delivered status ── */}
            {isDelivery && (r.status === 'seated' || r.status === 'delivered') && (
                <div className={`border-t px-5 py-3 ${r.status === 'delivered' ? 'bg-teal-50 border-teal-100' : 'bg-orange-50 border-orange-100'}`}>
                    <p className="text-xs font-semibold">
                        {r.status === 'seated'
                            ? '🚚 Delivery is on the way. Click "Mark Delivered" once received.'
                            : '✓ Delivery completed. Client paid on receipt.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

export default function Index({ reservations, tables }) {
    const [showForm, setShowForm] = useState(false);
    const [now, setNow] = useState(Date.now());

    // Tick every minute so elapsed times stay fresh
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(t);
    }, []);

    const form = useForm({
        customer_name: '',
        phone:         '',
        source:        'phone_call',
        party_size:    2,
        scheduled_at:  '',
        table_id:      '',
        notes:         '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('reservations.store'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setShowForm(false); },
        });
    };

    const deleteRes = (id) => {
        if (!confirm('Delete this reservation?')) return;
        router.delete(route('reservations.destroy', id), { preserveScroll: true });
    };

    const pendingList   = reservations.filter(r => r.status === 'pending');
    const confirmedList = reservations.filter(r => r.status === 'confirmed');
    const activeList    = reservations.filter(r => r.status === 'seated');
    const doneList      = reservations.filter(r => r.status === 'delivered');
    const todayList     = reservations.filter(r => isToday(r.scheduled_at));
    const upcomingList  = reservations.filter(r => !isToday(r.scheduled_at));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Reservations & Deliveries</h2>
                        {pendingList.length > 0 && (
                            <p className="text-sm text-orange-600 font-semibold">
                                🔔 {pendingList.length} pending — call to confirm
                            </p>
                        )}
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                        {showForm ? 'Cancel' : '+ New'}
                    </button>
                </div>
            }
        >
            <Head title="Reservations" />

            <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">

                {/* ── Status pipeline overview ── */}
                <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                        { label: 'Waiting',    count: pendingList.length,   color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200', icon: '⏳' },
                        { label: 'Confirmed',  count: confirmedList.length,  color: 'bg-blue-50 text-blue-700',   icon: '✓' },
                        { label: 'Active',     count: activeList.length,     color: 'bg-green-50 text-green-700',  icon: '🍽️' },
                        { label: 'Delivered',  count: doneList.length,       color: 'bg-teal-50 text-teal-700',   icon: '✓' },
                    ].map(s => (
                        <div key={s.label} className={`rounded-2xl px-3 py-3 ${s.color}`}>
                            <p className="text-lg font-extrabold">{s.count}</p>
                            <p className="text-xs font-semibold opacity-80">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Pending alert ── */}
                {pendingList.length > 0 && (
                    <div className="rounded-2xl bg-orange-50 ring-2 ring-orange-300 px-5 py-4 flex items-start gap-3">
                        <span className="text-3xl shrink-0">🔔</span>
                        <div>
                            <p className="font-extrabold text-orange-800 text-base">
                                {pendingList.length} request{pendingList.length > 1 ? 's' : ''} need a call
                            </p>
                            <p className="text-sm text-orange-700 mt-0.5">
                                Call each client, record price + notes, then confirm. Try to respond within 5 minutes.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── New reservation form (staff creates) ── */}
                {showForm && (
                    <div className="rounded-2xl bg-white p-5 shadow ring-2 ring-indigo-300">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">New Reservation (Staff)</h3>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Guest Name *</label>
                                <input className="w-full rounded-xl border-gray-300 text-sm" autoFocus
                                    value={form.data.customer_name}
                                    onChange={e => form.setData('customer_name', e.target.value)} placeholder="Full name" />
                                {form.errors.customer_name && <p className="mt-1 text-xs text-red-500">{form.errors.customer_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                                <input type="tel" className="w-full rounded-xl border-gray-300 text-sm"
                                    value={form.data.phone}
                                    onChange={e => form.setData('phone', e.target.value)} placeholder="07X XXX XXXX" />
                                {form.errors.phone && <p className="mt-1 text-xs text-red-500">{form.errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Date & Time *</label>
                                <input type="datetime-local" className="w-full rounded-xl border-gray-300 text-sm"
                                    value={form.data.scheduled_at}
                                    onChange={e => form.setData('scheduled_at', e.target.value)} />
                                {form.errors.scheduled_at && <p className="mt-1 text-xs text-red-500">{form.errors.scheduled_at}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">How is this coming in? *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => form.setData('source', 'phone_call')}
                                        className={`rounded-xl border py-2 text-xs font-bold transition ${form.data.source === 'phone_call' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}>
                                        Phone call
                                    </button>
                                    <button type="button" onClick={() => form.setData('source', 'walk_in')}
                                        className={`rounded-xl border py-2 text-xs font-bold transition ${form.data.source === 'walk_in' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}>
                                        Walk-in / in person
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Party Size *</label>
                                <input type="number" min="1" max="50" className="w-full rounded-xl border-gray-300 text-sm"
                                    value={form.data.party_size}
                                    onChange={e => form.setData('party_size', parseInt(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Table</label>
                                <select className="w-full rounded-xl border-gray-300 text-sm"
                                    value={form.data.table_id}
                                    onChange={e => form.setData('table_id', e.target.value)}>
                                    <option value="">No specific table</option>
                                    {tables.map(t => (
                                        <option key={t.id} value={t.id}>{t.label} — {t.zone} (seats {t.capacity})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                                <input className="w-full rounded-xl border-gray-300 text-sm"
                                    value={form.data.notes}
                                    onChange={e => form.setData('notes', e.target.value)}
                                    placeholder="e.g. birthday, window seat, allergies" />
                            </div>
                            <div className="sm:col-span-2">
                                <button type="submit" disabled={form.processing}
                                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                                    {form.processing ? 'Saving…' : '+ Confirm Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Today ── */}
                {todayList.length > 0 && (
                    <section>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Today — {todayList.length} booking{todayList.length !== 1 ? 's' : ''}
                        </h3>
                        <div className="space-y-3">
                            {todayList.map(r => (
                                <ReservationCard key={r.id} reservation={r} onDelete={deleteRes} tables={tables} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Upcoming ── */}
                {upcomingList.length > 0 && (
                    <section>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Upcoming — {upcomingList.length} booking{upcomingList.length !== 1 ? 's' : ''}
                        </h3>
                        <div className="space-y-3">
                            {upcomingList.map(r => (
                                <ReservationCard key={r.id} reservation={r} onDelete={deleteRes} tables={tables} />
                            ))}
                        </div>
                    </section>
                )}

                {reservations.length === 0 && !showForm && (
                    <div className="rounded-2xl bg-white py-16 text-center shadow">
                        <p className="text-4xl mb-3">📅</p>
                        <p className="text-gray-500 font-medium">No upcoming reservations or deliveries.</p>
                        <button onClick={() => setShowForm(true)}
                            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">
                            Add first reservation
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
