import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { menuApi } from "@/services/api";
import { ShoppingCart, Leaf, Wheat, Timer, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  allergens: string[];
  dietaryInfo: string[];
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "starters" | "mains" | "drinks" | "specials";
  image: string;
  available: boolean;
  popular: boolean;
  nutritionalInfo?: NutritionalInfo;
  preparationTime?: number;
}

const MenuPage = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Price filter
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Dietary filters
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [showAllergens, setShowAllergens] = useState(false);

  // Show/hide filters
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      // Disable cache to ensure we get fresh data with correct format
      const response = await menuApi.getAll({}, false);
      // Handle both paginated response and direct array
      const menuData = response.data || response || [];
      setItems(menuData);
      setFilteredItems(menuData);

      // Set max price from items
      if (menuData.length > 0) {
        const max = Math.max(...menuData.map((item: MenuItem) => item.price));
        setMaxPrice(max);
        setPriceRange([0, max]);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
    filterMenu(category, searchTerm, priceRange, dietaryFilters);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterMenu(selectedCategory, term, priceRange, dietaryFilters);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    filterMenu(selectedCategory, searchTerm, value, dietaryFilters);
  };

  const handleDietaryToggle = (diet: string) => {
    const newFilters = dietaryFilters.includes(diet)
      ? dietaryFilters.filter(f => f !== diet)
      : [...dietaryFilters, diet];
    setDietaryFilters(newFilters);
    filterMenu(selectedCategory, searchTerm, priceRange, newFilters);
  };

  const filterMenu = (category: string, search: string, price: number[], dietary: string[]) => {
    let filtered = items;

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter(item => item.category === category);
    }

    // Search filter
    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(item =>
      item.price >= price[0] && item.price <= price[1]
    );

    // Dietary filters
    if (dietary.length > 0) {
      filtered = filtered.filter(item => {
        const itemDietary = item.nutritionalInfo?.dietaryInfo || [];
        return dietary.every(d => itemDietary.includes(d));
      });
    }

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!item.available) {
      toast({
        title: "Item Unavailable",
        description: `${item.name} is currently not available`,
        variant: "destructive"
      });
      return;
    }

    addToCart(
      {
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        available: item.available,
        popular: item.popular,
      },
      1
    );

    toast({
      title: "Added to Cart",
      description: `${item.name} added to your cart`
    });
  };

  const getDietaryIcon = (diet: string) => {
    switch (diet.toLowerCase()) {
      case 'vegetarian':
        return <Leaf className="w-3 h-3 text-green-500" />;
      case 'vegan':
        return <Leaf className="w-3 h-3 text-green-600" />;
      case 'gluten-free':
        return <Wheat className="w-3 h-3 text-amber-500" />;
      default:
        return null;
    }
  };

  const categories = ["all", "starters", "mains", "drinks", "specials"];
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
    { id: 'nut-free', label: 'Nut-Free', icon: '🥜' },
  ];

  return (
    <main className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 pt-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">Our Menu</h1>
          <p className="text-muted-foreground text-lg">Crafted with passion, served with love</p>
        </div>

        {/* Search and Filter Toggle */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-md flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-8 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Range */}
              <div>
                <Label className="mb-2 block">Price Range: Ksh {priceRange[0]} - {priceRange[1]}</Label>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={maxPrice}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Dietary Filters */}
              <div>
                <Label className="mb-2 block">Dietary Preferences</Label>
                <div className="flex flex-wrap gap-3">
                  {dietaryOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={dietaryFilters.includes(option.id)}
                        onCheckedChange={() => handleDietaryToggle(option.id)}
                      />
                      <Label htmlFor={option.id} className="cursor-pointer text-sm">
                        {option.icon} {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Allergen Warning Toggle */}
            <div className="mt-4 flex items-center space-x-2">
              <Checkbox
                id="show-allergens"
                checked={showAllergens}
                onCheckedChange={() => setShowAllergens(!showAllergens)}
              />
              <Label htmlFor="show-allergens" className="cursor-pointer text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Show allergen information
              </Label>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => handleFilter(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Active Filters Display */}
        {(dietaryFilters.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {dietaryFilters.map(filter => (
              <Badge key={filter} variant="secondary" className="cursor-pointer" onClick={() => handleDietaryToggle(filter)}>
                {filter} ✕
              </Badge>
            ))}
            <Badge variant="secondary" className="cursor-pointer" onClick={() => { setDietaryFilters([]); setPriceRange([0, maxPrice]); filterMenu(selectedCategory, searchTerm, [0, maxPrice], []); }}>
              Clear all ✕
            </Badge>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredItems.length} of {items.length} items
        </p>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No items match your filters</p>
            <Button
              variant="link"
              onClick={() => { setDietaryFilters([]); setPriceRange([0, maxPrice]); filterMenu('all', '', [0, maxPrice], []); }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <Card key={item._id || `menu-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <p className="text-white font-semibold">Unavailable</p>
                    </div>
                  )}
                  {item.popular && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </div>
                  )}
                  {/* Dietary Badges */}
                  {item.nutritionalInfo?.dietaryInfo && item.nutritionalInfo.dietaryInfo.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.nutritionalInfo.dietaryInfo.map((diet: string) => (
                        <div key={diet} className="bg-white/90 p-1 rounded" title={diet}>
                          {getDietaryIcon(diet)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    {item.preparationTime && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Timer className="w-4 h-4 mr-1" />
                        {item.preparationTime} min
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

                  {/* Allergen Info */}
                  {showAllergens && item.nutritionalInfo?.allergens && item.nutritionalInfo.allergens.length > 0 && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs">
                      <div className="flex items-center text-red-600 font-semibold mb-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Contains:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.nutritionalInfo.allergens.map((allergen: string) => (
                          <Badge key={allergen} variant="outline" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nutritional Quick View */}
                  {item.nutritionalInfo && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {item.nutritionalInfo.calories} cal • {item.nutritionalInfo.protein}g protein
                    </div>
                  )}

                  <p className="text-2xl font-bold text-primary">Ksh {item.price.toLocaleString()}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                    className="w-full"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MenuPage;
