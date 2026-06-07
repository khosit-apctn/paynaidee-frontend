import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circle' | 'rectangle';
    width?: string | number;
    height?: string | number;
}

/**
 * Skeleton — glassmorphic shimmer loading state
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'rectangle', width, height, style, ...props }, ref) => {
        const variantStyles = {
            text: 'h-4 w-full rounded-lg',
            circle: 'rounded-full',
            rectangle: 'rounded-xl',
        };

        const inlineStyles: React.CSSProperties = {
            ...style,
            ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
            ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
        };

        return (
            <div
                ref={ref}
                className={cn(
                    // Glass shimmer using gradient animation
                    'relative overflow-hidden',
                    'bg-white/[0.04] border border-white/[0.06]',
                    variantStyles[variant],
                    className
                )}
                style={inlineStyles}
                {...props}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.8s ease-in-out infinite',
                    }}
                />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
