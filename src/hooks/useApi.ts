import { useState, useEffect, useCallback } from 'react';

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useFetch<T>(fetchFn: () => Promise<T>, dependencies: any[] = []): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, dependencies);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// Hook for menu items with filters
export function useMenuItems(filters?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; popular?: boolean }) {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMenuItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { menuApi } = await import('../services/api');
            const data = await menuApi.getAll(filters);
            setMenuItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch menu');
        } finally {
            setLoading(false);
        }
    }, [filters?.category, filters?.search, filters?.minPrice, filters?.maxPrice, filters?.popular]);

    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);

    return { menuItems, loading, error, refetch: fetchMenuItems };
}

// Hook for reviews
export function useReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { reviewsApi } = await import('../services/api');
            const data = await reviewsApi.getAll();
            setReviews(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, loading, error, refetch: fetchReviews };
}

// Hook for stats
export function useStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { statsApi } = await import('../services/api');
            const data = await statsApi.get();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}
