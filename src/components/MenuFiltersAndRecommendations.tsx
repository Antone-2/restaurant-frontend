import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Flame, Leaf, Wheat } from 'lucide-react';
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;

interface DietaryTag {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    spicy: boolean;
    lowCalorie: boolean;
}

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    dietary: DietaryTag;
    orders: number;
    rating: number;
    category: string;
}

const MenuFiltersAndRecommendations = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Active dietary filters
    const [filters, setFilters] = useState({
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        dairyFree: false,
        spicy: false,
        lowCalorie: false
    });

    const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price'>('popular');

    useEffect(() => {
        fetchMenuAndRecommendations();
    }, []);

    const fetchMenuAndRecommendations = async () => {
        setLoading(true);
        try {
            const [menuRes, recRes] = await Promise.all([
                fetch(`${API_BASE_URL}/menu`),
                fetch(`${API_BASE_URL}/menu/recommendations`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                })
            ]);

            if (menuRes.ok) {
                const menuData = await menuRes.json();
                setMenuItems(menuData.items || []);
            }

            if (recRes.ok) {
                const recData = await recRes.json();
                setRecommendations(recData.recommendations || []);
            }
        } catch (err) {
            console.error('Failed to fetch menu:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter menu items based on active filters
    const filteredItems = menuItems.filter(item => {
        const filterArray = Object.entries(filters).filter(([_, value]) => value);
        if (filterArray.length === 0) return true;
        return filterArray.every(([key, _]) => item.dietary[key as keyof DietaryTag]);
    });

    // Sort filtered items
    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return b.orders - a.orders;
            case 'rating':
                return b.rating - a.rating;
            case 'price':
                return a.price - b.price;
            default:
                return 0;
        }
    });

    const toggleFilter = (key: keyof typeof filters) => {
        setFilters(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getDietaryBadges = (dietary: DietaryTag) => {
        const badges = [];
        if (dietary.vegan) badges.push({ label: 'Vegan', icon: Leaf, color: 'bg-green-100 text-green-800' });
        if (dietary.vegetarian) badges.push({ label: 'Vegetarian', icon: Leaf, color: 'bg-emerald-100 text-emerald-800' });
        if (dietary.glutenFree) badges.push({ label: 'Gluten-Free', icon: Wheat, color: 'bg-yellow-100 text-yellow-800' });
        if (dietary.dairyFree) badges.push({ label: 'Dairy-Free', icon: Leaf, color: 'bg-blue-100 text-blue-800' });
        if (dietary.spicy) badges.push({ label: 'Spicy', icon: Flame, color: 'bg-red-100 text-red-800' });
        if (dietary.lowCalorie) badges.push({ label: 'Low Cal', icon: Flame, color: 'bg-orange-100 text-orange-800' });
        return badges;
    };

    return (
        <div className="space-y-6">
            {/* Dietary Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { key: 'vegan' as const, label: 'Vegan', icon: Leaf },
                            { key: 'vegetarian' as const, label: 'Vegetarian', icon: Leaf },
                            { key: 'glutenFree' as const, label: 'Gluten-Free', icon: Wheat },
                            { key: 'dairyFree' as const, label: 'Dairy-Free', icon: Leaf },
                            { key: 'spicy' as const, label: 'Spicy', icon: Flame },
                            { key: 'lowCalorie' as const, label: 'Low Calorie', icon: Flame }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => toggleFilter(key)}
                                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${filters[key as keyof typeof filters]
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium text-center">{label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && Object.values(filters).every(f => !f) && (
                <Card className="border-primary bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Recommended For You
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.slice(0, 6).map(item => (
                                <div key={item._id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                                    {item.image && (
                                        <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-md mb-3" />
                                    )}
                                    <h3 className="font-semibold text-sm">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 my-1">{item.description}</p>
                                    <div className="flex gap-1 flex-wrap my-2">
                                        {getDietaryBadges(item.dietary).slice(0, 2).map(badge => (
                                            <Badge key={badge.label} variant="outline" className="text-xs">
                                                {badge.label}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-sm">KES {item.price}</p>
                                        <span className="text-xs text-muted-foreground">⭐ {item.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sort Options */}
            <div className="flex gap-2">
                <span className="text-sm font-medium self-center">Sort by:</span>
                {['popular', 'rating', 'price'].map(option => (
                    <Button
                        key={option}
                        variant={sortBy === option ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy(option as any)}
                    >
                        {option === 'popular' ? 'Most Popular' : option === 'rating' ? 'Highest Rated' : 'Price: Low to High'}
                    </Button>
                ))}
            </div>

            {/* Filtered Menu Items */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Menu Items {Object.values(filters).some(f => f) && `(${sortedItems.length} matching)`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-muted-foreground">Loading menu...</p>
                    ) : sortedItems.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No items match your dietary preferences. Try clearing filters.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedItems.map(item => (
                                <div key={item._id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer group">
                                    {item.image && (
                                        <div className="relative overflow-hidden rounded-md mb-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    )}
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 my-1">{item.description}</p>

                                    {/* Dietary Tags */}
                                    <div className="flex gap-1 flex-wrap my-2">
                                        {getDietaryBadges(item.dietary).map(badge => {
                                            const Icon = badge.icon;
                                            return (
                                                <div key={badge.label} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {badge.label}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t">
                                        <div>
                                            <p className="font-bold">KES {item.price}</p>
                                            <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">⭐ {item.rating.toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MenuFiltersAndRecommendations;
