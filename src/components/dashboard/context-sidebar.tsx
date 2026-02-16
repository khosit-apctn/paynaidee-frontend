'use client';
import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useGroup } from '@/lib/hooks/use-groups';
import { useGroupBills, useBillQR } from '@/lib/hooks/use-bills';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MemberRoleBadge } from '@/components/groups/member-role-badge';
import { QRCodeDisplay } from '@/components/bills/qr-code-display';
import { formatThaiCurrency } from '@/lib/utils/currency';

/**
 * ContextSidebar
 * Right-most column (4th): Group profile, QR Payment Zone, and recent receipts
 * Real data from useGroup, useGroupBills, useBillQR
 */
export function ContextSidebar() {
    const activeGroupId = useUIStore((s) => s.activeGroupId);
    const activeBillId = useUIStore((s) => s.activeBillId);

    if (!activeGroupId) {
        return <ContextEmptyState />;
    }

    return (
        <aside className="flex flex-col h-full bg-dash-bg overflow-y-auto dash-scrollbar">
            {/* Group Profile Section */}
            <GroupProfileSection groupId={activeGroupId} />

            {/* QR Payment Zone */}
            <QRPaymentZone billId={activeBillId} />

            {/* Recent Receipts */}
            <RecentReceiptsSection groupId={activeGroupId} />
        </aside>
    );
}

/** Group profile panel with member list and role badges */
function GroupProfileSection({ groupId }: { groupId: number }) {
    const t = useTranslation();
    const { user } = useAuthStore();
    const { data: group, isLoading } = useGroup(groupId);
    const openModal = useUIStore((s) => s.openModal);
    const members = group?.members || [];
    const isAdmin = members.some((m: import('@/types/models').GroupMember) => m.user_id === user?.id && m.role === 'admin');

    if (isLoading) {
        return (
            <div className="p-5 border-b border-dash-border space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-14 h-14 rounded-2xl bg-dash-surface" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32 bg-dash-surface" />
                        <Skeleton className="h-3 w-20 bg-dash-surface" />
                    </div>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-full bg-dash-surface rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 border-b border-dash-border">
            {/* Group info */}
            <div className="flex items-center gap-3 mb-4">
                <Avatar
                    src={group?.avatar}
                    alt={group?.name}
                    fallback={group?.name}
                    size="lg"
                    className="ring-2 ring-dash-border rounded-2xl"
                />
                <div>
                    <h3 className="text-sm font-bold text-dash-text">{group?.name}</h3>
                    <p className="text-xs text-dash-text-muted">
                        {members.length} {t('groups.members')}
                    </p>
                </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal('editGroup', { groupId })}
                    className="w-full mb-4 !border-dash-border !text-dash-text-muted hover:!text-dash-accent hover:!border-dash-accent/30"
                >
                    {t('dashboard.manageGroup')}
                </Button>
            )}

            {/* Member list with roles */}
            <h4 className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider mb-2">
                {t('groups.members')}
            </h4>
            <div className="space-y-1.5">
                {members.slice(0, 8).map((member: import('@/types/models').GroupMember) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-dash-surface-hover transition-colors"
                    >
                        <Avatar
                            src={member.user?.avatar}
                            alt={member.user?.display_name || member.user?.username}
                            fallback={member.user?.display_name || member.user?.username}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-dash-text truncate">
                                {member.user?.display_name || member.user?.username}
                            </p>
                        </div>
                        <MemberRoleBadge role={member.role} />
                    </div>
                ))}
                {members.length > 8 && (
                    <p className="text-xs text-dash-text-dim text-center py-1">
                        +{members.length - 8} {t('groups.members')}
                    </p>
                )}
            </div>
        </div>
    );
}

/** QR Payment Zone — renders PromptPay QR from useBillQR */
function QRPaymentZone({ billId }: { billId: number | null }) {
    const t = useTranslation();
    const { mutate: fetchQR, data: qrData, isPending } = useBillQR(billId || 0);

    // Trigger QR fetch when billId changes
    const [hasFetched, setHasFetched] = useState(false);
    React.useEffect(() => {
        if (billId && !hasFetched) {
            fetchQR();
            setHasFetched(true);
        }
    }, [billId, hasFetched, fetchQR]);

    return (
        <div className="p-5 border-b border-dash-border">
            <h4 className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider mb-3">
                {t('dashboard.qrPaymentZone')}
            </h4>

            {!billId ? (
                <div className="glass-card-sm p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-dash-surface flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-dash-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <p className="text-xs text-dash-text-dim">{t('bills.scanToPay', { amount: '' })}</p>
                </div>
            ) : isPending ? (
                <div className="glass-card-sm p-6 flex flex-col items-center">
                    <Skeleton className="w-40 h-40 bg-dash-surface rounded-xl" />
                    <Skeleton className="h-3 w-32 bg-dash-surface mt-3" />
                </div>
            ) : qrData ? (
                <div className="glass-card-sm p-4 flex flex-col items-center">
                    <QRCodeDisplay
                        qrData={qrData.qr_data}
                        amount={qrData.amount}
                    />
                    <p className="text-[10px] text-dash-text-dim mt-2">
                        {t('dashboard.scanPromptPay')}
                    </p>
                </div>
            ) : null}
        </div>
    );
}

/** Recent shared receipts for the group */
function RecentReceiptsSection({ groupId }: { groupId: number }) {
    const t = useTranslation();
    const { data: billsData, isLoading } = useGroupBills(groupId, 5, 0);
    const setActiveBillId = useUIStore((s) => s.setActiveBillId);
    const openModal = useUIStore((s) => s.openModal);

    const bills = billsData || [];

    return (
        <div className="p-5">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider">
                    {t('dashboard.recentReceipts')}
                </h4>
                <button
                    onClick={() => openModal('splitCalculator', { groupId })}
                    className="text-[10px] text-dash-accent hover:text-dash-accent-dim transition-colors font-medium"
                >
                    {t('dashboard.splitCalculator')}
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-14 w-full bg-dash-surface rounded-lg" />
                    ))}
                </div>
            ) : bills.length === 0 ? (
                <p className="text-xs text-dash-text-dim text-center py-6">{t('dashboard.noReceipts')}</p>
            ) : (
                <div className="space-y-1.5">
                    {bills.map((bill) => (
                        <button
                            key={bill.id}
                            onClick={() => setActiveBillId(bill.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dash-surface-hover transition-all text-left group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-dash-surface flex items-center justify-center flex-shrink-0">
                                <span className="text-sm">
                                    {bill.status === 'SETTLED' ? '✅' : '📄'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-dash-text truncate">{bill.title}</p>
                                <p className="text-[10px] text-dash-text-dim">
                                    {new Date(bill.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-dash-text-muted flex-shrink-0">
                                {formatThaiCurrency(bill.total_amount)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/** Empty state when no group selected */
function ContextEmptyState() {
    const t = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-dash-text-muted p-6">
            <div className="w-16 h-16 rounded-2xl bg-dash-surface flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-dash-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-sm text-center">{t('dashboard.selectGroup')}</p>
        </div>
    );
}

export default ContextSidebar;
