import { Head, useForm, usePage, Link } from '@inertiajs/react';

// ── Icon set (inline SVG — no emoji) ────────────────────────────────────────
const Icon = {
    calendar: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="3.5" y="5" width="17" height="16" rx="2"/><path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17"/></svg>,
    seat:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="3" y="8" width="18" height="2" rx="1"/><path strokeLinecap="round" d="M5 10v8M19 10v8M8 10v3m8-3v3"/></svg>,
    truck:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>,
    phone:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5c0-.6.4-1 1-1h2.6c.5 0 .9.3 1 .8l.7 3a1 1 0 01-.3 1L7.4 10.4a12 12 0 006.2 6.2l1.6-1.6a1 1 0 011-.3l3 .7c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1C10.5 20 4 13.5 4 6V5z"/></svg>,
    note:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5"/></svg>,
    check:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    back:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>,
    pin:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>,
};

function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1">{label}</label>
            {children}
            {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}

export default function Book({ business, contact, tables, minDate, maxDate }) {
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
                <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-5">
                        <div className="flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg">
                                <Icon.check className="h-9 w-9 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-ink-900">Request Received!</h1>
                            <p className="mt-2 text-ink-600">
                                Thank you for choosing <strong>{business.name}</strong>.<br />
                                We will call you within 5 minutes to confirm.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white shadow-lg p-5 text-sm text-ink-600 space-y-3 text-left">
                            <p className="font-bold text-ink-700 text-base">What happens next?</p>
                            <div className="flex gap-2.5"><Icon.phone className="h-4 w-4 shrink-0 mt-0.5 text-brass-500" /><span>We call or WhatsApp you within 5 minutes of your request.</span></div>
                            <div className="flex gap-2.5"><Icon.note className="h-4 w-4 shrink-0 mt-0.5 text-brass-500" /><span>We confirm the time and record what you need on the call.</span></div>
                            <div className="flex gap-2.5"><Icon.check className="h-4 w-4 shrink-0 mt-0.5 text-brass-500" /><span>Once confirmed, we prepare everything for you.</span></div>
                        </div>
                        {business.phone && (
                            <a href={`tel:${business.phone}`}
                                className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-6 py-3 text-white font-bold shadow hover:bg-ink-800">
                                <Icon.phone className="h-4 w-4" /> Call us: {business.phone}
                            </a>
                        )}
                        <div>
                            <Link href={route('public.menu')}
                                className="inline-flex items-center gap-1 text-sm text-brass-600 hover:underline">
                                <Icon.back className="h-3.5 w-3.5" /> Back to Menu
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
            <div className="min-h-screen bg-ink-50">

                {/* Header */}
                <div className="bg-ink-950 text-white px-4 py-10 text-center">
                    <img src="/images/logo.jpeg" alt={business.name}
                        className="mx-auto mb-3 h-16 w-16 rounded-xl object-cover ring-1 ring-white/10" />
                    <h1 className="text-2xl font-extrabold">{business.name}</h1>
                    <p className="text-ink-300 mt-1 text-sm">Book a table or request delivery — no account needed</p>
                    {business.address && (
                        <p className="flex items-center justify-center gap-1 text-ink-400 text-xs mt-1">
                            <Icon.pin className="h-3 w-3" /> {business.address}
                        </p>
                    )}
                    {contact?.phone && (
                        <a href={`tel:${contact.phone}`}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 hover:bg-white/15 transition">
                            <Icon.phone className="h-4 w-4 text-brass-300" />
                            <span className="text-sm font-bold">
                                Need help booking? Call {contact.name ? `${contact.name} · ` : ''}{contact.phone}
                            </span>
                        </a>
                    )}
                </div>

                <div className="mx-auto max-w-lg px-4 py-8">
                    <div className="rounded-2xl bg-white shadow-xl p-6 sm:p-8">

                        {/* ── Type selector ── */}
                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">What do you need?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setKind('table')}
                                    className={`rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                                        !isDelivery
                                            ? 'border-brass-500 bg-brass-50 shadow'
                                            : 'border-ink-200 hover:border-brass-200 hover:bg-brass-50/50'
                                    }`}
                                >
                                    <Icon.seat className="mb-1.5 h-6 w-6 text-brass-600" />
                                    <div className="font-bold text-ink-800 text-sm">Book a Table</div>
                                    <div className="text-xs text-ink-500 mt-0.5">Come dine at our bar</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setKind('delivery')}
                                    className={`rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                                        isDelivery
                                            ? 'border-teal-500 bg-teal-50 shadow'
                                            : 'border-ink-200 hover:border-teal-200 hover:bg-teal-50/50'
                                    }`}
                                >
                                    <Icon.truck className="mb-1.5 h-6 w-6 text-teal-600" />
                                    <div className="font-bold text-ink-800 text-sm">Request Delivery</div>
                                    <div className="text-xs text-ink-500 mt-0.5">We bring it to your home</div>
                                </button>
                            </div>
                        </div>

                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900 mb-1">
                            {isDelivery ? <Icon.truck className="h-5 w-5 text-teal-600" /> : <Icon.seat className="h-5 w-5 text-brass-600" />}
                            {isDelivery ? 'Delivery Request' : 'Table Reservation'}
                        </h2>
                        <p className="text-sm text-ink-500 mb-6">Fill in your details. We will call to confirm.</p>

                        <form onSubmit={submit} className="space-y-5">

                            <Field label="Your Full Name *" error={form.errors.customer_name}>
                                <input
                                    type="text"
                                    autoFocus
                                    value={form.data.customer_name}
                                    onChange={e => form.setData('customer_name', e.target.value)}
                                    placeholder="e.g. Uwimana Claudine"
                                    className="w-full rounded-xl border-ink-200 shadow-sm text-sm focus:border-brass-500 focus:ring-brass-500"
                                />
                            </Field>

                            <Field label="Phone Number *" error={form.errors.phone}
                                hint="We will call or WhatsApp this number to confirm">
                                <input
                                    type="tel"
                                    value={form.data.phone}
                                    onChange={e => form.setData('phone', e.target.value)}
                                    placeholder="07X XXX XXXX"
                                    className="w-full rounded-xl border-ink-200 shadow-sm text-sm focus:border-brass-500 focus:ring-brass-500"
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
                                        className="w-full rounded-xl border-ink-200 shadow-sm text-sm focus:border-brass-500 focus:ring-brass-500"
                                    />
                                </Field>

                                <Field label="Number of People *" error={form.errors.party_size}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={form.data.party_size}
                                        onChange={e => form.setData('party_size', parseInt(e.target.value) || 1)}
                                        className="w-full rounded-xl border-ink-200 shadow-sm text-sm focus:border-brass-500 focus:ring-brass-500"
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
                                        className="w-full rounded-xl border-ink-200 shadow-sm text-sm focus:border-teal-500 focus:ring-teal-500 resize-none"
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
                                        className="w-full rounded-xl border-ink-200 shadow-sm text-sm focus:border-brass-500 focus:ring-brass-500"
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
                                    className="w-full rounded-xl border-ink-200 shadow-sm text-sm focus:border-brass-500 focus:ring-brass-500 resize-none"
                                />
                            </Field>

                            {/* Notice */}
                            <div className={`rounded-xl border px-4 py-3 ${isDelivery ? 'bg-teal-50 border-teal-200' : 'bg-brass-50 border-brass-200'}`}>
                                <p className={`text-xs ${isDelivery ? 'text-teal-700' : 'text-brass-700'}`}>
                                    <strong>Note:</strong> Your request is not yet confirmed.
                                    Within 5 minutes of your request we will call you, confirm the time,
                                    and record everything you need.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold text-white shadow-lg transition disabled:opacity-60 ${
                                    isDelivery
                                        ? 'bg-teal-600 hover:bg-teal-700'
                                        : 'bg-brass-600 hover:bg-brass-700'
                                }`}
                            >
                                {form.processing ? (
                                    'Sending…'
                                ) : (
                                    <>
                                        {isDelivery ? <Icon.truck className="h-5 w-5" /> : <Icon.calendar className="h-5 w-5" />}
                                        {isDelivery ? 'Request Delivery' : 'Request My Booking'}
                                    </>
                                )}
                            </button>
                        </form>

                        {business.phone && (
                            <div className="mt-5 border-t pt-4 text-center">
                                <p className="text-xs text-ink-400 mb-2">Prefer to book by phone?</p>
                                <a href={`tel:${business.phone}`}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-brass-600 hover:underline">
                                    <Icon.phone className="h-4 w-4" /> Call us: {business.phone}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-center">
                        <Link href={route('public.menu')}
                            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brass-600 hover:underline">
                            <Icon.back className="h-3.5 w-3.5" /> Back to Menu
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
