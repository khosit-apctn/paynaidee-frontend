'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n';
import { useWebSocket, useChatWebSocket, useGroupPresence } from '@/lib/websocket/hooks';
import { useChatStore } from '@/lib/stores/chat-store';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

interface ChatContainerProps {
    groupId: number;
    groupName?: string;
    className?: string;
}

/**
 * ChatContainer Component
 * Manages WebSocket connection and orchestrates chat components
 * Handles join_group on mount and leave_group on unmount
 * _Requirements: 2.1, 2.9, 2.10_
 */
export function ChatContainer({ groupId, className }: ChatContainerProps) {
    const t = useTranslation();

    // WebSocket connection and state
    const { connect, connectionState, isConnected, isConnecting, isReconnecting } = useWebSocket();
    const { sendMessage } = useChatWebSocket(groupId);

    // Join/leave group presence
    useGroupPresence(groupId);

    // Clear chat when leaving - handled by store
    const clearChat = useChatStore((state) => state.clearChat);

    // Connect WebSocket on mount
    useEffect(() => {
        if (connectionState === 'disconnected') {
            connect().catch(console.error);
        }
    }, [connect, connectionState]);

    // Cleanup chat on unmount
    useEffect(() => {
        return () => {
            clearChat(groupId);
        };
    }, [groupId, clearChat]);

    // Handle sending messages
    const handleSendMessage = (content: string) => {
        sendMessage(content);
    };

    // Connecting state
    if (isConnecting) {
        return (
            <div className={cn('flex h-full flex-col items-center justify-center', className)}>
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Spinner size="lg" />
                    <span>Connecting to chat...</span>
                </div>
            </div>
        );
    }

    // Disconnected state - show reconnect option
    if (connectionState === 'disconnected') {
        return (
            <div className={cn('flex h-full flex-col items-center justify-center', className)}>
                <div className="flex flex-col items-center gap-4 text-center">
                    <svg className="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                    </svg>
                    <div>
                        <p className="text-lg font-medium text-foreground">Disconnected</p>
                        <p className="text-sm text-muted-foreground">Unable to connect to chat</p>
                    </div>
                    <Button onClick={() => connect()}>{t('common.retry')}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex h-full flex-col bg-background', className)}>
            {/* Connection status indicator */}
            {isReconnecting && (
                <div className="flex items-center justify-center gap-2 bg-warning/10 px-3 py-2 text-sm text-warning">
                    <Spinner size="sm" />
                    <span>Reconnecting...</span>
                </div>
            )}

            {/* Message list - takes remaining space */}
            <MessageList groupId={groupId} className="flex-1" />

            {/* Message input - fixed at bottom */}
            <MessageInput
                groupId={groupId}
                onSendMessage={handleSendMessage}
                disabled={!isConnected}
            />
        </div>
    );
}

export default ChatContainer;
