'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useGroup } from '@/lib/hooks/use-groups';
import { useMessages } from '@/lib/hooks/use-chat';
import { useWebSocket, useChatWebSocket, useGroupPresence, useTypingIndicator } from '@/lib/websocket/hooks';
import { useChatStore } from '@/lib/stores/chat-store';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BillSplitCard } from './bill-split-card';
import type { Message } from '@/types/models';

/**
 * DashboardChat
 * Main chat area (3rd column) with real-time WebSocket messaging
 * Reads activeGroupId from ui-store, uses useMessages + useChatWebSocket
 */
export function DashboardChat() {
    const activeGroupId = useUIStore((s) => s.activeGroupId);

    if (!activeGroupId) {
        return <ChatEmptyState />;
    }

    return <ChatArea groupId={activeGroupId} />;
}

/** Full chat interface for an active group */
function ChatArea({ groupId }: { groupId: number }) {
    const t = useTranslation();
    const { user } = useAuthStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Group data
    const { data: group, isLoading: groupLoading } = useGroup(groupId);

    // Messages via TanStack Query (REST)
    const { data: messagesData, isLoading: msgsLoading, fetchNextPage, hasNextPage } = useMessages(groupId);

    // WebSocket real-time
    const { connect, connectionState, isConnected, isReconnecting } = useWebSocket();
    const { sendMessage } = useChatWebSocket(groupId);
    useGroupPresence(groupId);
    const { startTyping, stopTyping } = useTypingIndicator(groupId);

    // Chat store for real-time messages
    const storeMessages = useChatStore((s) => s.messages.get(groupId) || []);
    const typingUsers = useChatStore((s) => s.typingUsers.filter((u) => u.groupId === groupId));

    // Derive displayed messages: prefer store (has WS updates), fallback to query
    const messages = storeMessages.length > 0 ? storeMessages : (messagesData?.messages || []);

    // Connect WebSocket on mount
    useEffect(() => {
        if (connectionState === 'disconnected') {
            connect().catch(console.error);
        }
    }, [connect, connectionState]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const input = inputRef.current;
        if (!input || !input.value.trim()) return;
        sendMessage(input.value.trim());
        input.value = '';
        stopTyping();
    };

    const handleInputChange = () => {
        startTyping();
    };

    return (
        <div className="flex flex-col h-full bg-dash-bg">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-dash-border glass-card-sm rounded-none">
                {groupLoading ? (
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full bg-dash-surface" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32 bg-dash-surface" />
                            <Skeleton className="h-3 w-20 bg-dash-surface" />
                        </div>
                    </div>
                ) : (
                    <>
                        <Avatar
                            src={group?.avatar}
                            alt={group?.name}
                            fallback={group?.name}
                            size="md"
                            className="ring-2 ring-dash-border"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-dash-text truncate">
                                {group?.name}
                            </h3>
                            <p className="text-xs text-dash-text-muted">
                                {group?.members?.length || 0} {t('groups.members')}
                                <span className="inline-flex items-center ml-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                                    {t('dashboard.onlineNow')}
                                </span>
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Reconnecting banner */}
            {isReconnecting && (
                <div className="flex items-center justify-center gap-2 bg-dash-accent/10 px-3 py-2 text-sm text-dash-accent">
                    <Spinner size="sm" />
                    <span>Reconnecting...</span>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto dash-scrollbar px-6 py-4 space-y-4">
                {/* Load More */}
                {hasNextPage && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => fetchNextPage()}
                            className="text-xs text-dash-text-muted hover:text-dash-accent transition-colors px-3 py-1.5 rounded-lg glass-card-sm"
                        >
                            {t('chat.loadMore')}
                        </button>
                    </div>
                )}

                {msgsLoading ? (
                    <ChatSkeleton />
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-dash-text-muted">
                        <svg className="w-16 h-16 mb-4 text-dash-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">{t('chat.noMessages')}</p>
                        <p className="text-xs mt-1">{t('chat.startConversation')}</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
                    ))
                )}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-dash-text-muted animate-dash-fade-in">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-dash-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-dash-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-dash-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>{t('chat.typingMultiple', { count: String(typingUsers.length) })}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-dash-border">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('chat.typeMessage')}
                        onChange={handleInputChange}
                        disabled={!isConnected}
                        className="flex-1 px-4 py-3 rounded-xl bg-dash-surface border border-dash-border text-dash-text placeholder:text-dash-text-dim text-sm focus:outline-none focus:ring-1 focus:ring-dash-accent/40 transition-all disabled:opacity-50"
                    />
                    <Button
                        type="submit"
                        disabled={!isConnected}
                        className="!bg-dash-accent !text-dash-bg hover:!bg-dash-accent-dim rounded-xl !h-11 !min-h-0 px-5 font-semibold"
                    >
                        {t('chat.send')}
                    </Button>
                </form>
            </div>
        </div>
    );
}

/** Single chat message or inline bill card */
function ChatMessage({ message, isOwn }: { message: Message; isOwn: boolean }) {
    // Bill-type messages render as BillSplitCard
    if (message.type === 'bill') {
        const billData = message.metadata ? JSON.parse(message.metadata) : null;
        if (billData) {
            return (
                <div className="animate-dash-slide-up">
                    <BillSplitCard billId={billData.bill_id} />
                </div>
            );
        }
    }

    // System messages
    if (message.type === 'system') {
        return (
            <div className="flex justify-center animate-dash-fade-in">
                <span className="text-xs text-dash-text-dim bg-dash-surface px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    // Regular text messages
    return (
        <div className={`flex items-end gap-2 animate-dash-slide-up ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {!isOwn && (
                <Avatar
                    src={message.sender?.avatar}
                    alt={message.sender?.display_name || message.sender?.username}
                    fallback={message.sender?.display_name || message.sender?.username}
                    size="sm"
                />
            )}
            <div className={`max-w-[70%] ${isOwn ? 'order-first' : ''}`}>
                {!isOwn && (
                    <p className="text-[10px] text-dash-text-dim mb-1 ml-1">
                        {message.sender?.display_name || message.sender?.username}
                    </p>
                )}
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
                        ? 'bg-dash-accent text-dash-bg rounded-br-md'
                        : 'glass-card-sm text-dash-text rounded-bl-md'
                        }`}
                >
                    {message.content}
                </div>
                <p className={`text-[10px] text-dash-text-dim mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}

/** Empty state when no group is selected */
function ChatEmptyState() {
    const t = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full bg-dash-bg text-dash-text-muted">
            <div className="w-24 h-24 rounded-3xl bg-dash-surface flex items-center justify-center mb-6 animate-dash-pulse-glow">
                <svg className="w-12 h-12 text-dash-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-dash-text mb-2">PayNaiDee Chat</h3>
            <p className="text-sm text-dash-text-muted">{t('dashboard.selectGroup')}</p>
        </div>
    );
}

/** Skeleton for message loading */
function ChatSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? 'justify-end' : ''}`}>
                    {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full bg-dash-surface" />}
                    <div className={`space-y-1 ${i % 2 === 0 ? 'items-end' : ''}`}>
                        <Skeleton className={`h-10 rounded-2xl bg-dash-surface ${i % 2 === 0 ? 'w-48' : 'w-56'}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DashboardChat;
