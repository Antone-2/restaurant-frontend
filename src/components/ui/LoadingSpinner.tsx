import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
};

export function LoadingSpinner({
    size = 'md',
    className,
    text,
    fullScreen = false
}: LoadingSpinnerProps) {
    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={cn(
                    "rounded-full border-2 border-amber-200 border-t-amber-600 spinner-fast",
                    sizeClasses[size],
                    className
                )}
            />
            {text && (
                <p className="text-sm text-gray-600 animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
}

// Skeleton loader for content placeholders
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("skeleton rounded-md", className)} />
    );
}

// Card skeleton
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
        </div>
    );
}

// Menu item skeleton
export function MenuItemSkeleton() {
    return (
        <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-20" />
            </div>
        </div>
    );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    );
}

// Page loading state
export function PageLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

// Inline loader for buttons
interface ButtonLoaderProps {
    className?: string;
}

export function ButtonLoader({ className }: ButtonLoaderProps) {
    return (
        <div
            className={cn("w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner-fast", className)}
        />
    );
}

// Dots loader for subtle loading
export function DotsLoader({ className }: { className?: string }) {
    return (
        <div className={cn("flex gap-1", className)}>
            <div className="w-2 h-2 bg-amber-500 rounded-full bounce-fast" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-amber-500 rounded-full bounce-fast" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-amber-500 rounded-full bounce-fast" style={{ animationDelay: '300ms' }} />
        </div>
    );
}

// Pulse loader
export function PulseLoader({ className }: { className?: string }) {
    return (
        <div className={cn("relative", className)}>
            <div className="w-8 h-8 bg-amber-400/30 rounded-full animate-ping" />
            <div className="absolute inset-0 w-8 h-8 bg-amber-500 rounded-full animate-pulse" />
        </div>
    );
}
