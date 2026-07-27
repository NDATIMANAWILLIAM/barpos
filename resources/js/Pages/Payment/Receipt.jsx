import { Head, Link } from '@inertiajs/react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n ?? 0) + ' RWF';

const METHOD_EMOJI = {
    cash:         '💵',
    mtn_momo:     '📱',
    airtel_money: '📶',
    card:         '💳',
    bank:         '🏦',
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
            <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 print:hidden">
                <div className="w-full max-w-md space-y-4">

                    {/* Success banner */}
                    <div className="rounded-2xl bg-green-500 p-5 text-center text-white shadow-lg">
                        <div className="flex justify-center mb-2">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow">✅</div>
                        </div>
                        <h1 className="text-xl font-extrabold">Payment Confirmed!</h1>
                        <p className="text-sm text-green-100 mt-0.5">Order <span className="font-mono font-bold">#{order.order_number}</span> is paid</p>
                    </div>

                    {/* Receipt card */}
                    <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-900 px-6 pt-6 pb-4 text-center text-white">
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Official Receipt</p>
                            <h2 className="mt-1 text-2xl font-extrabold">{business?.name ?? 'BarPOS'}</h2>
                            {business?.address && <p className="mt-1 text-xs text-gray-400">📍 {business.address}</p>}
                            {business?.phone   && <p className="text-xs text-gray-400">📞 {business.phone}</p>}
                            {business?.tin     && <p className="mt-1 text-xs text-gray-300">TIN: {business.tin}</p>}
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-px bg-gray-100">
                            {[
                                ['Order #',   `#${order.order_number}`],
                                ['Date',      fmt(payment?.confirmed_at ?? order.placed_at)],
                                ['Type',      order.type?.replace('_', ' ')],
                                order.table ? ['Table', order.table] : null,
                                cashier ? ['Cashier', cashier] : null,
                            ].filter(Boolean).map(([label, val]) => (
                                <div key={label} className="bg-white px-4 py-2.5">
                                    <p className="text-xs text-gray-400">{label}</p>
                                    <p className="font-semibold text-gray-900 text-sm capitalize">{val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Items */}
                        <div className="px-5 py-4 space-y-2.5 border-t border-dashed border-gray-200">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Items Ordered</p>
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <span className="text-sm text-gray-800">{item.name_snapshot}</span>
                                        <span className="text-xs text-gray-400 ml-1.5">×{item.quantity}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 shrink-0">{rwf(item.line_total)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-dashed border-gray-200 px-5 py-4 space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span><span>{rwf(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span><span>−{rwf(order.discount)}</span>
                                </div>
                            )}
                            {order.tax > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>VAT / Tax</span><span>{rwf(order.tax)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                                <span className="font-extrabold text-gray-900">TOTAL PAID</span>
                                <span className="font-extrabold text-xl text-gray-900">{rwf(order.total)}</span>
                            </div>
                        </div>

                        {/* Payment method */}
                        {payment && (
                            <div className="border-t border-dashed border-gray-200 px-5 py-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Payment Details</p>
                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                                    <span className="text-2xl">{METHOD_EMOJI[payment.method] ?? '💰'}</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{payment.method_label}</p>
                                        {payment.reference && (
                                            <p className="text-xs text-gray-500 font-mono">Ref: {payment.reference}</p>
                                        )}
                                    </div>
                                    <span className="font-bold text-gray-800">{rwf(payment.amount)}</span>
                                </div>

                                {/* EBM / Fiscal receipt */}
                                {payment.ebm_number && (
                                    <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
                                        <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1">EBM Fiscal Receipt (RRA)</p>
                                        <p className="font-mono text-base font-extrabold text-blue-900 tracking-wider">{payment.ebm_number}</p>
                                        <p className="text-xs text-blue-500 mt-0.5">Verify at: <span className="font-mono">www.rra.gov.rw</span></p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="bg-gray-50 px-5 py-4 text-center border-t border-gray-100">
                            <p className="text-sm font-bold text-gray-700">Murakoze / Thank you!</p>
                            <p className="text-xs text-gray-400 mt-1">Please come again · Nimweze gusubira</p>
                            {order.notes && (
                                <p className="mt-2 text-xs text-gray-400 italic">Note: {order.notes}</p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={printReceipt}
                            className="rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white shadow-md hover:bg-gray-800 transition">
                            🖨 Print Receipt
                        </button>
                        <Link href={route('pos.index')}
                            className="flex items-center justify-center rounded-2xl bg-amber-500 py-4 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition">
                            ← Back to POS
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── PRINT VIEW (80mm thermal receipt) ───────────────────────── */}
            <div className="hidden print:block" style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', padding: '4mm' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '4mm', marginBottom: '3mm' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{business?.name ?? 'BarPOS'}</div>
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
                        {payment.reference  && <div>Ref: {payment.reference}</div>}
                        {payment.ebm_number && (
                            <div style={{ marginTop: '2mm', border: '1px solid #000', padding: '1mm' }}>
                                <div style={{ fontWeight: 'bold' }}>EBM (RRA)</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{payment.ebm_number}</div>
                            </div>
                        )}
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
