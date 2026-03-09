import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { menuApi } from "@/services/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialogStandalone } from "@/components/ConfirmDialog";
import {
    Utensils,
    Search,
    Plus,
    Trash2,
    Edit,
    Star,
    Image as ImageIcon,
    DollarSign,
    Tag,
    Check,
    X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Menu item interface
interface MenuItem {
    _id: string;
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    imageUrl: string;
    popular: boolean;
    available: boolean;
    dietaryTags: string[];
    allergens: string[];
    spicy: string;
    popularTags: string[];
    nutritionalInfo: {
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        fiber: number;
        sodium: number;
    };
    stockQuantity?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
}

// Helper to get item ID
const getItemId = (item: MenuItem): string => item._id || item.id || '';

// Menu categories
const CATEGORIES = [
    "starters",
    "mains",
    "desserts",
    "drinks",
    "specials"
];

// Spicy levels
const SPICY_LEVELS = [
    { value: "", label: "Not Spicy" },
    { value: "mild", label: "Mild" },
    { value: "medium", label: "Medium" },
    { value: "hot", label: "Hot" },
    { value: "extra-hot", label: "Extra Hot" }
];

// Default nutritional info
const DEFAULT_NUTRITIONAL_INFO = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sodium: 0
};

const MenuManagement = () => {
    const { toast } = useToast();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);

    // Dialog states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Selected item for edit/delete
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [deletingItemName, setDeletingItemName] = useState("");

    // Form state for add/edit
    const [formData, setFormData] = useState<Partial<MenuItem>>({
        name: "",
        description: "",
        price: 0,
        category: "mains",
        image: "",
        popular: false,
        available: true,
        dietaryTags: [],
        allergens: [],
        spicy: "",
        popularTags: [],
        nutritionalInfo: { ...DEFAULT_NUTRITIONAL_INFO }
    });

    // Fetch menu items from API
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await menuApi.getAll({ category: selectedCategory !== 'all' ? selectedCategory : undefined });

                // Handle both response formats
                let items = Array.isArray(response) ? response : (response as any)?.data || [];

                // Debug: Log the first item to see its structure
                if (items.length > 0) {
                    console.log('First menu item:', JSON.stringify(items[0]));
                }

                // Normalize items to ensure they have _id
                items = items.map((item: any) => ({
                    ...item,
                    _id: item._id || item.id || `temp-${Math.random().toString(36).substr(2, 9)}`
                }));

                setMenuItems(items);
            } catch (err) {
                console.error('Failed to fetch menu items:', err);
                setError('Failed to load menu items');
                toast({
                    title: "Error",
                    description: "Failed to load menu items. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [selectedCategory, toast]);

    // Filter menu items
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        const matchesAvailability = !showAvailableOnly || item.available;
        return matchesSearch && matchesCategory && matchesAvailability;
    });

    // Open add dialog
    const handleAddClick = () => {
        setFormData({
            name: "",
            description: "",
            price: 0,
            category: "mains",
            image: "",
            popular: false,
            available: true,
            dietaryTags: [],
            allergens: [],
            spicy: "",
            popularTags: [],
            nutritionalInfo: { ...DEFAULT_NUTRITIONAL_INFO }
        });
        setAddDialogOpen(true);
    };

    // Open edit dialog
    const handleEditClick = (item: MenuItem) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            description: item.description || "",
            price: item.price,
            category: item.category,
            image: item.image || item.imageUrl || "",
            popular: item.popular || false,
            available: item.available !== false,
            dietaryTags: item.dietaryTags || [],
            allergens: item.allergens || [],
            spicy: item.spicy || "",
            popularTags: item.popularTags || [],
            nutritionalInfo: item.nutritionalInfo || { ...DEFAULT_NUTRITIONAL_INFO }
        });
        setEditDialogOpen(true);
    };

    // Open delete dialog
    const handleDeleteClick = (item: MenuItem) => {
        setSelectedItem(item);
        setDeletingItemName(item.name);
        setDeleteDialogOpen(true);
    };

    // Handle form input change
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle dietary tags
    const handleDietaryTagToggle = (tag: string) => {
        const currentTags = formData.dietaryTags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        setFormData(prev => ({ ...prev, dietaryTags: newTags }));
    };

    // Handle popular tags
    const handlePopularTagToggle = (tag: string) => {
        const currentTags = formData.popularTags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        setFormData(prev => ({ ...prev, popularTags: newTags }));
    };

    // Handle add new menu item
    const handleAddMenuItem = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (name, price, category)",
                variant: "destructive"
            });
            return;
        }

        try {
            setSaving(true);
            const menuData = {
                name: formData.name,
                description: formData.description || "",
                price: formData.price,
                category: formData.category,
                image: formData.image || "",
                popular: formData.popular || false,
                available: formData.available !== false,
                dietaryTags: formData.dietaryTags || [],
                allergens: formData.allergens || [],
                spicy: formData.spicy || "",
                popularTags: formData.popularTags || [],
                nutritionalInfo: formData.nutritionalInfo || { ...DEFAULT_NUTRITIONAL_INFO }
            };

            const response = await menuApi.create(menuData);

            // Add new item to the list - handle both response formats
            const newItem = response.menuItem || response;
            // Ensure the new item has an ID
            if (!newItem._id && !newItem.id && response._id) {
                newItem._id = response._id;
            }
            setMenuItems(prev => [newItem, ...prev]);

            toast({
                title: "Success",
                description: `${formData.name} has been added to the menu.`
            });

            setAddDialogOpen(false);
        } catch (err: any) {
            console.error('Failed to add menu item:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to add menu item. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle update menu item
    const handleUpdateMenuItem = async () => {
        if (!selectedItem || !formData.name || !formData.price || !formData.category) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (name, price, category)",
                variant: "destructive"
            });
            return;
        }

        try {
            setSaving(true);
            const menuData = {
                name: formData.name,
                description: formData.description || "",
                price: formData.price,
                category: formData.category,
                image: formData.image || "",
                popular: formData.popular || false,
                available: formData.available !== false,
                dietaryTags: formData.dietaryTags || [],
                allergens: formData.allergens || [],
                spicy: formData.spicy || "",
                popularTags: formData.popularTags || [],
                nutritionalInfo: formData.nutritionalInfo || { ...DEFAULT_NUTRITIONAL_INFO }
            };

            await menuApi.update(getItemId(selectedItem), menuData);

            // Update item in the list
            setMenuItems(prev => prev.map(item =>
                getItemId(item) === getItemId(selectedItem)
                    ? { ...item, ...menuData }
                    : item
            ));

            toast({
                title: "Success",
                description: `${formData.name} has been updated.`
            });

            setEditDialogOpen(false);
        } catch (err: any) {
            console.error('Failed to update menu item:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to update menu item. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle delete menu item
    const handleDeleteMenuItem = async () => {
        if (!selectedItem) return;

        const itemId = getItemId(selectedItem);

        // Validate item ID - prevent deletion of items with temporary IDs
        if (!itemId || itemId.startsWith('temp-')) {
            toast({
                title: "Error",
                description: "This item cannot be deleted. It may not have been saved to the database yet. Please refresh the page and try again.",
                variant: "destructive"
            });
            setDeleteDialogOpen(false);
            return;
        }

        try {
            setSaving(true);
            await menuApi.delete(itemId);

            // Remove item from the list
            setMenuItems(prev => prev.filter(item => getItemId(item) !== itemId));

            toast({
                title: "Success",
                description: `${deletingItemName} has been deleted from the menu.`
            });

            setDeleteDialogOpen(false);
        } catch (err: any) {
            console.error('Failed to delete menu item:', err);
            const errorMessage = err.message || '';

            // Handle specific error cases
            if (err.status === 404 || errorMessage.includes('not found')) {
                // Item doesn't exist in backend - remove from local state anyway
                setMenuItems(prev => prev.filter(item => getItemId(item) !== itemId));
                toast({
                    title: "Item Removed",
                    description: `${deletingItemName} has been removed from the list (it no longer exists in the database).`
                });
            } else if (errorMessage.includes('Cannot delete fallback menu items')) {
                // Handle case when database is not connected and item is from fallback data
                toast({
                    title: "Cannot Delete",
                    description: "Cannot delete menu items when the database is not connected. These are default sample items.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: errorMessage || "Failed to delete menu item. Please try again.",
                    variant: "destructive"
                });
            }
        } finally {
            setSaving(false);
        }
    };

    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(price);
    };

    // Get category badge color
    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            starters: "bg-blue-500",
            mains: "bg-green-500",
            desserts: "bg-purple-500",
            drinks: "bg-cyan-500",
            specials: "bg-orange-500"
        };
        return colors[category] || "bg-gray-500";
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
                <Utensils className="w-12 h-12 text-red-500" />
                <p className="text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Add Menu Item Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Menu Item</DialogTitle>
                        <DialogDescription>
                            Add a new item to the restaurant menu.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="e.g., Grilled Salmon"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (KES) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Describe the dish..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleInputChange("category", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat} className="capitalize">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Spicy Level</Label>
                                <Select
                                    value={formData.spicy}
                                    onValueChange={(value) => handleInputChange("spicy", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPICY_LEVELS.map(level => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input
                                id="image"
                                value={formData.image}
                                onChange={(e) => handleInputChange("image", e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Dietary Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'].map(tag => (
                                    <Button
                                        key={tag}
                                        variant={formData.dietaryTags?.includes(tag) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleDietaryTagToggle(tag)}
                                        className="capitalize"
                                    >
                                        {tag.replace('-', ' ')}
                                        {formData.dietaryTags?.includes(tag) && <Check className="w-3 h-3 ml-1" />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Popular Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {['chef-special', 'customer-favourite', 'new', 'seasonal'].map(tag => (
                                    <Button
                                        key={tag}
                                        variant={formData.popularTags?.includes(tag) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePopularTagToggle(tag)}
                                        className="capitalize"
                                    >
                                        {tag.replace('-', ' ')}
                                        {formData.popularTags?.includes(tag) && <Check className="w-3 h-3 ml-1" />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="popular"
                                    checked={formData.popular}
                                    onChange={(e) => handleInputChange("popular", e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="popular" className="text-sm font-normal">Mark as Popular</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={formData.available}
                                    onChange={(e) => handleInputChange("available", e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="available" className="text-sm font-normal">Available</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddMenuItem} disabled={saving}>
                            {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add Menu Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Menu Item Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                        <DialogDescription>
                            Update the details for {selectedItem?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Price (KES) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleInputChange("category", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat} className="capitalize">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Spicy Level</Label>
                                <Select
                                    value={formData.spicy}
                                    onValueChange={(value) => handleInputChange("spicy", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPICY_LEVELS.map(level => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-image">Image URL</Label>
                            <Input
                                id="edit-image"
                                value={formData.image}
                                onChange={(e) => handleInputChange("image", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Dietary Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'].map(tag => (
                                    <Button
                                        key={tag}
                                        variant={formData.dietaryTags?.includes(tag) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleDietaryTagToggle(tag)}
                                        className="capitalize"
                                    >
                                        {tag.replace('-', ' ')}
                                        {formData.dietaryTags?.includes(tag) && <Check className="w-3 h-3 ml-1" />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Popular Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {['chef-special', 'customer-favourite', 'new', 'seasonal'].map(tag => (
                                    <Button
                                        key={tag}
                                        variant={formData.popularTags?.includes(tag) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePopularTagToggle(tag)}
                                        className="capitalize"
                                    >
                                        {tag.replace('-', ' ')}
                                        {formData.popularTags?.includes(tag) && <Check className="w-3 h-3 ml-1" />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit-popular"
                                    checked={formData.popular}
                                    onChange={(e) => handleInputChange("popular", e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="edit-popular" className="text-sm font-normal">Mark as Popular</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit-available"
                                    checked={formData.available}
                                    onChange={(e) => handleInputChange("available", e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="edit-available" className="text-sm font-normal">Available</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateMenuItem} disabled={saving}>
                            {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Menu Item"
                description={`Are you sure you want to permanently delete "${deletingItemName}"? This action cannot be undone.`}
                confirmText="Delete Permanently"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteMenuItem}
                loading={saving}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Utensils className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Menu Management</h2>
                </div>
                <Button onClick={handleAddClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{menuItems.length}</div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                            {menuItems.filter(i => i.available).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Available</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-orange-600">
                            {menuItems.filter(i => i.popular).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Popular Items</p>
                    </CardContent>
                </Card>
                <Card className="border-red-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">
                            {menuItems.filter(i => !i.available).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Unavailable</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory("all")}
                    >
                        All
                    </Button>
                    {CATEGORIES.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className="capitalize"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button
                        variant={showAvailableOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                    >
                        Available Only
                    </Button>
                </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item, index) => (
                    <Card key={getItemId(item) || `menu-${index}`} className={`overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
                        <div className="aspect-video relative bg-gray-100">
                            {item.image || item.imageUrl ? (
                                <img
                                    src={item.image || item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                            {item.popular && (
                                <Badge className="absolute top-2 right-2 bg-orange-500">
                                    <Star className="w-3 h-3 mr-1" /> Popular
                                </Badge>
                            )}
                            {!item.available && (
                                <Badge className="absolute top-2 left-2 bg-red-500">
                                    Unavailable
                                </Badge>
                            )}
                            {item.spicy && (
                                <Badge className="absolute bottom-2 left-2 bg-red-600">
                                    🌶️ {item.spicy}
                                </Badge>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <Badge className={`${getCategoryBadge(item.category)} mt-1`}>
                                        {item.category}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{formatPrice(item.price)}</div>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {item.description || "No description available"}
                            </p>
                            {item.dietaryTags && item.dietaryTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {item.dietaryTags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleEditClick(item)}
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteClick(item)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No menu items found</p>
                    <Button className="mt-4" onClick={handleAddClick}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Menu Item
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
