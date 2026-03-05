import env from '../lib/env';

const API_BASE_URL = env.VITE_API_URL.endsWith('/api') ? env.VITE_API_URL : `${env.VITE_API_URL}/api`;

// Simple in-memory cache with TTL support
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class ApiCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        });
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Invalidate cache patterns (e.g., delete all menu-related cache)
    invalidatePattern(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}

export const apiCache = new ApiCache();

// Pagination helper
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

export const getPaginationParams = (page = 1, limit = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return params;
};

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        let errorMessage = 'An error occurred';
        let errorCode = 'UNKNOWN_ERROR';

        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            errorCode = errorData.code || errorCode;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }
        const errorMessages: Record<string, string> = {
            'EMAIL_EXISTS': 'An account with this email already exists',
            'INVALID_CREDENTIALS': 'Invalid email or password',
            'TOKEN_EXPIRED': 'Your session has expired. Please log in again',
            'INSUFFICIENT_PERMISSION': 'You do not have permission to perform this action',
            'NETWORK_ERROR': 'Network error. Please check your connection',
            'SERVER_ERROR': 'Server error. Please try again later',
            'VALIDATION_ERROR': 'Please check your input and try again',
            'NOT_FOUND': 'The requested resource was not found',
            'RATE_LIMIT': 'Too many requests. Please wait a moment',
        };

        const userMessage = errorMessages[errorCode] || errorMessage;
        throw new ApiError(userMessage, response.status, errorCode);
    }

    return response.json();
};

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper function to get headers with auth token
const getHeaders = (includeAuth = true) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};

// Authentication API
export const authApi = {
    register: async (userData: { email: string; password: string; name: string; phone?: string }) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(userData)
        });
        return handleResponse<{ user: any; token: string }>(response);
    },

    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ email, password })
        });
        return handleResponse<{ user: any; token: string }>(response);
    },

    logout: () => {
        localStorage.removeItem('authToken');
    },

    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    updateProfile: async (userData: { name?: string; phone?: string; address?: string }) => {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(userData)
        });
        return handleResponse<any>(response);
    },

    forgotPassword: async (email: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ email })
        });
        return handleResponse<{ message: string }>(response);
    },

    resetPassword: async (token: string, newPassword: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ token, newPassword })
        });
        return handleResponse<{ message: string }>(response);
    },

    verifyEmail: async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ token })
        });
        return handleResponse<{ message: string }>(response);
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return handleResponse<{ message: string }>(response);
    },

    deleteAccount: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/account`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<{ message: string }>(response);
    },

    updatePreferences: async (notificationPreferences: { orderUpdates?: boolean; promotionalEmails?: boolean; reservationReminders?: boolean; marketingSMS?: boolean }) => {
        const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ notificationPreferences })
        });
        return handleResponse<{ message: string; notificationPreferences: any }>(response);
    },

    getAddresses: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/addresses`, {
            headers: getHeaders(true)
        });
        return handleResponse<{ addresses: any[] }>(response);
    },

    addAddress: async (address: { label?: string; street: string; city: string; instructions?: string; isDefault?: boolean }) => {
        const response = await fetch(`${API_BASE_URL}/auth/addresses`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(address)
        });
        return handleResponse<{ message: string; address: any }>(response);
    },

    deleteAddress: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/addresses/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<{ message: string }>(response);
    },

    setDefaultAddress: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/addresses/${id}/default`, {
            method: 'PUT',
            headers: getHeaders(true)
        });
        return handleResponse<{ message: string; addresses: any[] }>(response);
    }
};

// Menu Items API with pagination and caching
export const menuApi = {
    getAll: async (filters?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; popular?: boolean; page?: number; limit?: number }, useCache = true) => {
        const params = new URLSearchParams();
        if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters?.popular) params.append('popular', 'true');
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const cacheKey = `menu_${params.toString()}`;

        // Try cache first for GET requests
        if (useCache) {
            const cached = apiCache.get<PaginatedResponse<any>>(cacheKey);
            if (cached) return cached;
        }

        const response = await fetch(`${API_BASE_URL}/menu?${params.toString()}`);
        const data = await handleResponse<PaginatedResponse<any>>(response);

        // Cache the response
        if (useCache) {
            apiCache.set(cacheKey, data);
        }

        return data;
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`);
        return handleResponse<any>(response);
    },

    create: async (menuData: any) => {
        const response = await fetch(`${API_BASE_URL}/menu`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(menuData)
        });
        return handleResponse<any>(response);
    },

    update: async (id: string, menuData: any) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(menuData)
        });
        return handleResponse<any>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    },

    // Bulk operations
    bulkCreate: async (items: any[]) => {
        const response = await fetch(`${API_BASE_URL}/menu/bulk`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ items })
        });
        return handleResponse<{ message: string; items: any[] }>(response);
    },

    bulkUpdate: async (items: any[]) => {
        const response = await fetch(`${API_BASE_URL}/menu/bulk`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ items })
        });
        return handleResponse<{ message: string; items: any[] }>(response);
    },

    bulkDelete: async (ids: string[]) => {
        const response = await fetch(`${API_BASE_URL}/menu/bulk`, {
            method: 'DELETE',
            headers: getHeaders(true),
            body: JSON.stringify({ ids })
        });
        return handleResponse<{ message: string }>(response);
    },

    // Inventory management
    updateInventory: async (id: string, inventoryData: { stockQuantity?: number; lowStockThreshold?: number; trackInventory?: boolean }) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}/inventory`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(inventoryData)
        });
        return handleResponse<any>(response);
    },

    getLowStock: async () => {
        const response = await fetch(`${API_BASE_URL}/menu/low-stock`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    }
};

// Orders API with pagination
export const ordersApi = {
    create: async (orderData: any) => {
        // Invalidate orders cache on create
        apiCache.invalidatePattern('orders_');
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(orderData)
        });
        return handleResponse<any>(response);
    },

    getAll: async (filters?: { status?: string; startDate?: string; endDate?: string; paymentStatus?: string; search?: string; page?: number; limit?: number }) => {
        const params = new URLSearchParams();
        if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.paymentStatus && filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
            headers: getHeaders(true)
        });
        return handleResponse<PaginatedResponse<any>>(response);
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    // Track order
    trackOrder: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/track`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    // Reorder
    reorder: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/reorder`, {
            method: 'POST',
            headers: getHeaders(true)
        });
        return handleResponse<{ message: string; orderId: string; items: any[]; total: number }>(response);
    },

    // Customer cancel order
    cancelOrder: async (id: string, reason?: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ reason })
        });
        return handleResponse<any>(response);
    },

    // Modify order (while pending)
    modifyOrder: async (id: string, data: { items?: any[]; deliveryAddress?: any; specialInstructions?: string }) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/modify`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        return handleResponse<any>(response);
    },

    // Modify order items (while pending/confirmed)
    modifyOrderItems: async (id: string, data: { itemsToRemove?: string[]; itemsToUpdate?: Array<{ itemId: string; quantity: number }> }) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/items`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        return handleResponse<any>(response);
    },

    updateStatus: async (id: string, status: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ status })
        });
        return handleResponse<any>(response);
    },

    update: async (id: string, orderData: any) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(orderData)
        });
        return handleResponse<any>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    },

    // Retry payment
    retryPayment: async (id: string, paymentMethod: string, phoneNumber?: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/payment/retry`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ paymentMethod, phoneNumber })
        });
        return handleResponse<any>(response);
    },

    // Send invoice email
    sendInvoice: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/invoice/send`, {
            method: 'POST',
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    // Set delivery ETA (admin)
    setDeliveryEta: async (id: string, preparationTime?: number, deliveryTime?: number) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/delivery/eta`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ preparationTime, deliveryTime })
        });
        return handleResponse<any>(response);
    },

    // Request a refund (customer)
    requestRefund: async (id: string, reason?: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/request-refund`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ reason })
        });
        return handleResponse<any>(response);
    },

    // Check payment status
    getPaymentStatus: async (checkoutRequestId: string) => {
        const response = await fetch(`${API_BASE_URL}/payments/mpesa/status?checkoutRequestId=${checkoutRequestId}`, {
            headers: getHeaders()
        });
        return handleResponse<any>(response);
    }
};

// Reservations API
export const reservationsApi = {
    create: async (reservationData: any) => {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(reservationData)
        });
        return handleResponse<any>(response);
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    update: async (id: string, reservationData: any) => {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(reservationData)
        });
        return handleResponse<any>(response);
    },

    updateStatus: async (id: string, status: string) => {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ status })
        });
        return handleResponse<any>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    }
};

// Parking API
export const parkingApi = {
    create: async (parkingData: any) => {
        const response = await fetch(`${API_BASE_URL}/parking`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(parkingData)
        });
        return handleResponse<any>(response);
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/parking`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    }
};

// Reviews API
export const reviewsApi = {
    getAll: async (filters?: { status?: string; visible?: boolean }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.visible !== undefined) params.append('visible', filters.visible.toString());

        const response = await fetch(`${API_BASE_URL}/reviews?${params.toString()}`);
        return handleResponse<any[]>(response);
    },

    create: async (reviewData: { name: string; rating: number; comment: string; orderId?: string; userId?: string; email?: string }) => {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(reviewData)
        });
        return handleResponse<any>(response);
    },

    getAllForAdmin: async (status?: string) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);

        const response = await fetch(`${API_BASE_URL}/admin/reviews?${params.toString()}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    updateStatus: async (id: string, status: string, adminReply?: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ status, adminReply })
        });
        return handleResponse<any>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    }
};

// Events API
export const eventsApi = {
    submit: async (eventData: any) => {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(eventData)
        });
        return handleResponse<any>(response);
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/events`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    }
};

// Contact API
export const contactApi = {
    submit: async (contactData: { name: string; email: string; phone: string; subject: string; message: string }) => {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(contactData)
        });
        return handleResponse<any>(response);
    }
};

// Subscribers API
export const subscribersApi = {
    subscribe: async (email: string) => {
        const response = await fetch(`${API_BASE_URL}/subscribe`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ email })
        });
        return handleResponse<any>(response);
    }
};

// Stats API
export const statsApi = {
    get: async () => {
        const response = await fetch(`${API_BASE_URL}/stats`);
        return handleResponse<any>(response);
    }
};

// Admin API
export const adminApi = {
    getAllOrders: async (filters?: { status?: string; startDate?: string; endDate?: string; limit?: number; search?: string; paymentStatus?: string; deliveryType?: string; minTotal?: number; maxTotal?: number }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters?.deliveryType) params.append('deliveryType', filters.deliveryType);
        if (filters?.minTotal) params.append('minTotal', filters.minTotal.toString());
        if (filters?.maxTotal) params.append('maxTotal', filters.maxTotal.toString());

        const response = await fetch(`${API_BASE_URL}/admin/orders?${params.toString()}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    getRevenue: async (filters?: { period?: string; startDate?: string; endDate?: string }) => {
        const params = new URLSearchParams();
        if (filters?.period) params.append('period', filters.period);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await fetch(`${API_BASE_URL}/admin/revenue?${params.toString()}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    getAnalytics: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    // Order operations
    cancelOrder: async (id: string, reason?: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ reason })
        });
        return handleResponse<any>(response);
    },

    refundOrder: async (id: string, amount?: number, reason?: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/refund`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ amount, reason })
        });
        return handleResponse<any>(response);
    },

    assignDelivery: async (id: string, deliveryData: { name: string; phone: string; vehicle?: string }) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/delivery/assign`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(deliveryData)
        });
        return handleResponse<any>(response);
    },

    updateDeliveryStatus: async (id: string, status: 'started' | 'completed') => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/delivery/status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ status })
        });
        return handleResponse<any>(response);
    },

    getInvoice: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/invoice`, {
            headers: getHeaders(true)
        });
        return handleResponse<{ invoiceNumber: string; html: string }>(response);
    },

    exportOrders: async (filters?: { status?: string; startDate?: string; endDate?: string }, format: 'csv' | 'json' = 'csv') => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        params.append('format', format);

        const response = await fetch(`${API_BASE_URL}/admin/orders/export?${params.toString()}`, {
            headers: getHeaders(true)
        });

        if (format === 'csv') {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return { success: true };
        }

        return handleResponse<any[]>(response);
    },

    // Process refund
    processRefund: async (orderId: string, amount?: number, reason?: string) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/refund`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ amount, reason })
        });
        return handleResponse<any>(response);
    },

    // Process M-Pesa B2C refund
    processMpesaRefund: async (phoneNumber: string, amount: number, orderId: string, reason?: string) => {
        const response = await fetch(`${API_BASE_URL}/payments/refund/mpesa`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ phoneNumber, amount, orderId, reason })
        });
        return handleResponse<any>(response);
    },

    // Inventory Management
    getInventory: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/inventory`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    createInventoryItem: async (item: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/inventory`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(item)
        });
        return handleResponse<any>(response);
    },

    updateInventoryItem: async (id: string, item: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/inventory/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(item)
        });
        return handleResponse<any>(response);
    },

    deleteInventoryItem: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/inventory/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    },

    getInventoryAlerts: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/inventory/alerts`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    // Staff Management
    getStaff: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/staff`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    createStaff: async (staff: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/staff`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(staff)
        });
        return handleResponse<any>(response);
    },

    updateStaff: async (id: string, staff: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(staff)
        });
        return handleResponse<any>(response);
    },

    deleteStaff: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    },

    // Tables Management
    getTables: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/tables`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    createTable: async (table: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/tables`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(table)
        });
        return handleResponse<any>(response);
    },

    updateTable: async (id: string, table: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(table)
        });
        return handleResponse<any>(response);
    },

    deleteTable: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    },

    getTableStats: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/tables/stats`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    // Campaign Management
    getCampaigns: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/campaigns`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    createCampaign: async (campaign: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/campaigns`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(campaign)
        });
        return handleResponse<any>(response);
    },

    updateCampaign: async (id: string, campaign: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(campaign)
        });
        return handleResponse<any>(response);
    },

    deleteCampaign: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    },

    sendCampaign: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}/send`, {
            method: 'POST',
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    // Subscribers Management
    getSubscribers: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/subscribers`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    addSubscriber: async (subscriber: { email: string; segment?: string }) => {
        const response = await fetch(`${API_BASE_URL}/admin/subscribers`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(subscriber)
        });
        return handleResponse<any>(response);
    },

    deleteSubscriber: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/subscribers/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    }
};

// Complaints API (Customer)
export const complaintsApi = {
    submit: async (data: { orderId?: string; customerName: string; customerEmail?: string; customerPhone?: string; subject: string; description: string }) => {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(data)
        });
        return handleResponse<{ complaintId: string }>(response);
    }
};

// Disputes API (Customer)
export const disputesApi = {
    submit: async (data: { orderId: string; customerName?: string; customerEmail?: string; customerPhone?: string; amount?: number; reason: string; evidence?: string }) => {
        const response = await fetch(`${API_BASE_URL}/disputes`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify(data)
        });
        return handleResponse<{ disputeId: string }>(response);
    }
};

// Wishlist API
export const wishlistApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            headers: getHeaders(true)
        });
        return handleResponse<{ items: any[] }>(response);
    },

    addItem: async (item: { menuItemId: string; name: string; price: number; image?: string; category?: string }) => {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(item)
        });
        return handleResponse<any>(response);
    },

    removeItem: async (itemId: string) => {
        const response = await fetch(`${API_BASE_URL}/wishlist/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    },

    clear: async () => {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    }
};

// Payment API
export const paymentApi = {
    initiateMpesa: async ({ phoneNumber, amount, orderId, customerEmail, customerName }: { phoneNumber: string; amount: number; orderId: string; customerEmail?: string; customerName?: string }) => {
        const response = await fetch(`${API_BASE_URL}/payments/mpesa/initiate`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ phoneNumber, amount, orderId, customerEmail, customerName })
        });
        return handleResponse<any>(response);
    },

    checkPaymentStatus: async (checkoutRequestId: string) => {
        const response = await fetch(`${API_BASE_URL}/payments/mpesa/status/${checkoutRequestId}`);
        return handleResponse<any>(response);
    },

    getPaymentMethods: async () => {
        const response = await fetch(`${API_BASE_URL}/payments/methods`);
        return handleResponse<any>(response);
    }
};

// Loyalty Points API
export const loyaltyApi = {
    getPoints: async () => {
        const response = await fetch(`${API_BASE_URL}/loyalty/points`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    earnPoints: async (userId: string, orderId: string, amount: number) => {
        const response = await fetch(`${API_BASE_URL}/loyalty/earn`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ userId, orderId, amount })
        });
        return handleResponse<any>(response);
    },

    redeemPoints: async (points: number, orderId?: string) => {
        const response = await fetch(`${API_BASE_URL}/loyalty/redeem`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ points, orderId })
        });
        return handleResponse<any>(response);
    },

    getReferral: async () => {
        const response = await fetch(`${API_BASE_URL}/loyalty/referral`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    applyReferral: async (referralCode: string) => {
        const response = await fetch(`${API_BASE_URL}/loyalty/referral/apply`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ referralCode })
        });
        return handleResponse<any>(response);
    }
};

// Coupons API
export const couponsApi = {
    validate: async (code: string, orderTotal?: number, category?: string) => {
        const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ code, orderTotal, category })
        });
        return handleResponse<any>(response);
    },

    // Admin endpoints
    create: async (couponData: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(couponData)
        });
        return handleResponse<any>(response);
    },

    getAll: async (isActive?: boolean) => {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append('isActive', isActive.toString());
        const response = await fetch(`${API_BASE_URL}/admin/coupons?${params.toString()}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    update: async (id: string, couponData: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(couponData)
        });
        return handleResponse<any>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    }
};

// Support Tickets API
export const ticketsApi = {
    create: async (ticketData: { subject: string; category?: string; priority?: string; message: string; orderId?: string }) => {
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(ticketData)
        });
        return handleResponse<any>(response);
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/tickets`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    addMessage: async (id: string, message: string) => {
        const response = await fetch(`${API_BASE_URL}/tickets/${id}/messages`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ message })
        });
        return handleResponse<any>(response);
    },

    // Admin endpoints
    getAllAdmin: async (status?: string, priority?: string) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        const response = await fetch(`${API_BASE_URL}/admin/tickets?${params.toString()}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    updateAdmin: async (id: string, data: { status?: string; priority?: string; message?: string }) => {
        const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        return handleResponse<any>(response);
    }
};

// FAQ API
export const faqsApi = {
    getAll: async (category?: string) => {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        const response = await fetch(`${API_BASE_URL}/faqs?${params.toString()}`);
        return handleResponse<any[]>(response);
    },

    // Admin endpoints
    create: async (faqData: { question: string; answer: string; category?: string; order?: number }) => {
        const response = await fetch(`${API_BASE_URL}/admin/faqs`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(faqData)
        });
        return handleResponse<any>(response);
    },

    update: async (id: string, faqData: any) => {
        const response = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(faqData)
        });
        return handleResponse<any>(response);
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return handleResponse<void>(response);
    }
};

// Menu Analytics API
export const menuAnalyticsApi = {
    getPopularItems: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await fetch(`${API_BASE_URL}/admin/analytics/menu?${params.toString()}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    getSlowMovers: async (days: number = 30) => {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/menu/slow-movers?days=${days}`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    getCategoryPerformance: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/menu/categories`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    }
};

// Customer Analytics API
export const customerAnalyticsApi = {
    getCustomerSegments: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/customers/segments`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    },

    getCustomerLifetimeValue: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/customers/ltv`, {
            headers: getHeaders(true)
        });
        return handleResponse<any[]>(response);
    },

    getRetentionMetrics: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/customers/retention`, {
            headers: getHeaders(true)
        });
        return handleResponse<any>(response);
    }
};
