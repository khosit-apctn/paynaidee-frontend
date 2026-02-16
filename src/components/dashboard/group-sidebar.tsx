'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useGroups } from '@/lib/hooks/use-groups';
import { useGroupBills } from '@/lib/hooks/use-bills';
import { useUIStore } from '@/lib/stores/ui-store';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatThaiCurrency } from '@/lib/utils/currency';
import { showErrorToast } from '@/lib/stores/ui-store';

/**
 * GroupSidebar
 * Second column: searchable list of Bill Groups with status badges
 * Real data via useGroups(), selection synced via ui-store activeGroupId
 */
export function GroupSidebar() {
    const t = useTranslation();
    const { data: groups, isLoading, isError } = useGroups();
    const activeGroupId = useUIStore((s) => s.activeGroupId);
    const setActiveGroupId = useUIStore((s) => s.setActiveGroupId);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter groups by search
    const filteredGroups = useMemo(() => {
        if (!groups) return [];
        if (!searchQuery.trim()) return groups;
        const q = searchQuery.toLowerCase();
        return groups.filter((g) =>
            g.name.toLowerCase().includes(q)
        );
    }, [groups, searchQuery]);

    // Show error toast on fetch failure
    React.useEffect(() => {
        if (isError) {
            showErrorToast(t('errors.loadFailed'));
        }
    }, [isError, t]);

    return (
        <aside className="flex flex-col h-full bg-dash-bg">
            {/* Header */}
            <div className="p-4 pb-3">
                <h2 className="text-lg font-bold text-dash-text mb-3">
                    {t('nav.groups')}
                </h2>
                {/* Search */}
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-text-dim"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={t('dashboard.searchGroups')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dash-surface border border-dash-border text-dash-text placeholder:text-dash-text-dim text-sm focus:outline-none focus:ring-1 focus:ring-dash-accent/40 transition-all"
                    />
                </div>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto dash-scrollbar px-3 pb-4 space-y-1">
                {isLoading ? (
                    <GroupSidebarSkeleton />
                ) : filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-dash-text-muted">
                        <svg className="w-12 h-12 mb-3 text-dash-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm">{t('groups.noGroups')}</p>
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <GroupItem
                            key={group.id}
                            group={group}
                            isActive={activeGroupId === group.id}
                            onClick={() => setActiveGroupId(group.id)}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}

/** Individual group item in the sidebar */
function GroupItem({
    group,
    isActive,
    onClick,
}: {
    group: { id: number; name: string; avatar: string; members?: { id: number }[] };
    isActive: boolean;
    onClick: () => void;
}) {

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group ${isActive
                ? 'glass-card-sm border-dash-border-accent bg-dash-accent/5'
                : 'hover:bg-dash-surface-hover'
                }`}
        >
            {/* Active accent bar */}
            {isActive && (
                <span className="absolute left-0 w-1 h-8 rounded-r-full bg-dash-accent" />
            )}

            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <Avatar
                    src={group.avatar}
                    alt={group.name}
                    fallback={group.name}
                    size="md"
                    className={isActive ? 'ring-2 ring-dash-accent/40' : ''}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-dash-accent' : 'text-dash-text'
                    }`}>
                    {group.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <GroupStatusBadge groupId={group.id} />
                </div>
            </div>

            {/* Member count */}
            <span className="text-xs text-dash-text-dim flex-shrink-0">
                {group.members?.length || 0}
                <svg className="w-3 h-3 inline ml-0.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </span>
        </button>
    );
}

/**
 * GroupStatusBadge
 * Shows payment status for the group (e.g., "3 Pending" or "Owed: 500 THB")
 * Fetches bills for the group to compute status
 */
function GroupStatusBadge({ groupId }: { groupId: number }) {
    const t = useTranslation();
    const { data: billsData } = useGroupBills(groupId, 100, 0);

    const bills = billsData;
    if (!bills || bills.length === 0) return null;

    const pendingCount = bills.filter((b) => b.status === 'PENDING').length;
    const totalOwed = bills
        .filter((b) => b.status === 'PENDING')
        .reduce((sum, b) => sum + b.total_amount, 0);

    if (pendingCount === 0) {
        return (
            <Badge variant="success" className="text-[10px] px-1.5 py-0">
                {t('dashboard.allPaid')}
            </Badge>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                {t('dashboard.pendingPayments', { count: String(pendingCount) })}
            </Badge>
            {totalOwed > 0 && (
                <span className="text-[10px] text-dash-text-dim">
                    {formatThaiCurrency(totalOwed)}
                </span>
            )}
        </div>
    );
}

/** Skeleton loader for group sidebar */
function GroupSidebarSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                    <Skeleton className="w-10 h-10 rounded-full bg-dash-surface" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28 bg-dash-surface" />
                        <Skeleton className="h-3 w-20 bg-dash-surface" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GroupSidebar;
