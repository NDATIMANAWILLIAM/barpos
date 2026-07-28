import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

const TYPE_LABELS = {
    bar: 'Bar', restaurant: 'Restaurant', lodge: 'Lodge',
    guest_house: 'Guest House', hotel: 'Hotel',
};

function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1">{label}</label>
            {children}
            {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button type="button" onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-ink-200'}`}>
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-1'}`} />
        </button>
    );
}

export default function Business({ business, payment }) {
    const businessForm = useForm({
        name:        business.name ?? '',
        type:        business.type ?? 'bar',
        phone:       business.phone ?? '',
        address:     business.address ?? '',
        tin:         business.tin ?? '',
        tax_rate_bp: business.tax_rate_bp ?? 0,
    });

    const paymentForm = useForm({ ...payment });

    const saveBusiness = (e) => {
        e.preventDefault();
        businessForm.patch(route('settings.business.update'), { preserveScroll: true });
    };

    const savePayment = (e) => {
        e.preventDefault();
        paymentForm.patch(route('settings.business.payment'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header="Business Settings">
            <Head title="Business Settings" />

            <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">

                {/* ── Business details ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-ink-100 p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400 mb-4">
                        Business Details — shown to customers on the menu, receipts, and booking page
                    </h2>
                    <form onSubmit={saveBusiness} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Business Name *" error={businessForm.errors.name}>
                                <input className="w-full rounded-lg border-ink-200 text-sm"
                                    value={businessForm.data.name}
                                    onChange={e => businessForm.setData('name', e.target.value)} />
                            </Field>
                            <Field label="Type *" error={businessForm.errors.type}>
                                <select className="w-full rounded-lg border-ink-200 text-sm"
                                    value={businessForm.data.type}
                                    onChange={e => businessForm.setData('type', e.target.value)}>
                                    {Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                                </select>
                            </Field>
                            <Field label="Phone Number" error={businessForm.errors.phone} hint="Shown to customers to call in">
                                <input className="w-full rounded-lg border-ink-200 text-sm"
                                    value={businessForm.data.phone}
                                    onChange={e => businessForm.setData('phone', e.target.value)} placeholder="078 000 0000" />
                            </Field>
                            <Field label="TIN (Tax ID)" error={businessForm.errors.tin} hint="Shown on receipts, optional">
                                <input className="w-full rounded-lg border-ink-200 text-sm"
                                    value={businessForm.data.tin}
                                    onChange={e => businessForm.setData('tin', e.target.value)} />
                            </Field>
                        </div>
                        <Field label="Address" error={businessForm.errors.address}>
                            <input className="w-full rounded-lg border-ink-200 text-sm"
                                value={businessForm.data.address}
                                onChange={e => businessForm.setData('address', e.target.value)} placeholder="Street, area, city" />
                        </Field>
                        <Field label="Tax Rate (%)" error={businessForm.errors.tax_rate_bp} hint="e.g. 18 for 18% VAT — enter 0 if you don't charge tax">
                            <input type="number" min="0" max="100" step="0.5" className="w-40 rounded-lg border-ink-200 text-sm"
                                value={businessForm.data.tax_rate_bp / 100}
                                onChange={e => businessForm.setData('tax_rate_bp', Math.round((parseFloat(e.target.value) || 0) * 100))} />
                        </Field>
                        <button type="submit" disabled={businessForm.processing}
                            className="rounded-xl bg-brass-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-brass-700 disabled:opacity-50">
                            {businessForm.processing ? 'Saving…' : 'Save Business Details'}
                        </button>
                    </form>
                </div>

                {/* ── Payment methods ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-ink-100 p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400 mb-4">
                        Payment Methods — shown to customers/cashiers when paying an order
                    </h2>
                    <form onSubmit={savePayment} className="space-y-5">

                        <div className="rounded-xl border border-ink-100 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-ink-800">MTN Mobile Money</p>
                                <Toggle checked={paymentForm.data.momo_enabled} onChange={v => paymentForm.setData('momo_enabled', v)} />
                            </div>
                            {paymentForm.data.momo_enabled && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <input className="rounded-lg border-ink-200 text-sm" placeholder="MoMo number"
                                        value={paymentForm.data.momo_number} onChange={e => paymentForm.setData('momo_number', e.target.value)} />
                                    <input className="rounded-lg border-ink-200 text-sm" placeholder="Registered name"
                                        value={paymentForm.data.momo_name} onChange={e => paymentForm.setData('momo_name', e.target.value)} />
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-ink-100 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-ink-800">Airtel Money</p>
                                <Toggle checked={paymentForm.data.airtel_enabled} onChange={v => paymentForm.setData('airtel_enabled', v)} />
                            </div>
                            {paymentForm.data.airtel_enabled && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <input className="rounded-lg border-ink-200 text-sm" placeholder="Airtel number"
                                        value={paymentForm.data.airtel_number} onChange={e => paymentForm.setData('airtel_number', e.target.value)} />
                                    <input className="rounded-lg border-ink-200 text-sm" placeholder="Registered name"
                                        value={paymentForm.data.airtel_name} onChange={e => paymentForm.setData('airtel_name', e.target.value)} />
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-ink-100 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-ink-800">Bank Transfer</p>
                                <Toggle checked={paymentForm.data.bank_enabled} onChange={v => paymentForm.setData('bank_enabled', v)} />
                            </div>
                            {paymentForm.data.bank_enabled && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <input className="rounded-lg border-ink-200 text-sm" placeholder="Bank name"
                                        value={paymentForm.data.bank_name} onChange={e => paymentForm.setData('bank_name', e.target.value)} />
                                    <input className="rounded-lg border-ink-200 text-sm" placeholder="Account number"
                                        value={paymentForm.data.bank_account} onChange={e => paymentForm.setData('bank_account', e.target.value)} />
                                    <input className="rounded-lg border-ink-200 text-sm" placeholder="Account name"
                                        value={paymentForm.data.bank_account_name} onChange={e => paymentForm.setData('bank_account_name', e.target.value)} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2">
                                <Toggle checked={paymentForm.data.cash_enabled} onChange={v => paymentForm.setData('cash_enabled', v)} />
                                <span className="text-sm font-semibold text-ink-700">Cash</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <Toggle checked={paymentForm.data.card_enabled} onChange={v => paymentForm.setData('card_enabled', v)} />
                                <span className="text-sm font-semibold text-ink-700">Card / POS Machine</span>
                            </label>
                        </div>

                        <button type="submit" disabled={paymentForm.processing}
                            className="rounded-xl bg-brass-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-brass-700 disabled:opacity-50">
                            {paymentForm.processing ? 'Saving…' : 'Save Payment Settings'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
