import { Head, Link } from '@inertiajs/react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n ?? 0) + ' RWF';

// ── Icon set (inline SVG — no emoji) ────────────────────────────────────────
const Icon = {
    check:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    pin:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>,
    phone:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5c0-.6.4-1 1-1h2.6c.5 0 .9.3 1 .8l.7 3a1 1 0 01-.3 1L7.4 10.4a12 12 0 006.2 6.2l1.6-1.6a1 1 0 011-.3l3 .7c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1C10.5 20 4 13.5 4 6V5z"/></svg>,
    cash:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>,
    mobile:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path strokeLinecap="round" d="M11 18.5h2"/></svg>,
    card:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="2.5" y="5" width="19" height="14" rx="2"/><path strokeLinecap="round" d="M2.5 10h19"/></svg>,
    bank:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-6 9 6"/><path strokeLinecap="round" d="M5 10v9M10 10v9M14 10v9M19 10v9M3 19h18"/></svg>,
    printer: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 8V3.5h12V8M6 17.5H4.5A1.5 1.5 0 013 16v-5a1.5 1.5 0 011.5-1.5h17A1.5 1.5 0 0123 11v5a1.5 1.5 0 01-1.5 1.5H18M6 14h12v6.5H6z"/></svg>,
    back:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>,
};

const METHOD_ICON = {
    cash:         Icon.cash,
    mtn_momo:     Icon.mobile,
    airtel_money: Icon.mobile,
    card:         Icon.card,
    bank:         Icon.bank,
};

function fmt(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-RW', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function Receipt({ order, payment, cashier, business }) {
    const printReceipt = () => window.print();

    return (
        <>
            <Head title={`Receipt #${order.order_number}`} />

            {/* ── SCREEN VIEW ─────────────────────────────────────────────── */}
            <div className="min-h-screen bg-ink-50 flex flex-col items-center py-8 px-4 print:hidden">
                <div className="w-full max-w-md space-y-4">

                    {/* Success banner */}
                    <div className="rounded-2xl bg-green-600 p-5 text-center text-white shadow-lg">
                        <div className="flex justify-center mb-2">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow">
                                <Icon.check className="h-7 w-7 text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-xl font-extrabold">Payment Confirmed!</h1>
                        <p className="text-sm text-green-100 mt-0.5">Order <span className="font-mono font-bold">#{order.order_number}</span> is paid</p>
                    </div>

                    {/* Receipt card */}
                    <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-ink-950 px-6 pt-6 pb-4 text-center text-white">
                            <img src="/images/logo.jpeg" alt={business?.name ?? 'Logo'}
                                className="mx-auto mb-2 h-14 w-14 rounded-xl object-cover ring-1 ring-white/10" />
                            <p className="text-xs font-bold uppercase tracking-widest text-brass-400">Official Receipt</p>
                            <h2 className="mt-1 text-2xl font-extrabold">{business?.name ?? 'Isaro Rubengera'}</h2>
                            {business?.address && (
                                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-400">
                                    <Icon.pin className="h-3 w-3" /> {business.address}
                                </p>
                            )}
                            {business?.phone && (
                                <p className="flex items-center justify-center gap-1 text-xs text-ink-400">
                                    <Icon.phone className="h-3 w-3" /> {business.phone}
                                </p>
                            )}
                            {business?.tin     && <p className="mt-1 text-xs text-ink-300">TIN: {business.tin}</p>}
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-px bg-ink-100">
                            {[
                                ['Order #',   `#${order.order_number}`],
                                ['Date',      fmt(payment?.confirmed_at ?? order.placed_at)],
                                ['Type',      order.type?.replace('_', ' ')],
                                order.table ? ['Table', order.table] : null,
                                cashier ? ['Cashier', cashier] : null,
                            ].filter(Boolean).map(([label, val]) => (
                                <div key={label} className="bg-white px-4 py-2.5">
                                    <p className="text-xs text-ink-400">{label}</p>
                                    <p className="font-semibold text-ink-900 text-sm capitalize">{val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Items */}
                        <div className="px-5 py-4 space-y-2.5 border-t border-dashed border-ink-200">
                            <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-1">Items Ordered</p>
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <span className="text-sm text-ink-800">{item.name_snapshot}</span>
                                        <span className="text-xs text-ink-400 ml-1.5">×{item.quantity}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-ink-900 shrink-0">{rwf(item.line_total)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-dashed border-ink-200 px-5 py-4 space-y-1.5">
                            <div className="flex justify-between text-sm text-ink-600">
                                <span>Subtotal</span><span>{rwf(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span><span>−{rwf(order.discount)}</span>
                                </div>
                            )}
                            {order.tax > 0 && (
                                <div className="flex justify-between text-sm text-ink-600">
                                    <span>VAT / Tax</span><span>{rwf(order.tax)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-ink-200 pt-2 mt-1">
                                <span className="font-extrabold text-ink-900">TOTAL PAID</span>
                                <span className="font-extrabold text-xl text-ink-900">{rwf(order.total)}</span>
                            </div>
                        </div>

                        {/* Payment method */}
                        {payment && (
                            <div className="border-t border-dashed border-ink-200 px-5 py-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-2">Payment Details</p>
                                <div className="flex items-center gap-3 rounded-xl bg-ink-50 px-4 py-3">
                                    {(() => { const MIcon = METHOD_ICON[payment.method] ?? Icon.cash; return (
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-ink-600 shadow-sm">
                                            <MIcon className="h-5 w-5" />
                                        </span>
                                    ); })()}
                                    <div className="flex-1">
                                        <p className="font-bold text-ink-900">{payment.method_label}</p>
                                        {payment.reference && (
                                            <p className="text-xs text-ink-500 font-mono">Ref: {payment.reference}</p>
                                        )}
                                    </div>
                                    <span className="font-bold text-ink-800">{rwf(payment.amount)}</span>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="bg-ink-50 px-5 py-4 text-center border-t border-ink-100">
                            <p className="text-sm font-bold text-ink-700">Murakoze / Thank you!</p>
                            <p className="text-xs text-ink-400 mt-1">Please come again · Nimweze gusubira</p>
                            {order.notes && (
                                <p className="mt-2 text-xs text-ink-400 italic">Note: {order.notes}</p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={printReceipt}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-ink-900 py-4 text-sm font-bold text-white shadow-md hover:bg-ink-800 transition">
                            <Icon.printer className="h-4 w-4" /> Print Receipt
                        </button>
                        <Link href={route('pos.index')}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-brass-600 py-4 text-sm font-bold text-white shadow-md hover:bg-brass-700 transition">
                            <Icon.back className="h-4 w-4" /> Back to POS
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── PRINT VIEW (80mm thermal receipt) ───────────────────────── */}
            <div className="hidden print:block" style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', padding: '4mm' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '4mm', marginBottom: '3mm' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{business?.name ?? 'Isaro Rubengera'}</div>
                    {business?.address && <div>{business.address}</div>}
                    {business?.phone   && <div>Tel: {business.phone}</div>}
                    {business?.tin     && <div>TIN: {business.tin}</div>}
                    <div style={{ marginTop: '2mm', fontSize: '10px' }}>RECEIPT / INYEMEZABUGUZI</div>
                </div>

                {/* Order info */}
                <div style={{ marginBottom: '3mm' }}>
                    <div>Order #: {order.order_number}</div>
                    <div>Date:    {fmt(payment?.confirmed_at ?? order.placed_at)}</div>
                    {order.table   && <div>Table:   {order.table}</div>}
                    {cashier       && <div>Cashier: {cashier}</div>}
                </div>

                <div style={{ borderTop: '1px dashed #000', paddingTop: '2mm', marginBottom: '3mm' }}>
                    {/* Items */}
                    {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                            <span style={{ flex: 1 }}>{item.quantity}x {item.name_snapshot}</span>
                            <span>{item.line_total.toLocaleString()} RWF</span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px dashed #000', paddingTop: '2mm', marginBottom: '3mm' }}>
                    {order.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Discount</span><span>-{order.discount.toLocaleString()} RWF</span>
                        </div>
                    )}
                    {order.tax > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>VAT</span><span>{order.tax.toLocaleString()} RWF</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '1px solid #000', marginTop: '1mm', paddingTop: '1mm' }}>
                        <span>TOTAL</span><span>{order.total.toLocaleString()} RWF</span>
                    </div>
                </div>

                {/* Payment */}
                {payment && (
                    <div style={{ borderTop: '1px dashed #000', paddingTop: '2mm', marginBottom: '3mm' }}>
                        <div>Paid via: {payment.method_label}</div>
                        {payment.reference && <div>Ref: {payment.reference}</div>}
                    </div>
                )}

                {/* Footer */}
                <div style={{ borderTop: '1px dashed #000', paddingTop: '3mm', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>Murakoze / Thank you!</div>
                    <div style={{ fontSize: '10px', marginTop: '1mm' }}>Please come again</div>
                </div>
            </div>
        </>
    );
}
