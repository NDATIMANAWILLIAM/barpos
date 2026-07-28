import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

// ── Inline SVG Icons ─────────────────────────────────────────────────────────
const I = {
    home:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z"/></svg>,
    cart:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/></svg>,
    fire:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd"/></svg>,
    cal:      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z"/><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd"/></svg>,
    menu:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd"/></svg>,
    table:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><rect x="3" y="8" width="18" height="2" rx="1"/><path strokeLinecap="round" d="M5 10v8M19 10v8M8 10v3m8-3v3"/><rect x="2" y="6" width="20" height="3" rx="1.5"/></svg>,
    users:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z"/></svg>,
    book:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z"/></svg>,
    chart:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"/></svg>,
    logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[16px] h-[16px]"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
    profile:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[16px] h-[16px]"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
    bars:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>,
    x:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
    check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    shield:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.704-3.08z" clipRule="evenodd"/></svg>,
    ops:      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M3 13.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 13.5zM3 8.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 8.25zM3 18.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"/><circle cx="19" cy="5" r="4" fill="#ef4444"/><text x="19" y="7" fontSize="5" fill="white" textAnchor="middle">!</text></svg>,
    settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path strokeLinecap="round" d="M4 6h8M16 6h4M4 12h1M9 12h11M4 18h9M17 18h3"/><circle cx="12" cy="6" r="2"/><circle cx="5.5" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></svg>,
    bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z"/><path strokeLinecap="round" d="M10 19a2 2 0 004 0"/></svg>,
};

function fmtRelative(iso) {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell({ notifications }) {
    const [open, setOpen] = useState(false);
    const count = notifications.length;

    const openItem = (n) => {
        router.patch(route('notifications.read', n.id), {}, { preserveScroll: true });
        setOpen(false);
        if (n.data.url) router.visit(n.data.url);
    };

    const markAllRead = () => {
        router.patch(route('notifications.read-all'), {}, { preserveScroll: true });
        setOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 transition">
                {I.bell}
                {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl bg-white shadow-2xl ring-1 ring-ink-100 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
                            <p className="text-sm font-bold text-ink-800">Notifications</p>
                            {count > 0 && (
                                <button onClick={markAllRead} className="text-xs font-semibold text-brass-600 hover:underline">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-ink-50">
                            {count === 0 ? (
                                <p className="px-4 py-8 text-center text-sm text-ink-400">You're all caught up.</p>
                            ) : notifications.map((n) => (
                                <button key={n.id} onClick={() => openItem(n)}
                                    className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-ink-50 transition">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-ink-800">{n.data.text}</p>
                                        <p className="mt-0.5 text-xs text-ink-400">{fmtRelative(n.created_at)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Config ────────────────────────────────────────────────────────────────────
const ROLE_META = {
    owner:        { label: 'Super Manager', colour: 'bg-brass-500',   text: 'text-brass-700',  badge: 'bg-brass-100'   },
    manager:      { label: 'Manager',       colour: 'bg-blue-500',    text: 'text-blue-700',   badge: 'bg-blue-100'    },
    cashier:      { label: 'Cashier',       colour: 'bg-emerald-500', text: 'text-emerald-700',badge: 'bg-emerald-100' },
    waiter:       { label: 'Servant',       colour: 'bg-purple-500',  text: 'text-purple-700', badge: 'bg-purple-100'  },
    receptionist: { label: 'Receptionist',  colour: 'bg-pink-500',    text: 'text-pink-700',   badge: 'bg-pink-100'    },
    kitchen:      { label: 'Kitchen Staff', colour: 'bg-orange-500',  text: 'text-orange-700', badge: 'bg-orange-100'  },
    storekeeper:  { label: 'Storekeeper',   colour: 'bg-ink-500',   text: 'text-ink-700',  badge: 'bg-ink-100'   },
};
const ADMIN     = ['owner', 'manager'];
const POS_ROLES = ['owner', 'manager', 'cashier', 'waiter'];
const KIT_ROLES = ['owner', 'manager', 'kitchen'];
const RES_ROLES = ['owner', 'manager', 'waiter', 'receptionist'];
const OPS_ROLES = ['owner', 'manager', 'cashier', 'waiter', 'receptionist', 'kitchen'];

// ── Flash Banner ──────────────────────────────────────────────────────────────
function FlashBanner() {
    const { flash } = usePage().props;
    const [show, setShow] = useState(true);
    useEffect(() => { setShow(true); const t = setTimeout(() => setShow(false), 4500); return () => clearTimeout(t); }, [flash]);
    if (!show) return null;
    if (flash?.success) return (
        <div className="flex items-center gap-3 bg-emerald-600 px-5 py-2.5 text-sm text-white print:hidden">
            {I.check} <span>{flash.success}</span>
            <button onClick={() => setShow(false)} className="ml-auto opacity-70 hover:opacity-100">{I.x}</button>
        </div>
    );
    if (flash?.error) return (
        <div className="flex items-center gap-3 bg-red-600 px-5 py-2.5 text-sm text-white print:hidden">
            {I.x} <span>{flash.error}</span>
            <button onClick={() => setShow(false)} className="ml-auto opacity-70 hover:opacity-100">{I.x}</button>
        </div>
    );
    if (flash?.info) return (
        <div className="flex items-center gap-3 bg-blue-600 px-5 py-2.5 text-sm text-white print:hidden">
            <span>{flash.info}</span>
            <button onClick={() => setShow(false)} className="ml-auto opacity-70 hover:opacity-100">{I.x}</button>
        </div>
    );
    return null;
}

// ── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ href, icon, label, active, badge, onClick }) {
    return (
        <Link href={href} onClick={onClick}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active ? 'bg-brass-500 text-white shadow-lg shadow-brass-500/25' : 'text-ink-400 hover:bg-ink-800 hover:text-white'
            }`}>
            <span className={`shrink-0 transition ${active ? 'text-white' : 'text-ink-500 group-hover:text-ink-300'}`}>{icon}</span>
            <span className="flex-1 truncate">{label}</span>
            {badge && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">{badge}</span>}
            {active && <div className="h-1.5 w-1.5 rounded-full bg-white/60" />}
        </Link>
    );
}

// ── Nav Group ────────────────────────────────────────────────────────────────
function NavGroup({ label, children }) {
    return (
        <div className="space-y-0.5">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-600">{label}</p>
            {children}
        </div>
    );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, role, meta, navItems, onClose }) {
    const has = (roles) => roles.includes(role);

    const ops   = navItems.filter(n => ['dashboard', 'pos.*', 'kitchen.*', 'reservations.*'].includes(n.match));
    const mgmt  = navItems.filter(n => ['menu.*', 'tables.*', 'staff.*', 'reports.*', 'settings.*'].includes(n.match));
    const more  = navItems.filter(n => ['guide'].includes(n.match));

    return (
        <div className="flex h-full flex-col bg-ink-900">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-ink-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass-600 font-serif text-lg font-semibold text-ink-950">I</div>
                <div className="min-w-0">
                    <p className="font-bold text-white leading-none tracking-tight truncate">Isaro Rubengera</p>
                    <p className="text-[10px] text-ink-400 mt-1 uppercase tracking-[0.2em]">Bar &amp; Lodge</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="ml-auto text-ink-500 hover:text-white transition lg:hidden">{I.x}</button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {ops.length > 0 && (
                    <NavGroup label="Operations">
                        {ops.map(n => (
                            <NavItem key={n.match} href={n.href} icon={n.icon} label={n.label} active={route().current(n.match)} onClick={onClose} badge={n.badge} />
                        ))}
                    </NavGroup>
                )}
                {mgmt.length > 0 && (
                    <NavGroup label="Management">
                        {mgmt.map(n => (
                            <NavItem key={n.match} href={n.href} icon={n.icon} label={n.label} active={route().current(n.match)} onClick={onClose} />
                        ))}
                    </NavGroup>
                )}
                {more.length > 0 && (
                    <NavGroup label="Resources">
                        {more.map(n => (
                            <NavItem key={n.match} href={n.href} icon={n.icon} label={n.label} active={route().current(n.match)} onClick={onClose} />
                        ))}
                    </NavGroup>
                )}
            </nav>

            {/* User card */}
            <div className="border-t border-ink-800 px-3 py-3 space-y-2">
                {/* Owner badge */}
                {role === 'owner' && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-brass-500/10 px-3 py-1.5">
                        {I.shield}
                        <span className="text-xs font-bold text-brass-400 uppercase tracking-wide">Full Access · Owner</span>
                    </div>
                )}
                <div className="flex items-center gap-3 rounded-xl bg-ink-800 px-3 py-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm text-white shadow ${meta.colour}`}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mt-0.5 ${meta.badge} ${meta.text}`}>{meta.label}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    <Link href={route('profile.edit')} onClick={onClose}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-ink-800 py-2 text-xs font-medium text-ink-400 hover:bg-ink-700 hover:text-white transition">
                        {I.profile} Profile
                    </Link>
                    <Link href={route('logout')} method="post" as="button" onClick={onClose}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition">
                        {I.logout} Log out
                    </Link>
                </div>
                <p className="text-center text-[10px] text-ink-600 px-1">
                    To switch account: Log out first, then log in with the other account.
                </p>
            </div>
        </div>
    );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function AuthenticatedLayout({ header, children }) {
    const user          = usePage().props.auth.user;
    const notifications = usePage().props.notifications ?? [];
    const role   = user?.role ?? '';
    const meta   = ROLE_META[role] ?? { label: role, colour: 'bg-ink-500', text: 'text-ink-700', badge: 'bg-ink-100' };
    const [sideOpen, setSideOpen] = useState(false);
    const closeSide = useCallback(() => setSideOpen(false), []);

    const has = (roles) => roles.includes(role);

    const navItems = [
        { href: route('dashboard'),          icon: I.home,  label: 'Dashboard',    match: 'dashboard',      show: true,           group: 'ops' },
        { href: route('operations.index'),   icon: I.ops,   label: 'Live Operations',match:'operations.*',  show: has(OPS_ROLES), group: 'ops' },
        { href: route('pos.index'),          icon: I.cart,  label: 'Point of Sale',match: 'pos.*',          show: has(POS_ROLES), group: 'ops' },
        { href: route('kitchen.index'),      icon: I.fire,  label: 'Kitchen',      match: 'kitchen.*',      show: has(KIT_ROLES), group: 'ops' },
        { href: route('reservations.index'), icon: I.cal,   label: 'Reservations', match: 'reservations.*', show: has(RES_ROLES), group: 'ops' },
        { href: route('menu.index'),         icon: I.menu,  label: 'Menu Items',   match: 'menu.*',         show: has(ADMIN),     group: 'mgmt' },
        { href: route('tables.index'),       icon: I.table, label: 'Tables & QR',  match: 'tables.*',       show: has(ADMIN),     group: 'mgmt' },
        { href: route('staff.index'),        icon: I.users, label: 'Staff',        match: 'staff.*',        show: has(ADMIN),     group: 'mgmt' },
        { href: route('reports.index'),      icon: I.chart, label: 'Reports',      match: 'reports.*',      show: has(ADMIN),     group: 'mgmt' },
        { href: route('settings.business.edit'), icon: I.settings, label: 'Business Settings', match: 'settings.*', show: has(ADMIN), group: 'mgmt' },
        { href: route('guide'),              icon: I.book,  label: 'Staff Guide',  match: 'guide',          show: true,           group: 'more' },
    ].filter(i => i.show);

    const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

    return (
        <div className="flex h-screen overflow-hidden bg-ink-100">

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-60 shrink-0">
                <Sidebar user={user} role={role} meta={meta} navItems={navItems} />
            </aside>

            {/* Mobile sidebar overlay */}
            {sideOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSide} />
                    <div className="absolute inset-y-0 left-0 w-64 shadow-2xl">
                        <Sidebar user={user} role={role} meta={meta} navItems={navItems} onClose={closeSide} />
                    </div>
                </div>
            )}

            {/* Content area */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Top bar */}
                <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 bg-white px-4 shadow-sm print:hidden">
                    {/* Mobile hamburger */}
                    <button onClick={() => setSideOpen(true)} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 transition">
                        {I.bars}
                    </button>

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500 font-extrabold text-white text-sm">I</div>
                        <span className="font-bold text-ink-800 text-sm">Isaro Rubengera</span>
                    </div>

                    {/* Desktop: page header */}
                    <div className="hidden lg:block text-base font-bold text-ink-800">
                        {header}
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden md:block text-xs text-ink-400">
                            {new Date().toLocaleDateString('en-RW', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <NotificationBell notifications={notifications} />
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${meta.colour}`} title={user?.name}>
                            {initial}
                        </div>
                    </div>
                </header>

                {/* Mobile page header */}
                {header && (
                    <div className="lg:hidden border-b border-ink-200 bg-white px-4 py-2.5 print:hidden">
                        <div className="text-sm font-bold text-ink-800">{header}</div>
                    </div>
                )}

                {/* Flash */}
                <FlashBanner />

                {/* Page */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
