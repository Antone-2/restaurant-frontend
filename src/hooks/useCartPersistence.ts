import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./use-toast";
import env from "../lib/env";

const isDev = import.meta.env.DEV;

// In development, use relative URL to leverage Vite proxy
// In production, use the configured VITE_API_URL
const getApiUrl = () => {
    if (isDev) {
        return '';
    }
    return env.VITE_API_URL || '';
};

const API_URL = getApiUrl();

export interface CartItem {
    _id?: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    specialInstructions?: string;
}

export interface Cart {
    _id?: string;
    userId?: string;
    items: CartItem[];
    appliedCoupon?: string;
    orderType: "dinein" | "takeaway" | "delivery";
    selectedAddress?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const useCartPersistence = () => {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [cart, setCart] = useState<Cart>({
        items: [],
        orderType: "delivery"
    });
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Fetch cart from server on mount
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/cart`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCart(data.cart || { items: [], orderType: "delivery" });
            }
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            // Fall back to localStorage if server fails
            const localCart = localStorage.getItem("cart");
            if (localCart) {
                setCart(JSON.parse(localCart));
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Initialize cart on auth change
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            // Use localStorage for non-authenticated users
            const localCart = localStorage.getItem("cart");
            if (localCart) {
                setCart(JSON.parse(localCart));
            }
        }
    }, [isAuthenticated, fetchCart]);

    // Add item to cart
    const addItem = useCallback(async (item: CartItem) => {
        setSyncing(true);
        try {
            if (isAuthenticated) {
                const response = await fetch(`${API_URL}/api/cart/items`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    },
                    body: JSON.stringify(item)
                });

                if (!response.ok) {
                    throw new Error("Failed to add item to cart");
                }

                const data = await response.json();
                setCart(data.cart);
            } else {
                // Local cart management
                const updatedCart = { ...cart };
                const existingItem = updatedCart.items.find(i => i.menuItemId === item.menuItemId);

                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    updatedCart.items.push({ ...item, _id: Date.now().toString() });
                }

                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to add item to cart",
                variant: "destructive"
            });
        } finally {
            setSyncing(false);
        }
    }, [cart, isAuthenticated, toast]);

    // Update item quantity
    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        setSyncing(true);
        try {
            if (isAuthenticated) {
                const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    },
                    body: JSON.stringify({ quantity })
                });

                if (!response.ok) {
                    throw new Error("Failed to update item");
                }

                const data = await response.json();
                setCart(data.cart);
            } else {
                // Local cart update
                const updatedCart = { ...cart };
                const item = updatedCart.items.find(i => i._id === itemId);

                if (item) {
                    if (quantity <= 0) {
                        updatedCart.items = updatedCart.items.filter(i => i._id !== itemId);
                    } else {
                        item.quantity = quantity;
                    }
                }

                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update item",
                variant: "destructive"
            });
        } finally {
            setSyncing(false);
        }
    }, [cart, isAuthenticated, toast]);

    // Remove item from cart
    const removeItem = useCallback(async (itemId: string) => {
        setSyncing(true);
        try {
            if (isAuthenticated) {
                const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to remove item");
                }

                const data = await response.json();
                setCart(data.cart);
            } else {
                // Local cart update
                const updatedCart = {
                    ...cart,
                    items: cart.items.filter(i => i._id !== itemId)
                };

                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to remove item",
                variant: "destructive"
            });
        } finally {
            setSyncing(false);
        }
    }, [cart, isAuthenticated, toast]);

    // Update cart metadata (orderType, address, coupon, notes)
    const updateCartMetadata = useCallback(async (metadata: Partial<Cart>) => {
        setSyncing(true);
        try {
            if (isAuthenticated) {
                const response = await fetch(`${API_URL}/api/cart`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    },
                    body: JSON.stringify(metadata)
                });

                if (!response.ok) {
                    throw new Error("Failed to update cart");
                }

                const data = await response.json();
                setCart(data.cart);
            } else {
                // Local cart update
                const updatedCart = { ...cart, ...metadata };
                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update cart",
                variant: "destructive"
            });
        } finally {
            setSyncing(false);
        }
    }, [cart, isAuthenticated, toast]);

    // Clear entire cart
    const clearCart = useCallback(async () => {
        setSyncing(true);
        try {
            if (isAuthenticated) {
                const response = await fetch(`${API_URL}/api/cart`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to clear cart");
                }

                setCart({ items: [], orderType: "delivery" });
            } else {
                setCart({ items: [], orderType: "delivery" });
                localStorage.removeItem("cart");
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to clear cart",
                variant: "destructive"
            });
        } finally {
            setSyncing(false);
        }
    }, [isAuthenticated, toast]);

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
        cart,
        loading,
        syncing,
        addItem,
        updateQuantity,
        removeItem,
        updateCartMetadata,
        clearCart,
        subtotal,
        itemCount,
        fetchCart
    };
};
