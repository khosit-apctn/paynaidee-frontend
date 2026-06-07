import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

/**
 * Input — glassmorphic style
 * Transparent background with glass border, indigo focus ring
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, required, leftIcon, rightIcon, ...props }, ref) => {
        const inputId = id || `input-${React.useId()}`;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]"
                    >
                        {label}
                        {required && <span className="ml-1 text-[var(--rose-400)]">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            // Glass base
                            'input-glass',
                            'flex h-11 w-full px-3.5 py-2.5',
                            'text-sm text-[var(--text-primary)]',
                            'min-h-[44px]',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            // Error state
                            error && 'border-[var(--rose-400)]/60 focus:border-[var(--rose-400)] focus:shadow-[0_0_0_3px_rgba(251,113,133,0.15)]',
                            // Disabled
                            'disabled:cursor-not-allowed disabled:opacity-40',
                            className
                        )}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? errorId : helperText ? helperId : undefined}
                        required={required}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs text-[var(--rose-400)]" role="alert">
                        <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={helperId} className="mt-1.5 text-xs text-[var(--text-muted)]">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
