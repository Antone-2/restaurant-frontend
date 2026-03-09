import React, { useState } from 'react';
import {
    Leaf, Flame, Snowflake, Flower2, Sun, Star,
    ChevronLeft, ChevronRight, Sparkles, Clock, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Season types
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-year';

// Menu highlight types
export interface MenuHighlight {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    season: Season;
    isSeasonal: boolean;
    isNew?: boolean;
    isPopular?: boolean;
    discount?: number;
    available: boolean;
    // New dietary and tag fields
    dietaryTags?: string[];
    spicy?: 'mild' | 'medium' | 'hot' | 'extra-hot';
    popularTags?: string[];
}

// Default seasonal menu items
const seasonalMenuHighlights: MenuHighlight[] = [
    // Spring
    {
        id: 'spring-1',
        name: 'Spring Asparagus Risotto',
        description: 'Fresh asparagus with creamy Arborio rice, parmesan, and lemon zest',
        price: 1899,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400',
        category: 'mains',
        season: 'spring',
        isSeasonal: true,
        isNew: true,
        dietaryTags: ['vegetarian', 'gluten-free'],
        available: true
    },
    {
        id: 'spring-2',
        name: 'Garden Fresh Salad',
        description: 'Mixed greens, strawberries, feta, and honey balsamic dressing',
        price: 999,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        category: 'starters',
        season: 'spring',
        isSeasonal: true,
        isNew: true,
        dietaryTags: ['vegetarian'],
        available: true
    },
    // Summer
    {
        id: 'summer-1',
        name: 'Grilled Seafood Platter',
        description: 'Tiger prawns, lobster tail, fresh salmon, and calamari with herbs',
        price: 4499,
        image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
        category: 'specials',
        season: 'summer',
        isSeasonal: true,
        isPopular: true,
        dietaryTags: ['gluten-free', 'halal'],
        available: true
    },
    {
        id: 'summer-2',
        name: 'Tropical Smoothie Bowl',
        description: 'Mango, pineapple, coconut milk, topped with fresh fruits and granola',
        price: 899,
        image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        category: 'drinks',
        season: 'summer',
        isSeasonal: true,
        isNew: true,
        dietaryTags: ['vegan', 'gluten-free', 'dairy-free'],
        available: true
    },
    // Autumn
    {
        id: 'autumn-1',
        name: 'Pumpkin Spice Pasta',
        description: 'Creamy pumpkin sauce with sage, pine nuts, and fresh pasta',
        price: 1699,
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
        category: 'mains',
        season: 'autumn',
        isSeasonal: true,
        isNew: true,
        dietaryTags: ['vegetarian'],
        spicy: 'mild',
        discount: 10,
        available: true
    },
    {
        id: 'autumn-2',
        name: 'Harvest Bowl',
        description: 'Roasted sweet potatoes, quinoa, kale, and maple tahini dressing',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        category: 'mains',
        season: 'autumn',
        isSeasonal: true,
        dietaryTags: ['vegan', 'gluten-free', 'dairy-free'],
        available: true
    },
    // Winter
    {
        id: 'winter-1',
        name: 'Warming Beef Stew',
        description: 'Slow-cooked beef with root vegetables, herbs, and red wine',
        price: 1999,
        image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400',
        category: 'mains',
        season: 'winter',
        isSeasonal: true,
        isPopular: true,
        dietaryTags: ['gluten-free', 'halal'],
        available: true
    },
    {
        id: 'winter-2',
        name: 'Hot Chocolate Delight',
        description: 'Rich Belgian chocolate with whipped cream and marshmallows',
        price: 499,
        image: 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=400',
        category: 'drinks',
        season: 'winter',
        isSeasonal: true,
        isNew: true,
        dietaryTags: ['vegetarian'],
        available: true
    },
    // All Year
    {
        id: 'all-1',
        name: 'Wagyu Beef Steak',
        description: 'Premium A5 Wagyu beef with seasonal vegetables',
        price: 5499,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        category: 'mains',
        season: 'all-year',
        isSeasonal: false,
        isPopular: true,
        dietaryTags: ['gluten-free', 'halal'],
        available: true
    },
    {
        id: 'all-2',
        name: 'Lobster Thermidor',
        description: 'Succulent lobster in creamy cognac sauce',
        price: 3999,
        image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
        category: 'specials',
        season: 'all-year',
        isSeasonal: false,
        isPopular: true,
        dietaryTags: ['halal'],
        available: true
    }
];

// Get current season based on month
export const getCurrentSeason = (): Season => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
};

const seasonConfig = {
    spring: {
        name: 'Spring Menu',
        icon: Flower2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        gradient: 'from-green-400 to-emerald-500'
    },
    summer: {
        name: 'Summer Specials',
        icon: Sun,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        gradient: 'from-yellow-400 to-orange-500'
    },
    autumn: {
        name: 'Autumn Harvest',
        icon: Leaf,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        gradient: 'from-orange-400 to-red-500'
    },
    winter: {
        name: 'Winter Warmers',
        icon: Flame,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        gradient: 'from-red-400 to-pink-500'
    },
    'all-year': {
        name: 'Chef\'s Favorites',
        icon: Star,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        gradient: 'from-purple-400 to-indigo-500'
    }
};

interface SeasonalMenuHighlightsProps {
    items?: MenuHighlight[];
    showSeasonSelector?: boolean;
    autoRotate?: boolean;
    title?: string;
}

export const SeasonalMenuHighlights: React.FC<SeasonalMenuHighlightsProps> = ({
    items = seasonalMenuHighlights,
    showSeasonSelector = true,
    autoRotate = true,
    title
}) => {
    const [currentSeason, setCurrentSeason] = useState<Season>(getCurrentSeason());
    const [currentIndex, setCurrentIndex] = useState(0);

    const filteredItems = items.filter(
        item => item.season === currentSeason || item.season === 'all-year'
    ).filter(item => item.available);

    const config = seasonConfig[currentSeason];
    const SeasonIcon = config.icon;

    // Auto-rotate carousel
    React.useEffect(() => {
        if (!autoRotate || filteredItems.length <= 4) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRotate, filteredItems.length]);

    const visibleItems = filteredItems.slice(currentIndex, currentIndex + 4);
    const needsWrap = currentIndex + 4 > filteredItems.length;
    const displayItems = needsWrap
        ? [...filteredItems.slice(currentIndex), ...filteredItems.slice(0, (currentIndex + 4) % filteredItems.length)]
        : visibleItems;

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    };

    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${config.bgColor}`}>
                        <SeasonIcon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {title || config.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Fresh seasonal creations
                        </p>
                    </div>
                </div>

                {showSeasonSelector && (
                    <div className="flex gap-2 flex-wrap">
                        {(Object.keys(seasonConfig) as Season[]).map((season) => {
                            const seasonItem = seasonConfig[season];
                            const SeasonIconItem = seasonItem.icon;
                            return (
                                <button
                                    key={season}
                                    onClick={() => setCurrentSeason(season)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${currentSeason === season
                                        ? `bg-gradient-to-r ${seasonItem.gradient} text-white shadow-md`
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <SeasonIconItem className="w-4 h-4" />
                                    {seasonItem.name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Carousel */}
            {filteredItems.length > 0 ? (
                <div className="relative">
                    {/* Navigation Arrows */}
                    {filteredItems.length > 4 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-600" />
                            </button>
                        </>
                    )}

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {displayItems.slice(0, 4).map((item) => (
                            <MenuHighlightCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No seasonal items available</p>
                </div>
            )}
        </div>
    );
};

// Individual card component
const MenuHighlightCard: React.FC<{ item: MenuHighlight }> = ({ item }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const getDietaryIcon = (diet: string) => {
        switch (diet.toLowerCase()) {
            case 'vegetarian': return <span title="Vegetarian">🥬</span>;
            case 'vegan': return <span title="Vegan">🌱</span>;
            case 'gluten-free': return <span title="Gluten-Free">🌾</span>;
            case 'dairy-free': return <span title="Dairy-Free">🥛</span>;
            case 'nut-free': return <span title="Nut-Free">🥜</span>;
            case 'halal': return <span title="Halal">☪️</span>;
            default: return null;
        }
    };

    const getSpicyIcon = (level?: string) => {
        switch (level) {
            case 'mild': return <span title="Mild" className="text-yellow-600">🌶️</span>;
            case 'medium': return <span title="Medium" className="text-orange-500">🌶️🌶️</span>;
            case 'hot': return <span title="Hot" className="text-red-500">🌶️🌶️🌶️</span>;
            case 'extra-hot': return <span title="Extra Hot" className="text-red-600">🔥</span>;
            default: return null;
        }
    };

    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.isNew && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> NEW
                        </span>
                    )}
                    {item.isPopular && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" /> POPULAR
                        </span>
                    )}
                    {item.isSeasonal && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <Leaf className="w-3 h-3" /> SEASONAL
                        </span>
                    )}
                    {item.discount && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {item.discount}% OFF
                        </span>
                    )}
                </div>

                {/* Dietary Tags on Right */}
                {(item.dietaryTags || item.spicy) && (
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                        {item.dietaryTags?.map((diet) => (
                            <span key={diet} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-sm" title={diet}>
                                {getDietaryIcon(diet)}
                            </span>
                        ))}
                        {getSpicyIcon(item.spicy)}
                    </div>
                )}

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                        to="/menu"
                        className="px-4 py-2 bg-white text-gray-900 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform"
                    >
                        View Menu
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {item.discount ? (
                            <>
                                <span className="text-lg font-bold text-orange-600">
                                    KES {(item.price * (1 - item.discount / 100)).toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    KES {item.price.toLocaleString()}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900">
                                KES {item.price.toLocaleString()}
                            </span>
                        )}
                    </div>
                    <Link
                        to="/menu"
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                    >
                        Order <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Compact version for homepage
export const SeasonalMenuHighlightsCompact: React.FC = () => {
    const season = getCurrentSeason();
    const config = seasonConfig[season];
    const SeasonIcon = config.icon;

    const items = seasonalMenuHighlights.filter(
        item => item.season === season || item.season === 'all-year'
    ).slice(0, 3);

    return (
        <div className={`rounded-xl p-6 bg-gradient-to-br ${config.gradient} text-white`}>
            <div className="flex items-center gap-3 mb-4">
                <SeasonIcon className="w-8 h-8" />
                <div>
                    <h3 className="text-xl font-bold">{config.name}</h3>
                    <p className="text-white/80 text-sm">Limited time seasonal specials</p>
                </div>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-white/70 text-xs">KES {item.price.toLocaleString()}</p>
                        </div>
                        {item.isNew && <Sparkles className="w-4 h-4 text-yellow-300" />}
                    </div>
                ))}
            </div>

            <Link
                to="/menu"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
                View All Seasonal Dishes <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
};

export default SeasonalMenuHighlights;
