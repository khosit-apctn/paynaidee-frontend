'use client';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useBill, useUpdatePaymentStatus } from '@/lib/hooks/use-bills';
import { usePaymentUpdates } from '@/lib/websocket/hooks';
import { useUIStore } from '@/lib/stores/ui-store';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatThaiCurrency } from '@/lib/utils/currency';
import { showSuccessToast, showErrorToast } from '@/lib/stores/ui-store';

/**
 * BillSplitCard
 * Inline chat card for bill-type messages
 * Shows bill title, amount, payment progress, and "Pay Now" button
 * Real data via useBill(), payment via useUpdatePaymentStatus()
 * Real-time updates via usePaymentUpdates()
 */
export function BillSplitCard({ billId }: { billId: number }) {
    const t = useTranslation();
    const { user } = useAuthStore();
    const { data: bill, isLoading, refetch } = useBill(billId);
    const activeGroupId = useUIStore((s) => s.activeGroupId);

    // Real-time payment updates
    usePaymentUpdates(
        () => { refetch(); },
        () => { refetch(); }
    );

    if (isLoading || !bill) {
        return <BillSplitSkeleton />;
    }

    const totalParticipants = bill.participants?.length || 0;
    const paidCount = bill.participants?.filter((p) => p.payment_status === 'paid').length || 0;
    const progressPercent = totalParticipants > 0 ? (paidCount / totalParticipants) * 100 : 0;
    const isSettled = bill.status === 'settled';

    // Current user's participant record
    const myParticipant = bill.participants?.find((p) => p.user_id === user?.id);
    const isMyPaymentPending = myParticipant && myParticipant.payment_status === 'pending';

    // Check if current user is admin of the group
    const isAdmin = bill.group?.members?.some(
        (m) => m.user_id === user?.id && m.role === 'admin'
    );

    return (
        <div className="glass-card p-4 max-w-sm animate-dash-slide-up">
            {/* Bill Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-dash-text truncate">
                        {bill.title}
                    </h4>
                    {bill.description && (
                        <p className="text-xs text-dash-text-muted mt-0.5 line-clamp-1">
                            {bill.description}
                        </p>
                    )}
                </div>
                <span className="text-base font-bold text-dash-accent ml-2 flex-shrink-0">
                    {formatThaiCurrency(bill.total_amount)}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-dash-text-muted">
                        {t('dashboard.paidCount', { paid: String(paidCount), total: String(totalParticipants) })}
                    </span>
                    {isSettled && (
                        <span className="text-[10px] text-green-400 font-semibold">
                            {t('dashboard.settled')}
                        </span>
                    )}
                </div>
                <div className="h-2 rounded-full bg-dash-surface overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out animate-dash-progress"
                        style={{
                            width: `${progressPercent}%`,
                            background: progressPercent === 100
                                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                                : 'linear-gradient(90deg, var(--dash-accent), var(--dash-accent-dim))',
                        }}
                    />
                </div>
            </div>

            {/* Participant Avatars */}
            <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                    {bill.participants?.slice(0, 5).map((p) => (
                        <Avatar
                            key={p.id}
                            src={p.user?.avatar}
                            alt={p.user?.display_name || p.user?.username}
                            fallback={p.user?.display_name || p.user?.username}
                            size="sm"
                            className={`ring-2 ${p.payment_status === 'paid'
                                ? 'ring-green-500/50'
                                : 'ring-dash-border'
                                }`}
                        />
                    ))}
                    {totalParticipants > 5 && (
                        <div className="w-8 h-8 rounded-full bg-dash-surface flex items-center justify-center ring-2 ring-dash-border text-[10px] text-dash-text-muted font-medium">
                            +{totalParticipants - 5}
                        </div>
                    )}
                </div>

                {/* Pay Now button */}
                {isMyPaymentPending && !isSettled && (
                    <PayNowButton billId={billId} groupId={activeGroupId || bill.group_id} userId={user?.id || 0} />
                )}
            </div>

            {/* Admin: Mark others as paid */}
            {isAdmin && !isSettled && bill.participants?.some((p) => p.payment_status === 'pending') && (
                <div className="mt-3 pt-3 border-t border-dash-border">
                    <p className="text-[10px] text-dash-text-dim mb-2">
                        {t('bills.markAsPaid')} (Admin)
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {bill.participants
                            ?.filter((p) => p.payment_status === 'pending' && p.user_id !== user?.id)
                            .map((p) => (
                                <AdminPayButton
                                    key={p.id}
                                    name={p.user?.display_name || p.user?.username || ''}
                                    billId={billId}
                                    groupId={activeGroupId || bill.group_id}
                                    userId={p.user_id}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Pay Now button for the current user */
function PayNowButton({ billId, groupId, userId }: { billId: number; groupId: number; userId: number }) {
    const t = useTranslation();
    const { mutate, isPending } = useUpdatePaymentStatus(billId, groupId);

    const handlePay = () => {
        mutate(
            { userId, data: { status: 'paid' } },
            {
                onSuccess: () => showSuccessToast(t('bills.paymentStatusUpdated')),
                onError: () => showErrorToast(t('errors.updateFailed')),
            }
        );
    };

    return (
        <button
            onClick={handlePay}
            disabled={isPending}
            className="px-4 py-1.5 rounded-lg bg-dash-accent text-dash-bg text-xs font-bold hover:bg-dash-accent-dim transition-all duration-200 disabled:opacity-50 animate-dash-pulse-glow"
        >
            {isPending ? '...' : t('dashboard.payNow')}
        </button>
    );
}

/** Admin button to mark a specific user as paid */
function AdminPayButton({
    name,
    billId,
    groupId,
    userId,
}: {
    name: string;
    billId: number;
    groupId: number;
    userId: number;
}) {
    const { mutate, isPending } = useUpdatePaymentStatus(billId, groupId);

    const handleMark = () => {
        mutate({ userId, data: { status: 'paid' } });
    };

    return (
        <button
            onClick={handleMark}
            disabled={isPending}
            className="text-[10px] px-2 py-1 rounded-md border border-dash-border text-dash-text-muted hover:text-dash-accent hover:border-dash-accent/30 transition-all disabled:opacity-50"
        >
            ✓ {name}
        </button>
    );
}

function BillSplitSkeleton() {
    return (
        <div className="glass-card p-4 max-w-sm space-y-3">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-32 bg-dash-surface" />
                <Skeleton className="h-4 w-20 bg-dash-surface" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-dash-surface" />
            <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-8 h-8 rounded-full bg-dash-surface" />
                ))}
            </div>
        </div>
    );
}

export default BillSplitCard;
