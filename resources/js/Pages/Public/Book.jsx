import { Head, useForm, usePage, Link } from '@inertiajs/react';

function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            {children}
            {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}

export default function Book({ business, tables, minDate, maxDate }) {
    const { props } = usePage();
    const booked = props.flash?.booked;

    const form = useForm({
        kind:             'table',
        customer_name:    '',
        phone:            '',
        party_size:       2,
        scheduled_at:     '',
        table_id:         '',
        delivery_address: '',
        notes:            '',
    });

    const isDelivery = form.data.kind === 'delivery';

    const setKind = (k) => {
        form.setData({
            ...form.data,
            kind:         k,
            table_id:         '',
            delivery_address: '',
        });
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('public.book.store'), { preserveScroll: true });
    };

    /* ── Success screen ── */
    if (booked) {
        return (
            <>
                <Head title="Request Received" />
                <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-5">
                        <div className="flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-4xl shadow-lg">
                                ✅
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">Request Received!</h1>
                            <p className="mt-2 text-gray-600">
                                Thank you for choosing <strong>{business.name}</strong>.<br />
                                We will call you within 5 minutes to confirm.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white shadow-lg p-5 text-sm text-gray-600 space-y-2 text-left">
                            <p className="font-bold text-gray-700 text-base">What happens next?</p>
                            <div className="flex gap-2"><span>📞</span><span>We call or WhatsApp you within 5 minutes of your request.</span></div>
                            <div className="flex gap-2"><span>🗒️</span><span>We confirm the time and record what you need on the call.</span></div>
                            <div className="flex gap-2"><span>✓</span><span>Once confirmed, we prepare everything for you.</span></div>
                        </div>
                        {business.phone && (
                            <a href={`tel:${business.phone}`}
                                className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-white font-bold shadow hover:bg-green-700">
                                📞 Call us: {business.phone}
                            </a>
                        )}
                        <div>
                            <Link href={route('public.menu')}
                                className="text-sm text-indigo-600 hover:underline">
                                ← Back to Menu
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ── Booking form ── */
    return (
        <>
            <Head title={`Book — ${business.name}`} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-10 text-center">
                    <p className="text-3xl mb-2">📅</p>
                    <h1 className="text-2xl font-extrabold">{business.name}</h1>
                    <p className="text-indigo-200 mt-1 text-sm">Book a table or request delivery — no account needed</p>
                    {business.address && (
                        <p className="text-indigo-300 text-xs mt-1">📍 {business.address}</p>
                    )}
                </div>

                <div className="mx-auto max-w-lg px-4 py-8">
                    <div className="rounded-2xl bg-white shadow-xl p-6 sm:p-8">

                        {/* ── Type selector ── */}
                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">What do you need?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setKind('table')}
                                    className={`rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                                        !isDelivery
                                            ? 'border-indigo-500 bg-indigo-50 shadow'
                                            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">🪑</div>
                                    <div className="font-bold text-gray-800 text-sm">Book a Table</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Come dine at our bar</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setKind('delivery')}
                                    className={`rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                                        isDelivery
                                            ? 'border-orange-400 bg-orange-50 shadow'
                                            : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/50'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">🚚</div>
                                    <div className="font-bold text-gray-800 text-sm">Request Delivery</div>
                                    <div className="text-xs text-gray-500 mt-0.5">We bring it to your home</div>
                                </button>
                            </div>
                        </div>

                        <h2 className="text-lg font-extrabold text-gray-900 mb-1">
                            {isDelivery ? '🚚 Delivery Request' : '🪑 Table Reservation'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">Fill in your details. We will call to confirm.</p>

                        <form onSubmit={submit} className="space-y-5">

                            <Field label="Your Full Name *" error={form.errors.customer_name}>
                                <input
                                    type="text"
                                    autoFocus
                                    value={form.data.customer_name}
                                    onChange={e => form.setData('customer_name', e.target.value)}
                                    placeholder="e.g. Uwimana Claudine"
                                    className="w-full rounded-xl border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </Field>

                            <Field label="Phone Number *" error={form.errors.phone}
                                hint="We will call or WhatsApp this number to confirm">
                                <input
                                    type="tel"
                                    value={form.data.phone}
                                    onChange={e => form.setData('phone', e.target.value)}
                                    placeholder="07X XXX XXXX"
                                    className="w-full rounded-xl border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label={isDelivery ? 'Delivery Time *' : 'Date & Time *'} error={form.errors.scheduled_at}>
                                    <input
                                        type="datetime-local"
                                        value={form.data.scheduled_at}
                                        min={minDate}
                                        max={maxDate}
                                        onChange={e => form.setData('scheduled_at', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </Field>

                                <Field label="Number of People *" error={form.errors.party_size}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={form.data.party_size}
                                        onChange={e => form.setData('party_size', parseInt(e.target.value) || 1)}
                                        className="w-full rounded-xl border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </Field>
                            </div>

                            {/* Delivery: address field */}
                            {isDelivery && (
                                <Field label="Delivery Address *" error={form.errors.delivery_address}
                                    hint="Street, area, or landmark so we can find you">
                                    <textarea
                                        rows={2}
                                        value={form.data.delivery_address}
                                        onChange={e => form.setData('delivery_address', e.target.value)}
                                        placeholder="e.g. KG 7 Ave, Kacyiru — near the blue gate"
                                        className="w-full rounded-xl border-gray-300 shadow-sm text-sm focus:border-orange-400 focus:ring-orange-400 resize-none"
                                    />
                                </Field>
                            )}

                            {/* Dine-in: table preference */}
                            {!isDelivery && tables.length > 0 && (
                                <Field label="Preferred Table (optional)" error={form.errors.table_id}
                                    hint="Leave blank if you have no preference">
                                    <select
                                        value={form.data.table_id}
                                        onChange={e => form.setData('table_id', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">— No preference —</option>
                                        {tables.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.label} ({t.zone}, seats {t.capacity})
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            <Field label={isDelivery ? 'What would you like to order? (optional)' : 'Special Requests (optional)'}
                                error={form.errors.notes}>
                                <textarea
                                    rows={3}
                                    value={form.data.notes}
                                    onChange={e => form.setData('notes', e.target.value)}
                                    placeholder={isDelivery
                                        ? 'e.g. 2 grilled chicken, 1 Mutzig, extra sauce, no onions...'
                                        : 'e.g. birthday celebration, window seat, vegetarian food...'}
                                    className="w-full rounded-xl border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                                />
                            </Field>

                            {/* Notice */}
                            <div className={`rounded-xl border px-4 py-3 ${isDelivery ? 'bg-orange-50 border-orange-200' : 'bg-amber-50 border-amber-200'}`}>
                                <p className={`text-xs ${isDelivery ? 'text-orange-700' : 'text-amber-700'}`}>
                                    <strong>Note:</strong> Your request is not yet confirmed.
                                    Within 5 minutes of your request we will call you, confirm the time,
                                    and record everything you need.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className={`w-full rounded-2xl py-4 text-base font-extrabold text-white shadow-lg transition disabled:opacity-60 ${
                                    isDelivery
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {form.processing
                                    ? 'Sending…'
                                    : isDelivery ? '🚚 Request Delivery' : '📅 Request My Booking'}
                            </button>
                        </form>

                        {business.phone && (
                            <div className="mt-5 border-t pt-4 text-center">
                                <p className="text-xs text-gray-400 mb-2">Prefer to book by phone?</p>
                                <a href={`tel:${business.phone}`}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
                                    📞 Call us: {business.phone}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-center">
                        <Link href={route('public.menu')}
                            className="text-sm text-gray-500 hover:text-indigo-600 hover:underline">
                            ← Back to Menu
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
