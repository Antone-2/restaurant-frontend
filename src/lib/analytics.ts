// Analytics tracking utility
// This can be integrated with Google Analytics, Mixpanel, or any other analytics service

type AnalyticsEvent = {
    name: string;
    properties?: Record<string, any>;
};

type PageViewData = {
    page: string;
    title?: string;
};

// Analytics service interface
class AnalyticsService {
    private initialized = false;
    private debugMode = process.env.NODE_ENV === 'development';

    // Initialize analytics
    init(measurementId?: string) {
        if (!measurementId) {
            this.debugLog('Analytics: No measurement ID provided, running in debug mode');
            this.initialized = true;
            return;
        }

        // Google Analytics 4 initialization
        if (typeof window !== 'undefined') {
            // @ts-ignore
            window.dataLayer = window.dataLayer || [];
            // @ts-ignore
            window.gtag = function () {
                // @ts-ignore
                window.dataLayer.push(arguments);
            };
            // @ts-ignore
            window.gtag('js', new Date());
            // @ts-ignore
            window.gtag('config', measurementId, {
                page_title: document.title,
                page_location: window.location.href,
            });

            this.initialized = true;
            this.debugLog('Analytics initialized with ID:', measurementId);
        }
    }

    // Track page views
    trackPageView(data: PageViewData) {
        this.debugLog('Page View:', data);

        if (typeof window !== 'undefined' && (window as any).gtag) {
            // @ts-ignore
            (window as any).gtag('config', 'MEASUREMENT_ID', {
                page_path: data.page,
                page_title: data.title || document.title,
            });
        }

        this.sendToServer('pageview', data);
    }

    // Track custom events
    trackEvent(event: AnalyticsEvent) {
        this.debugLog('Event:', event);

        if (typeof window !== 'undefined' && (window as any).gtag) {
            // @ts-ignore
            (window as any).gtag('event', event.name, event.properties);
        }

        this.sendToServer('event', event);
    }

    // Track button clicks
    trackButtonClick(buttonName: string, location?: string) {
        this.trackEvent({
            name: 'button_click',
            properties: {
                button_name: buttonName,
                location: location || window.location.pathname,
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track conversions
    trackConversion(conversionName: string, value?: number) {
        this.trackEvent({
            name: 'conversion',
            properties: {
                conversion_name: conversionName,
                value: value,
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track errors
    trackError(error: Error, context?: string) {
        this.trackEvent({
            name: 'error',
            properties: {
                error_message: error.message,
                error_stack: error.stack,
                context: context,
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track user actions
    trackUserAction(action: string, details?: Record<string, any>) {
        this.trackEvent({
            name: 'user_action',
            properties: {
                action,
                ...details,
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track search queries
    trackSearch(query: string, resultsCount: number) {
        this.trackEvent({
            name: 'search',
            properties: {
                search_query: query,
                results_count: resultsCount,
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track menu item views
    trackMenuItemView(itemId: string, itemName: string, category: string) {
        this.trackEvent({
            name: 'view_item',
            properties: {
                item_id: itemId,
                item_name: itemName,
                item_category: category,
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track add to cart
    trackAddToCart(itemId: string, itemName: string, price: number, quantity: number) {
        this.trackEvent({
            name: 'add_to_cart',
            properties: {
                item_id: itemId,
                item_name: itemName,
                price: price,
                quantity: quantity,
                currency: 'KES',
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track checkout starts
    trackCheckoutStart(totalValue: number, itemCount: number) {
        this.trackEvent({
            name: 'begin_checkout',
            properties: {
                total_value: totalValue,
                items_count: itemCount,
                currency: 'KES',
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Track order completions
    trackOrderComplete(orderId: string, totalValue: number, items: any[]) {
        this.trackEvent({
            name: 'purchase',
            properties: {
                transaction_id: orderId,
                value: totalValue,
                currency: 'KES',
                items: items.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                timestamp: new Date().toISOString(),
            },
        });
    }

    // Send to server for server-side tracking
    private sendToServer(eventType: string, data: any) {
        // In production, you might want to send to your analytics server
        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics]', eventType, data);
        }
    }

    private debugLog(...args: any[]) {
        if (this.debugMode) {
            console.log('[Analytics Debug]', ...args);
        }
    }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
    return analytics;
}

export default analytics;
