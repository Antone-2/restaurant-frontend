// Environment variable configuration for frontend
// For production, set VITE_API_URL and VITE_WS_URL environment variables
// Example: VITE_API_URL=https://your-backend.onrender.com

interface EnvConfig {
    readonly VITE_API_URL: string;
    readonly VITE_WS_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_ENABLE_ANALYTICS: string;
}

function getEnvConfig(): EnvConfig {
    // In production, warn if API_URL is not set
    const isProduction = import.meta.env.PROD;

    if (isProduction && (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '')) {
        console.warn('Warning: VITE_API_URL not set for production. Using localhost as fallback.');
    }

    // Return config with defaults for development
    return {
        VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
        VITE_WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3001',
        VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'The Quill',
        VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS || 'false'
    } as EnvConfig;
}

// Initialize config
const env = getEnvConfig();

// Convenient exports for direct use throughout the app
// Use these instead of hardcoded URLs
// Example: import { API_URL } from '@/lib/env';
// Then: fetch(`${API_URL}/api/...`)
export const API_URL = env.VITE_API_URL;
export const WS_URL = env.VITE_WS_URL;
export const APP_NAME = env.VITE_APP_NAME;
export const ENABLE_ANALYTICS = env.VITE_ENABLE_ANALYTICS === 'true';

// For convenience, also export API_BASE_URL with /api suffix
export const API_BASE_URL = `${API_URL}/api`;

// Export the full config object
export { env };

// Development mode flags
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

export default env;
