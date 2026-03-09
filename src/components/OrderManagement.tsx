import { useState, useEffect } from 'react';
import { adminApi, ordersApi } from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialogStandalone } from '@/components/ConfirmDialog';
import { Package, MoreVertical, Trash2, Edit2, Eye, Clock, CheckCircle, XCircle, Truck, ChefHat, AlertTriangle } from 'lucide-react';

interface OrderItem {
    menuItemId?: string;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    orderId?: string;
    customerName: string;
    email: string;
    phone: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    deliveryType: 'delivery' | 'pickup' | 'dine-in';
    deliveryAddress?: {
        street: string;
        city: string;
        instructions?: string;
    };
    createdAt: string;
    updatedAt?: string;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600' },
    { value: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-orange-600' },
    { value: 'ready', label: 'Ready', icon: Package, color: 'text-purple-600' },
    { value: 'delivered', label: 'Delivered', icon: Truck, color: 'text-teal-600' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
];

const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'failed', label: 'Failed', color: 'text-red-600' },
    { value: 'refunded', label: 'Refunded', color: 'text-gray-600' },
];

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [paymentFilter, setPaymentFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (statusFilter !== 'all') filters.status = statusFilter;
            if (paymentFilter !== 'all') filters.paymentStatus = paymentFilter;

            const data: any = await adminApi.getAllOrders(filters);
            console.log('Orders API response:', data);
            if (data && data.length > 0) {
                console.log('First order items:', data[0].items);
            }
            setOrders(data?.orders || data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await ordersApi.updateStatus(orderId, newStatus);
            toast({
                title: 'Success',
                description: `Order status updated to ${newStatus}`,
            });
            fetchOrders();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update order status',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteOrder = async () => {
        if (!deletingOrderId) return;

        try {
            await ordersApi.delete(deletingOrderId);
            toast({
                title: 'Success',
                description: 'Order deleted successfully',
            });
            setDeleteDialogOpen(false);
            setDeletingOrderId(null);
            fetchOrders();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete order',
                variant: 'destructive',
            });
        }
    };

    const confirmDeleteOrder = (orderId: string) => {
        setDeletingOrderId(orderId);
        setDeleteDialogOpen(true);
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setOpenDialog(true);
    };

    const getStatusIcon = (status: string) => {
        const statusOption = statusOptions.find(s => s.value === status);
        if (statusOption) {
            const Icon = statusOption.icon;
            return <Icon className={`w-4 h-4 ${statusOption.color}`} />;
        }
        return <Clock className="w-4 h-4 text-gray-600" />;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: any) => {
        if (amount === undefined || amount === null || isNaN(amount)) return 'KES 0';
        return `KES ${Number(amount).toLocaleString()}`;
    };

    const getItemSubtotal = (item: any) => {
        const price = item?.price ?? item?.Price ?? 0;
        const quantity = item?.quantity ?? item?.Quantity ?? item?.qty ?? 1;
        return Number(price) * Number(quantity);
    };

    const getItemName = (item: any) => {
        // Try multiple possible field names for the item name
        if (item?.name) return item.name;
        if (item?.Name) return item.Name;
        if (item?.itemName) return item.itemName;
        if (item?.item?.name) return item.item.name;
        if (item?.title) return item.title;
        if (item?.productName) return item.productName;
        // If no name found, try to return a string representation of the item
        if (item && typeof item === 'object') {
            const keys = Object.keys(item);
            for (const key of keys) {
                if (typeof item[key] === 'string' && item[key].length > 0) {
                    return item[key];
                }
            }
        }
        return 'Unknown Item';
    };

    const getItemPrice = (item: any) => {
        return item?.price ?? item?.Price ?? item?.itemPrice ?? 0;
    };

    const getItemQuantity = (item: any) => {
        return item?.quantity ?? item?.Quantity ?? item?.qty ?? item?.Qty ?? 1;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Order Management
                </h2>
                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 dark:bg-gray-700">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                            <SelectItem value="all">All Status</SelectItem>
                            {statusOptions.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger className="w-40 dark:bg-gray-700">
                            <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                            <SelectItem value="all">All Payments</SelectItem>
                            {paymentStatusOptions.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchOrders}>
                        Refresh
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No orders found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium">
                                        {order.orderId || order._id}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{order.customerName}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.items?.length > 0 ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}` : 'No items'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Select
                                            value={order.status}
                                            onValueChange={(value) => handleStatusChange(order._id, value)}
                                        >
                                            <SelectTrigger className="w-36 h-8">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(order.status)}
                                                    <span className="capitalize">{order.status}</span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-700">
                                                {statusOptions.map(status => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(status.value)}
                                                            <span>{status.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`capitalize font-medium ${paymentStatusOptions.find(p => p.value === order.paymentStatus)?.color
                                            }`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 capitalize">
                                        {order.deliveryType || 'dine-in'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="dark:bg-gray-700 dark:border-gray-600">
                                                <DropdownMenuItem
                                                    onClick={() => handleViewOrder(order)}
                                                    className="dark:text-white"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => confirmDeleteOrder(order._id)}
                                                    className="text-red-600 dark:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Order
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            {selectedOrder?.orderId || selectedOrder?._id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400">Customer Information</h4>
                                    <p className="font-medium">{selectedOrder.customerName}</p>
                                    <p className="text-sm">{selectedOrder.email}</p>
                                    <p className="text-sm">{selectedOrder.phone}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400">Order Information</h4>
                                    <p>Status: <span className="capitalize font-medium">{selectedOrder.status}</span></p>
                                    <p>Payment: <span className="capitalize">{selectedOrder.paymentStatus}</span></p>
                                    <p>Type: <span className="capitalize">{selectedOrder.deliveryType || 'dine-in'}</span></p>
                                    <p>Method: <span className="capitalize">{selectedOrder.paymentMethod}</span></p>
                                </div>
                            </div>

                            {selectedOrder.deliveryAddress && (
                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400">Delivery Address</h4>
                                    <p>{selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}</p>
                                    {selectedOrder.deliveryAddress.instructions && (
                                        <p className="text-sm text-gray-500">Instructions: {selectedOrder.deliveryAddress.instructions}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium text-gray-500 dark:text-gray-400">Order Items</h4>
                                <div className="mt-2 border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Item</th>
                                                <th className="px-4 py-2 text-center">Qty</th>
                                                <th className="px-4 py-2 text-right">Price</th>
                                                <th className="px-4 py-2 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map((item: any, index: number) => (
                                                <tr key={index} className="border-t dark:border-gray-700">
                                                    <td className="px-4 py-2">{getItemName(item)}</td>
                                                    <td className="px-4 py-2 text-center">{getItemQuantity(item)}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(getItemPrice(item))}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(getItemSubtotal(item))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700 font-medium">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-right">Total</td>
                                                <td className="px-4 py-2 text-right">{formatCurrency(selectedOrder?.total)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500">
                                <p>Created: {formatDate(selectedOrder.createdAt)}</p>
                                {selectedOrder.updatedAt && (
                                    <p>Updated: {formatDate(selectedOrder.updatedAt)}</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Order"
                description="Are you sure you want to delete this order? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteOrder}
            />
        </div>
    );
}
