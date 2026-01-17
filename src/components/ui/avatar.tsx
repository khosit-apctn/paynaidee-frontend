'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt = '', size = 'md', fallback, ...props }, ref) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);

        const sizeStyles = {
            sm: 'h-8 w-8 text-xs',
            md: 'h-10 w-10 text-sm',
            lg: 'h-12 w-12 text-base',
            xl: 'h-16 w-16 text-lg',
        };

        // Generate initials from alt text or fallback
        const getInitials = () => {
            const text = fallback || alt || '??';
            const words = text.trim().split(/\s+/);
            if (words.length >= 2) {
                return (words[0][0] + words[1][0]).toUpperCase();
            }
            return text.slice(0, 2).toUpperCase();
        };

        const showFallback = !src || imageError;

        return (
            <div
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted',
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {!showFallback && (
                    <>
                        {imageLoading && (
                            <div className="absolute inset-0 animate-pulse bg-muted" />
                        )}
                        <img
                            src={src}
                            alt={alt}
                            className={cn(
                                'h-full w-full object-cover',
                                imageLoading && 'opacity-0'
                            )}
                            onLoad={() => setImageLoading(false)}
                            onError={() => {
                                setImageError(true);
                                setImageLoading(false);
                            }}
                        />
                    </>
                )}
                {showFallback && (
                    <span className="font-medium text-muted-foreground">
                        {getInitials()}
                    </span>
                )}
            </div>
        );
    }
);

Avatar.displayName = 'Avatar';

export { Avatar };
