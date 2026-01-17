'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useGroup, useDeleteGroup, useLeaveGroup } from '@/lib/hooks/use-groups';
import { useAuthStore } from '@/lib/stores/auth-store';
import { GroupForm } from '@/components/forms/group-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { useState } from 'react';

interface GroupSettingsPageProps {
    params: Promise<{ id: string }>;
}

/**
 * Group Settings Page
 * Allows admins to edit group info, manage members, and delete group
 * Regular members can only leave the group
 */
export default function GroupSettingsPage({ params }: GroupSettingsPageProps) {
    const { id } = use(params);
    const groupId = parseInt(id, 10);
    const router = useRouter();
    const t = useTranslation();
    const { user } = useAuthStore();
    const { data: group, isLoading, error } = useGroup(groupId);
    const deleteGroup = useDeleteGroup();
    const leaveGroup = useLeaveGroup();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    // Check if current user is admin
    const currentUserMember = group?.members?.find(m => m.user_id === user?.id);
    const isAdmin = currentUserMember?.role === 'admin';
    const isCreator = group?.created_by === user?.id;

    const handleDeleteGroup = async () => {
        try {
            await deleteGroup.mutateAsync(groupId);
            router.push('/groups');
        } catch (error) {
            console.error('Failed to delete group:', error);
        }
    };

    const handleLeaveGroup = async () => {
        try {
            await leaveGroup.mutateAsync(groupId);
            router.push('/groups');
        } catch (error) {
            console.error('Failed to leave group:', error);
        }
    };

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

            {/* Danger Zone */}
            <Card className="border-error/20">
                <CardHeader>
                    <CardTitle className="text-error">
                        {isCreator ? t('groups.deleteGroup') : t('groups.leaveGroup')}
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {isCreator ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Deleting this group will remove all members and data permanently.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="border-error text-error hover:bg-error/10"
                                >
                                    {t('groups.deleteGroup')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    You will be removed from this group.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsLeaveModalOpen(true)}
                                    className="border-error text-error hover:bg-error/10"
                                >
                                    {t('groups.leaveGroup')}
                                </Button>
                            </>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Delete Group Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('groups.deleteGroup')}
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to delete <strong>{group.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleteGroup.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDeleteGroup}
                            loading={deleteGroup.isPending}
                            className="bg-error hover:bg-error/90"
                        >
                            {t('common.delete')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Leave Group Modal */}
            <Modal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                title={t('groups.leaveGroup')}
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to leave <strong>{group.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsLeaveModalOpen(false)}
                            disabled={leaveGroup.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleLeaveGroup}
                            loading={leaveGroup.isPending}
                            className="bg-error hover:bg-error/90"
                        >
                            {t('groups.leaveGroup')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
