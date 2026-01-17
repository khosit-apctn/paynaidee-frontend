'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

export interface ToastProps {
    id: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: (id: string) => void;
}

export interface ToastContainerProps {
    toasts: ToastProps[];
}

const Toast: React.FC<ToastProps> = ({ id, message, variant = 'info', duration = 5000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => onClose(id), 300); // Wait for exit animation
            }, duration);

            return () => clearTimeout(timer);
        }
        return undefined;
    }, [duration, id, onClose]);

    const variantStyles = {
        success: 'bg-success text-success-foreground border-success',
        error: 'bg-error text-error-foreground border-error',
        warning: 'bg-warning text-warning-foreground border-warning',
        info: 'bg-primary text-primary-foreground border-primary',
    };

    const icons = {
        success: (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        warning: (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        info: (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div
            role="alert"
            className={cn(
                'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border-2 p-4 shadow-lg transition-all duration-300',
                variantStyles[variant],
                isExiting ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
            )}
        >
            {icons[variant]}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onClose(id), 300);
                }}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close notification"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4 sm:items-center sm:justify-end">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>,
        document.body
    );
};

ToastContainer.displayName = 'ToastContainer';
