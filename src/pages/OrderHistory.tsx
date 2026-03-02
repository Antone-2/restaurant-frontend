import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import useSocket from "@/hooks/useSocket";
import { ordersApi } from "@/services/api";
import { ArrowLeft, Clock, CheckCircle, Truck, Package, CreditCard } from "lucide-react";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    items: OrderItem[];
    total: number;
    orderType: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
}

const OrderHistory = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { lastEvent } = useSocket({ autoConnect: true });

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        loadOrders();
    }, [isAuthenticated, navigate]);

    // Listen for order updates via Socket.io
    useEffect(() => {
        if (lastEvent && (lastEvent.type === 'order:statusChanged' || lastEvent.type === 'order:updated' || lastEvent.type === 'order:new')) {
            loadOrders();
            toast({
                title: "Order Updated",
                description: "Your order list has been refreshed"
            });
        }
    }, [lastEvent]);

    const loadOrders = async () => {
        try {
            const data = await ordersApi.getAll();
            // Orders are now filtered by backend based on user's email
            setOrders(data.sort((a: Order, b: Order) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Could not load order history",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="w-4 h-4" />;
            case "confirmed":
            case "preparing":
                return <Package className="w-4 h-4" />;
            case "ready":
                return <CheckCircle className="w-4 h-4" />;
            case "delivered":
            case "completed":
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500";
            case "confirmed":
            case "preparing":
                return "bg-blue-500";
            case "ready":
                return "bg-green-500";
            case "delivered":
            case "completed":
                return "bg-green-700";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(order => order.status === filter);

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <Button variant="ghost" onClick={() => navigate("/profile")} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Profile
                </Button>

                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold mb-2">Order History</h1>
                    <p className="text-muted-foreground">View all your orders and their status</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { label: "All Orders", value: "all" },
                        { label: "Pending", value: "pending" },
                        { label: "Confirmed", value: "confirmed" },
                        { label: "Completed", value: "completed" },
                        { label: "Cancelled", value: "cancelled" }
                    ].map(btn => (
                        <Button
                            key={btn.value}
                            variant={filter === btn.value ? "default" : "outline"}
                            onClick={() => setFilter(btn.value)}
                        >
                            {btn.label}
                        </Button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-4">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground mb-4">
                                {filter === "all"
                                    ? "You haven't placed any orders yet"
                                    : `No ${filter} orders`}
                            </p>
                            <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <Card key={order._id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Left Side - Order Info */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-lg">
                                                    Order #{order._id.slice(-8).toUpperCase()}
                                                </h3>
                                                <Badge className={getStatusColor(order.status)}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="ml-1 capitalize">{order.status}</span>
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-3">
                                                {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>

                                            <div className="space-y-2 text-sm mb-4">
                                                <p className="flex items-center gap-2">
                                                    <span className="text-muted-foreground capitalize w-24">Type:</span>
                                                    <span className="font-semibold">{order.orderType}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-semibold">{order.paymentMethod === "mpesa" ? "M-Pesa" : "Cash"}</span>
                                                </p>
                                                {order.address && (
                                                    <p className="text-muted-foreground text-xs">
                                                        {order.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side - Items & Total */}
                                        <div className="border-l pl-4 md:border-l-2 md:border-muted">
                                            <p className="text-sm text-muted-foreground mb-2">Items:</p>
                                            <div className="space-y-1 mb-4">
                                                {order.items.map((item, idx) => (
                                                    <p key={idx} className="text-sm">
                                                        <span className="font-semibold">{item.quantity}x</span> {item.name}
                                                    </p>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t">
                                                <span className="font-bold">Total:</span>
                                                <span className="text-xl font-bold text-primary">
                                                    Ksh {order.total.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-4 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => navigate(`/orders/${order._id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default OrderHistory;
