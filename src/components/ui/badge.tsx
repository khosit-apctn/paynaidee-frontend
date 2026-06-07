import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline' | 'glass';
    children: React.ReactNode;
}

/**
 * Badge — glassmorphic pill tags (replaces solid-color heavy badges)
 * All variants use light text on a transparent tinted background
 * with a thin matching border for premium glass feel
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const base = 'inline-flex items-center gap-1 rounded-full text-[11px] font-semibold tracking-wide px-2.5 py-0.5 border transition-colors';

        const variantStyles: Record<string, string> = {
            default: 'bg-white/5 border-white/10 text-[var(--text-secondary)]',
            primary: 'bg-[rgba(79,70,229,0.15)] border-[rgba(99,102,241,0.30)] text-[var(--indigo-300)]',
            success: 'badge-paid',
            warning: 'badge-pending',
            error: 'badge-error',
            outline: 'bg-transparent border-[var(--border-glass)] text-[var(--text-secondary)]',
            glass: 'bg-[var(--bg-glass)] border-[var(--border-subtle)] text-[var(--text-primary)] backdrop-blur-sm',
        };

        return (
            <span
                ref={ref}
                className={cn(base, variantStyles[variant], className)}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export { Badge };
