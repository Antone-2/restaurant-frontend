import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, CheckCircle, Clock, Truck, Phone, MessageCircle } from 'lucide-react';

interface DeliveryStatus {
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
    estimatedTime?: string;
    driverName?: string;
    driverPhone?: string;
    driverRating?: number;
    vehicleType?: string;
    vehiclePlate?: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    updates: {
        status: string;
        timestamp: string;
        description: string;
    }[];
}

// Enhanced delivery tracking component with real-time updates
export function DeliveryTracking({ orderId }: { orderId: string }) {
    const socket = useSocket();
    const { toast } = useToast();
    const [trackingId, setTrackingId] = useState(orderId || '');
    const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Subscribe to real-time delivery updates
        if (socket) {
            socket.on('delivery:locationUpdated', handleLocationUpdate);
            socket.on('order:deliveryAssigned', handleDeliveryAssigned);
            socket.on('order:delivered', handleDeliveryComplete);
            socket.on('order:statusChanged', handleStatusChanged);

            return () => {
                socket.off('delivery:locationUpdated');
                socket.off('order:deliveryAssigned');
                socket.off('order:delivered');
                socket.off('order:statusChanged');
            };
        }
    }, [socket]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-5 h-5 text-blue-500" />;
            case 'preparing':
                return <Package className="w-5 h-5 text-orange-500" />;
            case 'ready':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'out_for_delivery':
                return <Truck className="w-5 h-5 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'preparing':
                return 'bg-orange-100 text-orange-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'out_for_delivery':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-200 text-green-900';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleLocationUpdate = (data: any) => {
        if (data.orderId === trackingId) {
            setDeliveryStatus(prev => prev ? {
                ...prev,
                location: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: data.address
                }
            } : null);
        }
    };

    const handleDeliveryAssigned = (data: any) => {
        if (data.orderId === trackingId) {
            toast({
                title: "Driver Assigned",
                description: "Your delivery driver has been assigned"
            });
            handleTrack();
        }
    };

    const handleDeliveryComplete = (data: any) => {
        if (data.orderId === trackingId) {
            setDeliveryStatus(prev => prev ? { ...prev, status: 'delivered' } : null);
            toast({
                title: "Delivered!",
                description: "Your order has been delivered"
            });
        }
    };

    const handleStatusChanged = (data: any) => {
        if (data.orderId === trackingId) {
            setDeliveryStatus(prev => prev ? { ...prev, status: data.status } : null);
        }
    };

    const handleTrack = async () => {
        const id = trackingId;
        if (!id) return;

        setLoading(true);

        try {
            const response = await fetch(`http://localhost:3001/api/orders/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Order not found');
            }

            const data = await response.json();
            const order = data.order;

            setDeliveryStatus({
                status: order.status,
                estimatedTime: order.estimatedDeliveryTime
                    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : undefined,
                driverName: order.deliveryPartner?.name,
                driverPhone: order.deliveryPartner?.phone,
                driverRating: order.deliveryPartner?.rating,
                vehicleType: order.deliveryPartner?.vehicleType,
                vehiclePlate: order.deliveryPartner?.vehiclePlate,
                location: order.deliveryPartner?.currentLocation ? {
                    latitude: order.deliveryPartner.currentLocation.latitude,
                    longitude: order.deliveryPartner.currentLocation.longitude
                } : undefined,
                updates: [
                    {
                        status: 'confirmed',
                        timestamp: order.createdAt,
                        description: 'Order confirmed and received'
                    },
                    {
                        status: 'preparing',
                        timestamp: order.updatedAt,
                        description: 'Kitchen is preparing your order'
                    },
                    ...(order.status === 'ready' || order.status === 'out_for_delivery' || order.status === 'delivered' ? [{
                        status: 'ready',
                        timestamp: order.updatedAt,
                        description: 'Order is ready for pickup'
                    }] : []),
                    ...(order.status === 'out_for_delivery' || order.status === 'delivered' ? [{
                        status: 'out_for_delivery',
                        timestamp: order.deliveryPartner?.updatedAt || new Date().toISOString(),
                        description: 'Driver has picked up your order'
                    }] : []),
                    ...(order.status === 'delivered' ? [{
                        status: 'delivered',
                        timestamp: order.deliveredAt || new Date().toISOString(),
                        description: 'Your order has been delivered'
                    }] : [])
                ]
            });

            setTrackingId(id);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to track order",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Track Your Delivery
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter order ID (e.g., ORD-123456)"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={handleTrack} disabled={loading || !trackingId}>
                        {loading ? 'Tracking...' : 'Track'}
                    </Button>
                </div>

                {/* Delivery Status */}
                {deliveryStatus && (
                    <div className="space-y-6">
                        {/* Status Header */}
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Order ID</p>
                                <p className="font-semibold">{trackingId}</p>
                            </div>
                            <div className="text-right">
                                <Badge className={getStatusColor(deliveryStatus.status)}>
                                    {deliveryStatus.status.replace(/_/g, ' ').toUpperCase()}
                                </Badge>
                                {deliveryStatus.estimatedTime && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        ETA: {deliveryStatus.estimatedTime}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Driver Info */}
                        {deliveryStatus.driverName && (
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-3">Your Driver</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{deliveryStatus.driverName}</p>
                                            {deliveryStatus.driverRating && (
                                                <p className="text-sm text-muted-foreground">⭐ {deliveryStatus.driverRating.toFixed(1)}</p>
                                            )}
                                            {deliveryStatus.vehicleType && (
                                                <p className="text-sm text-muted-foreground">
                                                    {deliveryStatus.vehicleType} ({deliveryStatus.vehiclePlate || 'N/A'})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {deliveryStatus.driverPhone && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`tel:${deliveryStatus.driverPhone}`}>
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    Call
                                                </a>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`https://wa.me/${deliveryStatus.driverPhone.replace('+254', '254')}`} target="_blank" rel="noopener noreferrer">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    WhatsApp
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {deliveryStatus.location && (
                                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                                        <p className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            Live location: {deliveryStatus.location.latitude.toFixed(4)}, {deliveryStatus.location.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h4 className="font-semibold">Delivery Timeline</h4>
                            <div className="space-y-4">
                                {deliveryStatus.updates.map((update, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            {getStatusIcon(update.status)}
                                            {index < deliveryStatus.updates.length - 1 && (
                                                <div className="w-0.5 h-8 bg-muted" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-medium capitalize">{update.status.replace(/_/g, ' ')}</p>
                                            <p className="text-sm text-muted-foreground">{update.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(update.timestamp).toLocaleTimeString('en-KE', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!deliveryStatus && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Enter your order ID to track delivery status</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default DeliveryTracking;
