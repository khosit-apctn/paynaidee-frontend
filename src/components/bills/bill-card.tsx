'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatThaiCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { Bill } from '@/types/models';

interface BillCardProps {
    bill: Bill;
    onClick?: () => void;
}

/**
 * BillCard Component
 * Displays bill information in a card format with title, amount, and status
 * Used in bills list
 * _Requirements: 5.6_
 */
export function BillCard({ bill, onClick }: BillCardProps) {
    const t = useTranslation();

    const totalParticipants = bill.participants?.length || 0;
    const paidParticipants = bill.participants?.filter(p => p.payment_status === 'PAID').length || 0;

    return (
        <Card
            className="h-full hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <CardBody className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Title and Description */}
                        <h3 className="font-semibold text-foreground truncate">
                            {bill.title}
                        </h3>
                        {bill.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {bill.description}
                            </p>
                        )}

                        {/* Amount */}
                        <div className="mt-2">
                            <span className="text-lg font-bold text-primary">
                                {formatThaiCurrency(bill.total_amount)}
                            </span>
                            {bill.service_charge > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    +{bill.service_charge}% {t('bills.serviceCharge')}
                                </span>
                            )}
                        </div>

                        {/* Payment Progress */}
                        <div className="mt-2 text-sm text-muted-foreground">
                            {paidParticipants}/{totalParticipants} {t('bills.paid')}
                        </div>

                        {/* Date */}
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(bill.created_at)}
                        </p>
                    </div>

                    {/* Status Badge */}
                    <Badge
                        variant={bill.status === 'SETTLED' ? 'success' : 'warning'}
                        className="flex-shrink-0"
                    >
                        {t(`bills.${bill.status}`)}
                    </Badge>
                </div>
            </CardBody>
        </Card>
    );
}

export default BillCard;
