import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

/**
 * Button — glassmorphism design system
 * primary = accent gradient with glow
 * secondary = violet glass
 * outline = glass border
 * ghost = transparent hover
 * glass = explicit glass surface
 * destructive = rose glass
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
        const baseStyles = [
            'inline-flex items-center justify-center font-semibold',
            'transition-all duration-200 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
            'disabled:pointer-events-none disabled:opacity-40',
            'select-none cursor-pointer',
        ].join(' ');

        const variantStyles: Record<string, string> = {
            primary: [
                'btn-accent text-white',
                'rounded-xl',
            ].join(' '),

            secondary: [
                'bg-[rgba(139,92,246,0.15)] text-[var(--violet-400)]',
                'border border-[rgba(139,92,246,0.30)]',
                'backdrop-blur-md',
                'hover:bg-[rgba(139,92,246,0.22)] hover:border-[rgba(139,92,246,0.45)]',
                'rounded-xl',
            ].join(' '),

            outline: [
                'bg-transparent text-[var(--text-primary)]',
                'border border-[var(--border-glass)]',
                'backdrop-blur-sm',
                'hover:bg-[var(--bg-glass)] hover:border-[var(--border-accent)]',
                'rounded-xl',
            ].join(' '),

            ghost: [
                'bg-transparent text-[var(--text-secondary)]',
                'hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)]',
                'rounded-xl',
            ].join(' '),

            glass: [
                'bg-[var(--bg-glass)] text-[var(--text-primary)]',
                'border border-[var(--border-subtle)]',
                'backdrop-blur-md',
                'hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-glass)]',
                'rounded-xl',
            ].join(' '),

            destructive: [
                'bg-[rgba(251,113,133,0.15)] text-[var(--rose-400)]',
                'border border-[rgba(251,113,133,0.28)]',
                'backdrop-blur-md',
                'hover:bg-[rgba(251,113,133,0.22)]',
                'rounded-xl',
            ].join(' '),
        };

        const sizeStyles: Record<string, string> = {
            sm: 'h-8 px-3 text-sm gap-1.5',
            md: 'h-10 px-4 text-sm gap-2 min-h-[44px]',
            lg: 'h-12 px-6 text-base gap-2.5 min-h-[48px]',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    loading && 'relative text-transparent hover:text-transparent',
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-100" />
                    </div>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
