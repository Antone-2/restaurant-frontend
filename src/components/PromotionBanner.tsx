import React, { useState, useEffect } from 'react';
import { X, Clock, Gift, Music, Sparkles, Calendar, Users, Star } from 'lucide-react';

// Time-based promotion types
export interface Promotion {
    id: string;
    title: string;
    description: string;
    discount?: string;
    code?: string;
    icon: 'clock' | 'gift' | 'music' | 'sparkles' | 'calendar' | 'users' | 'star';
    startTime?: string; // Format: "HH:MM" (24-hour)
    endTime?: string;  // Format: "HH:MM" (24-hour)
    startDate?: string; // Format: "YYYY-MM-DD"
    endDate?: string;   // Format: "YYYY-MM-DD"
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
    isActive: boolean;
    priority: number;
    backgroundColor?: string;
    textColor?: string;
}

// Default promotions for the restaurant
const defaultPromotions: Promotion[] = [
    {
        id: 'happy-hour',
        title: '🍹 Happy Hour Special!',
        description: 'Get 20% off all drinks from 4PM - 6PM',
        discount: '20% OFF',
        code: 'HAPPY20',
        icon: 'clock',
        startTime: '16:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
        isActive: true,
        priority: 1,
        backgroundColor: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
        textColor: '#ffffff'
    },
    {
        id: 'weekend-brunch',
        title: '🥂 Weekend Brunch',
        description: 'Free drink with any main course on weekends',
        discount: 'FREE DRINK',
        code: 'BRUNCH25',
        icon: 'gift',
        daysOfWeek: [0, 6], // Saturday - Sunday
        isActive: true,
        priority: 2,
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textColor: '#ffffff'
    },
    {
        id: 'early-bird',
        title: '🌅 Early Bird Dinner',
        description: '15% off when you dine before 7PM',
        discount: '15% OFF',
        code: 'EARLY15',
        icon: 'sparkles',
        startTime: '17:00',
        endTime: '19:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        priority: 3,
        backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        textColor: '#ffffff'
    },
    {
        id: 'live-music',
        title: '🎵 Live Music Night',
        description: 'Enjoy live performances every Friday & Saturday',
        icon: 'music',
        daysOfWeek: [5, 6], // Friday - Saturday
        isActive: true,
        priority: 4,
        backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        textColor: '#ffffff'
    },
    {
        id: 'corporate-deal',
        title: '🏢 Corporate Lunch',
        description: 'Special group rates for office teams',
        icon: 'users',
        isActive: true,
        priority: 5,
        backgroundColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        textColor: '#1a1a2e'
    }
];

interface PromotionBannerProps {
    promotions?: Promotion[];
    position?: 'top' | 'bottom';
    showCloseButton?: boolean;
    autoHide?: boolean;
    hideDuration?: number; // in milliseconds
}

const iconMap = {
    clock: Clock,
    gift: Gift,
    music: Music,
    sparkles: Sparkles,
    calendar: Calendar,
    users: Users,
    star: Star
};

export const PromotionBanner: React.FC<PromotionBannerProps> = ({
    promotions = defaultPromotions,
    position = 'top',
    showCloseButton = true,
    autoHide = true,
    hideDuration = 8000
}) => {
    const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Check if promotion is currently active based on time and date
    const isPromotionActive = (promo: Promotion): boolean => {
        if (!promo.isActive) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
        const currentDay = now.getDay();
        const currentDate = now.toISOString().split('T')[0];

        // Check day of week
        if (promo.daysOfWeek && promo.daysOfWeek.length > 0) {
            if (!promo.daysOfWeek.includes(currentDay)) return false;
        }

        // Check time range
        if (promo.startTime && promo.endTime) {
            const [startHour, startMin] = promo.startTime.split(':').map(Number);
            const [endHour, endMin] = promo.endTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            if (currentTime < startMinutes || currentTime >= endMinutes) return false;
        }

        // Check date range
        if (promo.startDate && currentDate < promo.startDate) return false;
        if (promo.endDate && currentDate > promo.endDate) return false;

        return true;
    };

    // Find the highest priority active promotion
    useEffect(() => {
        const activePromos = promotions
            .filter(isPromotionActive)
            .sort((a, b) => a.priority - b.priority);

        if (activePromos.length > 0) {
            setActivePromotion(activePromos[0]);

            // Check if banner was previously dismissed
            const dismissedPromos = JSON.parse(localStorage.getItem('dismissedPromotions') || '[]');
            if (!dismissedPromos.includes(activePromos[0].id)) {
                setTimeout(() => setIsVisible(true), 100);
            }
        }
    }, []);

    // Auto-hide banner after duration
    useEffect(() => {
        if (autoHide && isVisible && activePromotion) {
            const timer = setTimeout(() => {
                handleClose();
            }, hideDuration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, activePromotion, autoHide, hideDuration]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            if (activePromotion) {
                // Save dismissed promotion to localStorage
                const dismissedPromos = JSON.parse(localStorage.getItem('dismissedPromotions') || '[]');
                if (!dismissedPromos.includes(activePromotion.id)) {
                    dismissedPromos.push(activePromotion.id);
                    localStorage.setItem('dismissedPromotions', JSON.stringify(dismissedPromos));
                }
            }
        }, 300);
    };

    if (!activePromotion || !isVisible) return null;

    const IconComponent = iconMap[activePromotion.icon] || Sparkles;

    return (
        <div
            className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 transition-all duration-500 ${isClosing ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'
                }`}
        >
            <div
                className="relative overflow-hidden"
                style={{
                    background: activePromotion.backgroundColor || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: activePromotion.textColor || '#ffffff'
                }}
            >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9nPjwvc3ZnPg==')] animate-pulse" />
                </div>

                <div className="relative px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        {/* Icon and Content */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-base font-bold truncate">
                                    {activePromotion.title}
                                </p>
                                <p className="text-xs sm:text-sm truncate opacity-90">
                                    {activePromotion.description}
                                </p>
                            </div>
                        </div>

                        {/* Discount Code / CTA */}
                        <div className="flex items-center gap-3 ml-3">
                            {activePromotion.code && (
                                <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider">
                                        Use code:
                                    </span>
                                    <span className="text-sm font-bold bg-white/30 px-2 py-0.5 rounded">
                                        {activePromotion.code}
                                    </span>
                                </div>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={handleClose}
                                    className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                                    aria-label="Close promotion"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress bar for auto-hide */}
                {autoHide && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                        <div
                            className="h-full bg-white/80 animate-shrink"
                            style={{
                                animation: `shrink ${hideDuration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>

            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation-name: shrink;
        }
      `}</style>
        </div>
    );
};

// Component for showing promotion carousel/drawer
interface PromotionDrawerProps {
    promotions?: Promotion[];
    onClose?: () => void;
}

export const PromotionDrawer: React.FC<PromotionDrawerProps> = ({
    promotions = defaultPromotions,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const activePromotions = promotions.filter(p => p.isActive);

    useEffect(() => {
        if (activePromotions.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activePromotions.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [activePromotions.length]);

    if (activePromotions.length === 0) return null;

    const currentPromo = activePromotions[currentIndex];
    const IconComponent = iconMap[currentPromo?.icon] || Sparkles;

    return (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg">{currentPromo?.title}</h3>
                    <p className="text-white/90 text-sm">{currentPromo?.description}</p>
                    {currentPromo?.code && (
                        <div className="mt-2 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                            <span className="text-xs text-white/80">Code:</span>
                            <span className="text-sm font-bold text-white">{currentPromo.code}</span>
                        </div>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {activePromotions.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                    {activePromotions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromotionBanner;
