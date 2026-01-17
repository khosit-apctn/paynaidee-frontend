'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n';
import { useMessages } from '@/lib/hooks/use-chat';
import { useChatStore } from '@/lib/stores/chat-store';
import { MessageItem } from './message-item';
import { TypingIndicator } from './typing-indicator';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/models';

interface MessageListProps {
    groupId: number;
    className?: string;
}

/**
 * MessageList Component
 * Displays chat messages with infinite scroll for loading history
 * Integrates with both REST API (history) and WebSocket (real-time)
 * _Requirements: 2.4, 2.5, 9.5_
 */
export function MessageList({ groupId, className }: MessageListProps) {
    const t = useTranslation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMessageCountRef = useRef(0);

    // Get messages from REST API (history with pagination)
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
    } = useMessages(groupId);

    // Get real-time messages from store
    const storeMessages = useChatStore((state) => state.getMessages(groupId));
    const setMessages = useChatStore((state) => state.setMessages);

    // Merge API messages with store messages, avoiding duplicates
    const allMessages = React.useMemo(() => {
        const apiMessages = data?.messages || [];

        // Combine and deduplicate by message ID
        const messageMap = new Map<number, Message>();

        // API messages first (older)
        apiMessages.forEach((msg) => messageMap.set(msg.id, msg));

        // Then store messages (which may include real-time messages)
        storeMessages.forEach((msg) => messageMap.set(msg.id, msg));

        // Sort by created_at
        return Array.from(messageMap.values()).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, [data?.messages, storeMessages]);

    // Sync API messages to store on initial load
    useEffect(() => {
        if (data?.messages && data.messages.length > 0) {
            setMessages(groupId, data.messages);
        }
    }, [data?.messages, groupId, setMessages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (allMessages.length > lastMessageCountRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        lastMessageCountRef.current = allMessages.length;
    }, [allMessages.length]);

    // Infinite scroll handler - load older messages when scrolling to top
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        // Load more when scrolled near the top
        if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Check if we should show sender info (different sender from previous message)
    const shouldShowSender = (message: Message, index: number) => {
        if (index === 0) return true;
        const prevMessage = allMessages[index - 1];
        return prevMessage.sender_id !== message.sender_id || message.type === 'system';
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={cn('flex flex-1 items-center justify-center', className)}>
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Spinner size="lg" />
                    <span>{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={cn('flex flex-1 items-center justify-center', className)}>
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="text-error">{t('errors.unknown')}</div>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        {t('common.retry')}
                    </Button>
                </div>
            </div>
        );
    }

    // Empty state
    if (allMessages.length === 0) {
        return (
            <div className={cn('flex flex-1 flex-col items-center justify-center', className)}>
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <svg className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium">{t('chat.noMessages')}</p>
                    <p className="text-sm">{t('chat.startConversation')}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn('flex flex-1 flex-col overflow-y-auto', className)}
            onScroll={handleScroll}
        >
            {/* Load more indicator */}
            {hasNextPage && (
                <div className="flex justify-center py-4">
                    {isFetchingNextPage ? (
                        <Spinner size="sm" />
                    ) : (
                        <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
                            {t('chat.loadMore')}
                        </Button>
                    )}
                </div>
            )}

            {/* Messages */}
            <div className="flex flex-col py-2">
                {allMessages.map((message, index) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        showSender={shouldShowSender(message, index)}
                    />
                ))}
            </div>

            {/* Typing indicator */}
            <TypingIndicator groupId={groupId} />

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default MessageList;
