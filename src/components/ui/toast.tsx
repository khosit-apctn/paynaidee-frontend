'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

const variantConfig = {
    success: {
        bg: 'rgba(52,211,153,0.12)',
        border: 'rgba(52,211,153,0.28)',
        color: '#34d399',
        icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    error: {
        bg: 'rgba(251,113,133,0.12)',
        border: 'rgba(251,113,133,0.28)',
        color: '#fb7185',
        icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    },
    warning: {
        bg: 'rgba(251,191,36,0.12)',
        border: 'rgba(251,191,36,0.28)',
        color: '#fbbf24',
        icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    info: {
        bg: 'rgba(99,102,241,0.12)',
        border: 'rgba(99,102,241,0.28)',
        color: '#a5b4fc',
        icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

/**
 * Toast — glassmorphic notification pill
 * Transparent tinted bg with matching border (NOT solid color)
 */
const Toast: React.FC<ToastProps> = ({ id, message, variant = 'info', duration = 5000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);
    const config = variantConfig[variant];

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => onClose(id), 300);
            }, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [duration, id, onClose]);

    return (
        <div
            role="alert"
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3.5 shadow-2xl transition-all duration-300"
            style={{
                background: config.bg,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: `1px solid ${config.border}`,
                color: config.color,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
                transform: isExiting ? 'translateY(8px)' : 'translateY(0)',
                opacity: isExiting ? 0 : 1,
            }}
        >
            {config.icon}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => { setIsExiting(true); setTimeout(() => onClose(id), 300); }}
                className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close notification"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
    if (typeof window === 'undefined') return null;
    return createPortal(
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>,
        document.body
    );
};

ToastContainer.displayName = 'ToastContainer';
