import { useState, useEffect, useMemo } from 'react';
import { ordersApi, menuApi } from '@/services/api';

interface MenuItem {
    _id: string;
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    popular: boolean;
}

interface RecommendationItem extends MenuItem {
    score: number;
    reason: 'popular' | 'frequently_ordered' | 'same_category' | 'often_together';
}

// Get user's order history
async function getUserOrderHistory(): Promise<any[]> {
    try {
        const orders = await ordersApi.getAll();
        return orders || [];
    } catch {
        return [];
    }
}

// Get all menu items
async function getAllMenuItems(): Promise<MenuItem[]> {
    try {
        const items = await menuApi.getAll();
        return items || [];
    } catch {
        return [];
    }
}

// Analyze order patterns to find frequently ordered items
function analyzeOrderPatterns(orders: any[]): Map<string, number> {
    const itemCounts = new Map<string, number>();

    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
                const itemId = item.id || item.menuItemId || item._id;
                if (itemId) {
                    itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + (item.quantity || 1));
                }
            });
        }
    });

    return itemCounts;
}

// Find items from same categories as user's orders
function getCategoriesFromOrders(orders: any[], menuItems: MenuItem[]): string[] {
    const categories = new Set<string>();

    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
                const menuItem = menuItems.find(m => m.id === item.id || m._id === item.menuItemId);
                if (menuItem) {
                    categories.add(menuItem.category);
                }
            });
        }
    });

    return Array.from(categories);
}

// Find items often ordered together
function findItemsOrderedTogether(orders: any[]): Map<string, string[]> {
    const coOccurrences = new Map<string, string[]>();

    orders.forEach(order => {
        if (order.items && order.items.length > 1) {
            const itemIds = order.items.map((item: any) => item.id || item.menuItemId);

            for (let i = 0; i < itemIds.length; i++) {
                for (let j = 0; j < itemIds.length; j++) {
                    if (i !== j && itemIds[i] && itemIds[j]) {
                        const existing = coOccurrences.get(itemIds[i]) || [];
                        if (!existing.includes(itemIds[j])) {
                            existing.push(itemIds[j]);
                        }
                        coOccurrences.set(itemIds[i], existing);
                    }
                }
            }
        }
    });

    return coOccurrences;
}

export function useRecommendations(currentItemId?: string) {
    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateRecommendations() {
            setLoading(true);

            try {
                // Get order history and menu items in parallel
                const [orders, menuItems] = await Promise.all([
                    getUserOrderHistory(),
                    getAllMenuItems()
                ]);

                if (orders.length === 0 || menuItems.length === 0) {
                    // No history, return popular items
                    const popularItems = menuItems
                        .filter(item => item.popular)
                        .slice(0, 8)
                        .map(item => ({
                            ...item,
                            score: 100,
                            reason: 'popular' as const
                        }));
                    setRecommendations(popularItems);
                    setLoading(false);
                    return;
                }

                const allRecommendations: RecommendationItem[] = [];

                // 1. Get frequently ordered items
                const orderPatterns = analyzeOrderPatterns(orders);
                const frequentlyOrdered = Array.from(orderPatterns.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                frequentlyOrdered.forEach(([itemId, count]) => {
                    const menuItem = menuItems.find(m => m.id === itemId || m._id === itemId);
                    if (menuItem) {
                        allRecommendations.push({
                            ...menuItem,
                            score: count * 20, // Weight by order count
                            reason: 'frequently_ordered'
                        });
                    }
                });

                // 2. Get items from same categories
                const userCategories = getCategoriesFromOrders(orders, menuItems);
                const categoryItems = menuItems
                    .filter(item => userCategories.includes(item.category))
                    .filter(item => !orderPatterns.has(item.id || item._id))
                    .slice(0, 10);

                categoryItems.forEach(item => {
                    allRecommendations.push({
                        ...item,
                        score: 50,
                        reason: 'same_category'
                    });
                });

                // 3. Get popular items not yet ordered
                const orderedItemIds = new Set(
                    orders.flatMap(o => o.items || []).map((i: any) => i.id || i.menuItemId)
                );

                const popularUnordered = menuItems
                    .filter(item => item.popular && !orderedItemIds.has(item.id) && !orderedItemIds.has(item._id))
                    .slice(0, 5);

                popularUnordered.forEach(item => {
                    allRecommendations.push({
                        ...item,
                        score: 30,
                        reason: 'popular'
                    });
                });

                // 4. Find items often ordered together with current item
                if (currentItemId) {
                    const coOccurrences = findItemsOrderedTogether(orders);
                    const relatedItemIds = coOccurrences.get(currentItemId) || [];

                    relatedItemIds.forEach(relatedId => {
                        const menuItem = menuItems.find(m => m.id === relatedId || m._id === relatedId);
                        if (menuItem) {
                            allRecommendations.push({
                                ...menuItem,
                                score: 40,
                                reason: 'often_together'
                            });
                        }
                    });
                }

                // Remove duplicates and sort by score
                const uniqueRecommendations = Array.from(
                    new Map(allRecommendations.map(item => [item.id || item._id, item])).values()
                )
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 8);

                setRecommendations(uniqueRecommendations);
            } catch (error) {
                console.error('Error generating recommendations:', error);
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        }

        generateRecommendations();
    }, [currentItemId]);

    return { recommendations, loading };
}

// Get "Popular with this" suggestions for a specific item
export function useRelatedItems(itemId: string, category: string) {
    const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRelatedItems() {
            setLoading(true);

            try {
                const [orders, menuItems] = await Promise.all([
                    getUserOrderHistory(),
                    getAllMenuItems()
                ]);

                // Get items from the same category
                const categoryItems = menuItems
                    .filter(item => item.category === category && item.id !== itemId)
                    .slice(0, 4);

                // If user has order history, prioritize items often ordered together
                if (orders.length > 0) {
                    const coOccurrences = findItemsOrderedTogether(orders);
                    const relatedIds = coOccurrences.get(itemId) || [];

                    const coOrderedItems = relatedIds
                        .map(id => menuItems.find(m => m.id === id || m._id === id))
                        .filter(Boolean) as MenuItem[];

                    // Combine: first add co-ordered items, then fill with category items
                    const combined = [
                        ...coOrderedItems.filter(item => item.id !== itemId),
                        ...categoryItems.filter(item => !coOrderedItems.some(c => c.id === item.id))
                    ];

                    setRelatedItems(combined.slice(0, 4));
                } else {
                    setRelatedItems(categoryItems);
                }
            } catch {
                setRelatedItems([]);
            } finally {
                setLoading(false);
            }
        }

        fetchRelatedItems();
    }, [itemId, category]);

    return { relatedItems, loading };
}

export default useRecommendations;
