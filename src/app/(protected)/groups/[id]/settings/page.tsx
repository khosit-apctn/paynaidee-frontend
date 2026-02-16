'use client';

import { use } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useGroup } from '@/lib/hooks/use-groups';
import { useAuthStore } from '@/lib/stores/auth-store';
import { GroupForm } from '@/components/forms/group-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupSettingsPageProps {
    params: Promise<{ id: string }>;
}

/**
 * Group Settings Page
 * Allows admins to edit group info and manage members
 */
export default function GroupSettingsPage({ params }: GroupSettingsPageProps) {
    const { id } = use(params);
    const groupId = parseInt(id, 10);
    const t = useTranslation();
    const { user } = useAuthStore();
    const { data: group, isLoading, error } = useGroup(groupId);

    // Check if current user is admin
    const currentUserMember = group?.members?.find(m => m.user_id === user?.id);
    const isAdmin = currentUserMember?.role === 'admin';

    const handleEditSuccess = () => {
        // Stay on settings page, group data will be refetched
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
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
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/groups/${groupId}`}>
                    <Button variant="ghost" size="sm">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('common.back')}
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-foreground">
                    {t('groups.settings')}
                </h1>
            </div>

            {/* Edit Group Form (Admin only) */}
            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('common.edit')}</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <GroupForm
                            mode="edit"
                            group={group}
                            onSuccess={handleEditSuccess}
                        />
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
