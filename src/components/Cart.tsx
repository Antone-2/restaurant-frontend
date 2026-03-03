import { useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Gift, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import CheckoutFlow from "./CheckoutFlow";

const Cart = () => {
    const navigate = useNavigate();
    const { items, removeFromCart, updateQuantity, clearCart, subtotal, tax, total, isCartOpen, setIsCartOpen, loyaltyPoints, addLoyaltyPoints } = useCart();
    const [showCheckout, setShowCheckout] = useState(false);

    const handleCheckout = () => {
        // Award loyalty points (1 point per Ksh 10 spent)
        const points = Math.floor(subtotal / 10);
        addLoyaltyPoints(points);
        setIsCartOpen(false);
        navigate("/checkout");
    };

    const handleCloseCheckout = () => {
        setShowCheckout(false);
        setIsCartOpen(false);
    };

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsCartOpen(false)} />

            {/* Cart Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col animate-slide-in-right">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-primary" size={24} />
                        <h2 className="font-display text-xl font-bold">Your Order</h2>
                        {items.length > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                {items.length}
                            </span>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                        <X size={20} />
                    </Button>
                </div>

                {/* Loyalty Points Banner */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-3 mx-4 mt-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Gift className="text-primary" size={18} />
                        <span className="text-sm font-medium">Loyalty Points</span>
                    </div>
                    <span className="font-bold text-primary">{loyaltyPoints}</span>
                </div>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <ShoppingBag size={64} className="text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-4">Your cart is empty</p>
                        <Button asChild onClick={() => setIsCartOpen(false)}>
                            <Link to="/menu">Browse Menu</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 p-3 bg-card rounded-lg border">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-card-foreground truncate">{item.name}</h3>
                                            <p className="text-primary font-bold">Ksh {item.price}</p>
                                            {item.specialInstructions && (
                                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                                    Note: {item.specialInstructions}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus size={14} />
                                                </Button>
                                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 ml-auto text-destructive"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="border-t p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>Ksh {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (10%)</span>
                                <span>Ksh {tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-3">
                                <span>Total</span>
                                <span className="text-primary">Ksh {total.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                                You'll earn {Math.floor(subtotal / 10)} loyalty points!
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                                <Button className="bg-primary text-primary-foreground" onClick={handleCheckout}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Checkout
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
        </>
    );
};

export default Cart;
