import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { MenuItem } from "@/data/menuData";
import { wishlistApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface WishlistItem {
    menuItemId: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    addedAt?: string;
}

interface WishlistContextType {
    items: WishlistItem[];
    loading: boolean;
    addToWishlist: (item: MenuItem) => Promise<void>;
    removeFromWishlist: (id: string) => Promise<void>;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => Promise<void>;
    syncWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, user } = useAuth();

    // Load wishlist from backend when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            syncWishlist();
        } else {
            // Clear local wishlist when user logs out
            setItems([]);
        }
    }, [isAuthenticated]);

    const syncWishlist = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const data = await wishlistApi.getAll();
            setItems(data.items || []);
        } catch (error) {
            console.error("Failed to sync wishlist:", error);
            // Fall back to local storage if backend fails
            const stored = localStorage.getItem("wishlist");
            if (stored) {
                try {
                    setItems(JSON.parse(stored));
                } catch {
                    setItems([]);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const addToWishlist = useCallback(async (item: MenuItem) => {
        const wishlistItem: WishlistItem = {
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category
        };

        if (isAuthenticated) {
            try {
                await wishlistApi.addItem(wishlistItem);
                await syncWishlist();
            } catch (error) {
                console.error("Failed to add to wishlist:", error);
                // Fall back to local state
                setItems((prev) => {
                    if (prev.find((i) => i.menuItemId === item.id)) return prev;
                    const newItems = [...prev, { ...wishlistItem, addedAt: new Date().toISOString() }];
                    localStorage.setItem("wishlist", JSON.stringify(newItems));
                    return newItems;
                });
            }
        } else {
            // Guest user - use local storage
            setItems((prev) => {
                if (prev.find((i) => i.menuItemId === item.id)) return prev;
                const newItems = [...prev, { ...wishlistItem, addedAt: new Date().toISOString() }];
                localStorage.setItem("wishlist", JSON.stringify(newItems));
                return newItems;
            });
        }
    }, [isAuthenticated, syncWishlist]);

    const removeFromWishlist = useCallback(async (id: string) => {
        if (isAuthenticated) {
            try {
                await wishlistApi.removeItem(id);
                setItems((prev) => prev.filter((i) => i.menuItemId !== id));
            } catch (error) {
                console.error("Failed to remove from wishlist:", error);
                // Fall back to local state
                setItems((prev) => {
                    const newItems = prev.filter((i) => i.menuItemId !== id);
                    localStorage.setItem("wishlist", JSON.stringify(newItems));
                    return newItems;
                });
            }
        } else {
            // Guest user - use local storage
            setItems((prev) => {
                const newItems = prev.filter((i) => i.menuItemId !== id);
                localStorage.setItem("wishlist", JSON.stringify(newItems));
                return newItems;
            });
        }
    }, [isAuthenticated]);

    const isInWishlist = useCallback((id: string) => {
        return items.some((item) => item.menuItemId === id);
    }, [items]);

    const clearWishlist = useCallback(async () => {
        if (isAuthenticated) {
            try {
                await wishlistApi.clear();
            } catch (error) {
                console.error("Failed to clear wishlist:", error);
            }
        }
        setItems([]);
        localStorage.removeItem("wishlist");
    }, [isAuthenticated]);

    // Load from local storage on mount (for guest users)
    useEffect(() => {
        if (!isAuthenticated) {
            const stored = localStorage.getItem("wishlist");
            if (stored) {
                try {
                    setItems(JSON.parse(stored));
                } catch {
                    setItems([]);
                }
            }
        }
    }, [isAuthenticated]);

    return (
        <WishlistContext.Provider
            value={{
                items,
                loading,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
                syncWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
