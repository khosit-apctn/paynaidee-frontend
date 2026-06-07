'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Modal — glassmorphic dialog
 * Backdrop: deep blur + subtle vignette
 * Modal: glass-card surface with gradient top accent border
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, size = 'md' }) => {
    const modalRef = React.useRef<HTMLDivElement>(null);

    const handleEscape = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
    }, [onClose]);

    const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        firstElement?.focus();

        const handleTab = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTab);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleTab);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, handleEscape]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClass = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    }[size];

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[var(--bg-base)]/80 backdrop-blur-xl" />

            {/* Radial glow behind modal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-96 h-96 rounded-full bg-[var(--indigo-800)]/20 blur-3xl" />
            </div>

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                className={cn(
                    'relative z-10 w-full animate-scale-in',
                    sizeClass,
                    'max-h-[90vh] overflow-y-auto',
                    // Glass surface
                    'rounded-2xl',
                    'bg-[var(--bg-surface-raised)]',
                    'backdrop-blur-2xl',
                    'border border-[var(--border-glass)]',
                    'shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]',
                    className
                )}
            >
                {/* Top accent gradient line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--indigo-400)]/40 to-transparent" />

                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                    {title && (
                        <h2 id="modal-title" className="text-lg font-semibold text-[var(--text-primary)]">
                            {title}
                        </h2>
                    )}
                    <button
                        onClick={onClose}
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo-400)]"
                        aria-label="Close modal"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 text-[var(--text-primary)]">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

Modal.displayName = 'Modal';
