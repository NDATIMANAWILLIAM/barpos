import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n) + ' RWF';

const STATUS_COLORS = {
    open:      'bg-blue-100 text-blue-700',
    ready:     'bg-green-100 text-green-700',
    served:    'bg-gray-100 text-gray-600',
    paid:      'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
};

const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });

export default function Index({ categories, menuItems, tables, openOrders, todaysOrders }) {
    const [cart, setCart]         = useState([]);
    const [type, setType]         = useState('dine_in');
    const [tableId, setTableId]   = useState('');
    const [notes, setNotes]       = useState('');
    const [activeCat, setActiveCat] = useState('all');
    const [saving, setSaving]     = useState(false);
    const [ordersTab, setOrdersTab] = useState('open'); // 'open' | 'history'

    // Custom charge form (room, accommodation, service fee, etc.)
    const [showCustom, setShowCustom]         = useState(false);
    const [customName, setCustomName]         = useState('');
    const [customPrice, setCustomPrice]       = useState('');
    const [customQty, setCustomQty]           = useState(1);
    const [customNights, setCustomNights]     = useState(1);
    const [customMode, setCustomMode]         = useState('room'); // 'room' | 'other'

    // Poll for order status changes (e.g. kitchen marking items ready) — a
    // waiter has no other way to know an order is ready without this, since
    // nothing pushes that update to them otherwise.
    useEffect(() => {
        const t = setInterval(() => {
            router.reload({ only: ['openOrders'], preserveScroll: true, preserveState: true });
        }, 20000);
        return () => clearInterval(t);
    }, []);

    // Category tabs
    const catList = [
        { id: 'all', name: 'All' },
        ...categories.map((c) => ({ id: String(c.id), name: c.name })),
    ];

    const visibleItems =
        activeCat === 'all'
            ? menuItems
            : menuItems.filter((i) => String(i.category_id) === activeCat);

    // Group visible items by category name
    const groups = {};
    visibleItems.forEach((i) => {
        const key = i.category?.name ?? 'Other';
        (groups[key] = groups[key] || []).push(i);
    });

    // Cart helpers
    const addItem = (item) => {
        setCart((prev) => {
            const found = prev.find((c) => c.menu_item_id === item.id);
            if (found) {
                return prev.map((c) =>
                    c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [
                ...prev,
                { _key: item.id, menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 },
            ];
        });
    };

    const changeQty = (key, delta) => {
        setCart((prev) =>
            prev
                .map((c) => (c._key === key ? { ...c, quantity: c.quantity + delta } : c))
                .filter((c) => c.quantity > 0)
        );
    };

    const addCustomCharge = () => {
        const price = parseInt(customPrice) || 0;
        if (!customName.trim() || price <= 0) return;
        const qty   = customMode === 'room' ? customNights : customQty;
        const label = customMode === 'room'
            ? `${customName} (${customNights} night${customNights > 1 ? 's' : ''})`
            : customName;
        const key   = `custom_${Date.now()}`;
        setCart(prev => [
            ...prev,
            { _key: key, menu_item_id: null, custom_name: label, name: label, price, quantity: qty },
        ]);
        setCustomName(''); setCustomPrice(''); setCustomQty(1); setCustomNights(1);
        setShowCustom(false);
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const saveOrder = () => {
        if (cart.length === 0) return;
        setSaving(true);
        router.post(
            route('pos.orders.store'),
            {
                type,
                table_id: tableId || null,
                notes: notes || null,
                items: cart.map((c) => c.menu_item_id
                    ? { menu_item_id: c.menu_item_id, quantity: c.quantity }
                    : { menu_item_id: null, custom_name: c.custom_name, custom_price: c.price, quantity: c.quantity }
                ),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCart([]);
                    setTableId('');
                    setNotes('');
                },
                onFinish: () => setSaving(false),
            }
        );
    };

    const cancelOrder = (id) => {
        if (!confirm('Cancel this order?')) return;
        router.patch(route('pos.orders.cancel', id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Point of Sale</h2>}>
            <Head title="POS" />

            <div className="mx-auto max-w-7xl p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* ── Left: menu browser ── */}
                    <div className="space-y-4 lg:col-span-2">

                        {/* Category filter tabs */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {catList.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveCat(c.id)}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                            activeCat === c.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-600 shadow hover:bg-indigo-50'
                                        }`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Item grid */}
                        {Object.keys(groups).length === 0 ? (
                            <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500 shadow">
                                No available items.{' '}
                                <Link href={route('menu.index')} className="text-indigo-600 hover:underline">
                                    Add some on the Menu page.
                                </Link>
                            </div>
                        ) : (
                            Object.entries(groups).map(([cat, list]) => (
                                <div key={cat} className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {cat}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {list.map((item) => {
                                            const inCart = cart.find(
                                                (c) => c.menu_item_id === item.id
                                            );
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => addItem(item)}
                                                    className={`relative rounded-lg border p-3 text-left transition-colors ${
                                                        inCart
                                                            ? 'border-indigo-400 bg-indigo-50'
                                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                                    }`}
                                                >
                                                    {inCart && (
                                                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                                                            {inCart.quantity}
                                                        </span>
                                                    )}
                                                    {item.is_special && (
                                                        <span className="mb-1 inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                                                            Special
                                                        </span>
                                                    )}
                                                    <div className="text-sm font-medium text-gray-800">
                                                        {item.name}
                                                    </div>
                                                    {item.description && (
                                                        <div className="mt-0.5 text-xs text-gray-400 line-clamp-1">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                    <div className="mt-1 text-xs font-semibold text-indigo-600">
                                                        {rwf(item.price)}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── Right: order panel ── */}
                    <div className="space-y-4">

                        {/* Current order */}
                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Current order</h3>
                                {cartCount > 0 && (
                                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                                        {cartCount} item{cartCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Order type + table */}
                            <div className="mb-3 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-500">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="mt-1 w-full rounded border-gray-300 text-sm"
                                    >
                                        <option value="dine_in">Dine in</option>
                                        <option value="takeaway">Takeaway</option>
                                        <option value="room_service">Room service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Table</label>
                                    <select
                                        value={tableId}
                                        onChange={(e) => setTableId(e.target.value)}
                                        className="mt-1 w-full rounded border-gray-300 text-sm"
                                    >
                                        <option value="">No table</option>
                                        {tables.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Cart items */}
                            {cart.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">
                                    Tap items on the left to add them.
                                </p>
                            ) : (
                                <><div className="space-y-2">
                                    {cart.map((c) => (
                                        <div
                                            key={c._key}
                                            className={`flex items-center gap-2 text-sm rounded-lg p-1.5 ${!c.menu_item_id ? 'bg-purple-50 ring-1 ring-purple-100' : ''}`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="truncate font-medium text-gray-800 flex items-center gap-1">
                                                    {!c.menu_item_id && <span className="text-xs">🛏</span>}
                                                    {c.name}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {rwf(c.price)} {c.menu_item_id ? 'each' : '/ unit'}
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    onClick={() => changeQty(c._key, -1)}
                                                    className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    −
                                                </button>
                                                <span className="w-5 text-center text-xs font-medium">
                                                    {c.quantity}
                                                </span>
                                                <button
                                                    onClick={() => changeQty(c._key, 1)}
                                                    className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="w-20 text-right text-xs font-medium text-gray-800">
                                                {rwf(c.price * c.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Custom / Room charge form */}
                                {showCustom && (
                                    <div className="mt-3 rounded-xl bg-purple-50 p-3 ring-1 ring-purple-200 space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-purple-800">Add Custom Charge</span>
                                            <div className="flex gap-1 ml-auto">
                                                {[['room','🛏 Room'],['other','+ Other']].map(([m, l]) => (
                                                    <button key={m} type="button" onClick={() => setCustomMode(m)}
                                                        className={`rounded-full px-2 py-0.5 text-xs font-bold transition ${customMode === m ? 'bg-purple-600 text-white' : 'bg-white text-purple-500 ring-1 ring-purple-200'}`}>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <input
                                            className="w-full rounded-lg border-gray-300 text-sm"
                                            value={customName}
                                            onChange={e => setCustomName(e.target.value)}
                                            placeholder={customMode === 'room' ? 'Room type (e.g. Single Room)' : 'Charge description'}
                                            autoFocus
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-0.5">
                                                    {customMode === 'room' ? 'Price per night (RWF)' : 'Unit price (RWF)'}
                                                </label>
                                                <input type="number" min="0" step="500"
                                                    className="w-full rounded-lg border-gray-300 text-sm"
                                                    value={customPrice}
                                                    onChange={e => setCustomPrice(e.target.value)}
                                                    placeholder="e.g. 25000" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-0.5">
                                                    {customMode === 'room' ? 'Number of nights' : 'Quantity'}
                                                </label>
                                                <input type="number" min="1"
                                                    className="w-full rounded-lg border-gray-300 text-sm"
                                                    value={customMode === 'room' ? customNights : customQty}
                                                    onChange={e => customMode === 'room'
                                                        ? setCustomNights(parseInt(e.target.value) || 1)
                                                        : setCustomQty(parseInt(e.target.value) || 1)
                                                    } />
                                            </div>
                                        </div>
                                        {customName && customPrice && (
                                            <p className="text-xs text-purple-600 font-semibold">
                                                Total: {rwf((parseInt(customPrice) || 0) * (customMode === 'room' ? customNights : customQty))}
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <button type="button" onClick={addCustomCharge}
                                                className="flex-1 rounded-lg bg-purple-600 py-1.5 text-xs font-bold text-white hover:bg-purple-700">
                                                + Add to order
                                            </button>
                                            <button type="button" onClick={() => setShowCustom(false)}
                                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-white">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </>
                            )}

                            {/* Add custom / room charge button */}
                            {!showCustom && (
                                <button
                                    type="button"
                                    onClick={() => setShowCustom(true)}
                                    className="mt-2 w-full rounded-lg border-2 border-dashed border-purple-200 py-2 text-xs font-semibold text-purple-500 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50 transition"
                                >
                                    🛏 Add Room / Custom Charge
                                </button>
                            )}

                            {/* Notes */}
                            {cart.length > 0 && (
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-500">
                                        Order notes (optional)
                                    </label>
                                    <input
                                        className="mt-1 w-full rounded border-gray-300 text-sm"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. no onions on table 2"
                                    />
                                </div>
                            )}

                            {/* Total + save */}
                            <div className="mt-4 border-t pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700">Total</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {rwf(cartTotal)}
                                    </span>
                                </div>
                                <button
                                    onClick={saveOrder}
                                    disabled={cart.length === 0 || saving}
                                    className="mt-3 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving…' : 'Send order to kitchen'}
                                </button>
                                {cart.length > 0 && (
                                    <button
                                        onClick={() => { setCart([]); setNotes(''); }}
                                        className="mt-2 w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Open orders / history */}
                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="mb-3 flex items-center gap-2">
                                <button
                                    onClick={() => setOrdersTab('open')}
                                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${ordersTab === 'open' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Open ({openOrders.length})
                                </button>
                                <button
                                    onClick={() => setOrdersTab('history')}
                                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${ordersTab === 'history' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Today's History ({todaysOrders.length})
                                </button>
                            </div>

                            {ordersTab === 'history' ? (
                                todaysOrders.length === 0 ? (
                                    <p className="text-sm text-gray-400">No orders yet today.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {todaysOrders.map((o) => (
                                            <div key={o.id} className="rounded-lg border border-gray-100 p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-800">#{o.order_number}</span>
                                                            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                {o.status}
                                                            </span>
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-gray-400">
                                                            {fmtTime(o.created_at)}
                                                            {o.table && ` · ${o.table.label}`}
                                                            {' · '}
                                                            {o.waiter?.name ?? 'Client (self-order)'}
                                                            {' · '}
                                                            {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right text-sm font-semibold text-gray-800">
                                                        {rwf(o.total)}
                                                    </div>
                                                </div>
                                                {o.status !== 'paid' && o.status !== 'cancelled' && (
                                                    <div className="mt-2">
                                                        <Link
                                                            href={route('payments.show', o.id)}
                                                            className="inline-block rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                                                        >
                                                            Pay
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : openOrders.length === 0 ? (
                                <p className="text-sm text-gray-400">No open orders.</p>
                            ) : (
                                <div className="space-y-2">
                                    {openOrders.map((o) => {
                                        const readyCount = o.items.filter((i) => i.status === 'ready' || i.status === 'served').length;
                                        const isReady = o.status === 'ready';
                                        return (
                                            <div
                                                key={o.id}
                                                className={`rounded-lg border p-3 ${
                                                    isReady ? 'border-green-300 bg-green-50 ring-1 ring-green-200' : 'border-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-800">
                                                                #{o.order_number}
                                                            </span>
                                                            <span
                                                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                                                    STATUS_COLORS[o.status] ??
                                                                    'bg-gray-100 text-gray-600'
                                                                }`}
                                                            >
                                                                {isReady ? 'Ready — bring to table' : o.status}
                                                            </span>
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-gray-400">
                                                            {o.type.replace('_', ' ')}
                                                            {o.table && ` · ${o.table.label}`}
                                                            {' · '}
                                                            {readyCount}/{o.items.length} item{o.items.length !== 1 ? 's' : ''} ready
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <div className="text-sm font-semibold text-gray-800">
                                                            {rwf(o.total)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex gap-2">
                                                    <Link
                                                        href={route('payments.show', o.id)}
                                                        className="flex-1 rounded bg-green-600 py-1 text-center text-xs font-medium text-white hover:bg-green-700"
                                                    >
                                                        Pay
                                                    </Link>
                                                    <button
                                                        onClick={() => cancelOrder(o.id)}
                                                        className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
