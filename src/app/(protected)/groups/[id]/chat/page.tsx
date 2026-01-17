'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useGroup } from '@/lib/hooks/use-groups';
import { ChatContainer } from '@/components/chat/chat-container';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Group Chat Page
 * Real-time chat interface for a specific group
 * _Requirements: 2.1_
 */
export default function GroupChatPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslation();

    const groupId = Number(params.id);
    const { data: group, isLoading } = useGroup(groupId);

    // Loading state
    if (isLoading) {
        return (
            <PageContainer className="flex flex-col h-[calc(100vh-120px)]">
                <div className="flex items-center gap-3 border-b border-border p-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex-1" />
            </PageContainer>
        );
    }

    // Invalid group
    if (!groupId || isNaN(groupId)) {
        return (
            <PageContainer className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
                <div className="text-center">
                    <p className="text-lg font-medium">{t('errors.groupNotFound')}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push('/groups')}
                    >
                        {t('common.back')}
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="flex flex-col h-[calc(100vh-120px)] p-0">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => router.push(`/groups/${groupId}`)}
                    aria-label={t('common.back')}
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-semibold text-foreground truncate">
                        {group?.name || t('nav.chat')}
                    </h1>
                    {group?.members && (
                        <p className="text-xs text-muted-foreground">
                            {t('groups.memberCount').replace('{{count}}', String(group.members.length))}
                        </p>
                    )}
                </div>
            </div>

            {/* Chat Container */}
            <ChatContainer
                groupId={groupId}
                groupName={group?.name}
                className="flex-1 min-h-0"
            />
        </PageContainer>
    );
}
