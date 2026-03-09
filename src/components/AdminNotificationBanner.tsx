import { useEffect, useState, useCallback } from 'react';
import {
    ShoppingCart,
    Calendar,
    Car,
    Star,
    AlertCircle,
    X,
    Mail,
    PartyPopper,
    AlertTriangle,
    CheckCircle,
    Clock,
    Bell,
    ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface NotificationBanner {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date;
    data?: any;
}

interface AdminNotificationBannerProps {
    notifications: NotificationBanner[];
    onDismiss: (id: string) => void;
    duration?: number;
    onNotificationClick?: (notification: NotificationBanner) => void;
}

// Get detailed information based on notification type - exported for reuse
export const getNotificationDetails = (notification: NotificationBanner) => {
    const data = notification.data || {};
    const type = notification.type;

    switch (type) {
        case 'order:new':
        case 'order:statusChanged':
        case 'order:updated':
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
                    { label: 'Items', value: data.items?.map((item: any) => `${item.name} x${item.quantity}`).join(', ') || 'N/A' },
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
        case 'parking:new':
            return {
                fields: [
                    { label: 'Slot Number', value: data.slotNumber || 'N/A' },
                    { label: 'Name', value: data.name || 'N/A' },
                    { label: 'Phone', value: data.phone || 'N/A' },
                    { label: 'Vehicle Plate', value: data.vehiclePlate || 'N/A' },
                    { label: 'Entry Time', value: data.entryTime || 'N/A' },
                    { label: 'Exit Time', value: data.exitTime || 'N/A' },
                    { label: 'Status', value: data.status || 'N/A' },
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
        case 'dispute:new':
            return {
                fields: [
                    { label: 'Dispute ID', value: data._id || 'N/A' },
                    { label: 'Subject', value: data.subject || 'N/A' },
                    { label: 'Name', value: data.name || 'N/A' },
                    { label: 'Email', value: data.email || 'N/A' },
                    { label: 'Description', value: data.description || 'N/A' },
                    { label: 'Status', value: data.status || 'N/A' },
                ]
            };
        case 'contact:new':
            return {
                fields: [
                    { label: 'Name', value: data.name || 'N/A' },
                    { label: 'Email', value: data.email || 'N/A' },
                    { label: 'Phone', value: data.phone || 'N/A' },
                    { label: 'Subject', value: data.subject || 'N/A' },
                    { label: 'Message', value: data.message || 'N/A' },
                    { label: 'Date', value: data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A' },
                ]
            };
        case 'event:new':
            return {
                fields: [
                    { label: 'Event Type', value: data.eventType || 'N/A' },
                    { label: 'Name', value: data.name || 'N/A' },
                    { label: 'Email', value: data.email || 'N/A' },
                    { label: 'Phone', value: data.phone || 'N/A' },
                    { label: 'Guests', value: data.guests || 'N/A' },
                    { label: 'Date', value: data.date || 'N/A' },
                    { label: 'Message', value: data.message || 'N/A' },
                ]
            };
        case 'inventory:low':
            return {
                fields: [
                    { label: 'Item Name', value: data.itemName || 'N/A' },
                    { label: 'Current Quantity', value: data.quantity || 'N/A' },
                    { label: 'Reorder Level', value: data.reorderLevel || 'N/A' },
                    { label: 'Category', value: data.category || 'N/A' },
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

const AdminNotificationBanner = ({ notifications, onDismiss, duration = 5000, onNotificationClick }: AdminNotificationBannerProps) => {
    const [visibleNotifications, setVisibleNotifications] = useState<NotificationBanner[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<NotificationBanner | null>(null);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[notifications.length - 1];
            setVisibleNotifications(prev => {
                const exists = prev.find(n =>
                    n.type === latest.type &&
                    n.message === latest.message &&
                    Math.abs(n.timestamp.getTime() - latest.timestamp.getTime()) < 1000
                );
                if (!exists) {
                    return [latest, ...prev].slice(0, 3);
                }
                return prev;
            });
        }
    }, [notifications]);

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        visibleNotifications.forEach((notification) => {
            const timer = setTimeout(() => {
                onDismiss(notification.id);
                setVisibleNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, duration);
            timers.push(timer);
        });
        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [visibleNotifications, duration, onDismiss]);

    const getNotificationConfig = (type: string) => {
        switch (type) {
            case 'order:new':
                return { icon: <ShoppingCart className="w-5 h-5" />, bgColor: 'bg-blue-500', textColor: 'text-white', title: 'New Order' };
            case 'order:statusChanged':
            case 'order:updated':
                return { icon: <CheckCircle className="w-5 h-5" />, bgColor: 'bg-blue-400', textColor: 'text-white', title: 'Order Updated' };
            case 'reservation:new':
                return { icon: <Calendar className="w-5 h-5" />, bgColor: 'bg-green-500', textColor: 'text-white', title: 'New Reservation' };
            case 'reservation:statusChanged':
            case 'reservation:updated':
                return { icon: <Clock className="w-5 h-5" />, bgColor: 'bg-green-400', textColor: 'text-white', title: 'Reservation Updated' };
            case 'parking:new':
                return { icon: <Car className="w-5 h-5" />, bgColor: 'bg-amber-500', textColor: 'text-white', title: 'New Parking' };
            case 'review:new':
                return { icon: <Star className="w-5 h-5" />, bgColor: 'bg-yellow-500', textColor: 'text-white', title: 'New Review' };
            case 'complaint:new':
                return { icon: <AlertCircle className="w-5 h-5" />, bgColor: 'bg-red-500', textColor: 'text-white', title: 'New Complaint' };
            case 'dispute:new':
                return { icon: <AlertTriangle className="w-5 h-5" />, bgColor: 'bg-orange-500', textColor: 'text-white', title: 'New Dispute' };
            case 'contact:new':
                return { icon: <Mail className="w-5 h-5" />, bgColor: 'bg-purple-500', textColor: 'text-white', title: 'New Contact' };
            case 'event:new':
                return { icon: <PartyPopper className="w-5 h-5" />, bgColor: 'bg-pink-500', textColor: 'text-white', title: 'New Event Inquiry' };
            case 'inventory:low':
                return { icon: <AlertTriangle className="w-5 h-5" />, bgColor: 'bg-red-600', textColor: 'text-white', title: 'Low Inventory' };
            default:
                return { icon: <Bell className="w-5 h-5" />, bgColor: 'bg-gray-600', textColor: 'text-white', title: 'Notification' };
        }
    };

    const handleDismiss = (id: string) => {
        onDismiss(id);
        setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleBannerClick = (notification: NotificationBanner) => {
        setSelectedNotification(notification);
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
    };

    if (visibleNotifications.length === 0) return null;

    return (
        <>
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
                {visibleNotifications.map((notification) => {
                    const config = getNotificationConfig(notification.type);
                    return (
                        <div
                            key={notification.id}
                            className={`${config.bgColor} ${config.textColor} rounded-lg shadow-lg overflow-hidden animate-slide-in-right cursor-pointer hover:opacity-90 transition-opacity`}
                            style={{ animation: 'slideInRight 0.3s ease-out' }}
                            onClick={() => handleBannerClick(notification)}
                        >
                            <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
                            <div className="flex items-start gap-3 p-4">
                                <div className="flex-shrink-0">{config.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{config.title}</p>
                                    <p className="text-xs opacity-90 truncate mt-0.5">{notification.message}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    <ChevronRight className="w-4 h-4 opacity-70" />
                                    <button onClick={(e) => { e.stopPropagation(); handleDismiss(notification.id); }} className="opacity-70 hover:opacity-100 transition-opacity ml-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="h-1 bg-black/20">
                                <div className="h-full bg-white/50 animate-shrink" style={{ animation: `shrink ${duration}ms linear forwards` }} />
                            </div>
                            <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
                        </div>
                    );
                })}
            </div>

            <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedNotification && (<>{getNotificationConfig(selectedNotification.type).icon}{selectedNotification.title}</>)}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedNotification && (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-500">{new Date(selectedNotification.timestamp).toLocaleString()}</div>
                            <div className="space-y-3">
                                {getNotificationDetails(selectedNotification).fields.map((field, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase">{field.label}</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{field.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button variant="outline" onClick={() => { handleDismiss(selectedNotification.id); setSelectedNotification(null); }}>Dismiss</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export const useNotificationBanners = () => {
    const [banners, setBanners] = useState<NotificationBanner[]>([]);

    const addBanner = useCallback((type: string, data: any) => {
        let title = '', message = '';
        switch (type) {
            case 'order:new': title = 'New Order'; message = `${data.customerName || 'Customer'} placed an order - KES ${data.total?.toLocaleString() || '0'}`; break;
            case 'order:statusChanged': title = 'Order Updated'; message = `Order #${data.orderId?.slice(-8) || ''} status changed to ${data.status}`; break;
            case 'order:updated': title = 'Order Updated'; message = `Order #${data.orderId?.slice(-8) || ''} was updated`; break;
            case 'reservation:new': title = 'New Reservation'; message = `${data.name || 'Guest'} reserved a table for ${data.guests || 0} guests`; break;
            case 'reservation:statusChanged': title = 'Reservation Updated'; message = `Reservation for ${data.name || 'Guest'} status: ${data.status}`; break;
            case 'reservation:updated': title = 'Reservation Updated'; message = `Reservation #${data.reservationId?.slice(-8) || ''} was updated`; break;
            case 'parking:new': title = 'New Parking Reservation'; message = `${data.name || 'Customer'} booked slot ${data.slotNumber || ''}`; break;
            case 'review:new': title = 'New Review'; message = `${data.name || 'Guest'} left a ${data.rating || 0} star review`; break;
            case 'complaint:new': title = 'New Complaint'; message = data.subject || 'A new complaint was submitted'; break;
            case 'dispute:new': title = 'New Dispute'; message = data.subject || 'A new dispute was opened'; break;
            case 'contact:new': title = 'New Contact Message'; message = `${data.name || 'Someone'} sent a message`; break;
            case 'event:new': title = 'New Event Inquiry'; message = `${data.name || 'Someone'} inquired about ${data.eventType || 'an event'}`; break;
            case 'inventory:low': title = 'Low Inventory Alert'; message = `${data.itemName || 'Item'} stock is low (${data.quantity || 0} remaining)`; break;
            default: title = 'Notification'; message = JSON.stringify(data).slice(0, 50);
        }
        const newBanner: NotificationBanner = { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, type, title, message, timestamp: new Date(), data };
        setBanners(prev => [...prev, newBanner]);
    }, []);

    const removeBanner = useCallback((id: string) => { setBanners(prev => prev.filter(b => b.id !== id)); }, []);
    const clearBanners = useCallback(() => { setBanners([]); }, []);

    return { banners, addBanner, removeBanner, clearBanners };
};

export default AdminNotificationBanner;

