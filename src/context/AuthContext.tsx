import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface User {
    _id?: string;
    email: string;
    name?: string;
    phone?: string;
    address?: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (userData: { email: string; password: string; name: string; phone?: string }) => Promise<any>;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => Promise<any>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely parse JSON from localStorage
const getStoredItem = (key: string): any | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = getStoredItem('authUser');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser);

                // Optionally verify token is still valid with backend
                try {
                    const profile = await authApi.getProfile();
                    setUser(profile);
                    localStorage.setItem('authUser', JSON.stringify(profile));
                } catch (error) {
                    // Token might be expired, clear storage
                    console.error('Token validation failed:', error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    setToken(null);
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);

            // Store both token and user object
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setToken(response.token);
            }

            if (response.user) {
                // Use isAdmin from backend if provided, otherwise default to 'user'
                const userWithRole = {
                    ...response.user,
                    role: response.user.isAdmin ? 'admin' : (response.user.role || 'user')
                };
                localStorage.setItem('authUser', JSON.stringify(userWithRole));
                setUser(userWithRole);
            }

            return response;
        } catch (error: any) {
            // Re-throw with more descriptive message
            const message = error.message || 'Login failed. Please check your credentials.';
            throw new Error(message);
        }
    };

    const register = async (userData: { email: string; password: string; name: string; phone?: string }) => {
        try {
            const response = await authApi.register(userData);

            // Store both token and user object
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setToken(response.token);
            }

            if (response.user) {
                // Ensure user has a role (default to 'user' if not provided)
                const userWithRole = {
                    ...response.user,
                    role: response.user.role || 'user'
                };
                localStorage.setItem('authUser', JSON.stringify(userWithRole));
                setUser(userWithRole);
            }

            return response;
        } catch (error: any) {
            // Re-throw with more descriptive message
            const message = error.message || 'Registration failed. Please try again.';
            throw new Error(message);
        }
    };

    const logout = () => {
        authApi.logout();
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (userData: Partial<User>) => {
        try {
            const response = await authApi.updateProfile({
                name: userData.name,
                phone: userData.phone,
                address: userData.address
            });

            // Update local user state and localStorage
            const updatedUser = { ...user, ...userData } as User;
            setUser(updatedUser);
            localStorage.setItem('authUser', JSON.stringify(updatedUser));

            return response;
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
