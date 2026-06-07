'use client';

import { useTranslation } from '@/lib/i18n';
import { formatThaiCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { Bill } from '@/types/models';

interface BillCardProps {
    bill: Bill;
    onClick?: () => void;
}

/**
 * BillCard — glassmorphic bill row
 * Status badge uses glass pill (badge-paid/badge-pending), NOT solid color
 */
export function BillCard({ bill, onClick }: BillCardProps) {
    const t = useTranslation();

    const totalParticipants = bill.participants?.length || 0;
    const paidParticipants = bill.participants?.filter(p => p.payment_status === 'PAID').length || 0;
    const isSettled = bill.status === 'SETTLED';
    const progress = totalParticipants > 0 ? (paidParticipants / totalParticipants) : 0;

    return (
        <div
            className="flex items-start gap-3.5 rounded-2xl p-4 cursor-pointer transition-all duration-200 group"
            style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-subtle)',
            }}
            onClick={onClick}
        >
            {/* Bill icon box */}
            <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                    background: isSettled ? 'rgba(52,211,153,0.10)' : 'rgba(99,102,241,0.10)',
                    border: `1px solid ${isSettled ? 'rgba(52,211,153,0.22)' : 'rgba(99,102,241,0.22)'}`,
                }}
            >
                {isSettled ? '✅' : '🧾'}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">
                            {bill.title}
                        </h3>
                        {bill.description && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                                {bill.description}
                            </p>
                        )}
                    </div>

                    {/* Status badge — glass pill */}
                    <span className={isSettled ? 'badge-paid flex-shrink-0' : 'badge-pending flex-shrink-0'}>
                        {isSettled ? '✓ จ่ายครบ' : t(`bills.${bill.status}`)}
                    </span>
                </div>

                {/* Amount + service charge */}
                <div className="flex items-baseline gap-2 mt-1.5">
                    <span
                        className="text-base font-bold"
                        style={{ color: isSettled ? 'var(--emerald-400)' : 'var(--indigo-300)' }}
                    >
                        {formatThaiCurrency(bill.total_amount)}
                    </span>
                    {bill.service_charge > 0 && (
                        <span className="text-xs text-[var(--text-muted)]">
                            +{bill.service_charge}% {t('bills.serviceCharge')}
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                {totalParticipants > 0 && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-[var(--text-muted)]">
                                {paidParticipants}/{totalParticipants} {t('bills.paid')}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                                {formatDate(bill.created_at)}
                            </span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${progress * 100}%`,
                                    background: isSettled
                                        ? 'linear-gradient(90deg, #34d399, #10b981)'
                                        : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BillCard;
