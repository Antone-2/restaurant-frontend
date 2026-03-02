import { useState, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    MoreVertical,
    Trash2,
    Edit2,
    AlertTriangle,
    Package,
    TrendingDown,
    Calendar,
} from 'lucide-react';

interface InventoryItem {
    _id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorderLevel: number;
    supplier: string;
    unitCost: number;
    lastRestocked: string;
    expiryDate: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface Alerts {
    lowStock: Array<{ itemId: string; name: string; currentQty: number; reorderLevel: number }>;
    expiringSoon: Array<{ itemId: string; name: string; expiryDate: string; daysLeft: number }>;
    suppliers: Array<{ name: string; phone: string; email: string }>;
}

export default function InventoryDashboard() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [alerts, setAlerts] = useState<Alerts | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        category: 'Produce',
        quantity: 0,
        unit: 'kg',
        reorderLevel: 10,
        supplier: '',
        unitCost: 0,
        expiryDate: '',
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchInventory();
        fetchAlerts();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found');
                setInventory([]);
                setLoading(false);
                return;
            }
            const response = await fetch('/api/admin/inventory', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                console.error('Failed to fetch inventory:', response.status, response.statusText);
                setInventory([]);
                setLoading(false);
                return;
            }
            const data = await response.json();
            setInventory(data.inventory || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found');
                return;
            }
            const response = await fetch('/api/admin/inventory/alerts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                console.error('Failed to fetch alerts:', response.status);
                return;
            }
            const data = await response.json();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        }
    };

    const handleAddItem = async () => {
        if (!formData.name || !formData.category) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in required fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({ title: 'Error', description: 'Please log in', variant: 'destructive' });
                return;
            }
            const response = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to add item');

            toast({
                title: 'Success',
                description: 'Inventory item added successfully',
            });

            setFormData({
                name: '',
                category: 'Produce',
                quantity: 0,
                unit: 'kg',
                reorderLevel: 10,
                supplier: '',
                unitCost: 0,
                expiryDate: '',
            });
            setOpenDialog(false);
            fetchInventory();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add inventory item',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm('Delete this inventory item?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({ title: 'Error', description: 'Please log in', variant: 'destructive' });
                return;
            }
            await fetch(`/api/admin/inventory/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({ title: 'Success', description: 'Item deleted' });
            fetchInventory();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete item',
                variant: 'destructive',
            });
        }
    };

    const categories = ['all', 'Produce', 'Meat', 'Seafood', 'Oils & Condiments', 'Dairy'];

    const filteredInventory =
        filterCategory === 'all'
            ? (inventory || [])
            : (inventory || []).filter((item) => item.category === filterCategory);

    const totalValue = (inventory || []).reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Inventory Management
                </h2>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="dark:bg-gray-800 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Inventory Item</DialogTitle>
                            <DialogDescription>
                                Add a new item to your restaurant inventory
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Item Name *</label>
                                <Input
                                    placeholder="e.g., Fresh Salmon"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                >
                                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                                        <SelectItem value="Produce">Produce</SelectItem>
                                        <SelectItem value="Meat">Meat</SelectItem>
                                        <SelectItem value="Seafood">Seafood</SelectItem>
                                        <SelectItem value="Oils & Condiments">
                                            Oils & Condiments
                                        </SelectItem>
                                        <SelectItem value="Dairy">Dairy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Quantity</label>
                                    <Input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantity: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Unit</label>
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, unit: value })
                                        }
                                    >
                                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="litre">litre</SelectItem>
                                            <SelectItem value="units">units</SelectItem>
                                            <SelectItem value="boxes">boxes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Unit Cost (KES)</label>
                                    <Input
                                        type="number"
                                        value={formData.unitCost}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                unitCost: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Reorder Level</label>
                                    <Input
                                        type="number"
                                        value={formData.reorderLevel}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                reorderLevel: parseFloat(e.target.value) || 10,
                                            })
                                        }
                                        className="dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Supplier</label>
                                <Input
                                    placeholder="Supplier name"
                                    value={formData.supplier}
                                    onChange={(e) =>
                                        setFormData({ ...formData, supplier: e.target.value })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Expiry Date</label>
                                <Input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            expiryDate: e.target.value,
                                        })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <Button onClick={handleAddItem} className="w-full">
                                Add Item
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Alerts Section */}
            {alerts && alerts.lowStock && alerts.expiringSoon && (
                <div className="grid gap-4">
                    {(alerts.lowStock || []).length > 0 && (
                        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <AlertTitle className="text-orange-800 dark:text-orange-200">
                                Low Stock Alert
                            </AlertTitle>
                            <AlertDescription className="text-orange-700 dark:text-orange-300">
                                {(alerts.lowStock || []).map((item) => (
                                    <div key={item.itemId} className="text-sm">
                                        {item.name}: {item.currentQty} {item.currentQty <= item.reorderLevel ? '⚠️' : ''}
                                    </div>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}

                    {(alerts.expiringSoon || []).length > 0 && (
                        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                            <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertTitle className="text-red-800 dark:text-red-200">
                                Expiring Soon
                            </AlertTitle>
                            <AlertDescription className="text-red-700 dark:text-red-300">
                                {(alerts.expiringSoon || []).map((item) => (
                                    <div key={item.itemId} className="text-sm">
                                        {item.name}: expires in {item.daysLeft} days
                                    </div>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
                    <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        {inventory.length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        Low Stock Items
                    </div>
                    <div className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">
                        {inventory.filter((i) => i.status === 'low-stock').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                    <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        KES {totalValue.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                    >
                        {cat === 'all' ? 'All Items' : cat}
                    </button>
                ))}
            </div>

            {/* Inventory List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No inventory items found
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredInventory.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {item.name}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded ${item.status === 'in-stock'
                                                ? 'bg-green-100 text-green-800'
                                                : item.status === 'low-stock'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {item.status === 'in-stock'
                                                ? '✓ In Stock'
                                                : item.status === 'low-stock'
                                                    ? '⚠ Low Stock'
                                                    : '✗ Out of Stock'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {item.category}
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Quantity
                                            </span>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Unit Cost
                                            </span>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                KES {item.unitCost}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Reorder Level
                                            </span>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {item.reorderLevel} {item.unit}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Supplier
                                            </span>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {item.supplier}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        Expires: {item.expiryDate}
                                        <Calendar className="w-3 h-3 ml-3" />
                                        Restocked: {item.lastRestocked}
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <DropdownMenuItem className="dark:text-white">
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
