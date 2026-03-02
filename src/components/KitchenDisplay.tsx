import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    ChefHat,
    Clock,
    CheckCircle,
    AlertCircle,
    Bell,
    Filter,
    RefreshCw,
    Timer,
    Utensils,
    Trash2,
    Plus,
    Minus,
    X,
    Flame,
    Star,
    User,
    MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KitchenOrderItem {
    name: string;
    quantity: number;
    notes?: string;
    status: "pending" | "preparing" | "ready";
}

interface KitchenOrder {
    id: string;
    orderId: string;
    items: KitchenOrderItem[];
    status: "pending" | "preparing" | "ready" | "served";
    createdAt: Date;
    customerName: string;
    tableNumber?: string;
    orderType: "dine-in" | "takeout" | "delivery";
    priority: "normal" | "rush" | "vip";
    specialInstructions?: string;
}

const KitchenDisplay = () => {
    const { toast } = useToast();
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [filter, setFilter] = useState<string>("all");
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Demo orders for display
    const demoOrders: KitchenOrder[] = [
        {
            id: "k1",
            orderId: "ORD-2026-001",
            items: [
                { name: "Wagyu Beef Steak", quantity: 2, notes: "Medium rare", status: "preparing" },
                { name: "Truffle Risotto", quantity: 1, notes: "", status: "ready" },
                { name: "Soup of the Day", quantity: 2, notes: "", status: "pending" },
            ],
            status: "preparing",
            createdAt: new Date(Date.now() - 15 * 60000),
            customerName: "John D.",
            tableNumber: "Table 5",
            orderType: "dine-in",
            priority: "normal",
            specialInstructions: "No onions"
        },
        {
            id: "k2",
            orderId: "ORD-2026-002",
            items: [
                { name: "Pan-Seared Salmon", quantity: 1, notes: "No lemon", status: "pending" },
                { name: "Herb Roasted Chicken", quantity: 1, notes: "", status: "pending" },
            ],
            status: "pending",
            createdAt: new Date(Date.now() - 8 * 60000),
            customerName: "Sarah M.",
            tableNumber: "Table 3",
            orderType: "dine-in",
            priority: "rush"
        },
        {
            id: "k3",
            orderId: "ORD-2026-003",
            items: [
                { name: "Crispy Calamari", quantity: 2, notes: "", status: "ready" },
                { name: "Signature Cocktail", quantity: 3, notes: "", status: "ready" },
            ],
            status: "ready",
            createdAt: new Date(Date.now() - 25 * 60000),
            customerName: "Mike R.",
            tableNumber: "Bar 2",
            orderType: "dine-in",
            priority: "normal"
        },
        {
            id: "k4",
            orderId: "ORD-2026-004",
            items: [
                { name: "Seafood Platter", quantity: 1, notes: "Extra sauce", status: "preparing" },
                { name: "Lobster Thermidor", quantity: 1, notes: "", status: "preparing" },
            ],
            status: "preparing",
            createdAt: new Date(Date.now() - 5 * 60000),
            customerName: "VIP Guest",
            tableNumber: "VIP Room",
            orderType: "dine-in",
            priority: "vip"
        },
        {
            id: "k5",
            orderId: "ORD-2026-005",
            items: [
                { name: "Vegetable Wellington", quantity: 1, notes: "Vegan", status: "pending" },
                { name: "Fresh Smoothie Bowl", quantity: 2, notes: "", status: "pending" },
            ],
            status: "pending",
            createdAt: new Date(Date.now() - 3 * 60000),
            customerName: "Emma W.",
            orderType: "takeout",
            priority: "normal",
            specialInstructions: "Call when ready"
        },
        {
            id: "k6",
            orderId: "ORD-2026-006",
            items: [
                { name: "Spicy Chicken Curry", quantity: 1, notes: "Extra spicy", status: "pending" },
                { name: "Mushroom Risotto", quantity: 1, notes: "", status: "pending" },
                { name: "Bruschetta Trio", quantity: 1, notes: "", status: "pending" },
            ],
            status: "pending",
            createdAt: new Date(Date.now() - 2 * 60000),
            customerName: "James K.",
            tableNumber: "Table 8",
            orderType: "delivery",
            priority: "normal"
        },
    ];

    useEffect(() => {
        // Load demo orders
        setOrders(demoOrders);

        // Auto refresh every 30 seconds
        const interval = setInterval(() => {
            if (autoRefresh) {
                setLastUpdate(new Date());
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const getTimeElapsed = (date: Date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return "Just now";
        if (minutes === 1) return "1 min";
        if (minutes < 60) return `${minutes} min`;
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    const getTimeColor = (date: Date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes > 20) return "text-red-500 bg-red-50";
        if (minutes > 10) return "text-orange-500 bg-orange-50";
        return "text-green-500 bg-green-50";
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "rush":
                return <Badge className="bg-orange-500 hover:bg-orange-600"><Flame className="w-3 h-3 mr-1" /> RUSH</Badge>;
            case "vip":
                return <Badge className="bg-purple-500 hover:bg-purple-600"><Star className="w-3 h-3 mr-1" /> VIP</Badge>;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="border-orange-500 text-orange-500 bg-orange-50">NEW</Badge>;
            case "preparing":
                return <Badge className="bg-blue-500 hover:bg-blue-600">PREPARING</Badge>;
            case "ready":
                return <Badge className="bg-green-500 hover:bg-green-600">READY</Badge>;
            case "served":
                return <Badge className="bg-gray-500 hover:bg-gray-600">SERVED</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getOrderTypeIcon = (type: string) => {
        switch (type) {
            case "dine-in":
                return "🍽️";
            case "takeout":
                return "🥡";
            case "delivery":
                return "🚗";
            default:
                return "📝";
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === "all") return true;
        return order.status === filter;
    });

    const pendingCount = orders.filter(o => o.status === "pending").length;
    const preparingCount = orders.filter(o => o.status === "preparing").length;
    const readyCount = orders.filter(o => o.status === "ready").length;

    const handleItemStatus = (orderId: string, itemIndex: number) => {
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                const newItems = [...order.items];
                const currentStatus = newItems[itemIndex].status;
                if (currentStatus === "pending") {
                    newItems[itemIndex] = { ...newItems[itemIndex], status: "preparing" };
                } else if (currentStatus === "preparing") {
                    newItems[itemIndex] = { ...newItems[itemIndex], status: "ready" };
                }

                // Check if all items are ready
                const allReady = newItems.every(item => item.status === "ready");

                return {
                    ...order,
                    items: newItems,
                    status: allReady ? "ready" : newItems.some(i => i.status === "preparing") ? "preparing" : order.status
                };
            }
            return order;
        }));
    };

    const handleDeleteOrder = (orderId: string) => {
        setOrders(prev => prev.filter(order => order.id !== orderId));
        toast({
            title: "Order Removed",
            description: "The order has been removed from the queue",
            variant: "destructive"
        });
    };

    const handleMarkServed = (orderId: string) => {
        setOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                return { ...order, status: "served" as const };
            }
            return order;
        }));
        toast({
            title: "Order Served",
            description: "Order marked as served and removed",
        });
        // Remove from list after a short delay
        setTimeout(() => {
            setOrders(prev => prev.filter(order => order.id !== orderId));
        }, 2000);
    };

    const handleAddOrder = () => {
        const newOrder: KitchenOrder = {
            id: `k${Date.now()}`,
            orderId: `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`,
            items: [
                { name: "New Item", quantity: 1, notes: "", status: "pending" }
            ],
            status: "pending",
            createdAt: new Date(),
            customerName: "New Customer",
            tableNumber: "Table 1",
            orderType: "dine-in",
            priority: "normal"
        };
        setOrders(prev => [newOrder, ...prev]);
        setShowAddModal(false);
        toast({
            title: "Order Added",
            description: "New order has been added to the queue",
        });
    };

    return (
        <div className="space-y-4 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 rounded-lg">
            {/* Header Stats */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                        <ChefHat className="w-6 h-6 text-orange-400" />
                        <h2 className="text-xl font-bold text-white">Kitchen Display System</h2>
                    </div>
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                        Last update: {lastUpdate.toLocaleTimeString()}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={soundEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={soundEnabled ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                        <Bell className={`w-4 h-4 ${soundEnabled ? "" : "opacity-50"}`} />
                    </Button>
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="text-white border-white/30 hover:bg-white/20"
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddOrder}
                        className="bg-green-500 hover:bg-green-600"
                    >
                        <Plus className="w-4 h-4 mr-1" /> New Order
                    </Button>
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className={`border-orange-500 ${pendingCount > 0 ? "bg-orange-500/20" : "bg-slate-800"} border-2`}>
                    <CardContent className="pt-4 text-center">
                        <div className="text-4xl font-bold text-orange-400">{pendingCount}</div>
                        <p className="text-sm text-orange-200">New Orders</p>
                    </CardContent>
                </Card>
                <Card className={`border-blue-500 ${preparingCount > 0 ? "bg-blue-500/20" : "bg-slate-800"} border-2`}>
                    <CardContent className="pt-4 text-center">
                        <div className="text-4xl font-bold text-blue-400">{preparingCount}</div>
                        <p className="text-sm text-blue-200">Preparing</p>
                    </CardContent>
                </Card>
                <Card className={`border-green-500 ${readyCount > 0 ? "bg-green-500/20" : "bg-slate-800"} border-2`}>
                    <CardContent className="pt-4 text-center">
                        <div className="text-4xl font-bold text-green-400">{readyCount}</div>
                        <p className="text-sm text-green-200">Ready to Serve</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                {["all", "pending", "preparing", "ready"].map(status => (
                    <Button
                        key={status}
                        variant={filter === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(status)}
                        className={`capitalize ${filter === status ? "bg-white/20 hover:bg-white/30 text-white" : "text-white border-white/30 hover:bg-white/10"}`}
                    >
                        {status}
                        {status !== "all" && (
                            <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                                {status === "pending" ? pendingCount : status === "preparing" ? preparingCount : readyCount}
                            </Badge>
                        )}
                    </Button>
                ))}
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOrders.map(order => (
                    <Card
                        key={order.id}
                        className={`border-l-4 overflow-hidden ${order.priority === "vip" ? "border-l-purple-500 bg-purple-500/10" :
                            order.priority === "rush" ? "border-l-orange-500 bg-orange-500/10" :
                                "border-l-primary bg-slate-800"}`}
                    >
                        <CardHeader className="pb-2 bg-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-white">{order.orderId}</span>
                                        <span className="text-lg">{getOrderTypeIcon(order.orderType)}</span>
                                        {getPriorityBadge(order.priority)}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-300 mt-1">
                                        <User className="w-3 h-3" />
                                        <span className="text-sm">{order.customerName}</span>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-sm">{order.tableNumber || order.orderType}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className={`flex items-center gap-1 mt-2 px-2 py-1 rounded text-sm font-medium w-fit ${getTimeColor(order.createdAt)}`}>
                                <Timer className="w-4 h-4" />
                                {getTimeElapsed(order.createdAt)}
                            </div>
                        </CardHeader>
                        <CardContent className="bg-slate-800">
                            <div className="mb-2">{getStatusBadge(order.status)}</div>

                            {order.specialInstructions && (
                                <div className="mb-2 px-2 py-1 bg-yellow-500/20 text-yellow-200 text-xs rounded">
                                    📝 {order.specialInstructions}
                                </div>
                            )}

                            <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-2 rounded-lg transition-all ${item.status === "ready" ? "bg-green-500/20 border border-green-500/30" :
                                                item.status === "preparing" ? "bg-blue-500/20 border border-blue-500/30" :
                                                    "bg-slate-700/50 border border-slate-600"
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-sm ${item.status === "ready" ? "text-green-400" :
                                                        item.status === "preparing" ? "text-blue-400" : "text-white"
                                                    }`}>
                                                    {item.quantity}x
                                                </span>
                                                <span className="text-white text-sm font-medium">{item.name}</span>
                                            </div>
                                            {item.notes && (
                                                <p className="text-xs text-yellow-400 italic ml-6">• {item.notes}</p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={item.status === "ready" ? "default" : "outline"}
                                            onClick={() => handleItemStatus(order.id, idx)}
                                            disabled={item.status === "ready"}
                                            className={`${item.status === "ready" ? "bg-green-500 hover:bg-green-600" :
                                                    item.status === "preparing" ? "border-blue-400 text-blue-400 hover:bg-blue-400/20" :
                                                        "border-orange-400 text-orange-400 hover:bg-orange-400/20"
                                                }`}
                                        >
                                            {item.status === "pending" && <Clock className="w-3 h-3" />}
                                            {item.status === "preparing" && <ChefHat className="w-3 h-3" />}
                                            {item.status === "ready" && <CheckCircle className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {order.status === "ready" && (
                                <Button
                                    className="w-full mt-3 bg-green-500 hover:bg-green-600"
                                    onClick={() => handleMarkServed(order.id)}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Served
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No orders in queue</p>
                    <Button
                        variant="outline"
                        className="mt-4 border-white/30 text-white hover:bg-white/10"
                        onClick={handleAddOrder}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Order
                    </Button>
                </div>
            )}
        </div>
    );
};

export default KitchenDisplay;
