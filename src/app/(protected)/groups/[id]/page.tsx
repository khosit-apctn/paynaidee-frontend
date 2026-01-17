'use client';

import { use } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useGroup } from '@/lib/hooks/use-groups';
import { useAuthStore } from '@/lib/stores/auth-store';
import { MemberList } from '@/components/groups/member-list';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupDetailPageProps {
    params: Promise<{ id: string }>;
}

/**
 * Group Detail Page
 * Displays group information with tabs for members/bills/chat
 */
export default function GroupDetailPage({ params }: GroupDetailPageProps) {
    const { id } = use(params);
    const groupId = parseInt(id, 10);
    const t = useTranslation();
    const { user } = useAuthStore();
    const { data: group, isLoading, error } = useGroup(groupId);

    // Check if current user is admin
    const currentUserMember = group?.members?.find(m => m.user_id === user?.id);
    const isAdmin = currentUserMember?.role === 'admin';

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="text-center py-12">
                <p className="text-error mb-4">
                    {t('errors.groupNotFound')}
                </p>
                <Link href="/groups">
                    <Button variant="outline">{t('common.back')}</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Group Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={group.avatar}
                        alt={group.name}
                        fallback={group.name}
                        size="lg"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {group.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('groups.memberCount').replace('{{count}}', String(group.members?.length || 0))}
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <Link href={`/groups/${groupId}/settings`}>
                        <Button variant="ghost" size="sm">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t('groups.settings')}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Link href={`/groups/${groupId}/chat`}>
                    <Button variant="outline" size="md">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {t('nav.chat')}
                    </Button>
                </Link>
                <Link href={`/groups/${groupId}/bills`}>
                    <Button variant="outline" size="md">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {t('nav.bills')}
                    </Button>
                </Link>
            </div>

            {/* Members Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('groups.members')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <MemberList
                        groupId={groupId}
                        members={group.members || []}
                        isAdmin={isAdmin}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
