import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

/**
 * Card — glassmorphic surface card
 * Replaces the old flat border/bg-card style completely
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    // Glassmorphism base
                    'glass-card',
                    // Text
                    'text-[var(--text-primary)]',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1 px-5 pt-5 pb-3', className)}
            {...props}
        >
            {children}
        </div>
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn(
                'text-base font-semibold leading-none tracking-tight text-[var(--text-primary)]',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-sm text-[var(--text-secondary)]', className)}
            {...props}
        >
            {children}
        </p>
    )
);
CardDescription.displayName = 'CardDescription';

const CardBody = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn('px-5 pb-5', className)} {...props}>
            {children}
        </div>
    )
);
CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'flex items-center px-5 pb-5 pt-0 border-t border-[var(--border-subtle)] mt-4',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter };
