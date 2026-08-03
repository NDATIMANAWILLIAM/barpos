import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Head } from '@inertiajs/react';

const rwf = (n) => 'RWF ' + new Intl.NumberFormat('en-RW').format(n ?? 0);

// ── Category metadata ────────────────────────────────────────────────────────
// A monogram + colour block reads as a designed system rather than clip-art
// icons — one letter, drawn from the category's own name.
const CAT_COLOURS = [
    'bg-brass-50 text-brass-700', 'bg-orange-50 text-orange-700',
    'bg-green-50 text-green-700', 'bg-blue-50 text-blue-700',
    'bg-purple-50 text-purple-700', 'bg-rose-50 text-rose-700',
    'bg-cyan-50 text-cyan-700', 'bg-teal-50 text-teal-700',
];
const catMonogram = (name) => (name ?? '?').trim().charAt(0).toUpperCase();

// ── Icon set (inline SVG — no emoji) ────────────────────────────────────────
const Icon = {
    search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}><circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M21 21l-4.3-4.3"/></svg>,
    cart:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.2a2 2 0 002-1.8L20 8H6"/><circle cx="9" cy="21" r="1.4"/><circle cx="17" cy="21" r="1.4"/></svg>,
    check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    close:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
    seat:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="3" y="8" width="18" height="2" rx="1"/><path strokeLinecap="round" d="M5 10v8M19 10v8M8 10v3m8-3v3"/></svg>,
    pin:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>,
    phone:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5c0-.6.4-1 1-1h2.6c.5 0 .9.3 1 .8l.7 3a1 1 0 01-.3 1L7.4 10.4a12 12 0 006.2 6.2l1.6-1.6a1 1 0 011-.3l3 .7c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1C10.5 20 4 13.5 4 6V5z"/></svg>,
    scan:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M20 8V6a2 2 0 00-2-2h-2M4 16v2a2 2 0 002 2h2M20 16v2a2 2 0 01-2 2h-2M4 12h16"/></svg>,
    calendar:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}><rect x="3.5" y="5" width="17" height="16" rx="2"/><path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17"/></svg>,
    empty:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8l8-4 8 4-8 4-8-4zm0 0v8l8 4m0-12v12m8-12v8l-8 4"/></svg>,
    star:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2.5l2.7 6.4 6.9.6-5.2 4.6 1.6 6.8-6-3.6-6 3.6 1.6-6.8-5.2-4.6 6.9-.6L12 2.5z"/></svg>,
};

const cartTotal = (cart, itemMap) =>
    Object.entries(cart).reduce((s, [id, qty]) => s + (itemMap[id]?.price ?? 0) * qty, 0);
const cartCount = (cart) => Object.values(cart).reduce((s, q) => s + q, 0);

// ── Qty Stepper ──────────────────────────────────────────────────────────────
const QtyBtn = memo(({ qty, onAdd, onRemove, compact }) => {
    if (qty === 0) return (
        <button onClick={onAdd}
            className={`flex items-center gap-1 rounded-full bg-brass-500 font-bold text-white shadow transition active:scale-95 hover:bg-brass-600 ${compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'}`}>
            <span className="leading-none text-base">+</span> Add
        </button>
    );
    return (
        <div className={`flex items-center gap-2 rounded-full bg-white ring-2 ring-brass-400 shadow-sm ${compact ? 'px-2 py-0.5' : 'px-3 py-1.5'}`}>
            <button onClick={onRemove} className={`flex items-center justify-center rounded-full bg-brass-50 font-bold text-brass-600 hover:bg-red-50 hover:text-red-500 transition ${compact ? 'h-5 w-5 text-sm' : 'h-7 w-7 text-lg'}`}>−</button>
            <span className={`font-extrabold text-brass-700 text-center ${compact ? 'w-4 text-xs' : 'w-5 text-sm'}`}>{qty}</span>
            <button onClick={onAdd} className={`flex items-center justify-center rounded-full bg-brass-500 font-bold text-white hover:bg-brass-600 transition ${compact ? 'h-5 w-5 text-sm' : 'h-7 w-7 text-lg'}`}>+</button>
        </div>
    );
});

// ── Item Card ────────────────────────────────────────────────────────────────
const ItemCard = memo(({ item, qty, colourClass, onAdd, onRemove }) => (
    <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100 transition hover:shadow-md hover:ring-brass-200 group">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-serif text-lg font-semibold shadow-sm ${colourClass}`}>
            {catMonogram(item.category_name)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-start gap-1.5">
                <span className="text-sm font-semibold text-ink-900 leading-snug">{item.name}</span>
                {item.is_special && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brass-100 px-2 py-0.5 text-xs font-bold text-brass-700">
                        <Icon.star className="h-3 w-3" /> Special
                    </span>
                )}
            </div>
            {item.description && (
                <p className="mt-0.5 text-xs text-ink-400 line-clamp-2 leading-snug">{item.description}</p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-base font-extrabold text-brass-600">{rwf(item.price)}</span>
                <QtyBtn qty={qty} onAdd={onAdd} onRemove={onRemove} />
            </div>
        </div>
    </div>
));

// ── Cart Item Row (for sidebar + drawer) ────────────────────────────────────
const CartRow = memo(({ item, qty, onAdd, onRemove }) => (
    <div className="flex items-center gap-3 py-2.5">
        <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{item.name}</p>
            <p className="text-xs text-ink-400">{rwf(item.price)} each</p>
        </div>
        <QtyBtn qty={qty} onAdd={onAdd} onRemove={onRemove} compact />
        <span className="w-20 shrink-0 text-right text-sm font-bold text-ink-800">{rwf(item.price * qty)}</span>
    </div>
));

// ── Checkout Form ────────────────────────────────────────────────────────────
function CheckoutForm({ items, total, table, onBack, onDone }) {
    const [name, setName]   = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const submit = async () => {
        if (!name.trim()) { setError('Please enter your name.'); return; }
        if (!phone.trim()) { setError('Please enter your phone number.'); return; }
        setError(''); setLoading(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
            const res = await fetch('/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                body: JSON.stringify({
                    customer_name: name.trim(), phone: phone.trim(),
                    notes: notes.trim() || null, table_token: table?.token ?? null,
                    items: items.map(({ item, qty }) => ({ id: item.id, qty })),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.errors ? Object.values(data.errors).flat().join(' ') : (data.message ?? 'Error. Try again.'));
                setLoading(false); return;
            }
            onDone(data);
        } catch { setError('Network error. Please try again.'); }
        setLoading(false);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">Your name *</label>
                <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jean Pierre"
                    className="w-full rounded-xl border-ink-200 px-3 py-2.5 text-sm shadow-sm focus:border-brass-400 focus:ring-brass-400" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">Phone number *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07X XXX XXXX"
                    className="w-full rounded-xl border-ink-200 px-3 py-2.5 text-sm shadow-sm focus:border-brass-400 focus:ring-brass-400" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">Special requests</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="No onions, extra sauce…"
                    className="w-full rounded-xl border-ink-200 px-3 py-2.5 text-sm shadow-sm focus:border-brass-400 focus:ring-brass-400" />
            </div>
            {/* Order summary */}
            <div className="rounded-xl bg-ink-50 px-3 py-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Summary</p>
                <div className="space-y-1.5">
                    {items.map(({ item, qty }) => (
                        <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-ink-600">{qty} × {item.name}</span>
                            <span className="font-semibold text-ink-800">{rwf(item.price * qty)}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 text-sm font-extrabold text-ink-900">
                    <span>Total</span><span className="text-brass-600">{rwf(total)}</span>
                </div>
            </div>
            {error && <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 ring-1 ring-red-200">{error}</div>}
            <div className="flex gap-2">
                {onBack && (
                    <button onClick={onBack} className="rounded-xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-600 hover:bg-ink-50 flex-none">← Back</button>
                )}
                <button onClick={submit} disabled={loading}
                    className="flex-1 rounded-xl bg-brass-500 py-3 text-sm font-extrabold text-white shadow-md hover:bg-brass-600 disabled:opacity-50 transition">
                    {loading ? 'Placing…' : `Place Order · ${rwf(total)}`}
                </button>
            </div>
            <p className="text-center text-xs text-ink-400">Pay when done — cash, MoMo, Airtel or card</p>
        </div>
    );
}

// ── Done Screen ──────────────────────────────────────────────────────────────
function DoneScreen({ orderNum, total, table, onClose }) {
    return (
        <div className="flex flex-col items-center gap-4 px-2 py-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-inner">
                <Icon.check className="h-9 w-9 text-green-600" />
            </div>
            <div>
                <h3 className="text-xl font-extrabold text-ink-900">Order Sent!</h3>
                <p className="text-sm text-ink-500">Your kitchen is on it</p>
            </div>
            <div className="w-full rounded-2xl bg-brass-50 ring-2 ring-brass-300 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-brass-500">Order Number</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-brass-700">{orderNum}</p>
                <p className="mt-1 text-sm font-semibold text-brass-600">{rwf(total)}</p>
                {table && <p className="mt-1 text-xs text-brass-500">Table {table.label}</p>}
            </div>
            <div className="w-full space-y-2 rounded-2xl bg-ink-50 p-4 text-left">
                {['Kitchen received your order', 'It will be prepared shortly', 'Staff brings it to your table', 'Pay at the end — ask any staff'].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brass-500 text-xs font-bold text-white">{i + 1}</span>
                        <span className="text-sm text-ink-600">{s}</span>
                    </div>
                ))}
            </div>
            <button onClick={onClose} className="w-full rounded-2xl bg-ink-900 py-4 text-sm font-bold text-white shadow-lg hover:bg-ink-800 transition">
                Continue browsing
            </button>
        </div>
    );
}

// ── Mobile Cart Drawer ───────────────────────────────────────────────────────
function CartDrawer({ cart, setCart, itemMap, table, onClose }) {
    const [step, setStep]     = useState('review');
    const [orderData, setOrderData] = useState(null);

    const items = useMemo(() =>
        Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ item: itemMap[id], qty })).filter(x => x.item),
        [cart, itemMap]
    );
    const total = useMemo(() => cartTotal(cart, itemMap), [cart, itemMap]);

    const adjust = useCallback((id, delta) => setCart(prev => {
        const n = { ...prev, [id]: (prev[id] ?? 0) + delta };
        if (n[id] <= 0) delete n[id];
        return n;
    }), [setCart]);

    const handleDone = (data) => { setOrderData(data); setCart({}); setStep('done'); };

    return (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step !== 'done' ? onClose : undefined} />
            <div className="relative flex w-full flex-col bg-white shadow-2xl" style={{ borderRadius: '24px 24px 0 0', maxHeight: '93vh' }}>
                <div className="flex justify-center pt-3 pb-1"><div className="h-1 w-12 rounded-full bg-ink-200" /></div>

                {step === 'done' && (
                    <div className="overflow-y-auto px-5 py-4">
                        <DoneScreen orderNum={orderData?.order_number} total={orderData?.total} table={table} onClose={onClose} />
                    </div>
                )}

                {step === 'checkout' && (
                    <>
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h2 className="font-bold text-ink-900">Your Details</h2>
                            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                                <Icon.close className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <CheckoutForm items={items} total={total} table={table} onBack={() => setStep('review')} onDone={handleDone} />
                        </div>
                    </>
                )}

                {step === 'review' && (
                    <>
                        <div className="flex items-center justify-between px-5 py-3 border-b">
                            <h2 className="text-lg font-extrabold text-ink-900">
                                Cart
                                {items.length > 0 && (
                                    <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brass-500 text-xs font-bold text-white">{cartCount(cart)}</span>
                                )}
                            </h2>
                            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                                <Icon.close className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 divide-y divide-ink-50">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-12">
                                    <Icon.cart className="h-12 w-12 text-ink-200" />
                                    <p className="text-ink-400">Your cart is empty</p>
                                </div>
                            ) : items.map(({ item, qty }) => (
                                <CartRow key={item.id} item={item} qty={qty} onAdd={() => adjust(item.id, 1)} onRemove={() => adjust(item.id, -1)} />
                            ))}
                        </div>
                        {items.length > 0 && (
                            <div className="border-t px-5 py-4 space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-brass-50 px-4 py-3">
                                    <span className="font-bold text-ink-700">Total</span>
                                    <span className="text-lg font-extrabold text-brass-600">{rwf(total)}</span>
                                </div>
                                <button onClick={() => setStep('checkout')}
                                    className="w-full rounded-2xl bg-ink-900 py-4 text-base font-extrabold text-white shadow-lg hover:bg-ink-800 transition">
                                    Checkout →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ── Desktop Cart Panel ───────────────────────────────────────────────────────
function DesktopCart({ cart, setCart, itemMap, table }) {
    const [step, setStep]     = useState('cart');
    const [orderData, setOrderData] = useState(null);

    const items = useMemo(() =>
        Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ item: itemMap[id], qty })).filter(x => x.item),
        [cart, itemMap]
    );
    const total = useMemo(() => cartTotal(cart, itemMap), [cart, itemMap]);
    const count = cartCount(cart);

    const adjust = useCallback((id, delta) => setCart(prev => {
        const n = { ...prev, [id]: (prev[id] ?? 0) + delta };
        if (n[id] <= 0) delete n[id];
        return n;
    }), [setCart]);

    const handleDone = (data) => { setOrderData(data); setCart({}); setStep('done'); };

    return (
        <div className="hidden lg:flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
                <h2 className="text-base font-extrabold text-ink-900">Your Order</h2>
                {count > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brass-500 text-xs font-bold text-white">{count}</span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4">
                {step === 'done' ? (
                    <div className="py-4">
                        <DoneScreen orderNum={orderData?.order_number} total={orderData?.total} table={table} onClose={() => { setStep('cart'); setOrderData(null); }} />
                    </div>
                ) : step === 'checkout' ? (
                    <div className="py-4">
                        <CheckoutForm items={items} total={total} table={table} onBack={() => setStep('cart')} onDone={handleDone} />
                    </div>
                ) : (
                    <>
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <Icon.cart className="h-12 w-12 text-ink-200" />
                                <p className="text-sm text-ink-400">Your cart is empty</p>
                                <p className="text-xs text-ink-300">Tap + Add on any item</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-ink-50">
                                {items.map(({ item, qty }) => (
                                    <CartRow key={item.id} item={item} qty={qty} onAdd={() => adjust(item.id, 1)} onRemove={() => adjust(item.id, -1)} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {items.length > 0 && step === 'cart' && (
                <div className="border-t border-ink-100 px-4 py-4 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-brass-50 px-4 py-3">
                        <span className="font-bold text-ink-700">Total</span>
                        <span className="text-lg font-extrabold text-brass-600">{rwf(total)}</span>
                    </div>
                    <button onClick={() => setStep('checkout')}
                        className="w-full rounded-xl bg-brass-500 py-3 text-sm font-extrabold text-white shadow-md hover:bg-brass-600 transition active:scale-95">
                        Proceed to Order →
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Menu({ categories, table, business, contact }) {
    const [kindFilter, setKindFilter] = useState('all');
    const [activeSlug, setActiveSlug] = useState(null);
    const [cart, setCart]             = useState({});
    const [showDrawer, setShowDrawer] = useState(false);
    const [search, setSearch]         = useState('');
    const catRefs  = useRef({});
    const mainRef  = useRef(null);

    const businessName = business?.name ?? 'Our Menu';

    // Build itemMap with category_name
    const itemMap = useMemo(() => {
        const m = {};
        categories.forEach(c => c.items.forEach(i => { m[i.id] = { ...i, category_name: c.name }; }));
        return m;
    }, [categories]);

    const filtered = useMemo(() =>
        categories.filter(c => kindFilter === 'all' || c.kind === kindFilter),
        [categories, kindFilter]
    );

    // Flat search across all items
    const searchTerm = search.trim().toLowerCase();
    const searchResults = useMemo(() => {
        if (!searchTerm) return null;
        const results = [];
        categories.forEach(c => {
            c.items.forEach(item => {
                if (
                    item.name.toLowerCase().includes(searchTerm) ||
                    (item.description ?? '').toLowerCase().includes(searchTerm) ||
                    c.name.toLowerCase().includes(searchTerm)
                ) {
                    results.push({ ...item, category_name: c.name, cat_index: categories.indexOf(c) });
                }
            });
        });
        return results;
    }, [categories, searchTerm]);

    const specials = useMemo(() =>
        categories.flatMap(c => c.items.filter(i => i.is_special).map(i => ({ ...i, category_name: c.name }))).slice(0, 6),
        [categories]
    );

    const add    = useCallback((id) => setCart(p => ({ ...p, [id]: (p[id] ?? 0) + 1 })), []);
    const remove = useCallback((id) => setCart(p => { const n = { ...p, [id]: (p[id] ?? 0) - 1 }; if (n[id] <= 0) delete n[id]; return n; }), []);

    const scrollToCategory = useCallback((slug) => {
        setActiveSlug(slug);
        const el = catRefs.current[slug];
        if (!el) return;
        // On desktop, the center column scrolls; on mobile, the window scrolls
        const container = mainRef.current;
        if (container) {
            const offset = el.offsetTop - 120;
            container.scrollTo({ top: offset, behavior: 'smooth' });
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Track active category on scroll (desktop center scroll)
    useEffect(() => {
        const container = mainRef.current;
        if (!container) return;
        const handler = () => {
            let found = null;
            for (const [slug, el] of Object.entries(catRefs.current)) {
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                if (rect.top <= 160) found = slug;
            }
            if (found) setActiveSlug(found);
        };
        container.addEventListener('scroll', handler, { passive: true });
        return () => container.removeEventListener('scroll', handler);
    }, [filtered]);

    const count = cartCount(cart);
    const total = useMemo(() => cartTotal(cart, itemMap), [cart, itemMap]);

    return (
        <>
            <Head title={`Menu — ${businessName}`} />

            <div className="flex h-screen flex-col overflow-hidden bg-ink-50 lg:flex-row">

                {/* ── DESKTOP: Left Category Sidebar ─────────────────────── */}
                <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-white shadow-md z-10">
                    {/* Brand */}
                    <div className="bg-ink-950 px-5 py-5 text-white">
                        <img src="/images/logo.jpeg" alt={businessName}
                            className="mb-3 h-14 w-14 rounded-xl object-cover ring-1 ring-white/10" />
                        <p className="text-xs font-bold uppercase tracking-widest text-brass-400">Welcome to</p>
                        <h1 className="mt-1 text-lg font-extrabold leading-tight">{businessName}</h1>
                        {table && (
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brass-500/20 px-2.5 py-1">
                                <Icon.seat className="h-3.5 w-3.5 text-brass-300" />
                                <span className="text-xs font-bold text-brass-300">Table {table.label}</span>
                            </div>
                        )}
                        {contact?.phone && (
                            <a href={`tel:${contact.phone}`}
                                className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/15 transition">
                                <Icon.phone className="h-4 w-4 shrink-0 text-brass-300" />
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wide text-ink-300">Call us now</p>
                                    <p className="truncate text-sm font-bold">{contact.name ? `${contact.name} · ` : ''}{contact.phone}</p>
                                </div>
                            </a>
                        )}
                        <a href="/book"
                            className="mt-2 flex items-center gap-2 rounded-xl bg-brass-500 px-3 py-2 hover:bg-brass-400 transition">
                            <Icon.calendar className="h-4 w-4 shrink-0 text-white" />
                            <span className="text-sm font-bold text-white">Book a Table or Delivery</span>
                        </a>
                    </div>

                    {/* Search box */}
                    <div className="border-b px-3 py-2.5">
                        <div className="relative">
                            <Icon.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                            <input
                                type="search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search menu…"
                                className="w-full rounded-xl border-ink-100 bg-ink-50 pl-8 pr-3 py-2 text-sm text-ink-800 placeholder-ink-300 focus:border-brass-400 focus:ring-brass-400 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    {/* Kind filter */}
                    <div className="flex gap-1 border-b px-3 py-2.5">
                        {[{ k: 'all', l: 'All' }, { k: 'food', l: 'Food' }, { k: 'drink', l: 'Drinks' }].map(({ k, l }) => (
                            <button key={k} onClick={() => { setKindFilter(k); setSearch(''); }}
                                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${kindFilter === k ? 'bg-brass-500 text-white shadow' : 'text-ink-500 hover:bg-ink-100'}`}>
                                {l}
                            </button>
                        ))}
                    </div>

                    {/* Category list */}
                    <nav className="flex-1 overflow-y-auto py-2">
                        {filtered.map((c, i) => {
                            const clr = CAT_COLOURS[i % CAT_COLOURS.length];
                            const active = activeSlug === c.slug;
                            return (
                                <button key={c.slug} onClick={() => scrollToCategory(c.slug)}
                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${active ? 'bg-brass-50 font-bold text-brass-700 border-r-2 border-brass-500' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}>
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-serif text-sm font-semibold ${clr.split(' ')[0]}`}>{catMonogram(c.name)}</span>
                                    <span className="truncate">{c.name}</span>
                                    <span className="ml-auto text-xs text-ink-300">{c.items.length}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="border-t px-4 py-3 text-center">
                        <p className="text-xs text-ink-400">All prices in RWF</p>
                        <a href="/login" className="mt-1 block text-xs text-ink-300 hover:text-ink-500">Staff login</a>
                    </div>
                </aside>

                {/* ── MAIN: Center + Right ────────────────────────────────── */}
                <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">

                    {/* ── Center: Menu Items ── */}
                    <main ref={mainRef} className="flex-1 overflow-y-auto">

                        {/* Mobile Hero */}
                        <div className="lg:hidden bg-ink-950 px-5 pt-8 pb-12 text-white relative overflow-hidden">
                            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-brass-500/10 blur-3xl" />
                            <div className="relative">
                                <img src="/images/logo.jpeg" alt={businessName}
                                    className="mb-3 h-16 w-16 rounded-xl object-cover ring-1 ring-white/10" />
                                <p className="text-xs font-bold uppercase tracking-widest text-brass-400">Welcome to</p>
                                <h1 className="mt-1 text-2xl font-extrabold">{businessName}</h1>
                                {business?.address && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
                                        <Icon.pin className="h-3.5 w-3.5" /> {business.address}
                                    </p>
                                )}
                                {table && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/20">
                                        <Icon.seat className="h-4 w-4 text-brass-300" />
                                        <div>
                                            <p className="text-xs text-brass-300">Your table</p>
                                            <p className="text-lg font-extrabold">{table.label}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-3 flex gap-2">
                                    {contact?.phone && (
                                        <a href={`tel:${contact.phone}`}
                                            className="flex flex-1 items-center gap-2 rounded-2xl bg-brass-500 px-3.5 py-2.5 shadow-lg active:scale-95 transition">
                                            <Icon.phone className="h-4 w-4 shrink-0 text-white" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] uppercase tracking-wide text-white/80">Call us now</p>
                                                <p className="truncate text-sm font-bold text-white">{contact.phone}</p>
                                            </div>
                                        </a>
                                    )}
                                    <a href="/book"
                                        className="flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/20 active:scale-95 transition">
                                        <Icon.calendar className="h-4 w-4 shrink-0 text-brass-300" />
                                        <span className="text-sm font-bold">Book</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Mobile sticky filters */}
                        <div className="lg:hidden sticky top-0 z-30 bg-white/95 shadow-sm backdrop-blur px-4 pt-3 pb-2 -mt-6 rounded-t-3xl">
                            {/* Search */}
                            <div className="relative mb-2.5">
                                <Icon.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search food & drinks…"
                                    className="w-full rounded-2xl border-ink-100 bg-ink-50 pl-8 pr-3 py-2.5 text-sm placeholder-ink-300 focus:border-brass-400 focus:ring-brass-400 focus:bg-white"
                                />
                            </div>
                            {!search && (
                                <>
                                    <div className="flex gap-2 mb-2.5">
                                        {[{ k: 'all', l: 'All' }, { k: 'food', l: 'Food' }, { k: 'drink', l: 'Drinks' }].map(({ k, l }) => (
                                            <button key={k} onClick={() => setKindFilter(k)}
                                                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${kindFilter === k ? 'bg-brass-500 text-white shadow-md' : 'bg-ink-100 text-ink-500'}`}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                        {filtered.map((c, i) => (
                                            <button key={c.slug} onClick={() => scrollToCategory(c.slug)}
                                                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition ${activeSlug === c.slug ? 'border-brass-500 bg-brass-500 text-white' : 'border-ink-200 bg-white text-ink-600'}`}>
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Desktop category strip */}
                        <div className="hidden lg:block sticky top-0 z-20 bg-white/95 shadow-sm backdrop-blur border-b px-6 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wide text-ink-400 mr-2">Category</span>
                                {filtered.map((c) => (
                                    <button key={c.slug} onClick={() => scrollToCategory(c.slug)}
                                        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${activeSlug === c.slug ? 'bg-brass-500 text-white shadow' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 lg:px-6 lg:py-5 space-y-8">

                            {/* QR scan prompt (mobile, no table) */}
                            {!table && (
                                <div className="lg:hidden rounded-2xl bg-ink-900 px-4 py-4 text-white flex items-start gap-3">
                                    <Icon.scan className="h-7 w-7 shrink-0 text-brass-400" />
                                    <div>
                                        <p className="font-bold">Ordering from a table?</p>
                                        <p className="text-xs text-ink-300 mt-0.5">Scan the QR code sticker on your table with your phone camera — your order will be linked to your table automatically.</p>
                                    </div>
                                </div>
                            )}

                            {/* Servant info (when table is known) */}
                            {table?.servant && (
                                <div className="rounded-2xl bg-purple-50 px-4 py-3.5 ring-1 ring-purple-100 flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-200 text-sm font-extrabold text-purple-700 shadow-sm">
                                        {table.servant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-purple-400">Your servant today</p>
                                        <p className="font-bold text-ink-900">{table.servant.name}</p>
                                        {table.servant.phone && (
                                            <a href={`tel:${table.servant.phone}`} className="inline-flex items-center gap-1 text-xs text-purple-500 hover:underline">
                                                <Icon.phone className="h-3 w-3" /> {table.servant.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tip (mobile only, when table known) */}
                            {table && !searchResults && (
                                <div className="lg:hidden rounded-2xl bg-brass-50 px-4 py-3 text-sm text-brass-800 ring-1 ring-brass-200">
                                    Tap <strong>+ Add</strong> on any item — we'll bring it to <strong>Table {table.label}</strong>.
                                </div>
                            )}

                            {/* SEARCH RESULTS */}
                            {searchResults !== null && (
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Icon.search className="h-4 w-4 text-ink-400" />
                                        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-600">
                                            {searchResults.length > 0
                                                ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${search}"`
                                                : `No results for "${search}"`}
                                        </h2>
                                        <button onClick={() => setSearch('')} className="ml-auto text-xs text-ink-400 hover:text-ink-600 underline">Clear</button>
                                    </div>
                                    {searchResults.length === 0 ? (
                                        <div className="rounded-2xl bg-ink-50 py-12 text-center ring-1 ring-ink-100">
                                            <Icon.empty className="mx-auto mb-2 h-9 w-9 text-ink-300" />
                                            <p className="text-ink-500 font-semibold">Nothing found</p>
                                            <p className="text-xs text-ink-400 mt-1">Try a different word or browse the categories below</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {searchResults.map(item => (
                                                <ItemCard key={item.id} item={item}
                                                    qty={cart[item.id] ?? 0}
                                                    colourClass={CAT_COLOURS[item.cat_index % CAT_COLOURS.length].split(' ')[0]}
                                                    onAdd={() => add(item.id)} onRemove={() => remove(item.id)} />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Specials (hidden when searching) */}
                            {!searchResults && (
                            <>
                            {specials.length > 0 && (
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Icon.star className="h-4 w-4 text-brass-500" />
                                        <h2 className="text-sm font-extrabold uppercase tracking-wide text-brass-600">Today's Specials</h2>
                                        <div className="h-px flex-1 bg-brass-100" />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {specials.map((item, i) => (
                                            <ItemCard key={item.id} item={item}
                                                qty={cart[item.id] ?? 0}
                                                colourClass={CAT_COLOURS[i % CAT_COLOURS.length].split(' ')[0]}
                                                onAdd={() => add(item.id)} onRemove={() => remove(item.id)} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Categories */}
                            {filtered.map((cat, i) => {
                                const clr = CAT_COLOURS[i % CAT_COLOURS.length];
                                return (
                                    <section key={cat.slug} ref={el => { catRefs.current[cat.slug] = el; }}>
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-serif text-base font-semibold ${clr.split(' ')[0]}`}>{catMonogram(cat.name)}</div>
                                            <h2 className="text-base font-extrabold text-ink-800">{cat.name}</h2>
                                            <span className="ml-auto rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-400">{cat.items.length}</span>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {cat.items.map(item => (
                                                <ItemCard key={item.id} item={{ ...item, category_name: cat.name }}
                                                    qty={cart[item.id] ?? 0}
                                                    colourClass={clr.split(' ')[0]}
                                                    onAdd={() => add(item.id)} onRemove={() => remove(item.id)} />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                            </>
                            )}

                            <footer className="border-t pt-6 pb-10 text-center space-y-3">
                                <p className="text-sm font-bold text-ink-600">{businessName}</p>
                                {business?.phone && (
                                    <p className="flex items-center justify-center gap-1 text-xs text-ink-400">
                                        <Icon.phone className="h-3.5 w-3.5" />
                                        <a href={`tel:${business.phone}`} className="underline">{business.phone}</a>
                                    </p>
                                )}
                                <a href="/book"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-6 py-3 text-sm font-bold text-white shadow hover:bg-ink-800 transition">
                                    <Icon.calendar className="h-4 w-4" /> Book a Table or Delivery
                                </a>
                                <p className="text-xs text-ink-300">All prices in Rwandan Francs (RWF) · Inclusive of taxes</p>
                            </footer>
                        </div>
                    </main>

                    {/* ── Right: Desktop Cart Panel ── */}
                    <aside className="hidden lg:flex w-80 shrink-0 flex-col border-l border-ink-100 bg-white shadow-lg">
                        <DesktopCart cart={cart} setCart={setCart} itemMap={itemMap} table={table} />
                    </aside>
                </div>
            </div>

            {/* ── Mobile: floating cart button ── */}
            {count > 0 && !showDrawer && (
                <div className="fixed bottom-6 inset-x-4 z-40 lg:hidden">
                    <button onClick={() => setShowDrawer(true)}
                        className="flex w-full items-center justify-between rounded-2xl bg-ink-900 px-5 py-3.5 text-white shadow-2xl transition hover:bg-ink-800 active:scale-95">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-500 text-sm font-extrabold shadow">{count}</span>
                            <span className="font-semibold">View Cart</span>
                        </div>
                        <span className="font-extrabold text-brass-400">{rwf(total)}</span>
                    </button>
                </div>
            )}

            {/* ── Mobile: Cart Drawer ── */}
            {showDrawer && (
                <CartDrawer cart={cart} setCart={setCart} itemMap={itemMap} table={table} onClose={() => setShowDrawer(false)} />
            )}
        </>
    );
}
