import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const ITEM_STATUS_COLORS = {
    new:    'bg-orange-100 text-orange-700',
    ready:  'bg-green-100 text-green-700',
    served: 'bg-gray-100 text-gray-500',
};

function elapsed(placedAt) {
    const mins = Math.floor((Date.now() - new Date(placedAt)) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
}

function OrderCard({ order, station }) {
    const stationItems = order[station + '_items'] ?? [];
    const pending = stationItems.filter((i) => i.status === 'new');

    if (stationItems.length === 0) return null;

    const markReady = (itemId) => {
        router.patch(route('kitchen.items.ready', itemId), {}, { preserveScroll: true });
    };

    return (
        <div
            className={`rounded-xl border-2 bg-white shadow-sm ${
                pending.length > 0 ? 'border-orange-300' : 'border-green-300'
            }`}
        >
            {/* Card header */}
            <div className={`rounded-t-xl px-4 py-3 ${pending.length > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                {/* Table — shown BIG so staff knows where to bring food */}
                {order.table ? (
                    <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 mb-2 text-white text-sm font-extrabold shadow-sm ${
                        pending.length > 0 ? 'bg-orange-500' : 'bg-green-600'
                    }`}>
                        🪑 {order.table}
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1 mb-2 bg-gray-500 text-white text-xs font-bold">
                        🏪 Counter / Takeaway
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">#{order.order_number}</span>
                    <div className="text-right">
                        <div className={`text-xs font-semibold ${pending.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {pending.length > 0 ? `${pending.length} item${pending.length !== 1 ? 's' : ''} pending` : '✓ All ready'}
                        </div>
                        <div className="text-xs text-gray-400">{elapsed(order.placed_at)}</div>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="divide-y px-4">
                {stationItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                    item.status === 'new'
                                        ? 'bg-orange-200 text-orange-800'
                                        : 'bg-green-200 text-green-800'
                                }`}
                            >
                                {item.quantity}
                            </span>
                            <div>
                                <div className="font-medium text-gray-800">
                                    {item.name_snapshot}
                                </div>
                                {item.notes && (
                                    <div className="text-xs text-red-600">
                                        Note: {item.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.status === 'new' ? (
                            <button
                                onClick={() => markReady(item.id)}
                                className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Ready
                            </button>
                        ) : (
                            <span className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                                Ready
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Index({ orders }) {
    const [activeStation, setActiveStation] = useState('kitchen');
    const [now, setNow] = useState(Date.now());

    // Refresh timestamps every minute
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(t);
    }, []);

    // Auto-reload page data every 30 seconds
    useEffect(() => {
        const t = setInterval(() => router.reload({ preserveScroll: true }), 30000);
        return () => clearInterval(t);
    }, []);

    const kitchenOrders = orders.filter(
        (o) => (o.kitchen_items ?? []).length > 0
    );
    const barOrders = orders.filter(
        (o) => (o.bar_items ?? []).length > 0
    );

    const displayed = activeStation === 'kitchen' ? kitchenOrders : barOrders;

    const pendingKitchen = kitchenOrders.filter(
        (o) => o.kitchen_items.some((i) => i.status === 'new')
    ).length;
    const pendingBar = barOrders.filter(
        (o) => o.bar_items.some((i) => i.status === 'new')
    ).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Kitchen &amp; Bar Display
                    </h2>
                    <button
                        onClick={() => router.reload({ preserveScroll: true })}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>
            }
        >
            <Head title="Kitchen Display" />

            <div className="mx-auto max-w-6xl p-4 sm:p-6">

                {/* Station tabs */}
                <div className="mb-6 flex gap-3">
                    <button
                        onClick={() => setActiveStation('kitchen')}
                        className={`relative rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                            activeStation === 'kitchen'
                                ? 'bg-orange-500 text-white shadow'
                                : 'bg-white text-gray-600 shadow hover:bg-orange-50'
                        }`}
                    >
                        Kitchen
                        {pendingKitchen > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {pendingKitchen}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveStation('bar')}
                        className={`relative rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                            activeStation === 'bar'
                                ? 'bg-blue-500 text-white shadow'
                                : 'bg-white text-gray-600 shadow hover:bg-blue-50'
                        }`}
                    >
                        Bar
                        {pendingBar > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {pendingBar}
                            </span>
                        )}
                    </button>
                    <div className="ml-auto self-center text-sm text-gray-400">
                        Auto-refreshes every 30s
                    </div>
                </div>

                {/* Order cards */}
                {displayed.length === 0 ? (
                    <div className="rounded-xl bg-white py-16 text-center shadow">
                        <div className="text-4xl">
                            {activeStation === 'kitchen' ? '' : ''}
                        </div>
                        <p className="mt-4 text-gray-500">
                            No active {activeStation} orders right now.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {displayed.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                station={activeStation}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
