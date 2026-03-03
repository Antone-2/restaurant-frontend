import { useState, useEffect, useCallback } from 'react';
import env from '../lib/env';

const API_URL = env.VITE_API_URL;

interface PushNotificationOptions {
    onNotification?: (notification: NotificationData) => void;
    enabled?: boolean;
}

interface NotificationData {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
}

export const usePushNotifications = (options: PushNotificationOptions = {}) => {
    const { onNotification, enabled = true } = options;
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if push notifications are supported
        if ('Notification' in window && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            console.warn('Push notifications are not supported');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Subscribe to push notifications
                await subscribeToPush();
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }, [isSupported]);

    const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
        if (!isSupported || permission !== 'granted') {
            return null;
        }

        try {
            const registration = await navigator.serviceWorker?.ready;
            if (!registration) {
                console.warn('Service worker not ready');
                return null;
            }

            // In production, you would get the subscription from your server
            // For now, we'll create a mock subscription
            const vapidKey = urlBase64ToUint8Array(
                // This would be your VAPID public key in production
                'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
            );
            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey as unknown as BufferSource,
            });

            setSubscription(pushSubscription);

            // Send subscription to server
            try {
                await fetch(`${API_URL}/api/notifications/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        subscription: pushSubscription,
                    }),
                });
            } catch (e) {
                console.log('Note: Push subscription saved locally (server may be unavailable)');
            }

            return pushSubscription;
        } catch (error) {
            console.error('Error subscribing to push:', error);
            return null;
        }
    }, [isSupported, permission]);

    const showLocalNotification = useCallback(
        (title: string, body: string, options?: NotificationData) => {
            if (permission === 'granted') {
                new Notification(title, {
                    body,
                    icon: options?.icon || '/favicon.ico',
                    badge: options?.badge || '/favicon.ico',
                    tag: options?.tag || 'the-quill',
                    data: options?.data,
                    ...options,
                });

                if (onNotification) {
                    onNotification({ title, body, ...options });
                }
            }
        },
        [permission, onNotification]
    );

    const unsubscribe = useCallback(async () => {
        if (subscription) {
            await subscription.unsubscribe();
            setSubscription(null);
        }
    }, [subscription]);

    return {
        isSupported,
        permission,
        subscription,
        requestPermission,
        subscribeToPush,
        showLocalNotification,
        unsubscribe,
    };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as Uint8Array;
}

export default usePushNotifications;
