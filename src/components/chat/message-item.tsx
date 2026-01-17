'use client';

import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/ui/avatar';
import { formatChatTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTranslation } from '@/lib/i18n';
import { formatThaiCurrency } from '@/lib/utils/currency';
import type { Message } from '@/types/models';

interface MessageItemProps {
    message: Message;
    showSender?: boolean;
    className?: string;
}

/**
 * MessageItem Component
 * Renders a single chat message with sender info and timestamp
 * Supports text, bill, and system message types
 * Handles emoji and Thai text rendering
 * _Requirements: 2.4, 2.8_
 */
export function MessageItem({ message, showSender = true, className }: MessageItemProps) {
    const t = useTranslation();
    const currentUserId = useAuthStore((state) => state.user?.id);
    const isOwnMessage = message.sender_id === currentUserId;
    const isSystemMessage = message.type === 'system';

    // System messages are centered
    if (isSystemMessage) {
        return (
            <div className={cn('flex justify-center py-2', className)}>
                <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
                    {message.content}
                </div>
            </div>
        );
    }

    // Parse bill metadata for bill type messages
    const renderBillContent = () => {
        try {
            const metadata = JSON.parse(message.metadata);
            const amount = metadata.amount || 0;
            const title = metadata.title || t('bills.title');

            return (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2 text-primary">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-semibold">{title}</span>
                    </div>
                    <div className="mt-2 text-lg font-bold text-foreground">
                        {formatThaiCurrency(amount)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                        {message.content}
                    </div>
                </div>
            );
        } catch {
            // Fallback if metadata parsing fails
            return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
        }
    };

    return (
        <div
            className={cn(
                'flex gap-2 px-4 py-1',
                isOwnMessage ? 'flex-row-reverse' : 'flex-row',
                className
            )}
        >
            {/* Avatar - only for other users' messages */}
            {!isOwnMessage && showSender && (
                <Avatar
                    src={message.sender?.avatar}
                    alt={message.sender?.display_name || message.sender?.username}
                    fallback={message.sender?.display_name || message.sender?.username}
                    size="sm"
                    className="flex-shrink-0 mt-1"
                />
            )}

            {/* Spacer when not showing avatar */}
            {!isOwnMessage && !showSender && <div className="w-8 flex-shrink-0" />}

            {/* Message bubble */}
            <div
                className={cn(
                    'max-w-[75%] flex flex-col',
                    isOwnMessage ? 'items-end' : 'items-start'
                )}
            >
                {/* Sender name - only for others' messages */}
                {!isOwnMessage && showSender && message.sender && (
                    <span className="mb-1 text-xs font-medium text-muted-foreground">
                        {message.sender.display_name || message.sender.username}
                    </span>
                )}

                {/* Message content */}
                <div
                    className={cn(
                        'rounded-2xl px-4 py-2',
                        isOwnMessage
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md',
                        message.type === 'bill' && 'p-0 bg-transparent'
                    )}
                >
                    {message.type === 'bill' ? (
                        renderBillContent()
                    ) : (
                        <p className="whitespace-pre-wrap break-words text-base">
                            {message.content}
                        </p>
                    )}
                </div>

                {/* Timestamp */}
                <span className="mt-1 text-xs text-muted-foreground">
                    {formatChatTime(message.created_at)}
                </span>
            </div>
        </div>
    );
}

export default MessageItem;
