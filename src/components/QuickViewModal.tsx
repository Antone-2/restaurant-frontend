import { X, Minus, Plus, ShoppingBag, Share2, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MenuItem } from "@/data/menuData";
import { useCart } from "@/context/CartContext";
import StarRating from "./StarRating";

// Extended type that includes both API and static data formats
type ExtendedMenuItem = MenuItem & {
    _id?: string;
    available?: boolean;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
};

interface QuickViewModalProps {
    item: ExtendedMenuItem | null;
    isOpen: boolean;
    onClose: () => void;
}

const QuickViewModal = ({ item, isOpen, onClose }: QuickViewModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState("");
    const { addToCart } = useCart();

    if (!isOpen || !item) return null;

    // Convert to cart item type
    const cartItem = {
        id: item.id || item._id || '',
        name: item.name,
        price: item.price,
        image: item.image,
        description: item.description,
        category: item.category,
    };

    const handleAddToCart = () => {
        addToCart(cartItem, quantity, instructions);
        onClose();
        setQuantity(1);
        setInstructions("");
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${item.name} at The Quill`,
                    text: `Check out this delicious ${item.name} at The Quill Restaurant!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                        <img src={item.image} alt={item.name} className="w-full h-64 object-cover" />
                        <div className="absolute top-3 right-3 flex gap-2">
                            <Button variant="secondary" size="icon" onClick={handleShare} className="rounded-full">
                                <Share2 size={18} />
                            </Button>
                            <Button variant="secondary" size="icon" onClick={onClose} className="rounded-full">
                                <X size={18} />
                            </Button>
                        </div>
                        {item.popular && (
                            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">
                                Popular
                            </span>
                        )}
                    </div>

                    <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="font-display text-2xl font-bold">{item.name}</h2>
                                <p className="text-muted-foreground text-sm capitalize">{item.category}</p>
                            </div>
                            <p className="text-2xl font-bold text-primary">Ksh {item.price}</p>
                        </div>

                        <p className="text-muted-foreground mb-4">{item.description}</p>

                        {/* Nutritional Info (mock) */}
                        <div className="flex gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock size={14} />
                                <span>15-20 min</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Flame size={14} />
                                <span>~450 cal</span>
                            </div>
                            <div className="text-muted-foreground">
                                <StarRating rating={4} size={14} />
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Quantity</label>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Minus size={16} />
                                    </Button>
                                    <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                                    <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Special Instructions (optional)</label>
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Any allergies or special requests?"
                                    className="w-full p-3 border rounded-lg bg-background text-sm resize-none"
                                    rows={2}
                                />
                            </div>

                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" onClick={handleAddToCart}>
                                <ShoppingBag className="mr-2" size={18} />
                                Add to Cart - Ksh {(item.price * quantity).toLocaleString()}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
        </>
    );
};

export default QuickViewModal;
