'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useTypingIndicator } from '@/lib/websocket/hooks';

interface MessageInputProps {
    groupId: number;
    onSendMessage: (content: string) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * MessageInput Component
 * Text input with send button for sending chat messages
 * Implements typing indicator sending via WebSocket
 * _Requirements: 2.3, 2.6_
 */
export function MessageInput({ groupId, onSendMessage, disabled = false, className }: MessageInputProps) {
    const t = useTranslation();
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { startTyping, stopTyping } = useTypingIndicator(groupId);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled) return;

        onSendMessage(trimmedMessage);
        setMessage('');
        stopTyping();

        // Focus back on input after sending
        inputRef.current?.focus();
    }, [message, disabled, onSendMessage, stopTyping]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        // Start typing indicator when user types
        startTyping();
    }, [startTyping]);

    const handleBlur = useCallback(() => {
        // Stop typing when input loses focus
        if (message.trim()) {
            stopTyping();
        }
    }, [message, stopTyping]);

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'flex items-end gap-2 border-t border-border bg-background p-3',
                className
            )}
        >
            <div className="relative flex-1">
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={t('chat.typeMessage')}
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        'w-full resize-none rounded-xl border border-border bg-muted/50',
                        'px-4 py-3 text-base',
                        'placeholder:text-muted-foreground',
                        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'min-h-[48px] max-h-[120px]'
                    )}
                    style={{
                        // Auto-resize based on content
                        height: 'auto',
                        overflowY: message.split('\n').length > 3 ? 'auto' : 'hidden',
                    }}
                />
            </div>
            <Button
                type="submit"
                size="md"
                disabled={disabled || !message.trim()}
                className="h-12 w-12 rounded-full p-0 flex-shrink-0"
                aria-label={t('chat.send')}
            >
                {/* Send Icon */}
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                </svg>
            </Button>
        </form>
    );
}

export default MessageInput;
