import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { MenuItem } from "@/data/menuData";

// Extended type that includes both API and static data formats
export type CartItemType = MenuItem & {
    _id?: string;
    available?: boolean;
};

export interface CartItem extends CartItemType {
    quantity: number;
    specialInstructions?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItemType, quantity?: number, instructions?: string) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
    tax: number;
    total: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    loyaltyPoints: number;
    addLoyaltyPoints: (points: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);

    const addToCart = useCallback((item: CartItemType, quantity = 1, instructions?: string) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + quantity, specialInstructions: instructions || i.specialInstructions }
                        : i
                );
            }
            return [...prev, { ...item, quantity, specialInstructions: instructions }];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const addLoyaltyPoints = useCallback((points: number) => {
        setLoyaltyPoints((prev) => prev + points);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = 0; // No tax
    const total = subtotal;

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                subtotal,
                tax,
                total,
                isCartOpen,
                setIsCartOpen,
                loyaltyPoints,
                addLoyaltyPoints,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
