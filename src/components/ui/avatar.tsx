'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
    /** Emoji icon box color palette (replaces solid color circles) */
    emojiColor?: 'indigo' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
    /** Display an emoji instead of initials */
    emoji?: string;
}

/**
 * Avatar — glassmorphic emoji icon box system
 * When no image, shows emoji or initials in a transparent tinted glass box
 * (NOT a solid filled circle — uses bg-[color]/12 + border-[color]/25)
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt = '', size = 'md', fallback, emojiColor = 'indigo', emoji, ...props }, ref) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);

        const sizeStyles = {
            sm: 'h-8 w-8 text-xs rounded-xl',
            md: 'h-10 w-10 text-sm rounded-xl',
            lg: 'h-12 w-12 text-base rounded-[14px]',
            xl: 'h-16 w-16 text-xl rounded-2xl',
        };

        // Glassmorphic emoji box colors (bg/12 + border/25 pattern)
        const colorStyles: Record<string, string> = {
            indigo: 'bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.25)] text-[var(--indigo-300)]',
            violet: 'bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.25)] text-[var(--violet-400)]',
            cyan:   'bg-[rgba(34,211,238,0.12)] border border-[rgba(34,211,238,0.25)] text-[var(--cyan-400)]',
            emerald:'bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] text-[var(--emerald-400)]',
            amber:  'bg-[rgba(251,191,36,0.12)]  border border-[rgba(251,191,36,0.25)]  text-[var(--amber-400)]',
            rose:   'bg-[rgba(251,113,133,0.12)] border border-[rgba(251,113,133,0.25)] text-[var(--rose-400)]',
        };

        // Auto-pick a deterministic color from the text
        const getAutoColor = (text: string): string => {
            const palette = ['indigo', 'violet', 'cyan', 'emerald', 'amber', 'rose'];
            let hash = 0;
            for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
            return palette[Math.abs(hash) % palette.length];
        };

        const getInitials = () => {
            const text = fallback || alt || '??';
            const words = text.trim().split(/\s+/);
            if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
            return text.slice(0, 2).toUpperCase();
        };

        // Helper to check and format the image source URL
        const getResolvedSrc = (source?: string) => {
            if (!source) return undefined;
            const trimmed = source.trim();
            if (!trimmed) return undefined;

            // Check if it's an emoji (e.g., length <= 4 and no dot/slash)
            if (trimmed.length <= 4 && !trimmed.includes('.') && !trimmed.includes('/')) {
                return undefined;
            }

            // If it starts with http, data: or / it is already absolute or root-relative
            if (/^(https?:\/\/|data:|^\/)/i.test(trimmed)) {
                return trimmed;
            }

            // Otherwise, if it has a file extension or a dot, assume it's a root-relative asset
            if (trimmed.includes('.')) {
                return `/${trimmed}`;
            }

            return undefined;
        };

        const resolvedSrc = getResolvedSrc(src);
        
        // Auto-detect if src is actually an emoji
        const isEmojiSrc = src && !resolvedSrc && src.trim().length <= 4;
        const effectiveEmoji = emoji || (isEmojiSrc ? src : undefined);

        const showFallback = !resolvedSrc || imageError;
        const autoColor = getAutoColor(fallback || alt || 'x');
        const effectiveColor = emojiColor || autoColor;

        if (!showFallback && resolvedSrc) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        'relative inline-flex items-center justify-center overflow-hidden',
                        sizeStyles[size],
                        className
                    )}
                    {...props}
                >
                    {imageLoading && (
                        <div className="absolute inset-0 animate-pulse bg-white/5 rounded-inherit" />
                    )}
                    <img
                        src={resolvedSrc}
                        alt={alt}
                        className={cn('h-full w-full object-cover', imageLoading && 'opacity-0')}
                        onLoad={() => setImageLoading(false)}
                        onError={() => { setImageError(true); setImageLoading(false); }}
                    />
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center flex-shrink-0',
                    'backdrop-blur-sm font-semibold',
                    sizeStyles[size],
                    colorStyles[effectiveColor],
                    className
                )}
                {...props}
            >
                {effectiveEmoji ? (
                    <span>{effectiveEmoji}</span>
                ) : (
                    <span className="leading-none">{getInitials()}</span>
                )}
            </div>
        );
    }
);

Avatar.displayName = 'Avatar';

export { Avatar };
