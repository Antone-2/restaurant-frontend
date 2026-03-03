import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { menuApi } from "@/services/api";
import { menuItems as staticMenuItems, MenuItem } from "@/data/menuData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import QuickViewModal from "./QuickViewModal";

interface MenuItemType {
    _id: string;
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    popular: boolean;
    available: boolean;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

const MenuSearch = () => {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [showPopular, setShowPopular] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [useApi, setUseApi] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();

    const categories = ["all", "starters", "mains", "drinks", "specials"];


    const fetchMenuItems = async () => {
        setLoading(true);
        setError(null);

        if (!useApi) {
            // Use static data
            const mappedItems = staticMenuItems.map(item => ({
                _id: item.id,
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                category: item.category,
                popular: item.popular || false,
                available: true
            }));
            setMenuItems(mappedItems);
            setLoading(false);
            return;
        }

        try {
            const filters: any = {};
            if (selectedCategory !== "all") filters.category = selectedCategory;
            if (search) filters.search = search;
            if (priceRange[0] > 0) filters.minPrice = priceRange[0];
            if (priceRange[1] < 10000) filters.maxPrice = priceRange[1];
            if (showPopular) filters.popular = true;

            const data = await menuApi.getAll(filters);
            setMenuItems(data);
        } catch (err) {
            console.warn("API failed, falling back to static data:", err);
            setUseApi(false);
            // Use static data as fallback
            const mappedItems = staticMenuItems.map(item => ({
                _id: item.id,
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                category: item.category,
                popular: item.popular || false,
                available: true
            }));
            setMenuItems(mappedItems);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useMemo(() => {
        const timer = setTimeout(() => {
            fetchMenuItems();
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedCategory, search, priceRange, showPopular, useApi]);

    const filteredItems = useMemo(() => {
        return menuItems.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
            const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
            const matchesPopular = !showPopular || item.popular;
            return matchesSearch && matchesCategory && matchesPrice && matchesPopular;
        });
    }, [search, selectedCategory, priceRange, showPopular, menuItems]);

    const handleQuickView = (item: MenuItemType) => {
        setSelectedItem(item);
    };

    // Convert API item to cart item format
    const convertToCartItem = (item: MenuItemType) => {
        return {
            id: item.id || item._id || '',
            name: item.name,
            price: item.price,
            image: item.image,
            description: item.description,
            category: item.category as 'starters' | 'mains' | 'drinks' | 'specials'
        };
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        type="text"
                        placeholder="Search menu items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X size={16} className="text-muted-foreground" />
                        </button>
                    )}
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                    <SlidersHorizontal size={18} />
                    Filters
                </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                        {/* Categories */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
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
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Price Range: Ksh {priceRange[0]} - {priceRange[1]}</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    className="w-24"
                                    min={0}
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    className="w-24"
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Popular Toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="popular"
                                checked={showPopular}
                                onChange={(e) => setShowPopular(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="popular" className="text-sm">Show only popular items</label>
                        </div>

                        {/* Clear Filters */}
                        <Button variant="ghost" onClick={() => {
                            setSelectedCategory("all");
                            setPriceRange([0, 10000]);
                            setShowPopular(false);
                            setSearch("");
                        }}>
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading menu...</span>
                </div>
            )}

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found
                        {!useApi && <Badge variant="outline" className="ml-2">Offline Mode</Badge>}
                    </p>
                    {search && (
                        <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                            Clear search
                        </Button>
                    )}
                </div>
            )}

            {/* Results Grid */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                        <Card key={item._id} className="overflow-hidden border-primary/10 bg-card hover:shadow-xl transition-all group">
                            <div className="relative overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                                    onClick={() => handleQuickView(item)}
                                    loading="lazy"
                                />
                                {item.popular && (
                                    <Badge className="absolute top-2 right-2 bg-primary">Popular</Badge>
                                )}
                            </div>
                            <CardContent className="p-3">
                                <h3 className="font-display font-semibold text-card-foreground truncate">{item.name}</h3>
                                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{item.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-primary font-bold">Ksh {item.price}</span>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleQuickView(item)}
                                        >
                                            Quick View
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-primary"
                                            onClick={() => addToCart(convertToCartItem(item))}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No items found matching your criteria</p>
                    <Button variant="link" onClick={() => {
                        setSearch("");
                        setSelectedCategory("all");
                        setPriceRange([0, 10000]);
                        setShowPopular(false);
                    }}>
                        Clear filters
                    </Button>
                </div>
            )}

            {/* Quick View Modal */}
            <QuickViewModal
                item={selectedItem ? {
                    ...selectedItem,
                    category: selectedItem.category as 'starters' | 'mains' | 'drinks' | 'specials'
                } : null}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    );
};

export default MenuSearch;
