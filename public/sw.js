// Service Worker for The Quill Restaurant - Push Notifications & Caching

const CACHE_NAME = 'the-quill-v2';
const OFFLINE_URL = '/';

// Cache strategies
const CACHE_STRATEGIES = {
    // Static assets - Cache First
    STATIC: ['/assets/', '/icons/', '.css', '.js', '.woff', '.woff2'],
    // API responses - Network First with fallback
    API: ['/api/'],
    // Images - Stale While Revalidate
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
};

// Install event
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching static assets');
            return cache.addAll([
                OFFLINE_URL,
                '/index.html',
            ]);
        })
    );
    self.skipWaiting();
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[ServiceWorker] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event with caching strategies
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Determine caching strategy based on request type
    if (isApiRequest(url)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (isStaticAsset(url)) {
        event.respondWith(cacheFirstStrategy(request));
    } else if (isImageRequest(url)) {
        event.respondWith(staleWhileRevalidate(request));
    } else {
        event.respondWith(networkFirstStrategy(request));
    }
});

// Check if request is an API call
function isApiRequest(url) {
    return url.pathname.startsWith('/api/');
}

// Check if request is a static asset
function isStaticAsset(url) {
    return CACHE_STRATEGIES.STATIC.some(ext => url.pathname.includes(ext));
}

// Check if request is an image
function isImageRequest(url) {
    return CACHE_STRATEGIES.IMAGES.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

// Cache First Strategy - Check cache, fallback to network
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Cache First - Network failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First Strategy - Try network, fallback to cache
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Network First - Falling back to cache');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }
        return new Response('Offline', { status: 503 });
    }
}

// Stale While Revalidate - Return cached immediately, update in background
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    // Always fetch fresh data in the background
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            // Clone the response before caching, as response body can only be read once
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
            });
        }
        return networkResponse;
    }).catch(() => {
        // If network fails and we have a cached response, return it
        return cachedResponse || new Response('Offline', { status: 503 });
    });

    // Return cached immediately if available, otherwise wait for network
    return cachedResponse || fetchPromise;
}

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');

    let data = {
        title: 'The Quill Restaurant',
        body: 'You have a new notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'the-quill',
        data: {},
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        data: data.data,
        vibrate: [100, 50, 100],
        actions: [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' },
        ],
        requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked');

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(urlToOpen);
                    return;
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);

    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    console.log('[ServiceWorker] Syncing offline orders...');
}
