import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import useSocket from "@/hooks/useSocket";
import { ordersApi } from "@/services/api";
import { ArrowLeft, Clock, CheckCircle, Star, MessageSquare, AlertCircle } from "lucide-react";
import StarRating from "@/components/StarRating";
import ReviewSubmissionModal from "@/components/ReviewSubmissionModal";

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

const OrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { lastEvent } = useSocket({ autoConnect: true });
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [modifyingItems, setModifyingItems] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    // Listen for order updates via Socket.io
    useEffect(() => {
        if (lastEvent && id && (lastEvent.type === 'order:statusChanged' || lastEvent.type === 'order:updated')) {
            if (lastEvent.data._id === id || lastEvent.data.orderId === id) {
                loadOrder();
                toast({
                    title: "Order Updated",
                    description: `Your order status: ${lastEvent.data.status || lastEvent.data.newStatus}`
                });
            }
        }
    }, [lastEvent, id]);

    const loadOrder = async () => {
        try {
            const data = await ordersApi.getById(id!);
            setOrder(data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Could not load order details",
                variant: "destructive"
            });
            setTimeout(() => navigate("/"), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="w-5 h-5" />;
            case "confirmed":
            case "preparing":
                return <CheckCircle className="w-5 h-5" />;
            case "ready":
                return <CheckCircle className="w-5 h-5" />;
            case "delivered":
            case "completed":
                return <CheckCircle className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
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

    const handleCancelOrder = async () => {
        if (!order) return;
        setActionLoading(true);
        try {
            await ordersApi.cancelOrder(order._id);
            toast({
                title: "Success",
                description: "Order cancelled successfully. Refund will be processed within 24 hours."
            });
            setShowCancelConfirm(false);
            loadOrder();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Could not cancel order",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleModifyItems = async () => {
        if (!order) return;

        const itemsToRemove = order.items
            .filter(item => {
                const newQty = modifyingItems[item.id];
                return newQty !== undefined && newQty === 0;
            })
            .map(item => item.id);

        const itemsToUpdate = order.items
            .filter(item => {
                const newQty = modifyingItems[item.id];
                return newQty !== undefined && newQty > 0 && newQty !== item.quantity;
            })
            .map(item => ({
                itemId: item.id,
                quantity: modifyingItems[item.id]
            }));

        if (itemsToRemove.length === 0 && itemsToUpdate.length === 0) {
            toast({
                title: "No Changes",
                description: "Please modify at least one item quantity",
                variant: "destructive"
            });
            return;
        }

        setActionLoading(true);
        try {
            await ordersApi.modifyOrderItems(order._id, {
                itemsToRemove,
                itemsToUpdate
            });
            toast({
                title: "Success",
                description: "Order items updated successfully"
            });
            setShowModifyModal(false);
            setModifyingItems({});
            loadOrder();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Could not modify order",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="pt-20 pb-16 min-h-screen bg-background">
                <div className="container mx-auto px-4 text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Loading order...</p>
                </div>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="pt-20 pb-16 min-h-screen bg-background">
                <div className="container mx-auto px-4 text-center py-12">
                    <h1 className="font-display text-2xl font-bold mb-4">Order Not Found</h1>
                    <p className="text-muted-foreground mb-8">We couldn't find this order</p>
                    <Button onClick={() => navigate("/")}>Back to Home</Button>
                </div>
            </main>
        );
    }

    const stages = [
        { name: "Order Placed", value: "pending" },
        { name: "Confirmed", value: "confirmed" },
        { name: "Preparing", value: "preparing" },
        { name: "Ready", value: "ready" },
        { name: order.orderType === "delivery" ? "Delivered" : "Completed", value: order.orderType === "delivery" ? "delivered" : "completed" }
    ];

    const currentStageIndex = stages.findIndex(s => s.value === order.status);

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-2xl">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Order #{order._id.slice(-8).toUpperCase()}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-2 capitalize">{order.status}</span>
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Order Status Timeline */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stages.map((stage, index) => (
                                <div key={stage.value} className="flex items-center gap-4">
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full ${index <= currentStageIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${index <= currentStageIndex ? "text-foreground" : "text-muted-foreground"}`}>
                                            {stage.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Order Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between pb-3 border-b">
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                            <div className="flex justify-between pt-3 border-t">
                                <p className="font-bold text-lg">Total:</p>
                                <p className="font-bold text-lg text-primary">Ksh {order.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-semibold">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-semibold">+254{order.phone}</p>
                        </div>
                        {order.orderType === "delivery" && order.address && (
                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-semibold">{order.address}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Order Type</p>
                            <p className="font-semibold capitalize">{order.orderType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Payment Method</p>
                            <p className="font-semibold capitalize">{order.paymentMethod}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons - Only for pending/confirmed orders */}
                {(order.status === "pending" || order.status === "confirmed") && (
                    <Card className="mb-6 border-amber-200">
                        <CardHeader>
                            <CardTitle className="text-amber-900">Order Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowModifyModal(true)}
                                >
                                    Modify Items
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => setShowCancelConfirm(true)}
                                >
                                    Cancel Order
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Review Section - Show only for completed orders */}
                {(order.status === 'completed' || order.status === 'delivered') && (
                    <Card className="mb-6 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Rate Your Experience
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                How was your order? We'd love to hear your feedback!
                            </p>
                            <div className="flex items-center justify-center mb-4">
                                <StarRating rating={4} size={28} />
                            </div>
                            <Button
                                onClick={() => setShowReviewModal(true)}
                                className="w-full"
                            >
                                <Star className="w-4 h-4 mr-2" />
                                Write a Review
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="text-center text-muted-foreground text-sm">
                    <p>For support, contact us at 0113 857846 or thequillrestaurant@gmail.com</p>
                </div>
            </div>

            {/* Review Submission Modal */}
            {order && (
                <ReviewSubmissionModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    orderId={order._id}
                    customerName={order.customerName}
                    customerEmail={order.email}
                />
            )}

            {/* Modify Items Modal */}
            <Dialog open={showModifyModal} onOpenChange={setShowModifyModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modify Order Items</DialogTitle>
                        <DialogDescription>
                            Update item quantities or remove items. Items with quantity 0 will be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {order?.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Current: {item.quantity}</p>
                                </div>
                                <Input
                                    type="number"
                                    min="0"
                                    value={modifyingItems[item.id] ?? item.quantity}
                                    onChange={(e) => setModifyingItems({
                                        ...modifyingItems,
                                        [item.id]: parseInt(e.target.value) || 0
                                    })}
                                    className="w-20"
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModifyModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleModifyItems} disabled={actionLoading}>
                            {actionLoading ? "Updating..." : "Update Items"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Order Confirmation Modal */}
            <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            Cancel Order
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-800">
                            Cancellation details:
                        </p>
                        <ul className="text-sm text-red-800 mt-2 list-disc list-inside space-y-1">
                            <li>Order will be cancelled immediately</li>
                            <li>Refund will be processed within 24 hours</li>
                            <li>You will receive a confirmation email</li>
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                            Keep Order
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelOrder}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
};

export default OrderDetailsPage;
