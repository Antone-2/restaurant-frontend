import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { menuApi, ordersApi, reservationsApi, parkingApi, eventsApi, adminApi } from '../services/api';
import useSocket from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// Import new components
import TableManagement from '@/components/TableManagement';
import KitchenDisplaySystem from '@/components/KitchenDisplaySystem';
import InventoryDashboard from '@/components/InventoryDashboard';
import StaffManagement from '@/components/StaffManagement';
import MarketingPromotions from '@/components/MarketingPromotions';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

// Menu Item Form Component
interface MenuItemFormProps {
    item?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

function MenuItemForm({ item, onSave, onCancel }: MenuItemFormProps) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price?.toString() || '',
        category: item?.category || 'mains',
        image: item?.image || '',
        popular: item?.popular || false,
        available: item?.available !== false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: parseInt(formData.price)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Item name"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Item description"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price (KES) *</Label>
                    <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="starters">Starters</SelectItem>
                            <SelectItem value="mains">Mains</SelectItem>
                            <SelectItem value="sides">Sides</SelectItem>
                            <SelectItem value="desserts">Desserts</SelectItem>
                            <SelectItem value="drinks">Drinks</SelectItem>
                            <SelectItem value="specials">Specials</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                />
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="popular"
                        checked={formData.popular}
                        onCheckedChange={(checked) => setFormData({ ...formData, popular: checked as boolean })}
                    />
                    <Label htmlFor="popular" className="text-sm font-normal">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="available"
                        checked={formData.available}
                        onCheckedChange={(checked) => setFormData({ ...formData, available: checked as boolean })}
                    />
                    <Label htmlFor="available" className="text-sm font-normal">Available</Label>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{item ? 'Update' : 'Add'} Item</Button>
            </div>
        </form>
    );
}

// Reservation Edit Form Component
interface ReservationEditFormProps {
    reservation: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

function ReservationEditForm({ reservation, onSave, onCancel }: ReservationEditFormProps) {
    const [formData, setFormData] = useState({
        name: reservation?.name || '',
        email: reservation?.email || '',
        phone: reservation?.phone || '',
        date: reservation?.date || '',
        time: reservation?.time || '',
        guests: reservation?.guests?.toString() || '',
        tableName: reservation?.tableName || '',
        specialRequests: reservation?.specialRequests || '',
        status: reservation?.status || 'confirmed'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            guests: parseInt(formData.guests)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="res-name">Name *</Label>
                    <Input
                        id="res-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="res-email">Email *</Label>
                    <Input
                        id="res-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="res-phone">Phone *</Label>
                    <Input
                        id="res-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="res-guests">Guests *</Label>
                    <Input
                        id="res-guests"
                        type="number"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        required
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="res-date">Date *</Label>
                    <Input
                        id="res-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="res-time">Time *</Label>
                    <Input
                        id="res-time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="res-table">Table</Label>
                <Input
                    id="res-table"
                    value={formData.tableName}
                    onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                    placeholder="Table number or name"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="res-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="res-requests">Special Requests</Label>
                <Textarea
                    id="res-requests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Any special requests..."
                />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}

// Delete Confirmation Dialog
interface DeleteDialogProps {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteDialog({ open, title, description, onConfirm, onCancel }: DeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={open ? onCancel : undefined}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function AdminDashboard() {
    const { user, logout } = useAuth();
    const { lastEvent } = useSocket({ autoConnect: true, isAdmin: true });
    const [activeTab, setActiveTab] = useState('analytics');
    const [menu, setMenu] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [parking, setParking] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [revenue, setRevenue] = useState<any>(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Filters
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [reservationDateFilter, setReservationDateFilter] = useState('');
    const [reservationStatusFilter, setReservationStatusFilter] = useState('all');
    const [revenuePeriod, setRevenuePeriod] = useState('monthly');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    // Modals
    const [menuFormOpen, setMenuFormOpen] = useState(false);
    const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{ type: string; id: string } | null>(null);
    const [reservationEditOpen, setReservationEditOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<any>(null);

    // Load data
    useEffect(() => {
        loadAllData();
    }, []);

    // Listen for real-time updates via Socket.io
    useEffect(() => {
        if (lastEvent) {
            if (lastEvent.type === 'order:new' || lastEvent.type === 'order:updated' || lastEvent.type === 'order:statusChanged') {
                loadOrders();
            }
            if (lastEvent.type === 'reservation:new' || lastEvent.type === 'reservation:updated' || lastEvent.type === 'reservation:statusChanged') {
                loadReservations();
            }
        }
    }, [lastEvent]);

    useEffect(() => {
        if (activeTab === 'orders') {
            loadOrders();
        } else if (activeTab === 'reservations') {
            loadReservations();
        } else if (activeTab === 'analytics') {
            loadAnalytics();
        } else if (activeTab === 'revenue') {
            loadRevenue();
        }
    }, [activeTab, orderStatusFilter, reservationDateFilter, reservationStatusFilter, revenuePeriod, dateRange]);

    const loadAllData = async () => {
        try {
            const [menuData, ordersData, reservationsData, parkingData, eventsData, analyticsData]: any[] = await Promise.all([
                menuApi.getAll(),
                ordersApi.getAll(),
                reservationsApi.getAll(),
                parkingApi.getAll(),
                eventsApi.getAll(),
                adminApi.getAnalytics()
            ]);

            // Extract data from paginated responses
            const extractData = (response: any) => {
                if (Array.isArray(response)) return response;
                return response?.data ? response.data : [];
            };

            setMenu(extractData(menuData));
            setOrders(extractData(ordersData));
            setReservations(extractData(reservationsData));
            setParking(extractData(parkingData));
            setEvents(extractData(eventsData));
            setAnalytics(analyticsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
        }
    };

    const loadOrders = async () => {
        try {
            const filters: any = {};
            if (orderStatusFilter !== 'all') filters.status = orderStatusFilter;
            const data = await adminApi.getAllOrders(filters);
            setOrders(data);
        } catch (err: any) {
            console.error('Failed to load orders:', err);
        }
    };

    const loadReservations = async () => {
        try {
            const data = await reservationsApi.getAll();
            let filtered = data;
            if (reservationDateFilter) {
                filtered = filtered.filter((r: any) => r.date === reservationDateFilter);
            }
            if (reservationStatusFilter !== 'all') {
                filtered = filtered.filter((r: any) => r.status === reservationStatusFilter);
            }
            setReservations(filtered);
        } catch (err: any) {
            console.error('Failed to load reservations:', err);
        }
    };

    const loadAnalytics = async () => {
        try {
            const data = await adminApi.getAnalytics();
            setAnalytics(data);
        } catch (err: any) {
            console.error('Failed to load analytics:', err);
        }
    };

    const loadRevenue = async () => {
        try {
            const filters: any = { period: revenuePeriod };
            if (dateRange.startDate && dateRange.endDate) {
                filters.startDate = dateRange.startDate;
                filters.endDate = dateRange.endDate;
            }
            const data = await adminApi.getRevenue(filters);
            setRevenue(data);
        } catch (err: any) {
            console.error('Failed to load revenue:', err);
        }
    };

    // Menu Management
    const handleAddMenuItem = async (data: any) => {
        try {
            await menuApi.create(data);
            setSuccessMsg('Menu item added successfully');
            setMenuFormOpen(false);
            setTimeout(() => loadAllData(), 500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEditMenuItem = async (data: any) => {
        try {
            await menuApi.update(editingMenuItem._id, data);
            setSuccessMsg('Menu item updated successfully');
            setEditingMenuItem(null);
            setMenuFormOpen(false);
            setTimeout(() => loadAllData(), 500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteMenu = async () => {
        if (!deletingItem || deletingItem.type !== 'menu') return;
        try {
            await menuApi.delete(deletingItem.id);
            setSuccessMsg('Menu item deleted');
            setDeleteDialogOpen(false);
            setDeletingItem(null);
            setTimeout(() => loadAllData(), 500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const openEditMenu = (item: any) => {
        setEditingMenuItem(item);
        setMenuFormOpen(true);
    };

    // Order Management
    const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
        try {
            await ordersApi.updateStatus(id, newStatus);
            setSuccessMsg('Order status updated');
            setTimeout(() => loadOrders(), 500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Reservation Management
    const handleUpdateReservationStatus = async (id: string, status: string) => {
        try {
            await reservationsApi.updateStatus(id, status);
            setSuccessMsg('Reservation status updated');
            setTimeout(() => loadReservations(), 500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEditReservation = async (data: any) => {
        try {
            await reservationsApi.update(editingReservation._id, data);
            setSuccessMsg('Reservation updated successfully');
            setReservationEditOpen(false);
            setEditingReservation(null);
            setTimeout(() => loadReservations(), 500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteReservation = async () => {
        if (!deletingItem || deletingItem.type !== 'reservation') return;
        try {
            await reservationsApi.delete(deletingItem.id);
            setSuccessMsg('Reservation deleted');
            setDeleteDialogOpen(false);
            setDeletingItem(null);
            setTimeout(() => loadReservations(), 500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-purple-100 text-purple-800',
            ready: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    // Clear messages
    useEffect(() => {
        if (error || successMsg) {
            const timer = setTimeout(() => {
                setError('');
                setSuccessMsg('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, successMsg]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Header */}
            <div className="bg-black text-white p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-400">Welcome, {user?.name || user?.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={loadAllData}>
                        Refresh
                    </Button>
                    <Button variant="destructive" onClick={logout}>
                        Logout
                    </Button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <Alert variant="destructive" className="m-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {successMsg && (
                <Alert className="m-6 bg-green-100 border-green-300">
                    <AlertDescription className="text-green-800">{successMsg}</AlertDescription>
                </Alert>
            )}

            {/* Tabs */}
            <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList key="tabs-list" className="grid w-full max-w-6xl grid-cols-12">
                        <TabsTrigger key="analytics" value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger key="menu" value="menu">Menu</TabsTrigger>
                        <TabsTrigger key="orders" value="orders">Orders</TabsTrigger>
                        <TabsTrigger key="reservations" value="reservations">Reservations</TabsTrigger>
                        <TabsTrigger key="tables" value="tables">Tables</TabsTrigger>
                        <TabsTrigger key="kitchen" value="kitchen">Kitchen</TabsTrigger>
                        <TabsTrigger key="inventory" value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger key="staff" value="staff">Staff</TabsTrigger>
                        <TabsTrigger key="revenue" value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger key="parking" value="parking">Parking</TabsTrigger>
                        <TabsTrigger key="marketing" value="marketing">Marketing</TabsTrigger>
                        <TabsTrigger key="events" value="events">Events</TabsTrigger>
                    </TabsList>
                    {/* Analytics Tab */}
                    <TabsContent key="analytics-content" value="analytics" className="space-y-4">
                        <AnalyticsDashboard />
                    </TabsContent>

                    {/* Menu Tab */}
                    <TabsContent key="menu-content" value="menu" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Menu Items ({menu.length})</CardTitle>
                                    <CardDescription>Manage your restaurant menu</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingMenuItem(null); setMenuFormOpen(true); }}>
                                    Add New Item
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {(menu || []).map((item: any, idx: number) => (
                                        <div key={item._id || `menu-${idx}`} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{item.name}</p>
                                                    {item.popular && <Badge variant="secondary">Popular</Badge>}
                                                    {!item.available && <Badge variant="destructive">Unavailable</Badge>}
                                                </div>
                                                <p className="text-sm text-gray-600">KES {item.price} • {item.category}</p>
                                                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => openEditMenu(item)}>
                                                    Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => { setDeletingItem({ type: 'menu', id: item._id }); setDeleteDialogOpen(true); }}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent key="orders-content" value="orders" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Orders ({orders.length})</CardTitle>
                                    <CardDescription>Manage customer orders</CardDescription>
                                </div>
                                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="ready">Ready</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {(orders || []).map((order: any, idx: number) => (
                                        <div key={order._id || `order-${idx}`} className="p-4 border rounded bg-white">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold">{order.customerName}</p>
                                                    <p className="text-xs text-gray-500">{order._id}</p>
                                                    <p className="text-sm">{order.email}</p>
                                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">KES {order.total}</p>
                                                    <p className="text-xs text-gray-500">{order.paymentMethod} • {order.paymentStatus}</p>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="mt-2 p-2 bg-gray-50 rounded">
                                                {(order.items || []).map((item: any, idx: number) => (
                                                    <div key={`${order._id}-item-${idx}`} className="text-sm flex justify-between">
                                                        <span>{item.name} x{item.quantity}</span>
                                                        <span>KES {item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-3 flex items-center gap-2">
                                                <Label>Status:</Label>
                                                <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order._id, value)}>
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="preparing">Preparing</SelectItem>
                                                        <SelectItem value="ready">Ready</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reservations Tab */}
                    <TabsContent key="reservations-content" value="reservations" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Reservations ({reservations.length})</CardTitle>
                                    <CardDescription>Manage table reservations</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={reservationDateFilter}
                                        onChange={(e) => setReservationDateFilter(e.target.value)}
                                        className="w-40 bg-white"
                                    />
                                    <Select value={reservationStatusFilter} onValueChange={setReservationStatusFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {(reservations || []).map((res: any, idx: number) => (
                                        <div key={res._id || `res-${idx}`} className="p-4 border rounded bg-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{res.name}</p>
                                                    <p className="text-sm text-gray-600">{res.email}</p>
                                                    <p className="text-sm text-gray-600">{res.phone}</p>
                                                    <p className="text-sm mt-2">
                                                        <strong>Date:</strong> {res.date} at {res.time}
                                                    </p>
                                                    <p className="text-sm">
                                                        <strong>Guests:</strong> {res.guests} • <strong>Table:</strong> {res.tableName || 'Not assigned'}
                                                    </p>
                                                    {res.specialRequests && (
                                                        <p className="text-xs text-gray-500 mt-1">Notes: {res.specialRequests}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Badge className={getStatusColor(res.status)}>{res.status}</Badge>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" onClick={() => { setEditingReservation(res); setReservationEditOpen(true); }}>
                                                            Edit
                                                        </Button>
                                                        {res.status === 'pending' && (
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateReservationStatus(res._id, 'confirmed')}>
                                                                Confirm
                                                            </Button>
                                                        )}
                                                        {res.status === 'confirmed' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleUpdateReservationStatus(res._id, 'completed')}>
                                                                Complete
                                                            </Button>
                                                        )}
                                                        {res.status !== 'cancelled' && res.status !== 'completed' && (
                                                            <Button size="sm" variant="destructive" onClick={() => { setDeletingItem({ type: 'reservation', id: res._id }); setDeleteDialogOpen(true); }}>
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tables Tab */}
                    <TabsContent key="tables-content" value="tables" className="space-y-4">
                        <TableManagement />
                    </TabsContent>

                    {/* Kitchen Tab */}
                    <TabsContent key="kitchen-content" value="kitchen" className="space-y-4">
                        <KitchenDisplaySystem />
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent key="inventory-content" value="inventory" className="space-y-4">
                        <InventoryDashboard />
                    </TabsContent>

                    {/* Staff Tab */}
                    <TabsContent key="staff-content" value="staff" className="space-y-4">
                        <StaffManagement />
                    </TabsContent>

                    {/* Revenue Tab */}
                    <TabsContent key="revenue-content" value="revenue" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Reports</CardTitle>
                                <CardDescription>View revenue analytics and reports</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 mb-6">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={revenuePeriod === 'daily' ? 'default' : 'outline'}
                                            onClick={() => setRevenuePeriod('daily')}
                                        >
                                            Daily
                                        </Button>
                                        <Button
                                            variant={revenuePeriod === 'weekly' ? 'default' : 'outline'}
                                            onClick={() => setRevenuePeriod('weekly')}
                                        >
                                            Weekly
                                        </Button>
                                        <Button
                                            variant={revenuePeriod === 'monthly' ? 'default' : 'outline'}
                                            onClick={() => setRevenuePeriod('monthly')}
                                        >
                                            Monthly
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="date"
                                            value={dateRange.startDate}
                                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                            className="w-40 bg-white"
                                            placeholder="Start Date"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <Input
                                            type="date"
                                            value={dateRange.endDate}
                                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                            className="w-40 bg-white"
                                            placeholder="End Date"
                                        />
                                    </div>
                                </div>

                                {revenue && (
                                    <>
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{formatCurrency(revenue.totalRevenue)}</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{revenue.orderCount}</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{formatCurrency(revenue.averageOrderValue)}</div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Daily Revenue Chart */}
                                        <Card className="mb-4">
                                            <CardHeader>
                                                <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {(revenue.dailyRevenue || []).map((day: any, idx: number) => (
                                                        <div key={`day-${idx}-${day.date}`} className="flex justify-between items-center">
                                                            <span className="text-sm w-24">{day.date}</span>
                                                            <div className="flex-1 mx-4 h-4 bg-gray-200 rounded overflow-hidden">
                                                                <div
                                                                    className="h-full bg-green-500"
                                                                    style={{ width: `${revenue.dailyRevenue ? (day.revenue / Math.max(...revenue.dailyRevenue.map((d: any) => d.revenue))) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium w-28 text-right">{formatCurrency(day.revenue)}</span>
                                                            <span className="text-xs text-gray-500 w-16 text-right">({day.orders} orders)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Monthly Revenue Chart */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Monthly Revenue (Last 12 Months)</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {(revenue.monthlyRevenue || []).map((month: any, idx: number) => (
                                                        <div key={`month-${idx}-${month.month}`} className="flex justify-between items-center">
                                                            <span className="text-sm w-16">{month.month}</span>
                                                            <div className="flex-1 mx-4 h-4 bg-gray-200 rounded overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500"
                                                                    style={{ width: `${revenue.monthlyRevenue ? (month.revenue / Math.max(...revenue.monthlyRevenue.map((m: any) => m.revenue))) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium w-28 text-right">{formatCurrency(month.revenue)}</span>
                                                            <span className="text-xs text-gray-500 w-16 text-right">({month.orders} orders)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Parking Tab */}
                    <TabsContent key="parking-content" value="parking" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Parking Reservations ({parking.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {(parking || []).map((slot: any, idx: number) => (
                                        <div key={slot._id || `parking-${idx}`} className="p-4 border rounded bg-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{slot.name}</p>
                                                    <p className="text-sm text-gray-600">{slot.vehiclePlate}</p>
                                                    <p className="text-sm">{slot.date} • {slot.time}</p>
                                                    <p className="text-xs text-gray-500">{slot.email} | {slot.phone}</p>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-800">Slot {slot.slotNumber}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Marketing Tab */}
                    <TabsContent key="marketing-content" value="marketing" className="space-y-4">
                        <MarketingPromotions />
                    </TabsContent>

                    {/* Events Tab */}
                    <TabsContent key="events-content" value="events" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Inquiries ({events.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {(events || []).map((event: any, idx: number) => (
                                        <div key={event._id || `event-${idx}`} className="p-4 border rounded bg-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{event.eventType}</p>
                                                    <p className="text-sm text-gray-600">{event.name}</p>
                                                    <p className="text-sm">{event.date} • {event.guests} guests</p>
                                                    <p className="text-xs text-gray-500">{event.email} | {event.phone}</p>
                                                </div>
                                                <Badge className="bg-purple-100 text-purple-800">New</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Menu Item Form Dialog */}
            <Dialog open={menuFormOpen} onOpenChange={setMenuFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                    </DialogHeader>
                    <MenuItemForm
                        item={editingMenuItem}
                        onSave={editingMenuItem ? handleEditMenuItem : handleAddMenuItem}
                        onCancel={() => { setMenuFormOpen(false); setEditingMenuItem(null); }}
                    />
                </DialogContent>
            </Dialog>

            {/* Reservation Edit Dialog */}
            <Dialog open={reservationEditOpen} onOpenChange={setReservationEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Reservation</DialogTitle>
                    </DialogHeader>
                    <ReservationEditForm
                        reservation={editingReservation}
                        onSave={handleEditReservation}
                        onCancel={() => { setReservationEditOpen(false); setEditingReservation(null); }}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                title="Delete Item"
                description={deletingItem?.type === 'menu'
                    ? "Are you sure you want to delete this menu item? This action cannot be undone."
                    : "Are you sure you want to cancel this reservation? This action cannot be undone."
                }
                onConfirm={deletingItem?.type === 'menu' ? handleDeleteMenu : handleDeleteReservation}
                onCancel={() => { setDeleteDialogOpen(false); setDeletingItem(null); }}
            />
        </div>
    );
}

export default AdminDashboard;
