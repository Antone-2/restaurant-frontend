import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Bell,
    ShoppingCart,
    Calendar,
    Star,
    X,
    Check,
    AlertCircle,
    Settings
} from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface RealTimeNotificationsProps {
    isAdmin?: boolean;
}

const RealTimeNotifications = ({ isAdmin = false }: RealTimeNotificationsProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Initialize socket connection
    const {
        isConnected,
        notifications: socketNotifications,
    } = useSocket({
        autoConnect: true,
        userId: user?._id,
        isAdmin,
    });

    // Initialize push notifications
    const {
        isSupported,
        permission,
        requestPermission,
        showLocalNotification
    } = usePushNotifications({
        onNotification: (notification) => {
            toast({
                title: notification.title,
                description: notification.body,
            });
        },
    });

    // Convert socket notifications to our format
    useEffect(() => {
        const newNotifications: Notification[] = socketNotifications.map((n, index) => {
            let title = '';
            let message = '';

            switch (n.type) {
                case 'order:new':
                    title = 'New Order';
                    message = `${n.data.customerName} placed a new order`;
                    break;
                case 'order:statusChanged':
                    title = 'Order Updated';
                    message = `Order #${n.data.orderId?.slice(-8)} status changed to ${n.data.status}`;
                    break;
                case 'reservation:new':
                    title = 'New Reservation';
                    message = `${n.data.name} made a reservation for ${n.data.guests} guests`;
                    break;
                case 'reservation:updated':
                    title = 'Reservation Updated';
                    message = `Reservation #${n.data.reservationId?.slice(-8)} status changed`;
                    break;
                case 'review:new':
                    title = 'New Review';
                    message = `${n.data.name} submitted a new review`;
                    break;
                case 'notification:push':
                    title = n.data.title;
                    message = n.data.message;
                    break;
                default:
                    title = 'Notification';
                    message = JSON.stringify(n.data);
            }

            return {
                id: `${Date.now()}-${index}`,
                type: n.type,
                title,
                message,
                timestamp: new Date(),
                read: false,
            };
        });

        setNotifications((prev) => [...newNotifications, ...prev].slice(0, 50));
    }, [socketNotifications]);

    // Show local notification for new events
    useEffect(() => {
        if (socketNotifications.length > 0) {
            const latest = socketNotifications[socketNotifications.length - 1];

            let title = '';
            let body = '';

            switch (latest.type) {
                case 'order:new':
                    title = 'New Order!';
                    body = `${latest.data.customerName} placed a new order - KES ${latest.data.total?.toLocaleString()}`;
                    break;
                case 'order:statusChanged':
                    title = 'Order Updated';
                    body = `Order status changed to ${latest.data.status}`;
                    break;
                case 'reservation:new':
                    title = 'New Reservation!';
                    body = `${latest.data.name} reserved a table for ${latest.data.guests}`;
                    break;
                case 'review:new':
                    title = 'New Review!';
                    body = `${latest.data.name} left a ${latest.data.rating}-star review`;
                    break;
            }

            if (title && body) {
                showLocalNotification(title, body);
            }
        }
    }, [socketNotifications, showLocalNotification]);

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

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order:new':
            case 'order:statusChanged':
            case 'order:updated':
                return <ShoppingCart className="w-4 h-4 text-blue-500" />;
            case 'reservation:new':
            case 'reservation:statusChanged':
            case 'reservation:updated':
                return <Calendar className="w-4 h-4 text-green-500" />;
            case 'review:new':
                return <Star className="w-4 h-4 text-yellow-500" />;
            case 'notification:push':
                return <Bell className="w-4 h-4 text-purple-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Real-Time Updates
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                            {isConnected ? 'Live' : 'Offline'}
                        </Badge>

                        {isSupported && permission !== 'granted' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={requestPermission}
                            >
                                <Settings className="w-3 h-3 mr-1" />
                                Enable Notifications
                            </Button>
                        )}
                    </div>
                </div>
                {unreadCount > 0 && (
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </p>
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                        <p className="text-sm">Real-time updates will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${notification.read
                                        ? 'bg-muted/50'
                                        : 'bg-primary/5 border border-primary/10'
                                    }`}
                            >
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {notification.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {!notification.read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-6 h-6"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <Check className="w-3 h-3" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6"
                                        onClick={() => removeNotification(notification.id)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RealTimeNotifications;
