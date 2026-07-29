import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

const rwf = (n) => new Intl.NumberFormat('en-RW').format(n) + ' RWF';

export default function Index({ categories, items }) {
    const [editingItem, setEditingItem] = useState(null);
    const [editingCatId, setEditingCatId] = useState(null);
    const formRef = useRef(null);

    // --- Category forms ---
    const catForm = useForm({ name: '', kind: 'food' });
    const editCatForm = useForm({ name: '', kind: 'food' });

    // --- Item form (shared for add + edit) ---
    const defaultStationFor = (categoryId) =>
        categories.find((c) => String(c.id) === String(categoryId))?.kind === 'drink' ? 'bar' : 'kitchen';

    const itemForm = useForm({
        category_id: categories[0]?.id ?? '',
        name: '',
        price: '',
        prep_station: defaultStationFor(categories[0]?.id),
        description: '',
        is_special: false,
    });

    // ── Category actions ──────────────────────────────────────────
    const submitCat = (e) => {
        e.preventDefault();
        catForm.post(route('menu.categories.store'), {
            preserveScroll: true,
            onSuccess: () => catForm.reset('name'),
        });
    };

    const startEditCat = (cat) => {
        setEditingCatId(cat.id);
        editCatForm.setData({ name: cat.name, kind: cat.kind });
    };

    const submitEditCat = (e, catId) => {
        e.preventDefault();
        editCatForm.patch(route('menu.categories.update', catId), {
            preserveScroll: true,
            onSuccess: () => setEditingCatId(null),
        });
    };

    const deleteCat = (cat) => {
        const count = items.filter((i) => i.category_id === cat.id).length;
        if (count > 0) {
            alert(`"${cat.name}" still has ${count} item(s). Move or delete them first.`);
            return;
        }
        if (!confirm(`Delete category "${cat.name}"?`)) return;
        router.delete(route('menu.categories.destroy', cat.id), { preserveScroll: true });
    };

    // ── Item actions ──────────────────────────────────────────────
    const startEditItem = (item) => {
        setEditingItem(item);
        itemForm.setData({
            category_id:  item.category_id,
            name:         item.name,
            price:        item.price,
            prep_station: item.prep_station,
            description:  item.description ?? '',
            is_special:   item.is_special ?? false,
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const cancelEditItem = () => {
        setEditingItem(null);
        itemForm.reset();
        itemForm.setData('category_id', categories[0]?.id ?? '');
    };

    const submitItem = (e) => {
        e.preventDefault();
        if (editingItem) {
            itemForm.patch(route('menu.items.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingItem(null);
                    itemForm.reset();
                    itemForm.setData('category_id', categories[0]?.id ?? '');
                },
            });
        } else {
            itemForm.post(route('menu.items.store'), {
                preserveScroll: true,
                onSuccess: () => itemForm.reset('name', 'price', 'description'),
            });
        }
    };

    const toggle = (id) =>
        router.patch(route('menu.items.toggle', id), {}, { preserveScroll: true });

    const removeItem = (id) => {
        if (!confirm('Delete this item?')) return;
        router.delete(route('menu.items.destroy', id), { preserveScroll: true });
    };

    const stationLabel = { kitchen: 'Kitchen', bar: 'Bar', none: '—' };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Menu Management</h2>}>
            <Head title="Menu" />

            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">

                {/* ── Add category ── */}
                <div className="rounded-lg bg-white p-5 shadow">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Add a category
                    </h3>
                    <form onSubmit={submitCat} className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs text-gray-600">Name</label>
                            <input
                                className="mt-1 rounded border-gray-300 text-sm"
                                value={catForm.data.name}
                                onChange={(e) => catForm.setData('name', e.target.value)}
                                placeholder="e.g. Main Dishes"
                            />
                            {catForm.errors.name && (
                                <p className="mt-1 text-xs text-red-600">{catForm.errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600">Type</label>
                            <select
                                className="mt-1 rounded border-gray-300 text-sm"
                                value={catForm.data.kind}
                                onChange={(e) => catForm.setData('kind', e.target.value)}
                            >
                                <option value="food">Food</option>
                                <option value="drink">Drink</option>
                            </select>
                        </div>
                        <button
                            className="rounded bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-50"
                            disabled={catForm.processing}
                        >
                            Add category
                        </button>
                    </form>
                </div>

                {/* ── Add / Edit item ── */}
                <div
                    ref={formRef}
                    className={`rounded-lg bg-white p-5 shadow transition-all ${
                        editingItem ? 'ring-2 ring-indigo-400' : ''
                    }`}
                >
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        {editingItem ? (
                            <span>
                                Editing:{' '}
                                <span className="text-indigo-600">{editingItem.name}</span>
                            </span>
                        ) : (
                            'Add a menu item'
                        )}
                    </h3>

                    {categories.length === 0 ? (
                        <p className="text-sm text-gray-500">Add a category first.</p>
                    ) : (
                        <form onSubmit={submitItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs text-gray-600">Name</label>
                                <input
                                    className="mt-1 w-full rounded border-gray-300 text-sm"
                                    value={itemForm.data.name}
                                    onChange={(e) => itemForm.setData('name', e.target.value)}
                                    placeholder="e.g. Grilled Tilapia"
                                />
                                {itemForm.errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{itemForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600">Category</label>
                                <select
                                    className="mt-1 w-full rounded border-gray-300 text-sm"
                                    value={itemForm.data.category_id}
                                    onChange={(e) => {
                                        const categoryId = e.target.value;
                                        itemForm.setData((prev) => ({
                                            ...prev,
                                            category_id: categoryId,
                                            // Only auto-switch the station when adding a new item —
                                            // editing an existing item shouldn't silently override a
                                            // station someone already deliberately chose.
                                            prep_station: editingItem ? prev.prep_station : defaultStationFor(categoryId),
                                        }));
                                    }}
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600">Price (RWF)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="mt-1 w-full rounded border-gray-300 text-sm"
                                    value={itemForm.data.price}
                                    onChange={(e) => itemForm.setData('price', e.target.value)}
                                    placeholder="e.g. 5000"
                                />
                                {itemForm.errors.price && (
                                    <p className="mt-1 text-xs text-red-600">{itemForm.errors.price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600">Prepared at</label>
                                <select
                                    className="mt-1 w-full rounded border-gray-300 text-sm"
                                    value={itemForm.data.prep_station}
                                    onChange={(e) => itemForm.setData('prep_station', e.target.value)}
                                >
                                    <option value="kitchen">Kitchen</option>
                                    <option value="bar">Bar</option>
                                    <option value="none">None</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs text-gray-600">
                                    Description (optional)
                                </label>
                                <input
                                    className="mt-1 w-full rounded border-gray-300 text-sm"
                                    value={itemForm.data.description}
                                    onChange={(e) => itemForm.setData('description', e.target.value)}
                                    placeholder="Short description shown on menu"
                                />
                            </div>

                            <div className="flex items-center gap-2 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    id="is_special"
                                    className="rounded border-gray-300"
                                    checked={itemForm.data.is_special}
                                    onChange={(e) => itemForm.setData('is_special', e.target.checked)}
                                />
                                <label htmlFor="is_special" className="text-sm text-gray-600">
                                    Mark as today's special
                                </label>
                            </div>

                            <div className="flex gap-3 sm:col-span-2">
                                <button
                                    className="rounded bg-indigo-600 px-5 py-2 text-sm text-white disabled:opacity-50"
                                    disabled={itemForm.processing}
                                >
                                    {editingItem ? 'Save changes' : 'Add item'}
                                </button>
                                {editingItem && (
                                    <button
                                        type="button"
                                        onClick={cancelEditItem}
                                        className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Category / item list ── */}
                {categories.length === 0 ? (
                    <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-400 shadow">
                        No categories yet. Add one above to get started.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {categories.map((cat) => {
                            const catItems = items.filter((i) => i.category_id === cat.id);
                            const isEditing = editingCatId === cat.id;

                            return (
                                <div key={cat.id} className="rounded-lg bg-white shadow">
                                    {/* Category header */}
                                    <div className="flex items-center justify-between border-b px-5 py-3">
                                        {isEditing ? (
                                            <form
                                                onSubmit={(e) => submitEditCat(e, cat.id)}
                                                className="flex flex-1 flex-wrap items-center gap-2"
                                            >
                                                <input
                                                    className="rounded border-gray-300 text-sm"
                                                    value={editCatForm.data.name}
                                                    onChange={(e) =>
                                                        editCatForm.setData('name', e.target.value)
                                                    }
                                                    autoFocus
                                                />
                                                <select
                                                    className="rounded border-gray-300 text-sm"
                                                    value={editCatForm.data.kind}
                                                    onChange={(e) =>
                                                        editCatForm.setData('kind', e.target.value)
                                                    }
                                                >
                                                    <option value="food">Food</option>
                                                    <option value="drink">Drink</option>
                                                </select>
                                                <button
                                                    className="rounded bg-indigo-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                                                    disabled={editCatForm.processing}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCatId(null)}
                                                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                                {editCatForm.errors.name && (
                                                    <span className="text-xs text-red-600">
                                                        {editCatForm.errors.name}
                                                    </span>
                                                )}
                                            </form>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-800">
                                                    {cat.name}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        cat.kind === 'food'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}
                                                >
                                                    {cat.kind}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {catItems.length} item{catItems.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}

                                        {!isEditing && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => startEditCat(cat)}
                                                    className="text-xs text-indigo-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteCat(cat)}
                                                    className="text-xs text-red-500 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items table */}
                                    <div className="px-5 py-3">
                                        {catItems.length === 0 ? (
                                            <p className="py-2 text-sm text-gray-400">
                                                No items yet. Use the form above to add items to this
                                                category.
                                            </p>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b text-left text-xs text-gray-400">
                                                        <th className="pb-2 font-medium">Item</th>
                                                        <th className="pb-2 font-medium">Description</th>
                                                        <th className="pb-2 font-medium">Station</th>
                                                        <th className="pb-2 text-right font-medium">
                                                            Price
                                                        </th>
                                                        <th className="pb-2 text-center font-medium">
                                                            Status
                                                        </th>
                                                        <th className="pb-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {catItems.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            className={`border-b last:border-0 ${
                                                                editingItem?.id === item.id
                                                                    ? 'bg-indigo-50'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <td className="py-2 pr-4">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-medium text-gray-800">
                                                                        {item.name}
                                                                    </span>
                                                                    {item.is_special && (
                                                                        <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                                                                            Special
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 pr-4 text-gray-400">
                                                                {item.description || '—'}
                                                            </td>
                                                            <td className="py-2 pr-4 text-gray-500">
                                                                {stationLabel[item.prep_station]}
                                                            </td>
                                                            <td className="py-2 pr-4 text-right font-medium text-gray-800">
                                                                {rwf(item.price)}
                                                            </td>
                                                            <td className="py-2 pr-4 text-center">
                                                                <button
                                                                    onClick={() => toggle(item.id)}
                                                                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                                                                        item.is_available
                                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    {item.is_available
                                                                        ? 'Available'
                                                                        : 'Hidden'}
                                                                </button>
                                                            </td>
                                                            <td className="py-2 text-right">
                                                                <button
                                                                    onClick={() => startEditItem(item)}
                                                                    className="mr-3 text-xs text-indigo-600 hover:underline"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="text-xs text-red-500 hover:underline"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
