import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
    Clock,
    ChefHat,
    AlertCircle,
    CheckCircle2,
    Flame,
    UtensilsCrossed,
    Zap,
} from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    notes: string;
    status: 'not-started' | 'in-progress' | 'ready' | 'completed';
    timeStarted: Date | null;
}

interface Order {
    _id: string;
    orderNumber: string;
    table: number | null;
    items: OrderItem[];
    orderType: 'dine-in' | 'delivery' | 'takeaway';
    status: 'pending' | 'in-progress' | 'ready' | 'completed';
    priority: 'normal' | 'high' | 'urgent';
    createdAt: Date;
    estimatedTime: number;
    timeRemaining: number;
    deliveryTime?: string;
    specialRequests?: string;
}

export default function KitchenDisplaySystem() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'ready'>('all');
    const [refreshInterval, setRefreshInterval] = useState<number>(5000);
    const { toast } = useToast();

    // Demo data for fallback
    const demoOrders: Order[] = [
        {
            _id: 'k1',
            orderNumber: 'ORD-2026-001',
            table: 5,
            items: [
                { name: 'Wagyu Beef Steak', quantity: 2, notes: 'Medium rare', status: 'in-progress', timeStarted: new Date(Date.now() - 10 * 60000) },
                { name: 'Truffle Risotto', quantity: 1, notes: '', status: 'ready', timeStarted: new Date(Date.now() - 15 * 60000) },
                { name: 'Soup of the Day', quantity: 2, notes: '', status: 'not-started', timeStarted: null },
            ],
            orderType: 'dine-in',
            status: 'in-progress',
            priority: 'normal',
            createdAt: new Date(Date.now() - 15 * 60000),
            estimatedTime: 25,
            timeRemaining: 10,
            specialRequests: 'No onions'
        },
        {
            _id: 'k2',
            orderNumber: 'ORD-2026-002',
            table: 3,
            items: [
                { name: 'Pan-Seared Salmon', quantity: 1, notes: 'No lemon', status: 'not-started', timeStarted: null },
                { name: 'Herb Roasted Chicken', quantity: 1, notes: '', status: 'not-started', timeStarted: null },
            ],
            orderType: 'dine-in',
            status: 'pending',
            priority: 'high',
            createdAt: new Date(Date.now() - 8 * 60000),
            estimatedTime: 20,
            timeRemaining: 15
        },
        {
            _id: 'k3',
            orderNumber: 'ORD-2026-003',
            table: null,
            items: [
                { name: 'Crispy Calamari', quantity: 2, notes: '', status: 'ready', timeStarted: new Date(Date.now() - 20 * 60000) },
                { name: 'Signature Cocktail', quantity: 3, notes: '', status: 'ready', timeStarted: new Date(Date.now() - 25 * 60000) },
            ],
            orderType: 'takeaway',
            status: 'ready',
            priority: 'normal',
            createdAt: new Date(Date.now() - 25 * 60000),
            estimatedTime: 15,
            timeRemaining: 0
        },
        {
            _id: 'k4',
            orderNumber: 'ORD-2026-004',
            table: 8,
            items: [
                { name: 'Seafood Platter', quantity: 1, notes: 'Extra sauce', status: 'in-progress', timeStarted: new Date(Date.now() - 5 * 60000) },
                { name: 'Lobster Thermidor', quantity: 1, notes: '', status: 'in-progress', timeStarted: new Date(Date.now() - 8 * 60000) },
            ],
            orderType: 'dine-in',
            status: 'in-progress',
            priority: 'urgent',
            createdAt: new Date(Date.now() - 10 * 60000),
            estimatedTime: 30,
            timeRemaining: 20,
            specialRequests: 'VIP guest - priority service'
        },
        {
            _id: 'k5',
            orderNumber: 'ORD-2026-005',
            table: null,
            items: [
                { name: 'Vegetable Wellington', quantity: 1, notes: 'Vegan', status: 'not-started', timeStarted: null },
                { name: 'Fresh Smoothie Bowl', quantity: 2, notes: '', status: 'not-started', timeStarted: null },
            ],
            orderType: 'delivery',
            status: 'pending',
            priority: 'normal',
            createdAt: new Date(Date.now() - 3 * 60000),
            estimatedTime: 20,
            timeRemaining: 18,
            deliveryTime: '14:30'
        }
    ];

    const demoStats = {
        activeOrders: 5,
        completedToday: 23,
        avgPrepTime: 18,
        longestWait: 25,
        ordersReadyForPickup: 1,
        staffOnDuty: 4,
        busyStatus: 'moderate'
    };

    useEffect(() => {
        fetchOrders();
        fetchStats();
        const interval = setInterval(() => {
            fetchOrders();
            fetchStats();
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found - using demo data');
                setOrders(demoOrders);
                setLoading(false);
                return;
            }
            const response = await fetch('/api/kitchen/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                console.warn('Failed to fetch kitchen orders - using demo data');
                setOrders(demoOrders);
                setLoading(false);
                return;
            }
            const data = await response.json();
            // Use API data if available, otherwise fallback to demo
            setOrders(data.orders && data.orders.length > 0 ? data.orders : demoOrders);
            setLoading(false);
        } catch (error) {
            console.warn('Error fetching kitchen orders - using demo data:', error);
            setOrders(demoOrders);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found - using demo stats');
                setStats(demoStats);
                return;
            }
            const response = await fetch('/api/kitchen/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                console.warn('Failed to fetch kitchen stats - using demo stats');
                setStats(demoStats);
                return;
            }
            const text = await response.text();
            // Check if response is JSON
            if (!text.startsWith('{') && !text.startsWith('[')) {
                console.warn('Failed to fetch kitchen stats: Not JSON - using demo stats');
                setStats(demoStats);
                return;
            }
            const data = JSON.parse(text);
            // Use API data if available, otherwise fallback to demo
            setStats(data && Object.keys(data).length > 0 ? data : demoStats);
        } catch (error) {
            console.warn('Failed to fetch kitchen stats - using demo:', error);
            setStats(demoStats);
        }
    };

    const updateItemStatus = async (orderId: string, itemIndex: number, newStatus: string) => {
        try {
            await fetch(`/api/kitchen/orders/${orderId}/items/${itemIndex}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            toast({ title: 'Success', description: `Item marked as ${newStatus}` });
            fetchOrders();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update item status',
                variant: 'destructive',
            });
        }
    };

    const completeOrder = async (orderId: string) => {
        try {
            await fetch(`/api/kitchen/orders/${orderId}/complete`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            toast({ title: 'Success', description: 'Order completed' });
            fetchOrders();
            setSelectedOrder(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to complete order',
                variant: 'destructive',
            });
        }
    };

    const filteredOrders =
        filter === 'all' ? orders : orders.filter((order) => order.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-600 text-white';
            case 'in-progress':
                return 'bg-yellow-600 text-white';
            case 'ready':
                return 'bg-green-600 text-white';
            case 'completed':
                return 'bg-gray-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Flame className="w-5 h-5 text-red-600" />;
            case 'high':
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
            default:
                return <UtensilsCrossed className="w-5 h-5 text-gray-600" />;
        }
    };

    const getItemStatusBg = (status: string) => {
        switch (status) {
            case 'not-started':
                return 'bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400';
            case 'in-progress':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
            case 'ready':
                return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
            case 'completed':
                return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
            default:
                return 'bg-gray-100 dark:bg-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            {/* Header & Stats */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ChefHat className="w-8 h-8" />
                        Kitchen Display System
                    </h1>
                    <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded px-3 py-2 text-sm"
                    >
                        <option value={3000}>Refresh: 3s</option>
                        <option value={5000}>Refresh: 5s</option>
                        <option value={10000}>Refresh: 10s</option>
                    </select>
                </div>

                {/* KPI Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Active Orders</div>
                            <div className="text-2xl font-bold text-blue-600">{stats.activeOrders}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Completed Today</div>
                            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Prep Time</div>
                            <div className="text-2xl font-bold text-purple-600">{stats.avgPrepTime}m</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Longest Wait</div>
                            <div className="text-2xl font-bold text-orange-600">{stats.longestWait}m</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Ready for Pickup</div>
                            <div className="text-2xl font-bold text-teal-600">{stats.ordersReadyForPickup}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Staff on Duty</div>
                            <div className="text-2xl font-bold text-indigo-600">{stats.staffOnDuty}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 md:col-span-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Busy Status</div>
                            <div
                                className={`text-lg font-bold mt-1 ${stats.busyStatus === 'busy'
                                    ? 'text-red-600'
                                    : stats.busyStatus === 'moderate'
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                                    }`}
                            >
                                {stats.busyStatus.toUpperCase()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'in-progress', 'ready'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-gray-700'
                            }`}
                    >
                        {f === 'all' ? 'All Orders' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No {filter !== 'all' ? filter : ''} orders at the moment</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((order) => {
                        const allItemsReady = order.items.every((item) => item.status === 'ready');

                        return (
                            <div
                                key={order._id}
                                onClick={() => setSelectedOrder(order)}
                                className={`rounded-lg border-2 cursor-pointer transition transform hover:scale-105 hover:shadow-lg ${allItemsReady
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : order.priority === 'urgent'
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : order.priority === 'high'
                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                    }`}
                            >
                                {/* Order Header */}
                                <div className="border-b dark:border-gray-700 p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getPriorityIcon(order.priority)}
                                        <div>
                                            <div className="font-bold text-lg text-gray-900 dark:text-white">
                                                {order.orderNumber}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {order.orderType === 'dine-in' && order.table
                                                    ? `Table ${order.table}`
                                                    : order.orderType === 'delivery'
                                                        ? `📦 Delivery - ${order.deliveryTime}`
                                                        : '📋 Takeaway'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded font-semibold text-sm ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </div>
                                </div>

                                {/* Timer */}
                                <div className="border-b dark:border-gray-700 p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Est: {order.estimatedTime}m
                                        </span>
                                    </div>
                                    <div
                                        className={`text-lg font-bold ${order.timeRemaining <= 5
                                            ? 'text-red-600'
                                            : order.timeRemaining <= 10
                                                ? 'text-orange-600'
                                                : 'text-green-600'
                                            }`}
                                    >
                                        {order.timeRemaining}m left
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
                                    {order.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded border ${getItemStatusBg(item.status)}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {item.quantity}x{' '}
                                                        </span>
                                                        <span className="text-gray-900 dark:text-white">
                                                            {item.name}
                                                        </span>
                                                        {item.status === 'ready' && (
                                                            <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                                                        )}
                                                    </div>
                                                    {item.notes && (
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                            Note: {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick Status Buttons */}
                                            <div className="flex gap-1 mt-2 text-xs">
                                                {item.status !== 'in-progress' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateItemStatus(order._id, idx, 'in-progress');
                                                        }}
                                                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {item.status !== 'ready' && item.status !== 'completed' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateItemStatus(order._id, idx, 'ready');
                                                        }}
                                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition"
                                                    >
                                                        Ready
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Complete Button */}
                                {allItemsReady && (
                                    <div className="border-t dark:border-gray-700 p-3">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                completeOrder(order._id);
                                            }}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            Mark Order Complete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Detail Dialog */}
            {selectedOrder && (
                <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Order Info */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Order Type</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.orderType === 'dine-in'
                                                ? `Table ${selectedOrder.table}`
                                                : selectedOrder.orderType === 'delivery'
                                                    ? `Delivery ${selectedOrder.deliveryTime}`
                                                    : 'Takeaway'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.status.charAt(0).toUpperCase() +
                                                selectedOrder.status.slice(1)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Priority</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.priority.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Time Remaining</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.timeRemaining} minutes
                                        </p>
                                    </div>
                                </div>

                                {selectedOrder.specialRequests && (
                                    <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
                                        <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                                            SPECIAL REQUEST
                                        </p>
                                        <p className="text-sm text-yellow-900 dark:text-yellow-200 mt-1">
                                            {selectedOrder.specialRequests}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Items</h3>
                                {selectedOrder.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded border ${getItemStatusBg(item.status)}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {item.quantity}x {item.name}
                                                </p>
                                                {item.notes && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs font-semibold bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                                {item.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            {['not-started', 'in-progress', 'ready', 'completed'].map(
                                                (status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateItemStatus(selectedOrder._id, idx, status)}
                                                        className={`flex-1 px-2 py-1 rounded transition ${item.status === status
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {status === 'not-started'
                                                            ? 'Start'
                                                            : status.charAt(0).toUpperCase() +
                                                            status.slice(1)}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Close Button */}
                            <Button onClick={() => setSelectedOrder(null)} className="w-full">
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
