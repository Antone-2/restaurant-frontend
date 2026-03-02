import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    aspectRatio?: 'square' | 'video' | ' portrait' | 'wide';
}

export function LazyImage({
    src,
    alt,
    placeholder,
    aspectRatio = 'square',
    className,
    ...props
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(placeholder || '');

    const aspectRatioClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        wide: 'aspect-[16/9]',
    };

    useEffect(() => {
        // Intersection Observer for lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1,
            }
        );

        const element = document.getElementById(`lazy-image-${src}`);
        if (element) {
            observer.observe(element);
        }

        return () => {
            observer.disconnect();
        };
    }, [src]);

    useEffect(() => {
        if (isInView && src) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                setCurrentSrc(src);
                setIsLoaded(true);
            };
        }
    }, [isInView, src]);

    return (
        <div
            id={`lazy-image-${src}`}
            className={cn(
                'relative overflow-hidden bg-muted',
                aspectRatioClasses[aspectRatio],
                className
            )}
        >
            {/* Placeholder/skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
            )}

            {/* Image */}
            <img
                src={currentSrc}
                alt={alt}
                loading="lazy"
                decoding="async"
                className={cn(
                    'w-full h-full object-cover transition-opacity duration-500',
                    isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                {...props}
            />
        </div>
    );
}

// Simple lazy load wrapper for any element
interface LazyLoadProps {
    children: React.ReactNode;
    placeholder?: React.ReactNode;
}

export function LazyLoad({ children, placeholder }: LazyLoadProps) {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '100px',
                threshold: 0.1,
            }
        );

        const element = document.getElementById('lazy-load-wrapper');
        if (element) {
            observer.observe(element);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div id="lazy-load-wrapper">
            {isInView ? children : (placeholder || null)}
        </div>
    );
}

export default LazyImage;
