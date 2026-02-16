'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatThaiCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/date';
import type { Bill } from '@/types/models';

interface BillDetailProps {
    bill: Bill;
}

/**
 * BillDetail Component
 * Displays complete bill information including metadata
 * Shows creator, creation date, and split type details
 * _Requirements: 5.6_
 */
export function BillDetail({ bill }: BillDetailProps) {
    const t = useTranslation();

    const totalWithCharge = bill.total_amount * (1 + bill.service_charge / 100);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-foreground">
                            {bill.title}
                        </h2>
                        {bill.description && (
                            <p className="text-muted-foreground mt-2">
                                {bill.description}
                            </p>
                        )}
                    </div>
                    <Badge
                        variant={bill.status === 'SETTLED' ? 'success' : 'warning'}
                        className="ml-3"
                    >
                        {t(`bills.${bill.status}`)}
                    </Badge>
                </div>
            </CardHeader>

            <CardBody className="space-y-6">
                {/* Amount Summary */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="font-semibold text-foreground mb-3">
                        {t('bills.amountSummary')}
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('bills.totalAmount')}</span>
                            <span className="font-medium">{formatThaiCurrency(bill.total_amount)}</span>
                        </div>
                        {bill.service_charge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t('bills.serviceCharge')} ({bill.service_charge}%)
                                </span>
                                <span className="font-medium">
                                    {formatThaiCurrency(bill.total_amount * (bill.service_charge / 100))}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                            <span>{t('common.total')}</span>
                            <span className="text-primary">{formatThaiCurrency(totalWithCharge)}</span>
                        </div>
                    </div>
                </div>

                {/* Bill Info */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">
                        {t('bills.billInfo')}
                    </h3>

                    <div className="flex items-center gap-3">
                        <Avatar
                            src={bill.creator?.avatar}
                            alt={bill.creator?.display_name || bill.creator?.username}
                            fallback={bill.creator?.display_name || bill.creator?.username}
                            size="sm"
                        />
                        <div>
                            <p className="text-sm text-muted-foreground">{t('bills.createdBy')}</p>
                            <p className="font-medium">
                                {bill.creator?.display_name || bill.creator?.username}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">{t('bills.createdAt')}</p>
                        <p className="font-medium">{formatDateTime(bill.created_at)}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">{t('bills.splitType')}</p>
                        <p className="font-medium">{t(`bills.${bill.split_type}Split`)}</p>
                    </div>

                    {bill.qr_header && (
                        <div>
                            <p className="text-sm text-muted-foreground">{t('bills.qrHeader')}</p>
                            <p className="font-medium">{bill.qr_header}</p>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default BillDetail;
