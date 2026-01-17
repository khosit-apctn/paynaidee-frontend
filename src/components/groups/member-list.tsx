'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useRemoveMember, useUpdateMemberRole } from '@/lib/hooks/use-groups';
import { MemberRoleBadge } from '@/components/groups/member-role-badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { GroupMember } from '@/types/models';

interface MemberListProps {
    groupId: number;
    members: GroupMember[];
    isAdmin: boolean;
}

/**
 * MemberList Component
 * Displays group members with role badges
 * Admins can add, remove, and change member roles
 */
export function MemberList({ groupId, members, isAdmin }: MemberListProps) {
    const t = useTranslation();
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    const removeMember = useRemoveMember(groupId);
    const updateRole = useUpdateMemberRole(groupId);

    const handleRemoveMember = async () => {
        if (!selectedMember) return;
        try {
            await removeMember.mutateAsync(selectedMember.user_id);
            setIsRemoveModalOpen(false);
            setSelectedMember(null);
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    const handleChangeRole = async (newRole: 'admin' | 'member') => {
        if (!selectedMember) return;
        try {
            await updateRole.mutateAsync({
                userId: selectedMember.user_id,
                data: { role: newRole },
            });
            setIsRoleModalOpen(false);
            setSelectedMember(null);
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const openRoleModal = (member: GroupMember) => {
        setSelectedMember(member);
        setIsRoleModalOpen(true);
    };

    const openRemoveModal = (member: GroupMember) => {
        setSelectedMember(member);
        setIsRemoveModalOpen(true);
    };

    if (members.length === 0) {
        return (
            <p className="text-muted-foreground text-center py-4">
                {t('common.noResults')}
            </p>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <Avatar
                            src={member.user?.avatar}
                            alt={member.user?.display_name || member.user?.username || ''}
                            fallback={member.user?.display_name || member.user?.username || ''}
                            size="md"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground truncate">
                                    {member.user?.display_name || member.user?.username}
                                </p>
                                <MemberRoleBadge role={member.role} />
                            </div>
                            {member.user?.email && (
                                <p className="text-sm text-muted-foreground truncate">
                                    {member.user.email}
                                </p>
                            )}
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openRoleModal(member)}
                                    title={t('groups.changeRole')}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openRemoveModal(member)}
                                    className="text-error hover:text-error"
                                    title={t('groups.removeMember')}
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Change Role Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                title={t('groups.changeRole')}
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        {selectedMember?.user?.display_name || selectedMember?.user?.username}
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant={selectedMember?.role === 'admin' ? 'primary' : 'outline'}
                            onClick={() => handleChangeRole('admin')}
                            disabled={updateRole.isPending}
                            className="flex-1"
                        >
                            {t('groups.admin')}
                        </Button>
                        <Button
                            variant={selectedMember?.role === 'member' ? 'primary' : 'outline'}
                            onClick={() => handleChangeRole('member')}
                            disabled={updateRole.isPending}
                            className="flex-1"
                        >
                            {t('groups.member')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Remove Member Modal */}
            <Modal
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                title={t('groups.removeMember')}
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        {t('common.confirm')} {selectedMember?.user?.display_name || selectedMember?.user?.username}?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRemoveModalOpen(false)}
                            disabled={removeMember.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleRemoveMember}
                            loading={removeMember.isPending}
                            className="bg-error hover:bg-error/90"
                        >
                            {t('common.delete')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default MemberList;
