import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

        const variantStyles = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary-600 active:bg-primary-700',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-600 active:bg-secondary-700',
            outline: 'border-2 border-border bg-transparent hover:bg-muted active:bg-muted-foreground/10',
            ghost: 'hover:bg-muted active:bg-muted-foreground/10',
            destructive: 'bg-error text-error-foreground hover:bg-error-600 active:bg-error/90',
        };

        const sizeStyles = {
            sm: 'h-9 px-3 text-sm min-h-[36px]', // Touch-friendly minimum
            md: 'h-11 px-4 text-base min-h-[44px]', // Touch-friendly default
            lg: 'h-12 px-6 text-lg min-h-[48px]', // Touch-friendly large
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
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </div>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
