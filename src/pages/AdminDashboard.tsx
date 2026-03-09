import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { menuApi, ordersApi, reservationsApi, parkingApi, eventsApi, adminApi, specialEventsApi } from '../services/api';
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
import ThemeToggle from '@/components/ThemeToggle';
import AdminNotificationBanner, { useNotificationBanners } from '@/components/AdminNotificationBanner';
import { ConfirmDialogStandalone } from '@/components/ConfirmDialog';
import {
    Menu, ShoppingBag, CalendarDays,
    Building2, Users, DollarSign, Car, Megaphone, PartyPopper,
    ChefHat, Package, BarChart3, LogOut, Plus, Trash2, Edit,
    RefreshCw, Bell, ChevronLeft, ChevronRight, Star, Calendar, Clock, Bed, Handshake, ShoppingCart
} from 'lucide-react';

// Helper function to calculate parking price
const calculateParkingPrice = (vehicleType: string, duration: number) => {
    const prices: { [key: string]: number } = {
        'sedan': 200, 'suv': 250, 'van': 300, 'motorcycle': 150,
        'Sedan': 200, 'SUV': 250, 'Van': 300, 'Motorcycle': 150
    };
    return (duration || 1) * (prices[vehicleType] || 200);
};

// Import new components
import TableManagement from '@/components/TableManagement';
import InventoryDashboard from '@/components/InventoryDashboard';
import StaffManagement from '@/components/StaffManagement';
import OrderManagement from '@/components/OrderManagement';
import MarketingPromotions from '@/components/MarketingPromotions';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ReservationCalendar from '@/components/ReservationCalendar';
import CustomerEngagementDashboard from '@/components/CustomerEngagementDashboard';
import AccommodationManagement from '@/components/AccommodationManagement';
import MenuManagement from '@/components/MenuManagement';

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
    const handleOpenChange = (isOpen: boolean) => {
        // Only close the dialog if the user explicitly cancels (clicks outside or presses escape)
        // The Delete button has its own onClick handler that calls onConfirm
        if (!isOpen && open) {
            onCancel();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'engagement', label: 'Engagement', icon: <Users className="w-5 h-5" /> },
    { id: 'menu', label: 'Menu', icon: <ChefHat className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'tables', label: 'Tables', icon: <Building2 className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
    { id: 'staff', label: 'Staff', icon: <Users className="w-5 h-5" /> },
    { id: 'accommodations', label: 'Accommodations', icon: <Bed className="w-5 h-5" /> },
    { id: 'partnerships', label: 'Partnerships', icon: <Handshake className="w-5 h-5" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="w-5 h-5" /> },
    { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'events', label: 'Events', icon: <PartyPopper className="w-5 h-5" /> },
    { id: 'special-events', label: 'Special Events', icon: <Calendar className="w-5 h-5" /> },
];

// Mobile Bottom Navigation
function BottomNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 md:hidden z-50 safe-area-pb">
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

    // Notification banners state
    const { banners, addBanner, removeBanner, clearBanners } = useNotificationBanners();

    // Theme state management
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const initialTheme = savedTheme || systemTheme;
        setTheme(initialTheme);
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    // Get saved tab from localStorage or default to 'analytics'
    const getSavedTab = () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('adminActiveTab');
            if (saved && navItems.find(n => n.id === saved)) {
                return saved;
            }
        }
        return 'analytics';
    };

    // Get cleared notification IDs from localStorage
    const getClearedNotificationIds = (): string[] => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('clearedNotificationIds');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    };

    // Save cleared notification IDs to localStorage
    const saveClearedNotificationIds = (ids: string[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('clearedNotificationIds', JSON.stringify(ids));
        }
    };

    const [activeTab, setActiveTab] = useState(getSavedTab());
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menu, setMenu] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [parking, setParking] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [specialEvents, setSpecialEvents] = useState<any[]>([]);
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
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [dateRange] = useState({ startDate: '', endDate: '' });
    const [notifications, setNotifications] = useState<any[]>([]);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [accommodations, setAccommodations] = useState<any[]>([]);
    const [partnerships, setPartnerships] = useState<any[]>([]);
    const [accommodationFilter, setAccommodationFilter] = useState({ type: 'all', status: 'all' });
    const [partnershipFilter, setPartnershipFilter] = useState({ type: 'all', status: 'all', category: 'all' });

    // Modals
    const [menuFormOpen, setMenuFormOpen] = useState(false);
    const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{ type: string; id: string } | null>(null);
    const [reservationEditOpen, setReservationEditOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<any>(null);

    // Delete confirmation dialogs
    const [specialEventDeleteOpen, setSpecialEventDeleteOpen] = useState(false);
    const [deletingSpecialEventId, setDeletingSpecialEventId] = useState<string | null>(null);
    const [partnershipDeleteOpen, setPartnershipDeleteOpen] = useState(false);
    const [deletingPartnershipId, setDeletingPartnershipId] = useState<string | null>(null);

    // Parking Management
    const [parkingDialogOpen, setParkingDialogOpen] = useState(false);
    const [editingParking, setEditingParking] = useState<any>(null);
    const [parkingForm, setParkingForm] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'Sedan',
        vehiclePlate: '',
        date: '',
        time: '',
        duration: 1,
        slotNumber: '',
        paymentStatus: 'unpaid',
        paymentMethod: ''
    });
    const [parkingDeleteOpen, setParkingDeleteOpen] = useState(false);
    const [deletingParkingId, setDeletingParkingId] = useState<string | null>(null);
    const [parkingDetailsOpen, setParkingDetailsOpen] = useState(false);
    const [selectedParking, setSelectedParking] = useState<any>(null);

    // Notification details dialog
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);

    // Get notification details based on type
    const getNotificationDetails = (notification: any) => {
        const data = notification.data || {};
        const type = notification.type;

        switch (type) {
            case 'order:new':
            case 'order:statusChanged':
            case 'order:updated':
                // Handle items with either item.name or item.menuItemId?.name
                const getItemName = (item: any) => item.name || item.menuItemId?.name || item.menuItemId?.toString() || 'Unknown Item';
                const itemsList = data.items?.map((item: any) => `${getItemName(item)} x${item.quantity || 1}`).join(', ') || 'No items';
                return {
                    fields: [
                        { label: 'Order ID', value: data.orderId || data._id || 'N/A' },
                        { label: 'Customer', value: data.customerName || 'N/A' },
                        { label: 'Email', value: data.email || 'N/A' },
                        { label: 'Phone', value: data.phone || 'N/A' },
                        { label: 'Total', value: data.total ? `KES ${data.total.toLocaleString()}` : 'N/A' },
                        { label: 'Status', value: data.status || 'N/A' },
                        { label: 'Payment Status', value: data.paymentStatus || 'N/A' },
                        { label: 'Delivery Type', value: data.deliveryType || 'N/A' },
                        { label: 'Items', value: itemsList },
                    ]
                };
            case 'reservation:new':
            case 'reservation:statusChanged':
            case 'reservation:updated':
                return {
                    fields: [
                        { label: 'Reservation ID', value: data.reservationId || data._id || 'N/A' },
                        { label: 'Name', value: data.name || 'N/A' },
                        { label: 'Email', value: data.email || 'N/A' },
                        { label: 'Phone', value: data.phone || 'N/A' },
                        { label: 'Date', value: data.date || 'N/A' },
                        { label: 'Time', value: data.time || 'N/A' },
                        { label: 'Guests', value: data.guests || 'N/A' },
                        { label: 'Status', value: data.status || 'N/A' },
                        { label: 'Table', value: data.tableName || 'N/A' },
                        { label: 'Special Requests', value: data.specialRequests || 'None' },
                    ]
                };
            case 'review:new':
                return {
                    fields: [
                        { label: 'Review ID', value: data._id || 'N/A' },
                        { label: 'Name', value: data.name || 'N/A' },
                        { label: 'Email', value: data.email || 'N/A' },
                        { label: 'Rating', value: data.rating ? `${data.rating} stars` : 'N/A' },
                        { label: 'Comment', value: data.comment || 'N/A' },
                        { label: 'Date', value: data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A' },
                    ]
                };
            case 'complaint:new':
                return {
                    fields: [
                        { label: 'Complaint ID', value: data._id || 'N/A' },
                        { label: 'Subject', value: data.subject || 'N/A' },
                        { label: 'Name', value: data.name || 'N/A' },
                        { label: 'Email', value: data.email || 'N/A' },
                        { label: 'Phone', value: data.phone || 'N/A' },
                        { label: 'Description', value: data.description || 'N/A' },
                        { label: 'Status', value: data.status || 'N/A' },
                        { label: 'Date', value: data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A' },
                    ]
                };
            default:
                return {
                    fields: Object.entries(data).map(([key, value]) => ({
                        label: key.charAt(0).toUpperCase() + key.slice(1),
                        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
                    }))
                };
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: any) => {
        setSelectedNotification(notification);
        setNotificationDetailsOpen(true);
    };

    // Special Events
    const [specialEventDialogOpen, setSpecialEventDialogOpen] = useState(false);
    const [editingSpecialEvent, setEditingSpecialEvent] = useState<any>(null);
    const [specialEventForm, setSpecialEventForm] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'fundraiser',
        price: '',
        capacity: 50,
        image: '',
        isUpcoming: true,
        organizer: '',
        donationPercent: 0,
        isActive: true
    });

    // Sample special events for fallback
    const sampleSpecialEvents = [
        {
            _id: '1',
            title: 'Jazz Night with Local Artists',
            description: 'Enjoy an evening of smooth jazz with talented local musicians. Complimentary appetizer plate included.',
            date: '2026-03-15',
            time: '7:00 PM',
            type: 'live-music',
            price: 'KES 2,500/person',
            capacity: 50,
            image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
            isUpcoming: true,
            organizer: 'The Quill & Kisumu Arts Council',
            isActive: true
        },
        {
            _id: '2',
            title: 'Charity Fundraiser Dinner',
            description: "Support St. Jude's Orphanage with a gourmet dinner. 20% of proceeds go to the charity.",
            date: '2026-03-22',
            time: '6:30 PM',
            type: 'fundraiser',
            price: 'KES 3,500/person',
            capacity: 80,
            image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
            isUpcoming: true,
            organizer: "St. Jude's Orphanage",
            donationPercent: 20,
            isActive: true
        },
        {
            _id: '3',
            title: 'Wine & Dine Evening',
            description: 'Explore a curated selection of wines paired with exquisite dishes from our chef.',
            date: '2026-03-29',
            time: '6:00 PM',
            type: 'wine-tasting',
            price: 'KES 4,500/person',
            capacity: 30,
            image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
            isUpcoming: true,
            organizer: 'The Quill Sommelier Club',
            isActive: true
        },
        {
            _id: '4',
            title: '80s Retro Night',
            description: 'Travel back in time with 80s hits, classic cocktails, and retro vibes!',
            date: '2026-04-05',
            time: '8:00 PM',
            type: 'themed-night',
            price: 'KES 1,500/person',
            capacity: 60,
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
            isUpcoming: true,
            organizer: 'The Quill Entertainment',
            isActive: true
        },
        {
            _id: '5',
            title: "Mother's Day Brunch Fundraiser",
            description: 'Treat mom to a special brunch while supporting local women entrepreneurs.',
            date: '2026-05-10',
            time: '11:00 AM',
            type: 'fundraiser',
            price: 'KES 2,000/person',
            capacity: 100,
            image: 'https://images.unsplash.com/photo-1529335764857-3f5164c3f1ac?w=400',
            isUpcoming: true,
            organizer: 'Busia Women Business League',
            donationPercent: 15,
            isActive: true
        }
    ];

    // Partnerships
    const [partnershipDialogOpen, setPartnershipDialogOpen] = useState(false);
    const [editingPartnership, setEditingPartnership] = useState<any>(null);
    const [partnershipForm, setPartnershipForm] = useState({
        name: '',
        organization: '',
        type: 'corporate',
        description: '',
        email: '',
        phone: '',
        contactPerson: '',
        benefits: [] as string[],
        minPeople: 10,
        maxPeople: 100,
        priceRange: '',
        status: 'active',
        yearsActive: 0,
        category: 'Business'
    });

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

    // Save activeTab to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && activeTab) {
            localStorage.setItem('adminActiveTab', activeTab);
        }
    }, [activeTab]);

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

            // Add to notifications list
            const newNotification = {
                id: Date.now(),
                type: lastEvent.type,
                data: lastEvent.data,
                timestamp: new Date().toISOString(),
                read: false
            };
            setNotifications(prev => [newNotification, ...prev].slice(0, 50));

            // Show notification banner
            addBanner(lastEvent.type, lastEvent.data);
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
        } else if (activeTab === 'notifications') {
            loadNotifications();
        } else if (activeTab === 'accommodations') {
            loadAccommodations();
        } else if (activeTab === 'partnerships') {
            loadPartnerships();
        }
    }, [activeTab, orderStatusFilter, reservationDateFilter, reservationStatusFilter, revenuePeriod, accommodationFilter, partnershipFilter]);

    const loadAllData = async () => {
        try {
            // Load other data first
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

            // Special events - fetch from backend
            try {
                const specialEventsData = await specialEventsApi.getAll();
                const extractData = (response: any) => {
                    if (Array.isArray(response)) return response;
                    return response?.data ? response.data : [];
                };
                const extractedEvents = extractData(specialEventsData);
                // Only use sampleSpecialEvents if API fails completely (not just empty array)
                setSpecialEvents(extractedEvents);
            } catch (err) {
                // Use sampleSpecialEvents as fallback only on API error
                console.log('No special events found, using sample data');
                setSpecialEvents(sampleSpecialEvents);
            }
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
            const data: any = await reservationsApi.getAll();
            let filtered = Array.isArray(data) ? data : data?.reservations || data?.data || [];
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
        setRevenueLoading(true);
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
            // Set default values if API fails
            setRevenue({
                totalRevenue: 0,
                orderCount: 0,
                averageOrderValue: 0,
                dailyRevenue: []
            });
        } finally {
            setRevenueLoading(false);
        }
    };

    const loadNotifications = async () => {
        try {
            // Get auth token
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.log('No auth token - skipping notifications load');
                return;
            }

            // Get cleared notification IDs from localStorage
            const clearedIds = getClearedNotificationIds();

            // Fetch recent orders (last 10)
            const ordersData = await adminApi.getAllOrders({ limit: 10 });

            // Fetch recent reservations (last 10)
            const reservationsResponse: any = await reservationsApi.getAll();
            const reservationsData = Array.isArray(reservationsResponse)
                ? reservationsResponse
                : reservationsResponse?.reservations || reservationsResponse?.data || [];

            // Fetch recent reviews
            const reviewsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/reviews?status=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : [];

            // Fetch complaints
            const complaintsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/complaints?status=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const complaintsData = complaintsResponse.ok ? await complaintsResponse.json() : [];

            // Fetch disputes
            const disputesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/disputes?status=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const disputesData = disputesResponse.ok ? await disputesResponse.json() : [];

            // Build notifications array from all data sources
            const allNotifications: any[] = [];

            // Add orders as notifications
            (ordersData || []).slice(0, 10).forEach((order: any) => {
                const notifId = `order-${order._id}`;
                if (!clearedIds.includes(notifId)) {
                    allNotifications.push({
                        id: notifId,
                        type: 'order:new',
                        data: order,
                        timestamp: order.createdAt,
                        read: false
                    });
                }
            });

            // Add reservations as notifications
            (reservationsData || []).slice(0, 10).forEach((res: any) => {
                const notifId = `reservation-${res._id}`;
                if (!clearedIds.includes(notifId)) {
                    allNotifications.push({
                        id: notifId,
                        type: 'reservation:new',
                        data: res,
                        timestamp: res.createdAt,
                        read: false
                    });
                }
            });

            // Add reviews as notifications
            (reviewsData || []).slice(0, 10).forEach((review: any) => {
                const notifId = `review-${review._id}`;
                if (!clearedIds.includes(notifId)) {
                    allNotifications.push({
                        id: notifId,
                        type: 'review:new',
                        data: review,
                        timestamp: review.createdAt,
                        read: false
                    });
                }
            });

            // Add complaints as notifications
            (complaintsData || []).slice(0, 10).forEach((complaint: any) => {
                const notifId = `complaint-${complaint._id}`;
                if (!clearedIds.includes(notifId)) {
                    allNotifications.push({
                        id: notifId,
                        type: 'complaint:new',
                        data: complaint,
                        timestamp: complaint.createdAt,
                        read: false
                    });
                }
            });

            // Add disputes as notifications
            (disputesData || []).slice(0, 10).forEach((dispute: any) => {
                const notifId = `dispute-${dispute._id}`;
                if (!clearedIds.includes(notifId)) {
                    allNotifications.push({
                        id: notifId,
                        type: 'dispute:new',
                        data: dispute,
                        timestamp: dispute.createdAt,
                        read: false
                    });
                }
            });

            // Sort by timestamp descending (newest first)
            allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            // Take only the most recent 50
            setNotifications(allNotifications.slice(0, 50));
        } catch (err: any) {
            console.error('Failed to load notifications:', err);
        }
    };

    const loadAccommodations = async () => {
        try {
            const filters: any = {};
            if (accommodationFilter.type !== 'all') filters.type = accommodationFilter.type;
            if (accommodationFilter.status !== 'all') filters.status = accommodationFilter.status;

            const response = await adminApi.getAccommodations(filters);
            const data = response?.accommodations || response?.data || response || [];
            setAccommodations(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to load accommodations:', err);
            // Use demo data on error
            setAccommodations([
                { _id: 'acc1', name: 'Safari Park Hotel', type: 'hotel', starRating: 5, address: { city: 'Busia', area: 'Busia' }, priceRange: { min: 15000, max: 45000 }, status: 'active', distanceFromVenue: 2.5 },
                { _id: 'acc2', name: 'Garden Square Guest House', type: 'guest-house', starRating: 3, address: { city: 'Busia', area: 'Matayos' }, priceRange: { min: 5000, max: 12000 }, status: 'active', distanceFromVenue: 1.2 },
                { _id: 'acc3', name: 'Riverside Lodge', type: 'lodge', starRating: 4, address: { city: 'Busia', area: 'Korinda' }, priceRange: { min: 8000, max: 25000 }, status: 'active', distanceFromVenue: 5.0 },
                { _id: 'acc4', name: 'City Center Apartments', type: 'apartment', starRating: 4, address: { city: 'Busia', area: 'CBD' }, priceRange: { min: 6000, max: 18000 }, status: 'active', distanceFromVenue: 0.8 },
                { _id: 'acc5', name: 'Budget Hostel', type: 'hostel', starRating: 2, address: { city: 'Busia', area: 'Funyula' }, priceRange: { min: 1500, max: 4000 }, status: 'active', distanceFromVenue: 3.2 }
            ]);
        }
    };

    const loadPartnerships = async () => {
        try {
            const filters: any = {};
            if (partnershipFilter.type !== 'all') filters.type = partnershipFilter.type;
            if (partnershipFilter.status !== 'all') filters.status = partnershipFilter.status;
            if (partnershipFilter.category !== 'all') filters.category = partnershipFilter.category;

            // Fetch from API
            const response = await adminApi.getPartnerships(filters);
            const apiData = response?.partnerships || response?.data || [];

            // Filter out demo partnerships (those with demo IDs)
            const isDemoPartnership = (p: any) => {
                const id = String(p._id || p.id || '');
                return id.startsWith('PART-DEMO') ||
                    id.startsWith('corp') ||
                    id.startsWith('school') ||
                    id.startsWith('event') ||
                    id.startsWith('fund');
            };
            const realData = (Array.isArray(apiData) ? apiData : []).filter((p: any) => !isDemoPartnership(p));

            // Use API data if available, otherwise fallback to demo data
            if (realData.length > 0) {
                setPartnerships(realData);
            } else {
                // Use demo data as fallback
                const demoData = [
                    { _id: 'PART-DEMO1', name: 'Corporate Office Catering', organization: 'Various Companies', type: 'corporate', category: 'Business', status: 'active', yearsActive: 2, minPeople: 10, maxPeople: 500, description: 'Professional catering solutions for offices, meetings, and corporate events' },
                    { _id: 'PART-DEMO2', name: 'School & Institution Catering', organization: 'Various Schools', type: 'schools', category: 'Education', status: 'active', yearsActive: 5, minPeople: 20, maxPeople: 1000, description: 'Nutritious meals for schools, universities, and educational institutions' },
                    { _id: 'PART-DEMO3', name: 'Event Catering', organization: 'Various Event Planners', type: 'events', category: 'Business', status: 'active', yearsActive: 3, minPeople: 30, maxPeople: 500, description: 'Full-service catering for weddings, birthdays, and special occasions' },
                    { _id: 'PART-DEMO4', name: 'Fundraiser Support', organization: 'Various Charities', type: 'fundraiser', category: 'Charity', status: 'active', yearsActive: 4, minPeople: 25, maxPeople: 300, description: 'Support for charity events, fundraisers, and community causes' },
                ];

                let filtered = demoData;
                if (partnershipFilter.type !== 'all') {
                    filtered = filtered.filter(p => p.type === partnershipFilter.type);
                }
                if (partnershipFilter.status !== 'all') {
                    filtered = filtered.filter(p => p.status === partnershipFilter.status);
                }
                if (partnershipFilter.category !== 'all') {
                    filtered = filtered.filter(p => p.category === partnershipFilter.category);
                }
                setPartnerships(filtered);
            }
        } catch (err: any) {
            console.error('Failed to load partnerships:', err);
            // Fallback to demo data on error
            const demoData = [
                { _id: 'PART-DEMO1', name: 'Corporate Office Catering', organization: 'Various Companies', type: 'corporate', category: 'Business', status: 'active', yearsActive: 2, minPeople: 10, maxPeople: 500, description: 'Professional catering solutions for offices, meetings, and corporate events' },
                { _id: 'PART-DEMO2', name: 'School & Institution Catering', organization: 'Various Schools', type: 'schools', category: 'Education', status: 'active', yearsActive: 5, minPeople: 20, maxPeople: 1000, description: 'Nutritious meals for schools, universities, and educational institutions' },
                { _id: 'PART-DEMO3', name: 'Event Catering', organization: 'Various Event Planners', type: 'events', category: 'Business', status: 'active', yearsActive: 3, minPeople: 30, maxPeople: 500, description: 'Full-service catering for weddings, birthdays, and special occasions' },
                { _id: 'PART-DEMO4', name: 'Fundraiser Support', organization: 'Various Charities', type: 'fundraiser', category: 'Charity', status: 'active', yearsActive: 4, minPeople: 25, maxPeople: 300, description: 'Support for charity events, fundraisers, and community causes' },
            ];

            let filtered = demoData;
            if (partnershipFilter.type !== 'all') {
                filtered = filtered.filter(p => p.type === partnershipFilter.type);
            }
            if (partnershipFilter.status !== 'all') {
                filtered = filtered.filter(p => p.status === partnershipFilter.status);
            }
            if (partnershipFilter.category !== 'all') {
                filtered = filtered.filter(p => p.category === partnershipFilter.category);
            }
            setPartnerships(filtered);
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
        if (!deletingItem || deletingItem.type !== 'menu' || !deletingItem.id) return;
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

    // Special Events handlers
    const handleSaveSpecialEvent = async () => {
        try {
            if (editingSpecialEvent) {
                await specialEventsApi.update(editingSpecialEvent._id || editingSpecialEvent.id, specialEventForm);
                setSuccessMsg('Event updated successfully');
            } else {
                await specialEventsApi.create(specialEventForm);
                setSuccessMsg('Event created successfully');
            }
            setSpecialEventDialogOpen(false);
        } catch (err) {
            // If API fails, work with local state
            const newEvent = {
                ...specialEventForm,
                _id: editingSpecialEvent?._id || `local-${Date.now()}`,
                id: editingSpecialEvent?.id || `local-${Date.now()}`,
                capacity: parseInt(specialEventForm.capacity.toString()) || 50,
                donationPercent: parseInt(specialEventForm.donationPercent.toString()) || 0
            };

            if (editingSpecialEvent) {
                setSpecialEvents(prev => prev.map(e =>
                    (e._id === editingSpecialEvent._id || e.id === editingSpecialEvent.id)
                        ? { ...e, ...newEvent }
                        : e
                ));
                setSuccessMsg('Event updated (local)');
            } else {
                setSpecialEvents(prev => [...prev, newEvent]);
                setSuccessMsg('Event created (local)');
            }
            setSpecialEventDialogOpen(false);
        }
        // Refresh from API
        try {
            const updatedEvents = await specialEventsApi.getAll();
            const extractData = (response: any) => {
                if (Array.isArray(response)) return response;
                return response?.data ? response.data : [];
            };
            const extractedEvents = extractData(updatedEvents);
            if (extractedEvents.length > 0) {
                setSpecialEvents(extractedEvents);
            }
        } catch (err) {
            // Keep local state
        }
    };

    const handleDeleteSpecialEvent = async (id: string) => {
        setDeletingSpecialEventId(id);
        setSpecialEventDeleteOpen(true);
    };

    const confirmDeleteSpecialEvent = async () => {
        if (!deletingSpecialEventId) return;

        // Check if it's a purely local event (starts with 'local-')
        const isPurelyLocalEvent = deletingSpecialEventId.startsWith('local-');

        if (isPurelyLocalEvent) {
            // Delete locally only
            setSpecialEvents(prev => prev.filter(e => String(e._id) !== String(deletingSpecialEventId) && String(e.id) !== String(deletingSpecialEventId)));
            setSuccessMsg('Event deleted (local)');
            setSpecialEventDeleteOpen(false);
            setDeletingSpecialEventId(null);
            return;
        }

        // Try to delete from API
        try {
            await specialEventsApi.delete(deletingSpecialEventId);
            setSuccessMsg('Event deleted successfully');
        } catch (err: any) {
            console.error('Delete failed:', err);
            // If event not found (404) or already deleted, treat as success
            const errorMessage = err?.message || '';
            if (errorMessage.includes('not found') || errorMessage.includes('404')) {
                setSuccessMsg('Event removed (was not in database)');
            } else {
                setSuccessMsg('Delete failed, removed from view');
            }
        }

        // Always remove from local state after delete attempt
        setSpecialEvents(prev => prev.filter(e => String(e._id) !== String(deletingSpecialEventId) && String(e.id) !== String(deletingSpecialEventId)));
        setSpecialEventDeleteOpen(false);
        setDeletingSpecialEventId(null);
    };

    const handleSeedSpecialEvents = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/special-events/seed`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSuccessMsg(data.message || 'Events seeded successfully');
                // Refresh special events from API
                const updatedEvents = await specialEventsApi.getAll();
                const extractData = (response: any) => {
                    if (Array.isArray(response)) return response;
                    return response?.data ? response.data : [];
                };
                setSpecialEvents(extractData(updatedEvents));
            } else {
                throw new Error('Failed to seed events');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to seed events');
        }
    };

    // Partnership handlers
    const handleSavePartnership = async () => {
        try {
            if (editingPartnership) {
                await adminApi.updatePartnership(editingPartnership._id, partnershipForm);
                setSuccessMsg('Partnership updated successfully');
            } else {
                await adminApi.createPartnership(partnershipForm);
                setSuccessMsg('Partnership created successfully');
            }
            setPartnershipDialogOpen(false);
            setEditingPartnership(null);
            setTimeout(() => loadPartnerships(), 500);
        } catch (err: any) {
            setError(err.message || 'Failed to save partnership');
        }
    };

    const handleDeletePartnership = async (id: string) => {
        setDeletingPartnershipId(id);
        setPartnershipDeleteOpen(true);
    };

    const confirmDeletePartnership = async () => {
        if (!deletingPartnershipId) return;

        // Always attempt to delete from the database via API
        // The backend will handle demo partnerships appropriately
        try {
            await adminApi.deletePartnership(deletingPartnershipId);
            setSuccessMsg('Partnership deleted successfully');
            setPartnershipDeleteOpen(false);
            setDeletingPartnershipId(null);
            // Refresh the partnerships list
            setTimeout(() => loadPartnerships(), 500);
        } catch (err: any) {
            // If partnership not found (404), it may already be deleted or never existed in DB
            // Still remove from local state to give user feedback
            const errorMessage = err?.message || '';
            if (errorMessage.includes('not found') || errorMessage.includes('404')) {
                setPartnerships(prev => prev.filter(p => String(p._id) !== String(deletingPartnershipId)));
                setSuccessMsg('Partnership removed');
            } else {
                setError(err.message || 'Failed to delete partnership');
            }
            setPartnershipDeleteOpen(false);
            setDeletingPartnershipId(null);
        }
    };

    const openEditPartnership = (partnership: any) => {
        setEditingPartnership(partnership);
        setPartnershipForm({
            name: partnership.name || '',
            organization: partnership.organization || '',
            type: partnership.type || 'corporate',
            description: partnership.description || '',
            email: partnership.email || '',
            phone: partnership.phone || '',
            contactPerson: partnership.contactPerson || '',
            benefits: partnership.benefits || [],
            minPeople: partnership.minPeople || 10,
            maxPeople: partnership.maxPeople || 100,
            priceRange: partnership.priceRange || '',
            status: partnership.status || 'active',
            yearsActive: partnership.yearsActive || 0,
            category: partnership.category || 'Business'
        });
        setPartnershipDialogOpen(true);
    };

    // Parking Management Handlers
    const handleSaveParking = async () => {
        try {
            if (editingParking) {
                await parkingApi.update(editingParking._id, parkingForm);
                setSuccessMsg('Parking reservation updated successfully');
            } else {
                await parkingApi.adminAdd(parkingForm);
                setSuccessMsg('Parking reservation created successfully');
            }
            setParkingDialogOpen(false);
            setEditingParking(null);
            setTimeout(() => loadAllData(), 500);
        } catch (err: any) {
            setError(err.message || 'Failed to save parking reservation');
        }
    };

    const confirmDeleteParking = async () => {
        if (!deletingParkingId) return;
        console.log('[AdminDashboard] Attempting to delete parking with ID:', deletingParkingId);
        try {
            await parkingApi.delete(deletingParkingId);
            setSuccessMsg('Parking reservation deleted successfully');
            setParkingDeleteOpen(false);
            setDeletingParkingId(null);
            setTimeout(() => loadAllData(), 500);
        } catch (err: any) {
            console.error('[AdminDashboard] Delete parking error:', err);
            setError(err.message || 'Failed to delete parking reservation');
        }
    };

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'engagement':
                return <CustomerEngagementDashboard />;
            case 'reservations':
                return <ReservationCalendar />;
            case 'notifications':
                return (
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg text-gray-900 dark:text-white">Real-Time Notifications ({notifications.length})</CardTitle>
                                <CardDescription className="text-gray-500 dark:text-gray-400">Live updates from customers and system</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Save all current notification IDs to localStorage so they won't reappear
                                        const allIds = notifications.map((n: any) => n.id);
                                        const currentCleared = getClearedNotificationIds();
                                        const updatedCleared = [...new Set([...currentCleared, ...allIds])];
                                        saveClearedNotificationIds(updatedCleared);
                                        setNotifications([]);
                                    }}
                                >
                                    Clear All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Clear localStorage to show all notifications again
                                        saveClearedNotificationIds([]);
                                        loadNotifications();
                                    }}
                                >
                                    Show All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No notifications yet</p>
                                    <p className="text-sm">New orders, reservations, and other updates will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                    {notifications.map((notification: any) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-blue-500' : 'border-gray-200 dark:border-gray-600'}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {notification.type.includes('order') && <ShoppingBag className="w-4 h-4 text-blue-500" />}
                                                    {notification.type.includes('reservation') && <CalendarDays className="w-4 h-4 text-purple-500" />}
                                                    {notification.type.includes('review') && <span className="text-yellow-500">★</span>}
                                                    {notification.type.includes('parking') && <Car className="w-4 h-4 text-green-500" />}
                                                    {notification.type.includes('contact') && <Bell className="w-4 h-4 text-orange-500" />}
                                                    {notification.type.includes('event') && <PartyPopper className="w-4 h-4 text-pink-500" />}
                                                    {notification.type.includes('complaint') && <Alert className="w-4 h-4 text-red-500" />}
                                                    <Badge variant="outline" className="text-xs">
                                                        {notification.type.replace(':', ' ')}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                {notification.type === 'order:new' && (
                                                    <>
                                                        <p className="font-medium text-gray-900 dark:text-white">New Order Received</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {notification.data?.customerName} - KES {notification.data?.total?.toLocaleString()}
                                                        </p>
                                                    </>
                                                )}
                                                {notification.type === 'reservation:new' && (
                                                    <>
                                                        <p className="font-medium text-gray-900 dark:text-white">New Reservation</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {notification.data?.name} - {notification.data?.guests} guests on {notification.data?.date}
                                                        </p>
                                                    </>
                                                )}
                                                {notification.type === 'review:new' && (
                                                    <>
                                                        <p className="font-medium text-gray-900 dark:text-white">New Review</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {notification.data?.name} rated {notification.data?.rating} stars
                                                        </p>
                                                    </>
                                                )}
                                                {notification.type === 'parking:new' && (
                                                    <>
                                                        <p className="font-medium text-gray-900 dark:text-white">New Parking Reservation</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {notification.data?.name} - Slot {notification.data?.slotNumber}
                                                        </p>
                                                    </>
                                                )}
                                                {notification.type === 'contact:new' && (
                                                    <>
                                                        <p className="font-medium text-gray-900 dark:text-white">New Contact Message</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {notification.data?.name} - {notification.data?.email}
                                                        </p>
                                                    </>
                                                )}
                                                {notification.type === 'event:new' && (
                                                    <>
                                                        <p className="font-medium text-gray-900 dark:text-white">New Event Inquiry</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {notification.data?.name} - {notification.data?.eventType} for {notification.data?.guests} guests
                                                        </p>
                                                    </>
                                                )}
                                                {notification.type === 'complaint:new' && (
                                                    <>
                                                        <p className="font-medium text-red-600 dark:text-red-400">New Complaint</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {notification.data?.subject}
                                                        </p>
                                                    </>
                                                )}
                                                {notification.type.includes('order:updated') || notification.type.includes('order:statusChanged') ? (
                                                    <>
                                                        <p className="font-medium text-gray-900 dark:text-white">Order Updated</p>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            Order #{notification.data?.orderId} - Status: {notification.data?.status}
                                                        </p>
                                                    </>
                                                ) : null}
                                                {!['order:new', 'reservation:new', 'review:new', 'parking:new', 'contact:new', 'event:new', 'complaint:new', 'order:updated', 'order:statusChanged'].includes(notification.type) && (
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        {JSON.stringify(notification.data)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'menu':
                return <MenuManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'tables':
                return <TableManagement />;
            case 'inventory':
                return <InventoryDashboard />;
            case 'staff':
                return <StaffManagement />;
            case 'revenue':
                return (
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-900 dark:text-white">Revenue Reports</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">View revenue analytics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {['daily', 'weekly', 'monthly'].map((period) => (
                                    <Button
                                        key={period}
                                        variant={revenuePeriod === period ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setRevenuePeriod(period)}
                                        disabled={revenueLoading}
                                    >
                                        {period.charAt(0).toUpperCase() + period.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            {revenueLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : revenue && (revenue.totalRevenue > 0 || revenue.orderCount > 0) ? (
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
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No revenue data available</p>
                                    <p className="text-sm">Revenue will appear here once orders are placed</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'parking':
                return (
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg text-gray-900 dark:text-white">Parking Reservations ({parking.length})</CardTitle>
                                <CardDescription className="text-gray-500 dark:text-gray-400">Manage parking reservations</CardDescription>
                            </div>
                            <Button
                                onClick={() => {
                                    setEditingParking(null);
                                    setParkingForm({
                                        name: '',
                                        email: '',
                                        phone: '',
                                        vehicleType: 'Sedan',
                                        vehiclePlate: '',
                                        date: new Date().toISOString().split('T')[0],
                                        time: '10:00',
                                        duration: 2,
                                        slotNumber: '',
                                        paymentStatus: 'unpaid',
                                        paymentMethod: ''
                                    });
                                    setParkingDialogOpen(true);
                                }}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {(parking || []).length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No parking reservations yet</p>
                                        <p className="text-sm">Click "Add" to create a new reservation</p>
                                    </div>
                                ) : (
                                    (parking || []).map((slot: any, idx: number) => (
                                        <div
                                            key={slot._id || `parking-${idx}`}
                                            className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => {
                                                setSelectedParking(slot);
                                                setParkingDetailsOpen(true);
                                            }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-900 dark:text-white">{slot.name || 'Unknown'}</p>
                                                        <Badge className={`${slot.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : slot.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                            {slot.paymentStatus || 'unpaid'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Car className="w-3 h-3" /> {slot.vehicleType || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {slot.date || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {slot.time || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-medium text-amber-600">Slot {slot.slotNumber || 'N/A'}</span>
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                                                        <span className="font-medium">Plate:</span> {slot.vehiclePlate || 'N/A'} |
                                                        <span className="font-medium ml-2">Duration:</span> {slot.duration || 1}hr |
                                                        <span className="font-medium ml-2">Price:</span> KES {slot.price ? slot.price.toLocaleString() : calculateParkingPrice(slot.vehicleType, slot.duration).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingParking(slot);
                                                            setParkingForm({
                                                                name: slot.name || '',
                                                                email: slot.email || '',
                                                                phone: slot.phone || '',
                                                                vehicleType: slot.vehicleType || 'Sedan',
                                                                vehiclePlate: slot.vehiclePlate || '',
                                                                date: slot.date || '',
                                                                time: slot.time || '',
                                                                duration: slot.duration || 1,
                                                                slotNumber: slot.slotNumber || '',
                                                                paymentStatus: slot.paymentStatus || 'unpaid',
                                                                paymentMethod: slot.paymentMethod || ''
                                                            });
                                                            setParkingDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            setDeletingParkingId(slot._id);
                                                            setParkingDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'marketing':
                return <MarketingPromotions />;
            case 'events':
                return (
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-900 dark:text-white">Events ({events.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {(events || []).map((event: any, idx: number) => (
                                    <div key={event._id || `event-${idx}`} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <p className="font-medium text-gray-900 dark:text-white">{event.eventType}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.date} • {event.guests} guests</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'special-events':
                return (
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-gray-900 dark:text-white">Special Events ({specialEvents.length})</CardTitle>
                                <CardDescription className="text-gray-500 dark:text-gray-400">Manage special events and fundraisers</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setEditingSpecialEvent(null);
                                        setSpecialEventForm({
                                            title: '',
                                            description: '',
                                            date: '',
                                            time: '',
                                            type: 'fundraiser',
                                            price: '',
                                            capacity: 50,
                                            image: '',
                                            isUpcoming: true,
                                            organizer: '',
                                            donationPercent: 0,
                                            isActive: true
                                        });
                                        setSpecialEventDialogOpen(true);
                                    }}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Event
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {(specialEvents || []).length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No special events yet. Click "Add Event" to create one.</p>
                                ) : (
                                    (specialEvents || []).map((event: any, idx: number) => (
                                        <div key={event._id || `special-event-${idx}`} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                                                        <Badge variant={event.isActive ? 'default' : 'secondary'} className="text-xs">
                                                            {event.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        {event.isUpcoming && event.date && new Date(event.date) >= new Date() && (
                                                            <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900">Upcoming</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{event.description}</p>
                                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <CalendarDays className="w-3 h-3" />
                                                            {event.date ? new Date(event.date).toLocaleDateString('en-GB') : 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {event.time || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" /> {event.capacity} guests
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" /> {event.price}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">{event.type}</Badge>
                                                        {event.donationPercent > 0 && (
                                                            <Badge className="bg-red-100 text-red-800 text-xs">{event.donationPercent}% to charity</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingSpecialEvent(event);
                                                            setSpecialEventForm({
                                                                title: event.title || '',
                                                                description: event.description || '',
                                                                date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
                                                                time: event.time || '',
                                                                type: event.type || 'fundraiser',
                                                                price: event.price || '',
                                                                capacity: event.capacity || 50,
                                                                image: event.image || '',
                                                                isUpcoming: event.isUpcoming !== false,
                                                                organizer: event.organizer || '',
                                                                donationPercent: event.donationPercent || 0,
                                                                isActive: event.isActive !== false
                                                            });
                                                            setSpecialEventDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteSpecialEvent(event._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'accommodations':
                return <AccommodationManagement />;
            case 'partnerships':
                return (
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-gray-900 dark:text-white">Partnerships ({partnerships.length})</CardTitle>
                                <CardDescription className="text-gray-500 dark:text-gray-400">Manage business partnerships</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => {
                                    setEditingPartnership(null); setPartnershipForm({
                                        name: '',
                                        organization: '',
                                        type: 'corporate',
                                        description: '',
                                        email: '',
                                        phone: '',
                                        contactPerson: '',
                                        benefits: [],
                                        minPeople: 10,
                                        maxPeople: 100,
                                        priceRange: '',
                                        status: 'active',
                                        yearsActive: 0,
                                        category: 'Business'
                                    }); setPartnershipDialogOpen(true);
                                }} size="sm">
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                                <Select value={partnershipFilter.type} onValueChange={(value) => setPartnershipFilter({ ...partnershipFilter, type: value })}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="schools">Schools</SelectItem>
                                        <SelectItem value="events">Events</SelectItem>
                                        <SelectItem value="fundraiser">Fundraiser</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={partnershipFilter.status} onValueChange={(value) => setPartnershipFilter({ ...partnershipFilter, status: value })}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={partnershipFilter.category} onValueChange={(value) => setPartnershipFilter({ ...partnershipFilter, category: value })}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="Education">Education</SelectItem>
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                                        <SelectItem value="Charity">Charity</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {partnerships.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No partnerships found</p>
                                ) : (
                                    partnerships.map((partnership: any, idx: number) => (
                                        <div key={partnership._id || `part-${idx}`} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-900 dark:text-white">{partnership.name}</p>
                                                        <Badge variant={partnership.status === 'active' ? 'default' : partnership.status === 'pending' ? 'outline' : 'secondary'} className="text-xs">
                                                            {partnership.status}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">{partnership.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{partnership.organization}</p>
                                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                        {partnership.category && (
                                                            <Badge variant="outline" className="text-xs">{partnership.category}</Badge>
                                                        )}
                                                        {partnership.yearsActive !== undefined && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {partnership.yearsActive} years
                                                            </span>
                                                        )}
                                                        {partnership.minPeople && partnership.maxPeople && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" /> {partnership.minPeople} - {partnership.maxPeople} people
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Button variant="outline" size="icon" onClick={() => openEditPartnership(partnership)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeletePartnership(partnership._id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Real-time Notification Banners */}
            <AdminNotificationBanner
                notifications={banners}
                onDismiss={removeBanner}
                duration={5000}
            />
            {/* Header - Mobile */}
            <div className="md:hidden bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-40">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-white">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                                <div className="flex flex-col h-full">
                                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto py-4">
                                        {navItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setActiveTab(item.id); setSidebarOpen(true); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === item.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                                        <Button variant="destructive" className="w-full" onClick={logout}>
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <div>
                            <h1 className="text-gray-900 dark:text-white font-bold text-lg">Admin</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={loadAllData} className="text-gray-700 dark:text-white">
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <div
                    className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-16'
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                            {sidebarOpen && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={activeTab === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}>
                                        {item.icon}
                                    </div>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-white/10">
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
                <div className="hidden md:block bg-white/80 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
                    <div className="flex justify-between items-center p-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}</h1>
                            <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name || user?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Button variant="outline" size="sm" onClick={loadAllData} className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border-gray-200 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20">
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
                    <Alert className="m-4 md:mx-6 bg-green-50 dark:bg-green-100 border-green-200 dark:border-green-300">
                        <AlertDescription className="text-green-800 dark:text-green-900">{successMsg}</AlertDescription>
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

            {/* Special Events Dialog */}
            <Dialog open={specialEventDialogOpen} onOpenChange={setSpecialEventDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSpecialEvent ? 'Edit Special Event' : 'Add New Special Event'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="eventTitle">Title *</Label>
                            <Input
                                id="eventTitle"
                                value={specialEventForm.title}
                                onChange={(e) => setSpecialEventForm({ ...specialEventForm, title: e.target.value })}
                                placeholder="Event title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventDescription">Description *</Label>
                            <Textarea
                                id="eventDescription"
                                value={specialEventForm.description}
                                onChange={(e) => setSpecialEventForm({ ...specialEventForm, description: e.target.value })}
                                placeholder="Event description"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Date *</Label>
                                <Input
                                    id="eventDate"
                                    type="date"
                                    value={specialEventForm.date}
                                    onChange={(e) => setSpecialEventForm({ ...specialEventForm, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventTime">Time *</Label>
                                <Input
                                    id="eventTime"
                                    type="time"
                                    value={specialEventForm.time}
                                    onChange={(e) => setSpecialEventForm({ ...specialEventForm, time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventType">Type *</Label>
                                <Select
                                    value={specialEventForm.type}
                                    onValueChange={(value) => setSpecialEventForm({ ...specialEventForm, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fundraiser">Fundraiser</SelectItem>
                                        <SelectItem value="live-music">Live Music</SelectItem>
                                        <SelectItem value="themed-night">Themed Night</SelectItem>
                                        <SelectItem value="wine-tasting">Wine Tasting</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventCapacity">Capacity *</Label>
                                <Input
                                    id="eventCapacity"
                                    type="number"
                                    value={specialEventForm.capacity}
                                    onChange={(e) => setSpecialEventForm({ ...specialEventForm, capacity: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventPrice">Price *</Label>
                            <Input
                                id="eventPrice"
                                value={specialEventForm.price}
                                onChange={(e) => setSpecialEventForm({ ...specialEventForm, price: e.target.value })}
                                placeholder="e.g., KES 2,500/person"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventImage">Image URL</Label>
                            <Input
                                id="eventImage"
                                value={specialEventForm.image}
                                onChange={(e) => setSpecialEventForm({ ...specialEventForm, image: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventOrganizer">Organizer</Label>
                            <Input
                                id="eventOrganizer"
                                value={specialEventForm.organizer}
                                onChange={(e) => setSpecialEventForm({ ...specialEventForm, organizer: e.target.value })}
                                placeholder="Organizer name"
                            />
                        </div>
                        {specialEventForm.type === 'fundraiser' && (
                            <div className="space-y-2">
                                <Label htmlFor="donationPercent">Donation Percentage</Label>
                                <Input
                                    id="donationPercent"
                                    type="number"
                                    value={specialEventForm.donationPercent}
                                    onChange={(e) => setSpecialEventForm({ ...specialEventForm, donationPercent: parseInt(e.target.value) })}
                                    placeholder="e.g., 20"
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="eventUpcoming"
                                    checked={specialEventForm.isUpcoming}
                                    onCheckedChange={(checked) => setSpecialEventForm({ ...specialEventForm, isUpcoming: checked as boolean })}
                                />
                                <Label htmlFor="eventUpcoming" className="text-sm font-normal">
                                    Show as upcoming
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="eventActive"
                                    checked={specialEventForm.isActive}
                                    onCheckedChange={(checked) => setSpecialEventForm({ ...specialEventForm, isActive: checked as boolean })}
                                />
                                <Label htmlFor="eventActive" className="text-sm font-normal">
                                    Active
                                </Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => { setSpecialEventDialogOpen(false); setEditingSpecialEvent(null); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveSpecialEvent} className="bg-blue-600 hover:bg-blue-700">
                                {editingSpecialEvent ? 'Update Event' : 'Create Event'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Item"
                description={deletingItem?.type === 'menu'
                    ? "Are you sure you want to delete this menu item? This action cannot be undone."
                    : "Are you sure you want to cancel this reservation? This action cannot be undone."
                }
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={() => {
                    if (deletingItem?.type === 'menu') {
                        handleDeleteMenu();
                    } else if (deletingItem?.type === 'reservation') {
                        handleDeleteReservation();
                    }
                }}
            />

            {/* Special Event Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={specialEventDeleteOpen}
                onOpenChange={setSpecialEventDeleteOpen}
                title="Delete Special Event"
                description="Are you sure you want to delete this special event? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeleteSpecialEvent}
            />

            {/* Partnership Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={partnershipDeleteOpen}
                onOpenChange={setPartnershipDeleteOpen}
                title="Delete Partnership"
                description="Are you sure you want to delete this partnership? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeletePartnership}
            />

            {/* Partnership Edit Dialog */}
            {/* Notification Details Dialog */}
            <Dialog open={notificationDetailsOpen} onOpenChange={setNotificationDetailsOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Notification Details</DialogTitle>
                        <DialogDescription>
                            {selectedNotification?.type?.replace(':', ' ')} - {new Date(selectedNotification?.timestamp).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedNotification && (
                        <div className="space-y-4">
                            {getNotificationDetails(selectedNotification).fields.map((field: any, idx: number) => (
                                <div key={idx} className="flex flex-col">
                                    <Label className="text-xs text-gray-500 dark:text-gray-400">{field.label}</Label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{field.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNotificationDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Parking Add/Edit Dialog */}
            <Dialog open={parkingDialogOpen} onOpenChange={setParkingDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingParking ? 'Edit Parking Reservation' : 'Add New Parking Reservation'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parkingName">Name *</Label>
                                <Input
                                    id="parkingName"
                                    value={parkingForm.name}
                                    onChange={(e) => setParkingForm({ ...parkingForm, name: e.target.value })}
                                    placeholder="Customer name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parkingEmail">Email</Label>
                                <Input
                                    id="parkingEmail"
                                    type="email"
                                    value={parkingForm.email}
                                    onChange={(e) => setParkingForm({ ...parkingForm, email: e.target.value })}
                                    placeholder="customer@email.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parkingPhone">Phone *</Label>
                                <Input
                                    id="parkingPhone"
                                    value={parkingForm.phone}
                                    onChange={(e) => setParkingForm({ ...parkingForm, phone: e.target.value })}
                                    placeholder="+254 700 000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parkingVehiclePlate">Vehicle Plate *</Label>
                                <Input
                                    id="parkingVehiclePlate"
                                    value={parkingForm.vehiclePlate}
                                    onChange={(e) => setParkingForm({ ...parkingForm, vehiclePlate: e.target.value.toUpperCase() })}
                                    placeholder="KAA 123A"
                                    className="uppercase"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parkingVehicleType">Vehicle Type</Label>
                            <Select
                                value={parkingForm.vehicleType}
                                onValueChange={(value) => setParkingForm({ ...parkingForm, vehicleType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sedan">Sedan</SelectItem>
                                    <SelectItem value="SUV">SUV</SelectItem>
                                    <SelectItem value="Van">Van</SelectItem>
                                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parkingDate">Date *</Label>
                                <Input
                                    id="parkingDate"
                                    type="date"
                                    value={parkingForm.date}
                                    onChange={(e) => setParkingForm({ ...parkingForm, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parkingTime">Time *</Label>
                                <Input
                                    id="parkingTime"
                                    type="time"
                                    value={parkingForm.time}
                                    onChange={(e) => setParkingForm({ ...parkingForm, time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parkingDuration">Duration (hours)</Label>
                                <Input
                                    id="parkingDuration"
                                    type="number"
                                    min="1"
                                    value={parkingForm.duration}
                                    onChange={(e) => setParkingForm({ ...parkingForm, duration: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parkingSlot">Slot Number</Label>
                                <Input
                                    id="parkingSlot"
                                    value={parkingForm.slotNumber}
                                    onChange={(e) => setParkingForm({ ...parkingForm, slotNumber: e.target.value })}
                                    placeholder="P1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parkingPaymentStatus">Payment Status</Label>
                                <Select
                                    value={parkingForm.paymentStatus}
                                    onValueChange={(value) => setParkingForm({ ...parkingForm, paymentStatus: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parkingPaymentMethod">Payment Method</Label>
                                <Select
                                    value={parkingForm.paymentMethod}
                                    onValueChange={(value) => setParkingForm({ ...parkingForm, paymentMethod: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => { setParkingDialogOpen(false); setEditingParking(null); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveParking} className="bg-blue-600 hover:bg-blue-700">
                                {editingParking ? 'Update Reservation' : 'Create Reservation'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Parking Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={parkingDeleteOpen}
                onOpenChange={setParkingDeleteOpen}
                title="Delete Parking Reservation"
                description="Are you sure you want to delete this parking reservation? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeleteParking}
            />

            {/* Parking Details Dialog */}
            <Dialog open={parkingDetailsOpen} onOpenChange={setParkingDetailsOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Parking Reservation Details</DialogTitle>
                    </DialogHeader>
                    {selectedParking && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedParking.name}</h3>
                                    <p className="text-sm text-gray-500">ID: {selectedParking._id}</p>
                                </div>
                                <Badge className={`${selectedParking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : selectedParking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    {selectedParking.paymentStatus || 'unpaid'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-gray-500">Email</Label>
                                    <p className="text-gray-900 dark:text-gray-100">{selectedParking.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Phone</Label>
                                    <p className="text-gray-900 dark:text-gray-100">{selectedParking.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Vehicle Type</Label>
                                    <p className="text-gray-900 dark:text-gray-100">{selectedParking.vehicleType || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Vehicle Plate</Label>
                                    <p className="text-gray-900 dark:text-gray-100 uppercase">{selectedParking.vehiclePlate || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Date</Label>
                                    <p className="text-gray-900 dark:text-gray-100">{selectedParking.date || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Time</Label>
                                    <p className="text-gray-900 dark:text-gray-100">{selectedParking.time || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Duration</Label>
                                    <p className="text-gray-900 dark:text-gray-100">{selectedParking.duration || 1} hour(s)</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Slot Number</Label>
                                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-amber-600">{selectedParking.slotNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Price</Label>
                                    <p className="text-gray-900 dark:text-gray-100 font-semibold">KES {selectedParking.price ? selectedParking.price.toLocaleString() : calculateParkingPrice(selectedParking.vehicleType, selectedParking.duration).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Payment Method</Label>
                                    <p className="text-gray-900 dark:text-gray-100">{selectedParking.paymentMethod || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs text-gray-500">Created At</Label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {selectedParking.createdAt ? new Date(selectedParking.createdAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setParkingDetailsOpen(false);
                                        setEditingParking(selectedParking);
                                        setParkingForm({
                                            name: selectedParking.name || '',
                                            email: selectedParking.email || '',
                                            phone: selectedParking.phone || '',
                                            vehicleType: selectedParking.vehicleType || 'Sedan',
                                            vehiclePlate: selectedParking.vehiclePlate || '',
                                            date: selectedParking.date || '',
                                            time: selectedParking.time || '',
                                            duration: selectedParking.duration || 1,
                                            slotNumber: selectedParking.slotNumber || '',
                                            paymentStatus: selectedParking.paymentStatus || 'unpaid',
                                            paymentMethod: selectedParking.paymentMethod || ''
                                        });
                                        setParkingDialogOpen(true);
                                    }}
                                >
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                        setParkingDetailsOpen(false);
                                        setDeletingParkingId(selectedParking._id);
                                        setParkingDeleteOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setParkingDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={partnershipDialogOpen} onOpenChange={setPartnershipDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPartnership ? 'Edit Partnership' : 'Add New Partnership'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partnershipName">Partnership Name *</Label>
                                <Input
                                    id="partnershipName"
                                    value={partnershipForm.name}
                                    onChange={(e) => setPartnershipForm({ ...partnershipForm, name: e.target.value })}
                                    placeholder="e.g., Corporate Dining Program"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnershipOrg">Organization *</Label>
                                <Input
                                    id="partnershipOrg"
                                    value={partnershipForm.organization}
                                    onChange={(e) => setPartnershipForm({ ...partnershipForm, organization: e.target.value })}
                                    placeholder="e.g., Tech Solutions Ltd"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partnershipType">Type *</Label>
                                <Select
                                    value={partnershipForm.type}
                                    onValueChange={(value) => setPartnershipForm({ ...partnershipForm, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="schools">Schools</SelectItem>
                                        <SelectItem value="events">Events</SelectItem>
                                        <SelectItem value="fundraiser">Fundraiser</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnershipCategory">Category *</Label>
                                <Select
                                    value={partnershipForm.category}
                                    onValueChange={(value) => setPartnershipForm({ ...partnershipForm, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="Education">Education</SelectItem>
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                                        <SelectItem value="Charity">Charity</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partnershipEmail">Email</Label>
                                <Input
                                    id="partnershipEmail"
                                    type="email"
                                    value={partnershipForm.email}
                                    onChange={(e) => setPartnershipForm({ ...partnershipForm, email: e.target.value })}
                                    placeholder="contact@company.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnershipPhone">Phone</Label>
                                <Input
                                    id="partnershipPhone"
                                    value={partnershipForm.phone}
                                    onChange={(e) => setPartnershipForm({ ...partnershipForm, phone: e.target.value })}
                                    placeholder="+254 700 000000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="partnershipContact">Contact Person</Label>
                            <Input
                                id="partnershipContact"
                                value={partnershipForm.contactPerson}
                                onChange={(e) => setPartnershipForm({ ...partnershipForm, contactPerson: e.target.value })}
                                placeholder="Full name of contact person"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="partnershipDesc">Description</Label>
                            <Textarea
                                id="partnershipDesc"
                                value={partnershipForm.description}
                                onChange={(e) => setPartnershipForm({ ...partnershipForm, description: e.target.value })}
                                placeholder="Brief description of the partnership"
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partnershipMin">Min People</Label>
                                <Input
                                    id="partnershipMin"
                                    type="number"
                                    value={partnershipForm.minPeople}
                                    onChange={(e) => setPartnershipForm({ ...partnershipForm, minPeople: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnershipMax">Max People</Label>
                                <Input
                                    id="partnershipMax"
                                    type="number"
                                    value={partnershipForm.maxPeople}
                                    onChange={(e) => setPartnershipForm({ ...partnershipForm, maxPeople: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partnershipYears">Years Active</Label>
                                <Input
                                    id="partnershipYears"
                                    type="number"
                                    value={partnershipForm.yearsActive}
                                    onChange={(e) => setPartnershipForm({ ...partnershipForm, yearsActive: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnershipStatus">Status</Label>
                                <Select
                                    value={partnershipForm.status}
                                    onValueChange={(value) => setPartnershipForm({ ...partnershipForm, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="partnershipPrice">Price Range</Label>
                            <Input
                                id="partnershipPrice"
                                value={partnershipForm.priceRange}
                                onChange={(e) => setPartnershipForm({ ...partnershipForm, priceRange: e.target.value })}
                                placeholder="e.g., KES 500 - 2000 per person"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => { setPartnershipDialogOpen(false); setEditingPartnership(null); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSavePartnership} className="bg-blue-600 hover:bg-blue-700">
                                {editingPartnership ? 'Update Partnership' : 'Create Partnership'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AdminDashboard;

