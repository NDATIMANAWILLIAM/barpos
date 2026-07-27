import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ROLE_META = {
    owner:        { emoji: '👑', label: 'Super Manager', color: 'text-amber-600',  bg: 'bg-amber-100'  },
    manager:      { emoji: '🎯', label: 'Manager',       color: 'text-blue-600',   bg: 'bg-blue-100'   },
    cashier:      { emoji: '💰', label: 'Cashier',       color: 'text-green-600',  bg: 'bg-green-100'  },
    waiter:       { emoji: '🍽️', label: 'Servant',       color: 'text-purple-600', bg: 'bg-purple-100' },
    receptionist: { emoji: '📞', label: 'Receptionist',  color: 'text-pink-600',   bg: 'bg-pink-100'   },
    kitchen:      { emoji: '👨‍🍳', label: 'Kitchen Staff', color: 'text-orange-600', bg: 'bg-orange-100' },
    storekeeper:  { emoji: '📦', label: 'Storekeeper',   color: 'text-gray-600',   bg: 'bg-gray-100'   },
};

const ROLE_DESC = {
    owner:        'Full control — add/delete staff, all settings, all reports',
    manager:      'Same as owner except cannot delete owner accounts',
    cashier:      'POS + process payments + print receipts',
    waiter:       'Take orders in POS + manage reservations + live operations',
    receptionist: 'Handle reservations and bookings — call clients, confirm requests',
    kitchen:      'Kitchen display only — mark items ready',
    storekeeper:  'Inventory management only',
};

// Extra permissions that can be granted on top of any role
const EXTRA_PERMS = [
    { key: 'payments',     label: 'Process Payments',    desc: 'Can open the payment screen and confirm orders',         emoji: '💳' },
    { key: 'pos',          label: 'Access POS',          desc: 'Can use the Point of Sale screen to take orders',        emoji: '🖥️' },
    { key: 'kitchen',      label: 'Kitchen Display',     desc: 'Can see the kitchen orders screen and mark items ready', emoji: '👨‍🍳' },
    { key: 'reservations', label: 'Reservations',        desc: 'Can view and manage table reservations',                 emoji: '📅' },
    { key: 'manage',       label: 'Menu & Tables',       desc: 'Can add/edit menu items and table QR codes',             emoji: '🍽️' },
    { key: 'reports',      label: 'View Reports',        desc: 'Can see revenue and sales reports',                      emoji: '📊' },
];

function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                checked ? 'bg-green-500' : 'bg-gray-300'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

function PermissionCheckboxes({ selected, onChange }) {
    const toggle = (key) => {
        const next = selected.includes(key)
            ? selected.filter(k => k !== key)
            : [...selected, key];
        onChange(next);
    };
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EXTRA_PERMS.map((p) => {
                const active = selected.includes(p.key);
                return (
                    <label
                        key={p.key}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                            active
                                ? 'border-indigo-400 bg-indigo-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                        <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded accent-indigo-600"
                            checked={active}
                            onChange={() => toggle(p.key)}
                        />
                        <div>
                            <p className={`text-sm font-semibold ${active ? 'text-indigo-700' : 'text-gray-700'}`}>
                                {p.emoji} {p.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                        </div>
                    </label>
                );
            })}
        </div>
    );
}

function StaffRow({ member, roles, currentUserId }) {
    const [open, setOpen] = useState(false);
    const m = ROLE_META[member.role] ?? ROLE_META.waiter;

    const form = useForm({
        name:        member.name,
        role:        member.role,
        phone:       member.phone ?? '',
        is_active:   member.is_active,
        password:    '',
        permissions: member.permissions ?? [],
    });

    const save = (e) => {
        e.preventDefault();
        form.patch(route('staff.update', member.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const remove = () => {
        if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return;
        router.delete(route('staff.destroy', member.id), { preserveScroll: true });
    };

    return (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
            {/* Row summary */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${m.bg}`}>
                    {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${m.bg} ${m.color}`}>
                            {m.label}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {member.is_active ? '● Active' : '○ Inactive'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{member.email}{member.phone ? ` · ${member.phone}` : ''}</p>
                    {member.permissions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {member.permissions.map(p => {
                                const ep = EXTRA_PERMS.find(e => e.key === p);
                                return ep ? (
                                    <span key={p} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 font-medium">
                                        +{ep.label}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
                <div className="flex shrink-0 gap-2">
                    <button
                        onClick={() => setOpen(!open)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                        {open ? 'Close' : '✏️ Edit'}
                    </button>
                    {member.id !== currentUserId && (
                        <button
                            onClick={remove}
                            className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>

            {/* Edit form */}
            {open && (
                <form onSubmit={save} className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-5">
                    {/* Basic info */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                            <input className="w-full rounded-lg border-gray-300 text-sm" value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)} />
                            {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                            <input type="tel" className="w-full rounded-lg border-gray-300 text-sm" value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)} placeholder="07X XXX XXXX" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                            <input type="password" className="w-full rounded-lg border-gray-300 text-sm" value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)} placeholder="leave blank to keep" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Account Status</label>
                            <div className="flex items-center gap-2 mt-2">
                                <Toggle checked={form.data.is_active}
                                    onChange={(v) => form.setData('is_active', v)}
                                    disabled={member.id === currentUserId} />
                                <span className={`text-sm font-semibold ${form.data.is_active ? 'text-green-700' : 'text-red-500'}`}>
                                    {form.data.is_active ? 'Active' : 'Inactive (blocked)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Role */}
                    {member.id !== currentUserId && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                            <select className="rounded-lg border-gray-300 text-sm" value={form.data.role}
                                onChange={(e) => form.setData('role', e.target.value)}>
                                {Object.entries(roles).map(([key, label]) => (
                                    <option key={key} value={key}>{ROLE_META[key]?.emoji} {label}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-400">{ROLE_DESC[form.data.role]}</p>
                        </div>
                    )}

                    {/* Extra permissions */}
                    <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                            Extra Temporary Permissions
                            <span className="ml-2 font-normal text-gray-400">— grant access beyond their normal role</span>
                        </p>
                        <PermissionCheckboxes
                            selected={form.data.permissions ?? []}
                            onChange={(v) => form.setData('permissions', v)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={form.processing}
                            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                            {form.processing ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setOpen(false)}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-white">
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function Index({ staff, roles }) {
    const [showForm, setShowForm] = useState(false);
    const { props } = usePage();
    const currentUserId = props.auth.user.id;

    const form = useForm({
        name:        '',
        email:       '',
        role:        'waiter',
        phone:       '',
        password:    '',
        is_active:   true,
        permissions: [],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('staff.store'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); form.setData('role', 'waiter'); form.setData('is_active', true); form.setData('permissions', []); setShowForm(false); },
        });
    };

    const activeCount   = staff.filter(s => s.is_active).length;
    const inactiveCount = staff.filter(s => !s.is_active).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Staff Management</h2>
                        <p className="text-sm text-gray-500">{activeCount} active · {inactiveCount} inactive</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                        {showForm ? '✕ Cancel' : '+ Add Staff Member'}
                    </button>
                </div>
            }
        >
            <Head title="Staff Management" />
            <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-5">

                {/* ── Add form ── */}
                {showForm && (
                    <div className="rounded-2xl bg-white p-6 shadow-lg ring-2 ring-indigo-400 space-y-5">
                        <div>
                            <h3 className="text-lg font-extrabold text-gray-900">New Staff Member</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Fill in their details, pick a role, then grant any extra access they need temporarily.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Basic info */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                                    <input autoFocus className="w-full rounded-lg border-gray-300 text-sm"
                                        value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Jean Pierre" />
                                    {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                                    <input type="email" className="w-full rounded-lg border-gray-300 text-sm"
                                        value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="jean@bar.rw" />
                                    {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                                    <input type="tel" className="w-full rounded-lg border-gray-300 text-sm"
                                        value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="07X XXX XXXX" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
                                    <input type="password" className="w-full rounded-lg border-gray-300 text-sm"
                                        value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} placeholder="min 6 characters" />
                                    {form.errors.password && <p className="mt-1 text-xs text-red-500">{form.errors.password}</p>}
                                </div>
                            </div>

                            {/* Role + Active */}
                            <div className="flex flex-wrap items-start gap-6">
                                <div className="flex-1 min-w-48">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Role *</label>
                                    <select className="w-full rounded-lg border-gray-300 text-sm" value={form.data.role}
                                        onChange={(e) => form.setData('role', e.target.value)}>
                                        {Object.entries(roles).map(([key, label]) => (
                                            <option key={key} value={key}>{ROLE_META[key]?.emoji} {label}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1.5 text-xs text-gray-400">{ROLE_DESC[form.data.role]}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Account Status</label>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Toggle checked={form.data.is_active} onChange={(v) => form.setData('is_active', v)} />
                                        <span className={`text-sm font-semibold ${form.data.is_active ? 'text-green-700' : 'text-red-500'}`}>
                                            {form.data.is_active ? 'Active — can log in' : 'Inactive — blocked'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">Turn off to block login without deleting</p>
                                </div>
                            </div>

                            {/* Extra permissions */}
                            <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                    Extra Temporary Permissions
                                    <span className="ml-2 font-normal text-gray-400">— tick to grant access beyond their role (optional)</span>
                                </p>
                                <PermissionCheckboxes
                                    selected={form.data.permissions}
                                    onChange={(v) => form.setData('permissions', v)}
                                />
                            </div>

                            <button type="submit" disabled={form.processing}
                                className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-50">
                                {form.processing ? 'Adding…' : '+ Add Staff Member'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Staff list ── */}
                <div className="space-y-3">
                    {staff.map(member => (
                        <StaffRow key={member.id} member={member} roles={roles} currentUserId={currentUserId} />
                    ))}
                    {staff.length === 0 && (
                        <div className="rounded-2xl bg-white py-16 text-center shadow">
                            <p className="text-4xl mb-3">👥</p>
                            <p className="text-gray-500 font-medium">No staff members yet.</p>
                            <button onClick={() => setShowForm(true)}
                                className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white">
                                Add first staff member
                            </button>
                        </div>
                    )}
                </div>

                {/* Active/Inactive note */}
                <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-5 py-4">
                    <p className="text-sm font-bold text-amber-900">🔒 Active vs Inactive</p>
                    <p className="text-xs text-amber-700 mt-1">
                        <strong>Active</strong> — the staff member can log in normally.<br />
                        <strong>Inactive</strong> — account is blocked, they cannot log in even with the correct password. Use this when someone is away or leaves temporarily instead of deleting them.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
