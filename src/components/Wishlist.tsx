import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { MenuItem } from "@/data/menuData";

const Wishlist = () => {
    const { items, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (items.length === 0) return null;

    const handleAddToCart = (item: typeof items[0]) => {
        const menuItem: MenuItem = {
            id: item.menuItemId,
            name: item.name,
            price: item.price,
            description: item.category || '',
            category: (item.category as "starters" | "mains" | "drinks" | "specials") || 'mains',
            image: item.image || '',
            popular: false
        };
        addToCart(menuItem);
    };

    return (
        <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-4">
                <Heart className="text-primary fill-primary" size={20} />
                <h3 className="font-display font-semibold text-lg">Your Wishlist</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{items.length}</span>
            </div>

            <ScrollArea className="h-48">
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.menuItemId} className="flex gap-3 p-2 bg-background rounded-lg">
                            <img src={item.image || '/placeholder-food.jpg'} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                <p className="text-primary font-bold text-sm">Ksh {item.price}</p>
                                <div className="flex gap-1 mt-2">
                                    <Button
                                        size="sm"
                                        className="h-7 text-xs bg-primary"
                                        onClick={() => handleAddToCart(item)}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => removeFromWishlist(item.menuItemId)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <Button variant="outline" className="w-full mt-3" asChild>
                <Link to="/menu">View Full Menu</Link>
            </Button>
        </div>
    );
};

export default Wishlist;
