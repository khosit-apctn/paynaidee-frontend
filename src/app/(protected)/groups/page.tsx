'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useGroups } from '@/lib/hooks/use-groups';
import { GroupCard } from '@/components/groups/group-card';
import { GroupForm } from '@/components/forms/group-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Groups List Page
 * Displays all groups the user belongs to
 * Includes create group functionality via modal
 */
export default function GroupsPage() {
    const t = useTranslation();
    const { data: groups, isLoading, error } = useGroups();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t('groups.title')}
                    </h1>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('groups.createGroup')}
                </Button>
            </div>

            {/* Groups Grid */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-error mb-4">
                        {t('errors.networkError')}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        {t('common.retry')}
                    </Button>
                </div>
            ) : groups && groups.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Link key={group.id} href={`/groups/${group.id}`}>
                            <GroupCard group={group} />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-muted-foreground/50 mb-4">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        {t('groups.noGroups')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {t('groups.createFirst')}
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        {t('groups.createGroup')}
                    </Button>
                </div>
            )}

            {/* Create Group Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t('groups.createGroup')}
            >
                <GroupForm
                    mode="create"
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
