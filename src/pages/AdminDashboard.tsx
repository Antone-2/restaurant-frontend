import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { menuApi, ordersApi, reservationsApi, parkingApi, eventsApi, adminApi } from '../services/api';
import useSocket from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Menu, X, Home, ShoppingCart, ShoppingBag, CalendarDays,
    Building2, Users, DollarSign, Car, Megaphone, PartyPopper,
    ChefHat, Package, BarChart3, LogOut, Plus, Trash2, Edit,
    RefreshCw, Bell, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

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
                    <Label htmlFor="popular" className="text-sm font-normal">Popular</Label>
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

// Sidebar Navigation Item
interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'menu', label: 'Menu', icon: <ChefHat className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'tables', label: 'Tables', icon: <Building2 className="w-5 h-5" /> },
    { id: 'kitchen', label: 'Kitchen', icon: <ChefHat className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
    { id: 'staff', label: 'Staff', icon: <Users className="w-5 h-5" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="w-5 h-5" /> },
    { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'events', label: 'Events', icon: <PartyPopper className="w-5 h-5" /> },
];

// Mobile Bottom Navigation
function BottomNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-pb">
            <div className="flex items-center justify-around py-2">
                {navItems.slice(0, 5).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center justify-center p-2 min-w-[60px] rounded-lg transition-colors ${activeTab === item.id
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-500'
                            }`}
                    >
                        <div className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </button>
                ))}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center justify-center p-2 min-w-[60px] rounded-lg text-gray-500">
                            <Menu className="w-5 h-5" />
                            <span className="text-[10px] mt-1 font-medium">More</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-4 gap-4 pt-4">
                            {navItems.slice(5).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${activeTab === item.id
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    {item.icon}
                                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}

export function AdminDashboard() {
    const { user, logout } = useAuth();
    const { lastEvent } = useSocket({ autoConnect: true, isAdmin: true });
    const [activeTab, setActiveTab] = useState('analytics');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menu, setMenu] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [parking, setParking] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [revenue, setRevenue] = useState<any>(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isMobile, setIsMobile] = useState(false);

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

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'menu':
                return (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Menu Items ({menu.length})</CardTitle>
                                <CardDescription>Manage your restaurant menu</CardDescription>
                            </div>
                            <Button onClick={() => { setEditingMenuItem(null); setMenuFormOpen(true); }} size="sm">
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                {(menu || []).map((item: any, idx: number) => (
                                    <div key={item._id || `menu-${idx}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">{item.name}</p>
                                                {item.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                                                {!item.available && <Badge variant="destructive" className="text-xs">Unavailable</Badge>}
                                            </div>
                                            <p className="text-sm text-gray-500">KES {item.price} • {item.category}</p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <Button size="sm" variant="ghost" onClick={() => openEditMenu(item)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { setDeletingItem({ type: 'menu', id: item._id }); setDeleteDialogOpen(true); }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'orders':
                return (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Orders ({orders.length})</CardTitle>
                                <CardDescription>Manage customer orders</CardDescription>
                            </div>
                            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Filter" />
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
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {(orders || []).map((order: any, idx: number) => (
                                    <div key={order._id || `order-${idx}`} className="p-4 border rounded-lg bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold truncate">{order.customerName}</p>
                                                <p className="text-xs text-gray-500">{order._id}</p>
                                                <p className="text-sm truncate">{order.email}</p>
                                            </div>
                                            <div className="text-right ml-2">
                                                <p className="font-bold">{formatCurrency(order.total)}</p>
                                                <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                            <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order._id, value)}>
                                                <SelectTrigger className="h-8 w-28">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'reservations':
                return (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Reservations ({reservations.length})</CardTitle>
                                <CardDescription>Manage table reservations</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={reservationDateFilter}
                                    onChange={(e) => setReservationDateFilter(e.target.value)}
                                    className="w-32 h-8 bg-white"
                                />
                                <Select value={reservationStatusFilter} onValueChange={setReservationStatusFilter}>
                                    <SelectTrigger className="w-28 h-8">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {(reservations || []).map((res: any, idx: number) => (
                                    <div key={res._id || `res-${idx}`} className="p-4 border rounded-lg bg-white">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold">{res.name}</p>
                                                <p className="text-sm text-gray-600">{res.phone}</p>
                                                <p className="text-sm mt-1">
                                                    <CalendarDays className="w-3 h-3 inline mr-1" />
                                                    {res.date} at {res.time}
                                                </p>
                                                <p className="text-sm">
                                                    <Users className="w-3 h-3 inline mr-1" />
                                                    {res.guests} guests
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 ml-2">
                                                <Badge className={getStatusColor(res.status)}>{res.status}</Badge>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => { setEditingReservation(res); setReservationEditOpen(true); }}>
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    {res.status === 'pending' && (
                                                        <Button size="sm" className="bg-green-500 hover:bg-green-600 h-7" onClick={() => handleUpdateReservationStatus(res._id, 'confirmed')}>
                                                            ✓
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
                );
            case 'tables':
                return <TableManagement />;
            case 'kitchen':
                return <KitchenDisplaySystem />;
            case 'inventory':
                return <InventoryDashboard />;
            case 'staff':
                return <StaffManagement />;
            case 'revenue':
                return (
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Revenue Reports</CardTitle>
                            <CardDescription>View revenue analytics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {['daily', 'weekly', 'monthly'].map((period) => (
                                    <Button
                                        key={period}
                                        variant={revenuePeriod === period ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setRevenuePeriod(period)}
                                    >
                                        {period.charAt(0).toUpperCase() + period.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            {revenue && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                                        <p className="text-sm opacity-80">Total Revenue</p>
                                        <p className="text-xl font-bold">{formatCurrency(revenue.totalRevenue)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
                                        <p className="text-sm opacity-80">Total Orders</p>
                                        <p className="text-xl font-bold">{revenue.orderCount}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                                        <p className="text-sm opacity-80">Avg Order</p>
                                        <p className="text-xl font-bold">{formatCurrency(revenue.averageOrderValue)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'parking':
                return (
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Parking ({parking.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {(parking || []).map((slot: any, idx: number) => (
                                    <div key={slot._id || `parking-${idx}`} className="p-3 border rounded-lg bg-white">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{slot.name}</p>
                                                <p className="text-sm text-gray-500">{slot.vehiclePlate}</p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800">Slot {slot.slotNumber}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'marketing':
                return <MarketingPromotions />;
            case 'events':
                return (
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">Events ({events.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {(events || []).map((event: any, idx: number) => (
                                    <div key={event._id || `event-${idx}`} className="p-3 border rounded-lg bg-white">
                                        <p className="font-medium">{event.eventType}</p>
                                        <p className="text-sm text-gray-500">{event.name}</p>
                                        <p className="text-sm">{event.date} • {event.guests} guests</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header - Mobile */}
            <div className="md:hidden bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 bg-slate-900 border-slate-700">
                                <div className="flex flex-col h-full">
                                    <div className="p-4 border-b border-slate-700">
                                        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                                        <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto py-4">
                                        {navItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setActiveTab(item.id); setSidebarOpen(true); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === item.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-300 hover:bg-slate-800'
                                                    }`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-slate-700">
                                        <Button variant="destructive" className="w-full" onClick={logout}>
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <div>
                            <h1 className="text-white font-bold text-lg">Admin</h1>
                            <p className="text-gray-400 text-xs">Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={loadAllData} className="text-white">
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <div
                    className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-16'
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            {sidebarOpen && (
                                <div>
                                    <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-400 hover:text-white"
                            >
                                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </Button>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto py-4">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === item.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={activeTab === item.id ? 'text-white' : 'text-gray-400'}>
                                        {item.icon}
                                    </div>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10">
                            {sidebarOpen ? (
                                <Button variant="destructive" className="w-full" onClick={logout}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            ) : (
                                <Button variant="destructive" size="icon" onClick={logout}>
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'} ${isMobile ? 'ml-0' : ''}`}>
                {/* Desktop Header */}
                <div className="hidden md:block bg-black/20 backdrop-blur-xl border-b border-white/10">
                    <div className="flex justify-between items-center p-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}</h1>
                            <p className="text-gray-400">Welcome back, {user?.name || user?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={loadAllData} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <Alert variant="destructive" className="m-4 md:mx-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {successMsg && (
                    <Alert className="m-4 md:mx-6 bg-green-100 border-green-300">
                        <AlertDescription className="text-green-800">{successMsg}</AlertDescription>
                    </Alert>
                )}

                {/* Content */}
                <div className="p-4 md:p-6 pb-24 md:pb-6">
                    {renderContent()}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Menu Item Form Dialog */}
            <Dialog open={menuFormOpen} onOpenChange={setMenuFormOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
