import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_STYLES = {
    free:     'bg-green-100 text-green-700',
    occupied: 'bg-red-100 text-red-600',
    reserved: 'bg-blue-100 text-blue-700',
    cleaning: 'bg-yellow-100 text-yellow-700',
};

const ROLE_LABELS = { owner: 'Super Manager', manager: 'Manager', waiter: 'Servant' };

// ── QR Modal ─────────────────────────────────────────────────────────────────
function QRModal({ table, appUrl, onClose }) {
    const url     = `${appUrl}/m/${table.qr_token}`;
    const svgRef  = useRef(null);

    const printQR = () => {
        const svgHtml = svgRef.current?.innerHTML ?? '';
        const win = window.open('', '_blank', 'width=420,height=560');
        win.document.write(`<html><head><title>QR – ${table.label}</title><style>
            body{font-family:sans-serif;text-align:center;padding:36px;background:#fff;}
            h1{font-size:32px;margin:0 0 4px;}
            .sub{color:#777;font-size:14px;margin:0 0 24px;}
            .qr-wrap{display:inline-block;padding:16px;background:#fff;border:2px solid #f59e0b;border-radius:16px;}
            .hint{margin-top:20px;font-size:15px;color:#333;}
            small{display:block;margin-top:12px;color:#bbb;font-size:11px;word-break:break-all;}
        </style></head><body>
            <h1>Table ${table.label}</h1>
            <p class="sub">${table.zone ? table.zone + ' · ' : ''}${table.capacity} seats</p>
            <div class="qr-wrap">${svgHtml}</div>
            <p class="hint">📷 Scan to see our menu & order</p>
            <small>${url}</small>
        </body></html>`);
        win.document.close();
        win.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose}
                    className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm">
                    ✕
                </button>

                <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">QR Code — Scan to Order</p>
                    <h2 className="text-2xl font-extrabold text-gray-900">Table {table.label}</h2>
                    {table.zone && <p className="text-xs text-gray-400 mt-0.5">{table.zone} · {table.capacity} seats</p>}

                    <div ref={svgRef} className="mt-5 flex justify-center">
                        <QRCodeSVG value={url} size={200} level="H"
                            className="rounded-xl shadow-md ring-4 ring-amber-100" />
                    </div>

                    <p className="mt-3 text-xs text-amber-600 font-semibold">
                        📷 Customer scans this with phone camera → menu opens
                    </p>
                    <p className="mt-1 text-xs text-gray-300 font-mono break-all">{url}</p>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => navigator.clipboard?.writeText(url).then(() => alert('Link copied to clipboard!')).catch(() => prompt('Copy this link:', url))}
                            className="rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                            📋 Copy Link
                        </button>
                        <button onClick={printQR}
                            className="rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition">
                            🖨 Print QR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Table Card ───────────────────────────────────────────────────────────────
function TableCard({ t, appUrl, servants, onShowQR }) {
    const [editing, setEditing] = useState(false);

    const form = useForm({
        label:      t.label,
        zone:       t.zone ?? '',
        capacity:   t.capacity,
        status:     t.status,
        servant_id: t.servant_id ?? '',
    });

    const save = (e) => {
        e.preventDefault();
        form.patch(route('tables.update', t.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const regenQr  = () => router.patch(route('tables.qr', t.id), {}, { preserveScroll: true });
    const deleteIt = () => {
        if (!confirm(`Delete table ${t.label}? This cannot be undone.`)) return;
        router.delete(route('tables.destroy', t.id), { preserveScroll: true });
    };

    const servant = servants.find(s => s.id === (t.servant_id ?? t.servant?.id));

    if (editing) {
        return (
            <div className="rounded-2xl bg-indigo-50 p-5 ring-2 ring-indigo-300">
                <form onSubmit={save} className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Editing Table {t.label}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Label *</label>
                            <input className="w-full rounded-lg border-gray-300 text-sm"
                                value={form.data.label} onChange={e => form.setData('label', e.target.value)} />
                            {form.errors.label && <p className="text-xs text-red-500 mt-1">{form.errors.label}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Zone</label>
                            <input className="w-full rounded-lg border-gray-300 text-sm" placeholder="Indoor, Terrace…"
                                value={form.data.zone} onChange={e => form.setData('zone', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Seats</label>
                            <input type="number" min="1" className="w-full rounded-lg border-gray-300 text-sm"
                                value={form.data.capacity} onChange={e => form.setData('capacity', parseInt(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <select className="w-full rounded-lg border-gray-300 text-sm"
                                value={form.data.status} onChange={e => form.setData('status', e.target.value)}>
                                <option value="free">Free</option>
                                <option value="occupied">Occupied</option>
                                <option value="reserved">Reserved</option>
                                <option value="cleaning">Cleaning</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                            👤 Assigned Servant / Waiter
                        </label>
                        <select className="w-full rounded-xl border-gray-300 text-sm"
                            value={form.data.servant_id}
                            onChange={e => form.setData('servant_id', e.target.value || '')}>
                            <option value="">— No servant assigned —</option>
                            {servants.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({ROLE_LABELS[s.role] ?? s.role}){s.phone ? ' · ' + s.phone : ''}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-400">
                            This servant's name and phone will show on the customer menu after they order.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={form.processing}
                            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50 shadow-sm">
                            {form.processing ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setEditing(false)}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-white">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:ring-indigo-100 transition">
            {/* Table badge */}
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-800 text-white shadow-md">
                <span className="text-[10px] opacity-50 leading-none uppercase tracking-wider">Table</span>
                <span className="text-lg font-extrabold leading-tight">{t.label}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {t.status}
                    </span>
                    <span className="text-xs text-gray-400">{t.capacity} seats</span>
                    {t.zone && <span className="text-xs text-gray-400">· {t.zone}</span>}
                    {t.upcoming_reservations > 0 && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            {t.upcoming_reservations} booking{t.upcoming_reservations !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Servant */}
                {servant ? (
                    <div className="mb-1.5 flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-extrabold text-purple-700">
                            {servant.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{servant.name}</span>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600">
                            {ROLE_LABELS[servant.role] ?? servant.role}
                        </span>
                        {servant.phone && (
                            <a href={`tel:${servant.phone}`} className="text-xs text-gray-400 hover:text-indigo-600 hover:underline">
                                📞 {servant.phone}
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="mb-1.5 text-xs text-gray-300 italic">No servant assigned — click Edit to assign one</p>
                )}

                {t.qr_token && (
                    <p className="font-mono text-xs text-gray-200 truncate">{appUrl}/m/{t.qr_token}</p>
                )}
            </div>

            {/* Actions */}
            <div className="shrink-0 flex flex-col gap-1.5 items-end">
                <button onClick={() => onShowQR(t)}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 transition shadow-sm">
                    📱 QR Code
                </button>
                <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                    ✏️ Edit
                </button>
                <button onClick={regenQr}
                    className="text-xs text-gray-300 hover:text-indigo-500 transition px-1 py-0.5">
                    ↻ New QR
                </button>
                <button onClick={deleteIt}
                    className="text-xs text-red-300 hover:text-red-500 transition px-1 py-0.5">
                    Delete
                </button>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Index({ tables, servants, appUrl }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [qrTable, setQrTable]         = useState(null);

    const addForm = useForm({ label: '', zone: '', capacity: 4, servant_id: '' });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('tables.store'), {
            preserveScroll: true,
            onSuccess: () => { addForm.reset(); setShowAddForm(false); },
        });
    };

    const zones = [...new Set(tables.map(t => t.zone || 'Unassigned'))];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Tables & QR Codes</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {tables.length} table{tables.length !== 1 ? 's' : ''} · Click "📱 QR Code" on any table to print
                        </p>
                    </div>
                    <button onClick={() => setShowAddForm(!showAddForm)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-sm">
                        {showAddForm ? '✕ Cancel' : '+ Add Table'}
                    </button>
                </div>
            }
        >
            <Head title="Tables & QR Codes" />

            {qrTable && <QRModal table={qrTable} appUrl={appUrl} onClose={() => setQrTable(null)} />}

            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">

                {/* Info banner */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">📱</span>
                        <div className="text-sm">
                            <p className="font-bold text-amber-800">How QR ordering works</p>
                            <p className="mt-1 text-amber-700">
                                Each table has a unique QR code. Customer scans with phone camera → menu opens instantly (no app needed) → they browse and order.
                                Click <strong>"📱 QR Code"</strong> on any table below to view and print the QR card.
                            </p>
                            <p className="mt-1.5 text-amber-600 text-xs">
                                💡 Assign a <strong>servant</strong> to each table — their name and phone appear to customers after placing an order.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add table form */}
                {showAddForm && (
                    <div className="rounded-2xl bg-white p-6 shadow ring-2 ring-indigo-300">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">New Table</h3>
                        <form onSubmit={submitAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Label *</label>
                                    <input autoFocus className="w-full rounded-xl border-gray-300 text-sm" placeholder="T7, Bar-1, VIP…"
                                        value={addForm.data.label} onChange={e => addForm.setData('label', e.target.value)} />
                                    {addForm.errors.label && <p className="text-xs text-red-500 mt-1">{addForm.errors.label}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Zone</label>
                                    <input className="w-full rounded-xl border-gray-300 text-sm" placeholder="Indoor, Terrace…"
                                        value={addForm.data.zone} onChange={e => addForm.setData('zone', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Seats</label>
                                    <input type="number" min="1" className="w-full rounded-xl border-gray-300 text-sm"
                                        value={addForm.data.capacity} onChange={e => addForm.setData('capacity', parseInt(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Servant</label>
                                    <select className="w-full rounded-xl border-gray-300 text-sm"
                                        value={addForm.data.servant_id} onChange={e => addForm.setData('servant_id', e.target.value || '')}>
                                        <option value="">— None —</option>
                                        {servants.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={addForm.processing}
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 shadow-sm hover:bg-indigo-700 transition">
                                {addForm.processing ? 'Adding…' : 'Add Table'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Staff quick reference */}
                {servants.length > 0 && (
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">👥 Available Staff to Assign</p>
                        <div className="flex flex-wrap gap-2">
                            {servants.map(s => (
                                <div key={s.id} className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 ring-1 ring-purple-100">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-extrabold text-purple-700">
                                        {s.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 leading-none">{s.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{ROLE_LABELS[s.role] ?? s.role}{s.phone ? ' · ' + s.phone : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table list by zone */}
                {zones.map(zone => {
                    const zoneTables = tables.filter(t => (t.zone || 'Unassigned') === zone);
                    return (
                        <div key={zone}>
                            <div className="mb-3 flex items-center gap-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{zone}</p>
                                <div className="h-px flex-1 bg-gray-100" />
                                <span className="text-xs text-gray-300">{zoneTables.length} table{zoneTables.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="space-y-3">
                                {zoneTables.map(t => (
                                    <TableCard key={t.id} t={t} appUrl={appUrl} servants={servants} onShowQR={setQrTable} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {tables.length === 0 && (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
                        <p className="text-5xl mb-3">🪑</p>
                        <p className="font-bold text-gray-600">No tables yet</p>
                        <p className="text-sm text-gray-400 mt-1">Click "+ Add Table" to create your first table and get a QR code for customers to scan.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
