import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { X, Bell, Info, ShoppingCart, Clock, Truck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useSocket from "@/hooks/useSocket";

// Notification types
export type NotificationType = "order" | "reservation" | "delivery" | "promo" | "system" | "review" | "complaint" | "ticket" | "payment" | "event" | "contact" | "parking";

// Notification types
export type NotificationType = "order" | "reservation" | "delivery" | "promo" | "system";

// Notification interface
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Notification Context
interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) => {
    const { toast } = useToast();
    const socket = useSocket({ autoConnect: true, isAdmin });
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            type: "order",
            title: "Welcome to The Quill!",
            message: "Thank you for visiting. Check out our 24-hour dining experience.",
            timestamp: new Date(),
            read: false,
        },
    ]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket?.lastEvent) return;

        const { type, data } = socket.lastEvent;
        let newNotification: Omit<Notification, "id" | "timestamp" | "read"> | null = null;
        let toastMessage: { title: string; description: string } | null = null;

        switch (type) {
            case "order:new":
                newNotification = {
                    type: "order",
                    title: "New Order Received!",
                    message: `Order #${data.orderId?.slice(-6) || ' Unknown'} has been placed.`,
                };
                toastMessage = {
                    title: "🔔 New Order!",
                    description: `Order #${data.orderId?.slice(-6)} received`,
                };
                break;
            case "order:updated":
                newNotification = {
                    type: "order",
                    title: "Order Updated",
                    message: `Order #${data.orderId?.slice(-6)} status: ${data.status}`,
                };
                break;
            case "order:paymentUpdated":
                newNotification = {
                    type: "payment",
                    title: "Payment Updated",
                    message: `Order #${data.orderId?.slice(-6)} payment was ${data.paymentStatus}`,
                };
                toastMessage = {
                    title: "💳 Payment Update",
                    description: `Order #${data.orderId?.slice(-6)} - ${data.paymentStatus}`,
                };
                break;
            case "reservation:new":
                newNotification = {
                    type: "reservation",
                    title: "New Reservation!",
                    message: `New table reservation for ${data.guests || ''} guests.`,
                };
                toastMessage = {
                    title: "📅 New Reservation!",
                    description: `Table reserved for ${data.guests || '?'} guests`,
                };
                break;
            case "reservation:updated":
                newNotification = {
                    type: "reservation",
                    title: "Reservation Updated",
                    message: `Reservation #${data.reservationId?.slice(-6)} status: ${data.status}`,
                };
                break;
            case "review:new":
                newNotification = {
                    type: "review",
                    title: "New Review!",
                    message: `New ${data.rating || 5}-star review received.`,
                };
                toastMessage = {
                    title: "⭐ New Review!",
                    description: `${data.rating || 5} star review received`,
                };
                break;
            case "complaint:new":
                newNotification = {
                    type: "system",
                    title: "New Complaint!",
                    message: `New complaint received: ${data.subject || 'General issue'}`,
                };
                toastMessage = {
                    title: "⚠️ New Complaint!",
                    description: data.subject || 'New complaint submitted',
                };
                break;
            case "ticket:new":
                newNotification = {
                    type: "ticket",
                    title: "New Support Ticket!",
                    message: `Ticket: ${data.subject || 'Support request'}`,
                };
                toastMessage = {
                    title: "🎫 New Ticket!",
                    description: data.subject || 'New support request',
                };
                break;
            case "ticket:updated":
                newNotification = {
                    type: "ticket",
                    title: "Ticket Updated",
                    message: `Ticket #${data.ticketId?.slice(-6)} status: ${data.status}`,
                };
                break;
            case "inventory:low":
                newNotification = {
                    type: "system",
                    title: "Low Stock Alert!",
                    message: `${data.menuItemName || 'Item'} is running low on stock.`,
                };
                toastMessage = {
                    title: "⚠️ Low Stock!",
                    description: `${data.menuItemName || 'Item'} stock is low`,
                };
                break;
            case "notification:push":
                newNotification = {
                    type: data.type || "system",
                    title: data.title || "Notification",
                    message: data.message || "You have a new notification",
                };
                break;
        }

        if (newNotification) {
            addNotification(newNotification);
        }
        if (toastMessage && isAdmin) {
            toast({
                title: toastMessage.title,
                description: toastMessage.description,
                className: "border-l-4 border-l-blue-500",
            });
        }
    }, [socket?.lastEvent, isAdmin]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
        const newNotification: Notification = {
            ...notification,
            id: generateId(),
            timestamp: new Date(),
            read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
};

// Toast notification helper
export const useOrderNotifications = () => {
    const { addNotification } = useNotifications();
    const { toast } = useToast();

    const notifyOrderPlaced = (orderId: string, type: string) => {
        addNotification({
            type: "order",
            title: "Order Placed!",
            message: `Your ${type} order #${orderId.slice(-6)} has been received and is being processed.`,
        });
        toast({
            title: "Order Placed!",
            description: `Your ${type} order has been received.`,
            className: "border-green-500",
        });
    };

    const notifyOrderReady = (orderId: string) => {
        addNotification({
            type: "order",
            title: "Order Ready!",
            message: `Your order #${orderId.slice(-6)} is ready for pickup/delivery.`,
        });
        toast({
            title: "Order Ready! ",
            description: "Your order is ready. Thank you for ordering!",
        });
    };

    const notifyDelivery = (orderId: string, eta: number) => {
        addNotification({
            type: "delivery",
            title: "On the Way!",
            message: `Your order #${orderId.slice(-6)} is being delivered. ETA: ${eta} minutes.`,
        });
    };

    const notifyReservation = (date: string, time: string) => {
        addNotification({
            type: "reservation",
            title: "Reservation Confirmed!",
            message: `Your table for ${date} at ${time} is confirmed.`,
        });
        toast({
            title: "Reservation Confirmed! ",
            description: `Your table for ${date} at ${time} is confirmed.`,
        });
    };

    return {
        notifyOrderPlaced,
        notifyOrderReady,
        notifyDelivery,
        notifyReservation,
    };
};

// Notification Bell Component
export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "order":
                return <ShoppingCart className="w-4 h-4 text-blue-500" />;
            case "reservation":
                return <Clock className="w-4 h-4 text-green-500" />;
            case "delivery":
                return <Truck className="w-4 h-4 text-orange-500" />;
            case "promo":
                return <Info className="w-4 h-4 text-purple-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
            >
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-12 w-80 max-h-96 bg-background border rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b flex items-center justify-between bg-muted/50">
                            <h3 className="font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                                    Mark all read
                                </Button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 border-b hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? "bg-primary/5" : ""
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">{getIcon(notification.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm truncate">{notification.title}</p>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatTime(notification.timestamp)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notification.id);
                                                }}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
