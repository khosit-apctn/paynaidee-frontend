'use client';

import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatThaiCurrency } from '@/lib/utils/currency';
import type { BillParticipant } from '@/types/models';

interface ParticipantListProps {
    participants: BillParticipant[];
    onUpdateStatus?: (userId: number, status: 'paid' | 'pending') => void;
    canUpdate?: boolean;
}

/**
 * ParticipantList Component
 * Displays list of bill participants with payment status
 * Allows updating payment status if user has permission
 * _Requirements: 5.6, 6.7_
 */
export function ParticipantList({ participants, onUpdateStatus, canUpdate = false }: ParticipantListProps) {
    const t = useTranslation();

    if (!participants || participants.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {t('bills.noParticipants')}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {participants.map((participant) => {
                const isPaid = participant.payment_status === 'paid';
                const user = participant.user;

                return (
                    <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    >
                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar
                                src={user?.avatar}
                                alt={user?.display_name || user?.username}
                                fallback={user?.display_name || user?.username}
                                size="md"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                    {user?.display_name || user?.username}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatThaiCurrency(participant.amount)}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge and Action */}
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={isPaid ? 'success' : 'warning'}
                                className="flex-shrink-0"
                            >
                                {t(`bills.${participant.payment_status}`)}
                            </Badge>

                            {/* Toggle button for updating status */}
                            {canUpdate && onUpdateStatus && !isPaid && (
                                <button
                                    onClick={() => onUpdateStatus(participant.user_id, 'paid')}
                                    className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    {t('bills.markAsPaid')}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Summary */}
            <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.total')}</span>
                    <span className="font-bold text-foreground">
                        {formatThaiCurrency(
                            participants.reduce((sum, p) => sum + p.amount, 0)
                        )}
                    </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">{t('bills.paid')}</span>
                    <span className="font-medium text-green-600">
                        {participants.filter(p => p.payment_status === 'paid').length}/{participants.length}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ParticipantList;
