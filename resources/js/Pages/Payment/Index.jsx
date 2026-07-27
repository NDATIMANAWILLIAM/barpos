import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n) + ' RWF';

// Common RWF denominations for quick cash buttons
function quickAmounts(total) {
    const steps = [500, 1000, 2000, 5000, 10000, 20000, 50000];
    return steps.filter((s) => s >= total).slice(0, 4);
}

// ── Method icons ──────────────────────────────────────────────────────────────
function MethodIcon({ icon, active }) {
    const base = `flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-white text-current' : 'bg-gray-100 text-gray-500'}`;
    if (icon === 'momo')   return <span className={base}>M</span>;
    if (icon === 'airtel') return <span className={base}>A</span>;
    if (icon === 'cash')   return <span className={base}>₣</span>;
    if (icon === 'bank')   return <span className={base}>B</span>;
    if (icon === 'card')   return <span className={base}>💳</span>;
    return null;
}

// ── MoMo / Airtel panel ───────────────────────────────────────────────────────
function MobileMoneyPanel({ method, total, reference, setReference, label }) {
    const brand = label === 'MTN MoMo'
        ? { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-400 text-yellow-900' }
        : { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    badge: 'bg-red-500 text-white' };

    return (
        <div className="space-y-4">
            {/* Merchant number card */}
            {method.number && (
                <div className={`rounded-xl border-2 ${brand.border} ${brand.bg} p-4`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${brand.text} mb-2`}>
                        Send to this number
                    </p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-2xl font-bold tracking-widest ${brand.text}`}>
                                {method.number}
                            </p>
                            {method.name && (
                                <p className={`mt-0.5 text-sm ${brand.text} opacity-70`}>{method.name}</p>
                            )}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${brand.badge}`}>
                            {label === 'MTN MoMo' ? 'MTN' : 'AIRTEL'}
                        </span>
                    </div>
                </div>
            )}

            {/* Step-by-step instructions */}
            <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Instructions for customer
                </p>
                <ol className="space-y-2">
                    {label === 'MTN MoMo' ? (
                        <>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">1</span>
                                Dial <strong className="mx-1 font-mono">*182#</strong> or open MTN MoMo app
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">2</span>
                                Select <strong className="mx-1">Transfer money → Pay merchant</strong>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">3</span>
                                Enter amount: <strong className="ml-1 text-yellow-700">{rwf(total)}</strong>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">4</span>
                                Confirm with PIN — show staff the <strong className="mx-1">confirmation SMS</strong>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">1</span>
                                Dial <strong className="mx-1 font-mono">*185#</strong> or open Airtel Money app
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">2</span>
                                Select <strong className="mx-1">Send Money → Pay Bill</strong>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">3</span>
                                Enter amount: <strong className="ml-1 text-red-700">{rwf(total)}</strong>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">4</span>
                                Confirm with PIN — show staff the <strong className="mx-1">confirmation SMS</strong>
                            </li>
                        </>
                    )}
                </ol>
            </div>

            {/* Reference input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Transaction ID from SMS <span className="text-gray-400">(required)</span>
                </label>
                <input
                    type="text"
                    className="mt-1.5 w-full rounded-xl border-gray-300 text-sm shadow-sm"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 1234567890"
                />
                <p className="mt-1 text-xs text-gray-400">
                    Find this in the confirmation SMS sent to the customer's phone.
                </p>
            </div>
        </div>
    );
}

// ── Cash panel ────────────────────────────────────────────────────────────────
function CashPanel({ total, amountGiven, setAmountGiven }) {
    const change   = Math.max(0, amountGiven - total);
    const shortfall = total - amountGiven;
    const suggestions = quickAmounts(total);

    return (
        <div className="space-y-4">
            {/* Quick denomination buttons */}
            {suggestions.length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quick amount
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => setAmountGiven(amt)}
                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                                    amountGiven === amt
                                        ? 'border-green-500 bg-green-600 text-white'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50'
                                }`}
                            >
                                {rwf(amt)}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setAmountGiven(total)}
                            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                                amountGiven === total
                                    ? 'border-green-500 bg-green-600 text-white'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50'
                            }`}
                        >
                            Exact ({rwf(total)})
                        </button>
                    </div>
                </div>
            )}

            {/* Manual amount input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Amount received (RWF)
                </label>
                <input
                    type="number"
                    min={total}
                    step="100"
                    className="mt-1.5 w-full rounded-xl border-gray-300 text-sm shadow-sm"
                    value={amountGiven || ''}
                    onChange={(e) => setAmountGiven(parseInt(e.target.value) || 0)}
                />
            </div>

            {/* Change / shortfall */}
            {amountGiven >= total && (
                <div className={`rounded-xl p-4 text-center ${change > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {change > 0 ? 'Change to return' : 'Exact amount'}
                    </p>
                    <p className={`mt-1 text-3xl font-bold ${change > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                        {rwf(change)}
                    </p>
                </div>
            )}
            {amountGiven > 0 && amountGiven < total && (
                <div className="rounded-xl bg-red-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Short by</p>
                    <p className="mt-1 text-3xl font-bold text-red-600">{rwf(shortfall)}</p>
                </div>
            )}
        </div>
    );
}

// ── Bank panel ────────────────────────────────────────────────────────────────
function BankPanel({ method, total, reference, setReference }) {
    return (
        <div className="space-y-4">
            {(method.bank_name || method.bank_account) && (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Bank account details
                    </p>
                    {method.bank_name    && <p className="text-sm text-blue-800"><span className="text-gray-500">Bank:</span> <strong>{method.bank_name}</strong></p>}
                    {method.bank_account && <p className="mt-1 text-sm text-blue-800"><span className="text-gray-500">Account:</span> <strong className="font-mono">{method.bank_account}</strong></p>}
                    {method.account_name && <p className="mt-1 text-sm text-blue-800"><span className="text-gray-500">Name:</span> <strong>{method.account_name}</strong></p>}
                    <p className="mt-2 text-sm font-bold text-blue-900">Amount: {rwf(total)}</p>
                </div>
            )}
            <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                    Customer transfers <strong>{rwf(total)}</strong> to the account above, then provides the bank reference number.
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Bank reference / transaction ID
                </label>
                <input
                    type="text"
                    className="mt-1.5 w-full rounded-xl border-gray-300 text-sm shadow-sm"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. TXN20260622001"
                />
            </div>
        </div>
    );
}

// ── Card panel ────────────────────────────────────────────────────────────────
function CardPanel({ total, reference, setReference }) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                    Swipe or tap the customer's card on the <strong>POS machine</strong> for{' '}
                    <strong>{rwf(total)}</strong>. Enter the approval code from the machine receipt below.
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Approval code (optional)
                </label>
                <input
                    type="text"
                    className="mt-1.5 w-full rounded-xl border-gray-300 text-sm shadow-sm"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 123456"
                />
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Index({ order, paymentMethods }) {
    const { business } = usePage().props;

    const defaultMethod = paymentMethods[0]?.key ?? 'cash';
    const [activeKey, setActiveKey]     = useState(defaultMethod);
    const [reference, setReference]     = useState('');
    const [ebmNumber, setEbmNumber]     = useState('');
    const [amountGiven, setAmountGiven] = useState(order.total);

    const form = useForm({
        method:       defaultMethod,
        amount_given: order.total,
        reference:    '',
        ebm_number:   '',
    });

    const activeMethod = paymentMethods.find((m) => m.key === activeKey);

    const switchMethod = (key) => {
        setActiveKey(key);
        setReference('');
        form.setData('method', key);
        if (key === 'cash') setAmountGiven(order.total);
    };

    const isReady = () => {
        if (activeKey === 'cash') return amountGiven >= order.total;
        return true; // reference optional for non-cash
    };

    const submit = (e) => {
        e.preventDefault();
        form.setData({
            method:       activeKey,
            amount_given: activeKey === 'cash' ? amountGiven : order.total,
            reference:    reference,
            ebm_number:   ebmNumber,
        });
        form.post(route('payments.store', order.id));
    };

    // Method tab colours
    const tabColor = {
        mtn_momo:    { active: 'bg-yellow-400 text-yellow-900 border-yellow-400', idle: 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50' },
        airtel_money:{ active: 'bg-red-500 text-white border-red-500',           idle: 'border-gray-200 hover:border-red-300 hover:bg-red-50' },
        cash:        { active: 'bg-green-600 text-white border-green-600',       idle: 'border-gray-200 hover:border-green-400 hover:bg-green-50' },
        bank:        { active: 'bg-blue-600 text-white border-blue-600',         idle: 'border-gray-200 hover:border-blue-400 hover:bg-blue-50' },
        card:        { active: 'bg-gray-800 text-white border-gray-800',         idle: 'border-gray-200 hover:border-gray-500 hover:bg-gray-100' },
    };

    const confirmBtnColor = {
        mtn_momo:     'bg-yellow-400 text-yellow-900 hover:bg-yellow-500',
        airtel_money: 'bg-red-500 text-white hover:bg-red-600',
        cash:         'bg-green-600 text-white hover:bg-green-700',
        bank:         'bg-blue-600 text-white hover:bg-blue-700',
        card:         'bg-gray-800 text-white hover:bg-gray-900',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('pos.index')} className="text-sm text-indigo-600 hover:underline">
                        ← POS
                    </Link>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Payment — Order <span className="font-mono text-indigo-600">#{order.order_number}</span>
                    </h2>
                </div>
            }
        >
            <Head title={`Pay #${order.order_number}`} />

            <div className="mx-auto max-w-4xl p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

                    {/* ── Left: Order summary (2/5) ── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white p-5 shadow">
                            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Order summary
                            </h3>
                            <p className="mb-4 text-xs text-gray-400">
                                {order.type.replace('_', ' ')}
                                {order.table && <> · Table <strong>{order.table}</strong></>}
                            </p>

                            <div className="space-y-2.5">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <span className="text-sm text-gray-800">{item.name_snapshot}</span>
                                            <span className="ml-2 text-xs text-gray-400">×{item.quantity}</span>
                                        </div>
                                        <span className="shrink-0 text-sm font-medium text-gray-800">
                                            {rwf(item.line_total)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 space-y-1 border-t pt-4">
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Discount</span><span>−{rwf(order.discount)}</span>
                                    </div>
                                )}
                                {order.tax > 0 && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Tax</span><span>{rwf(order.tax)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Big total */}
                            <div className="mt-4 rounded-xl bg-gray-900 px-5 py-4 text-center text-white">
                                <p className="text-xs uppercase tracking-widest text-gray-400">Total due</p>
                                <p className="mt-1 text-4xl font-bold">{rwf(order.total)}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Payment (3/5) ── */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl bg-white p-5 shadow">
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Choose payment method
                            </h3>

                            {/* Method tabs */}
                            <div className="mb-5 flex flex-wrap gap-2">
                                {paymentMethods.map((m) => {
                                    const colors = tabColor[m.key] ?? { active: 'bg-gray-800 text-white', idle: 'border-gray-200' };
                                    return (
                                        <button
                                            key={m.key}
                                            type="button"
                                            onClick={() => switchMethod(m.key)}
                                            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                                                activeKey === m.key ? colors.active : 'border-gray-200 text-gray-600 ' + colors.idle
                                            }`}
                                        >
                                            <MethodIcon icon={m.icon} active={activeKey === m.key} />
                                            {m.label}
                                            {/* "Most popular" badge on MoMo */}
                                            {m.key === 'mtn_momo' && (
                                                <span className="rounded-full bg-yellow-200 px-1.5 py-0.5 text-xs text-yellow-800">
                                                    Popular
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Method-specific panel */}
                            <form onSubmit={submit} className="space-y-5">
                                {(activeKey === 'mtn_momo' || activeKey === 'airtel_money') && (
                                    <MobileMoneyPanel
                                        method={activeMethod ?? {}}
                                        total={order.total}
                                        reference={reference}
                                        setReference={setReference}
                                        label={activeMethod?.label ?? ''}
                                    />
                                )}
                                {activeKey === 'cash' && (
                                    <CashPanel
                                        total={order.total}
                                        amountGiven={amountGiven}
                                        setAmountGiven={setAmountGiven}
                                    />
                                )}
                                {activeKey === 'bank' && (
                                    <BankPanel
                                        method={activeMethod ?? {}}
                                        total={order.total}
                                        reference={reference}
                                        setReference={setReference}
                                    />
                                )}
                                {activeKey === 'card' && (
                                    <CardPanel
                                        total={order.total}
                                        reference={reference}
                                        setReference={setReference}
                                    />
                                )}

                                {/* EBM / RRA Fiscal receipt field */}
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">🧾</span>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-blue-800 mb-1">
                                                EBM Number — Inomero y'EBM (RRA) <span className="font-normal text-blue-500">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-xl border-blue-200 bg-white text-sm font-mono shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                                value={ebmNumber}
                                                onChange={(e) => setEbmNumber(e.target.value)}
                                                placeholder="e.g. 0780000000001234"
                                            />
                                            <p className="mt-1 text-xs text-blue-500">
                                                Enter the EBM receipt number from your Electronic Billing Machine (if applicable). This will appear on the printed receipt.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {form.errors.amount_given && (
                                    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                        {form.errors.amount_given}
                                    </p>
                                )}
                                {form.errors.order && (
                                    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                        {form.errors.order}
                                    </p>
                                )}

                                {/* Confirm button */}
                                <button
                                    type="submit"
                                    disabled={form.processing || !isReady()}
                                    className={`w-full rounded-xl py-4 text-base font-bold shadow-sm transition-all disabled:opacity-40 ${
                                        confirmBtnColor[activeKey] ?? 'bg-gray-800 text-white'
                                    }`}
                                >
                                    {form.processing
                                        ? 'Processing…'
                                        : `✓ Confirm ${activeMethod?.label ?? ''} — ${rwf(order.total)}`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
