import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi, menuApi } from "@/services/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialogStandalone } from "@/components/ConfirmDialog";
import {
    Package,
    Search,
    Plus,
    Minus,
    AlertTriangle,
    Filter,
    Download,
    Upload,
    Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minStock: number;
    maxStock: number;
    price: number;
    supplier: string;
    lastUpdated: Date;
    status: "in-stock" | "low-stock" | "out-of-stock" | "overstock";
}

// API response type from backend
interface ApiInventoryItem {
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
    status: string;
}

const CATEGORIES = [
    "All Categories",
    "Proteins",
    "Vegetables",
    "Dairy",
    "Beverages",
    "Dry Goods",
    "Spices",
    "Supplies"
];

const InventoryManagement = () => {
    const { toast } = useToast();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const [deletingItemName, setDeletingItemName] = useState<string>("");
    const [deleting, setDeleting] = useState(false);

    // Fetch inventory data from API
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await adminApi.getInventory();

                // Transform API response to match component interface
                const transformedData: InventoryItem[] = (response as ApiInventoryItem[]).map((item) => ({
                    id: item._id,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity || 0,
                    unit: item.unit || 'kg',
                    minStock: item.reorderLevel || 5,
                    maxStock: (item.reorderLevel || 5) * 3, // Estimate max as 3x reorder level
                    price: item.unitCost || 0,
                    supplier: item.supplier || '',
                    lastUpdated: item.lastRestocked ? new Date(item.lastRestocked) : new Date(),
                    status: item.status as InventoryItem['status'] || 'in-stock'
                }));

                setInventory(transformedData);
            } catch (err) {
                console.error('Failed to fetch inventory:', err);
                setError('Failed to load inventory data');
                toast({
                    title: "Error",
                    description: "Failed to load inventory data. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, [toast]);

    // Handle delete click
    const handleDeleteClick = (id: string, name: string) => {
        setDeletingItemId(id);
        setDeletingItemName(name);
        setDeleteDialogOpen(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!deletingItemId) return;

        try {
            setDeleting(true);
            // Use menuApi.delete to permanently delete the menu item
            await menuApi.delete(deletingItemId);

            toast({
                title: "Success",
                description: `${deletingItemName} has been permanently deleted.`,
            });

            // Remove the deleted item from the local state
            setInventory(prev => prev.filter(item => item.id !== deletingItemId));
            setDeleteDialogOpen(false);
            setDeletingItemId(null);
            setDeletingItemName("");
        } catch (err) {
            console.error('Failed to delete item:', err);
            toast({
                title: "Error",
                description: "Failed to delete item. Please try again.",
                variant: "destructive"
            });
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status: string): React.ReactNode => {
        switch (status) {
            case "in-stock":
                return <Badge className="bg-green-500">In Stock</Badge>;
            case "low-stock":
                return <Badge className="bg-orange-500"><AlertTriangle className="w-3 h-3 mr-1" /> Low Stock</Badge>;
            case "out-of-stock":
                return <Badge className="bg-red-500"><AlertTriangle className="w-3 h-3 mr-1" /> Out of Stock</Badge>;
            case "overstock":
                return <Badge className="bg-blue-500">Overstock</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "in-stock":
                return "border-green-500 bg-green-50";
            case "low-stock":
                return "border-orange-500 bg-orange-50";
            case "out-of-stock":
                return "border-red-500 bg-red-50";
            case "overstock":
                return "border-blue-500 bg-blue-50";
            default:
                return "";
        }
    };

    const filteredItems = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
        const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const stats = {
        total: inventory.length,
        inStock: inventory.filter(i => i.status === "in-stock").length,
        lowStock: inventory.filter(i => i.status === "low-stock").length,
        outOfStock: inventory.filter(i => i.status === "out-of-stock").length,
        totalValue: inventory.reduce((sum, i) => sum + (i.price * i.quantity), 0),
    };

    const handleAdjustQuantity = (id: string, adjustment: number) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(0, item.quantity + adjustment);
                let newStatus: InventoryItem["status"] = "in-stock";
                if (newQuantity === 0) newStatus = "out-of-stock";
                else if (newQuantity < item.minStock) newStatus = "low-stock";
                else if (newQuantity > item.maxStock) newStatus = "overstock";

                return { ...item, quantity: newQuantity, status: newStatus, lastUpdated: new Date() };
            }
            return item;
        }));
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Package className="w-12 h-12 text-red-500" />
                <p className="text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Menu Item"
                description={`Are you sure you want to permanently delete "${deletingItemName}"? This action cannot be undone and the item will be removed from the menu.`}
                confirmText="Delete Permanently"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleConfirmDelete}
                loading={deleting}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Inventory Management</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
                        <p className="text-sm text-muted-foreground">In Stock</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
                        <p className="text-sm text-muted-foreground">Low Stock</p>
                    </CardContent>
                </Card>
                <Card className="border-red-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">KES {stats.totalValue.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {["all", "in-stock", "low-stock", "out-of-stock", "overstock"].map(status => (
                        <Button
                            key={status}
                            variant={selectedStatus === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedStatus(status)}
                            className="capitalize"
                        >
                            {status === "all" ? "All Status" : status.replace("-", " ")}
                        </Button>
                    ))}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input
                            placeholder="Search inventory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-medium">Item</th>
                                    <th className="text-left p-4 font-medium">Category</th>
                                    <th className="text-left p-4 font-medium">Quantity</th>
                                    <th className="text-left p-4 font-medium">Min/Max</th>
                                    <th className="text-left p-4 font-medium">Unit Price</th>
                                    <th className="text-left p-4 font-medium">Supplier</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item.id} className={`border-b ${getStatusColor(item.status)}`}>
                                        <td className="p-4">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Updated: {item.lastUpdated.toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4">{item.category}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-6 w-6"
                                                    onClick={() => handleAdjustQuantity(item.id, -1)}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="w-12 text-center font-medium">
                                                    {item.quantity} {item.unit}
                                                </span>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-6 w-6"
                                                    onClick={() => handleAdjustQuantity(item.id, 1)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {item.minStock} / {item.maxStock}
                                        </td>
                                        <td className="p-4">KES {item.price.toFixed(2)}</td>
                                        <td className="p-4 text-sm">{item.supplier}</td>
                                        <td className="p-4">{getStatusBadge(item.status)}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(item.id, item.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No inventory items found</p>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
