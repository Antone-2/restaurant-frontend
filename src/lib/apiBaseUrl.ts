/**
 * Centralized API base URL helper
 * In development: uses relative path (/api) which goes through Vite proxy to localhost:3001
 * In production: uses the configured VITE_API_URL
 */
const isDev = import.meta.env.DEV;

export const getApiBaseUrl = (): string => {
    if (isDev) {
        // Development: use relative path - Vite proxy will forward to localhost:3001
        return '/api';
    }
    // Production: use configured API URL
    const envUrl = import.meta.env.VITE_API_URL || '';
    const prodUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    return prodUrl;
};

// For backward compatibility
export const API_BASE_URL = getApiBaseUrl();
