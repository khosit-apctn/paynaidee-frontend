import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circle' | 'rectangle';
    width?: string | number;
    height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'rectangle', width, height, style, ...props }, ref) => {
        const variantStyles = {
            text: 'h-4 w-full rounded',
            circle: 'rounded-full',
            rectangle: 'rounded-lg',
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
                    'animate-pulse bg-muted',
                    variantStyles[variant],
                    className
                )}
                style={inlineStyles}
                {...props}
            >
                <span className="sr-only">Loading...</span>
            </div>
        );
    }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
