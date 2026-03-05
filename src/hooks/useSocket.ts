import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import env from '../lib/env';

const SOCKET_URL = env.VITE_WS_URL;

interface SocketEvent {
    type: string;
    data: any;
}

interface UseSocketOptions {
    autoConnect?: boolean;
    userId?: string;
    isAdmin?: boolean;
}

// Define socket type more loosely to avoid import issues
type SocketType = any;

export const useSocket = (options: UseSocketOptions = {}) => {
    const { autoConnect = true, userId, isAdmin = false } = options;
    const socketRef = useRef<SocketType>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);
    const [notifications, setNotifications] = useState<SocketEvent[]>([]);

    useEffect(() => {
        if (autoConnect && !socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000, // 20 second connection timeout
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected:', socketRef.current?.id);
                setIsConnected(true);

                // Register the client
                socketRef.current?.emit('register', {
                    userId,
                    isAdmin,
                    connectedAt: new Date().toISOString(),
                });

                // Join appropriate rooms
                if (isAdmin) {
                    socketRef.current?.emit('join:admin');
                }
                socketRef.current?.emit('join:orders');
                socketRef.current?.emit('join:reservations');
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socketRef.current.on('connect_error', (error: any) => {
                console.error('Socket connection error:', error.message);
                setIsConnected(false);
            });

            socketRef.current.on('error', (error: any) => {
                console.error('Socket error:', error);
            });

            // Listen for various events
            socketRef.current.on('order:new', (data: any) => {
                setLastEvent({ type: 'order:new', data });
                setNotifications((prev) => [...prev, { type: 'order:new', data }].slice(-20));
            });

            socketRef.current.on('order:statusChanged', (data: any) => {
                setLastEvent({ type: 'order:statusChanged', data });
                setNotifications((prev) => [...prev, { type: 'order:statusChanged', data }].slice(-20));
            });

            socketRef.current.on('order:created', (data: any) => {
                setLastEvent({ type: 'order:created', data });
            });

            socketRef.current.on('order:updated', (data: any) => {
                setLastEvent({ type: 'order:updated', data });
                setNotifications((prev) => [...prev, { type: 'order:updated', data }].slice(-20));
            });

            socketRef.current.on('reservation:new', (data: any) => {
                setLastEvent({ type: 'reservation:new', data });
                setNotifications((prev) => [...prev, { type: 'reservation:new', data }].slice(-20));
            });

            socketRef.current.on('reservation:statusChanged', (data: any) => {
                setLastEvent({ type: 'reservation:statusChanged', data });
            });

            socketRef.current.on('reservation:created', (data: any) => {
                setLastEvent({ type: 'reservation:created', data });
            });

            socketRef.current.on('reservation:updated', (data: any) => {
                setLastEvent({ type: 'reservation:updated', data });
                setNotifications((prev) => [...prev, { type: 'reservation:updated', data }].slice(-20));
            });

            socketRef.current.on('review:new', (data: any) => {
                setLastEvent({ type: 'review:new', data });
                setNotifications((prev) => [...prev, { type: 'review:new', data }].slice(-20));
            });

            socketRef.current.on('review:updated', (data: any) => {
                setLastEvent({ type: 'review:updated', data });
            });

            // Admin-specific notification listeners
            socketRef.current.on('complaint:new', (data: any) => {
                setLastEvent({ type: 'complaint:new', data });
                setNotifications((prev) => [...prev, { type: 'complaint:new', data }].slice(-20));
            });

            socketRef.current.on('dispute:new', (data: any) => {
                setLastEvent({ type: 'dispute:new', data });
                setNotifications((prev) => [...prev, { type: 'dispute:new', data }].slice(-20));
            });

            socketRef.current.on('parking:new', (data: any) => {
                setLastEvent({ type: 'parking:new', data });
                setNotifications((prev) => [...prev, { type: 'parking:new', data }].slice(-20));
            });

            socketRef.current.on('contact:new', (data: any) => {
                setLastEvent({ type: 'contact:new', data });
                setNotifications((prev) => [...prev, { type: 'contact:new', data }].slice(-20));
            });

            socketRef.current.on('event:new', (data: any) => {
                setLastEvent({ type: 'event:new', data });
                setNotifications((prev) => [...prev, { type: 'event:new', data }].slice(-20));
            });

            socketRef.current.on('inventory:low', (data: any) => {
                setLastEvent({ type: 'inventory:low', data });
                setNotifications((prev) => [...prev, { type: 'inventory:low', data }].slice(-20));
            });

            socketRef.current.on('notification:push', (data: any) => {
                setLastEvent({ type: 'notification:push', data });
                setNotifications((prev) => [...prev, { type: 'notification:push', data }].slice(-20));
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [autoConnect, userId, isAdmin]);

    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        socketRef.current?.on(event, callback);
    }, []);

    const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
        if (callback) {
            socketRef.current?.off(event, callback);
        } else {
            socketRef.current?.off(event);
        }
    }, []);

    const emit = useCallback((event: string, data?: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        }
    }, []);

    const joinRoom = useCallback((room: string) => {
        socketRef.current?.emit(`join:${room}`);
    }, []);

    const leaveRoom = useCallback((room: string) => {
        socketRef.current?.emit(`leave:${room}`);
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        lastEvent,
        notifications,
        on,
        off,
        emit,
        joinRoom,
        leaveRoom,
        clearNotifications,
    };
};

export default useSocket;
