'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getGroups, getGroupBalances } from '@/lib/api/groups';
import { getGroupBills } from '@/lib/api/bills';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatThaiCurrency } from '@/lib/utils/currency';
import { formatRelativeTime } from '@/lib/utils/date';

interface DashboardSummary {
    totalOwed: number;
    totalPaid: number;
    groupCount: number;
    billCount: number;
    unpaidBills: any[];
    activities: any[];
}

/**
 * Dashboard Page (หน้าหลัก)
 * Mobile-first responsive layout.
 * Aggregates balances and bills from all groups in parallel.
 * _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2_
 */
export default function DashboardPage() {
    const t = useTranslation();
    const user = useAuthStore((state) => state.user);

    // Fetch all user groups
    const { data: groups, isLoading: groupsLoading, error: groupsError } = useQuery({
        queryKey: ['dashboard-groups', user?.id],
        queryFn: getGroups,
        enabled: !!user?.id,
    });

    // Aggregate balances and bills from all groups in parallel
    const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummary>({
        queryKey: ['dashboard-summary', groups?.map(g => g.id)],
        queryFn: async () => {
            if (!groups || groups.length === 0) {
                return { totalOwed: 0, totalPaid: 0, groupCount: 0, billCount: 0, unpaidBills: [], activities: [] };
            }

            let totalOwed = 0;
            let totalPaid = 0;
            let billCount = 0;
            const unpaidBills: any[] = [];
            const activities: any[] = [];

            await Promise.all(
                groups.map(async (group) => {
                    try {
                        const [balances, bills] = await Promise.all([
                            getGroupBalances(group.id),
                            getGroupBills(group.id),
                        ]);

                        balances.forEach((entry) => {
                            if (entry.debtor_id === user?.id) {
                                totalOwed += entry.amount;
                            }
                        });

                        billCount += bills.length;
                        bills.forEach((bill) => {
                            const myParticipant = bill.participants?.find((p) => p.user_id === user?.id);
                            if (myParticipant) {
                                if (myParticipant.payment_status === 'PENDING') {
                                    unpaidBills.push({
                                        id: bill.id,
                                        title: bill.title,
                                        groupId: group.id,
                                        groupName: group.name,
                                        amount: myParticipant.amount,
                                        participantsCount: bill.participants?.length || 0,
                                        paidCount: bill.participants?.filter((p) => p.payment_status === 'PAID').length || 0,
                                        created_at: bill.created_at,
                                        avatar: group.avatar,
                                    });
                                } else if (myParticipant.payment_status === 'PAID') {
                                    totalPaid += myParticipant.amount;
                                }
                            }

                            activities.push({
                                id: `bill-${bill.id}`,
                                type: 'bill_created',
                                title: bill.title,
                                amount: bill.total_amount,
                                actorName: bill.creator?.display_name || bill.creator?.username,
                                groupName: group.name,
                                timestamp: new Date(bill.created_at).getTime(),
                            });

                            bill.participants?.forEach((p) => {
                                if (p.payment_status === 'PAID' && p.paid_at) {
                                    activities.push({
                                        id: `payment-${bill.id}-${p.user_id}`,
                                        type: 'payment_made',
                                        title: bill.title,
                                        amount: p.amount,
                                        actorName: p.user?.display_name || p.user?.username,
                                        groupName: group.name,
                                        timestamp: new Date(p.paid_at).getTime(),
                                    });
                                }
                            });
                        });
                    } catch (err) {
                        console.error(`Failed to load data for group ${group.id}:`, err);
                    }
                })
            );

            unpaidBills.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            activities.sort((a, b) => b.timestamp - a.timestamp);

            return {
                totalOwed,
                totalPaid,
                groupCount: groups.length,
                billCount,
                unpaidBills: unpaidBills.slice(0, 5),
                activities: activities.slice(0, 5),
            };
        },
        enabled: !!groups && groups.length > 0 && !!user?.id,
    });

    const isLoading = groupsLoading || summaryLoading;

    // Emoji mapping for group avatars
    const getGroupEmoji = (name: string, avatar?: string) => {
        if (avatar && avatar.length <= 4) return avatar;
        const n = name.toLowerCase();
        if (n.includes('food') || n.includes('lunch') || n.includes('eat') || n.includes('pizza')) return '🍕';
        if (n.includes('trip') || n.includes('gang') || n.includes('camp') || n.includes('travel')) return '🏕️';
        if (n.includes('coffee') || n.includes('cafe')) return '☕';
        if (n.includes('work') || n.includes('office') || n.includes('it')) return '👥';
        if (n.includes('friend') || n.includes('uni') || n.includes('school')) return '🎓';
        return '💰';
    };

    const getGroupColorClass = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('food') || n.includes('lunch') || n.includes('eat') || n.includes('pizza')) return 'purple';
        if (n.includes('trip') || n.includes('gang') || n.includes('camp') || n.includes('travel')) return 'green';
        if (n.includes('coffee') || n.includes('cafe')) return 'amber';
        if (n.includes('work') || n.includes('office') || n.includes('it')) return 'purple';
        return 'pink';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Spinner size="lg" />
            </div>
        );
    }

    if (groupsError) {
        return (
            <div className="text-center py-12 px-4">
                <p className="text-destructive mb-4">{t('errors.loadFailed')}</p>
                <Button onClick={() => window.location.reload()}>{t('common.retry')}</Button>
            </div>
        );
    }

    const hasGroups = groups && groups.length > 0;
    const unpaidBills = summary?.unpaidBills || [];
    const activities = summary?.activities || [];

    return (
        <div className="space-y-5 max-w-2xl mx-auto px-4 py-5">

            {/* ── Greeting Header ──────────────────────────────── */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                        สวัสดี, {user?.display_name || user?.username} 👋
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        สรุปค่าใช้จ่ายของคุณในเดือนนี้
                    </p>
                </div>
                {hasGroups && (
                    <Link href="/groups/bills/new" className="shrink-0">
                        <Button
                            variant="primary"
                            size="sm"
                            className="text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-md shadow-indigo-500/20 whitespace-nowrap"
                        >
                            ＋ สร้างบิล
                        </Button>
                    </Link>
                )}
            </div>

            {!hasGroups ? (
                /* ── Empty state ─────────────────────────────── */
                <div
                    className="rounded-3xl p-8 text-center"
                    style={{
                        background: 'var(--bg-surface-raised)',
                        border: '1px solid var(--border-glass)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl mb-5 shadow-lg shadow-indigo-500/25">
                        👋
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        ยินดีต้อนรับสู่ PayNaiDee!
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                        เริ่มต้นใช้งานด้วยการสร้างกลุ่มร่วมกับเพื่อนๆ เพื่อความสะดวกในการแชร์บิล
                    </p>
                    <Link href="/groups?create=true">
                        <Button variant="primary" className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-md">
                            สร้างกลุ่มแรกของคุณ
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-5">

                    {/* ── Stats Grid ───────────────────────────── */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* Total Owed — full width */}
                        <div
                            className="col-span-2 relative rounded-2xl p-4 overflow-hidden flex items-center gap-3"
                            style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-glass)' }}
                        >
                            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full pointer-events-none bg-indigo-500/15 filter blur-2xl" />
                            <div className="emoji-icon-box purple shrink-0 relative z-10 w-10 h-10 text-base">💰</div>
                            <div className="relative z-10 flex-1 min-w-0">
                                <div className="text-xl font-bold text-amber-400 leading-none tabular-nums truncate">
                                    {formatThaiCurrency(summary?.totalOwed || 0)}
                                </div>
                                <div className="text-xs text-[var(--text-secondary)] mt-1">ค้างจ่ายทั้งหมด</div>
                            </div>
                            <div className="shrink-0 relative z-10">
                                <span className="stat-change down">{unpaidBills.length} รายการ</span>
                            </div>
                        </div>

                        {/* Total Paid — full width */}
                        <div
                            className="col-span-2 relative rounded-2xl p-4 overflow-hidden flex items-center gap-3"
                            style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-glass)' }}
                        >
                            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full pointer-events-none bg-emerald-500/15 filter blur-2xl" />
                            <div className="emoji-icon-box green shrink-0 relative z-10 w-10 h-10 text-base">✓</div>
                            <div className="relative z-10 flex-1 min-w-0">
                                <div className="text-xl font-bold text-emerald-400 leading-none tabular-nums truncate">
                                    {formatThaiCurrency(summary?.totalPaid || 0)}
                                </div>
                                <div className="text-xs text-[var(--text-secondary)] mt-1">จ่ายแล้วเดือนนี้</div>
                            </div>
                            <div className="shrink-0 relative z-10">
                                <span className="stat-change up">{summary?.billCount} บิล</span>
                            </div>
                        </div>

                        {/* Groups count — half width */}
                        <div
                            className="rounded-2xl p-4 flex flex-col justify-between min-h-[88px]"
                            style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-glass)' }}
                        >
                            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                กลุ่มของคุณ
                            </div>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-2xl font-bold text-[var(--text-primary)]">{summary?.groupCount}</span>
                                <span className="text-xs text-[var(--text-secondary)]">กลุ่ม</span>
                            </div>
                        </div>

                        {/* Total bills — half width */}
                        <div
                            className="rounded-2xl p-4 flex flex-col justify-between min-h-[88px]"
                            style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-glass)' }}
                        >
                            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                บิลทั้งหมด
                            </div>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-2xl font-bold text-[var(--text-primary)]">{summary?.billCount}</span>
                                <span className="text-xs text-[var(--text-secondary)]">บิล</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Unpaid Bills ─────────────────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                บิลค้างจ่าย
                            </span>
                            <Link href="/groups">
                                <span className="text-xs font-semibold text-[var(--text-accent)] hover:underline">
                                    ดูทั้งหมด →
                                </span>
                            </Link>
                        </div>
                        <div
                            className="rounded-2xl overflow-hidden border border-[var(--border-glass)]"
                            style={{ background: 'var(--bg-surface-raised)' }}
                        >
                            {unpaidBills.length > 0 ? (
                                <div className="divide-y divide-[var(--border-glass)]">
                                    {unpaidBills.map((bill) => {
                                        const emoji = getGroupEmoji(bill.groupName, bill.avatar);
                                        const color = getGroupColorClass(bill.groupName);
                                        return (
                                            <Link
                                                key={bill.id}
                                                href={`/groups/${bill.groupId}/bills/${bill.id}`}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors"
                                            >
                                                <div className={`emoji-icon-box ${color} shrink-0 w-9 h-9 text-sm`}>
                                                    {emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                                        {bill.title}
                                                    </div>
                                                    <div className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                                                        {bill.groupName} · {bill.paidCount}/{bill.participantsCount} คน
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right space-y-1">
                                                    <div className="text-sm font-bold text-amber-400 tabular-nums">
                                                        {formatThaiCurrency(bill.amount)}
                                                    </div>
                                                    <span className="badge badge-pending block text-center">
                                                        รอจ่าย
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-3xl mb-2">✅</div>
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">ไม่มีบิลค้างจ่าย</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">ทุกอย่างเคลียร์หมดแล้ว 🎉</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Recent Activity ──────────────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                กิจกรรมล่าสุด
                            </span>
                        </div>
                        <div
                            className="rounded-2xl overflow-hidden border border-[var(--border-glass)]"
                            style={{ background: 'var(--bg-surface-raised)' }}
                        >
                            {activities.length > 0 ? (
                                <div className="divide-y divide-[var(--border-glass)]">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 px-4 py-3">
                                            {/* Icon */}
                                            <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
                                                {activity.type === 'bill_created' ? '📝' : '✓'}
                                            </div>
                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[var(--text-secondary)] leading-snug">
                                                    <span className="font-bold text-[var(--text-primary)]">
                                                        {activity.actorName}
                                                    </span>{' '}
                                                    {activity.type === 'bill_created' ? 'สร้างบิล' : 'จ่ายเงิน'}{' '}
                                                    <span className="font-bold text-emerald-400 tabular-nums">
                                                        {formatThaiCurrency(activity.amount)}
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-[11px] text-[var(--text-muted)] truncate">
                                                        {activity.title} · {activity.groupName}
                                                    </span>
                                                    <span className="shrink-0 text-[10px] font-semibold text-[var(--text-secondary)] bg-white/[0.04] border border-[var(--border-glass)] px-1.5 py-0.5 rounded">
                                                        {formatRelativeTime(new Date(activity.timestamp).toISOString())}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-xs text-[var(--text-secondary)]">ไม่มีความเคลื่อนไหวล่าสุด</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
