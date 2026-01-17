'use client';

import { useTranslation } from '@/lib/i18n';
import { formatThaiCurrency } from '@/lib/utils/currency';

interface SplitCalculatorProps {
    totalAmount: number;
    serviceCharge?: number;
    splitType: 'equal' | 'custom';
    participants: { user_id: number; amount?: number; user?: { display_name?: string; username: string } }[];
}

/**
 * SplitCalculator Component
 * Displays preview of calculated amounts for bill participants
 * Handles both equal and custom split calculations
 * _Requirements: 5.2, 5.3_
 */
export function SplitCalculator({
    totalAmount,
    serviceCharge = 0,
    splitType,
    participants
}: SplitCalculatorProps) {
    const t = useTranslation();

    // Calculate total with service charge
    const totalWithCharge = totalAmount * (1 + serviceCharge / 100);

    // Calculate amount per person for equal split
    const perPersonAmount = participants.length > 0
        ? totalWithCharge / participants.length
        : 0;

    // Calculate custom split total
    const customTotal = participants.reduce((sum, p) => sum + (p.amount || 0), 0);
    const customMismatch = Math.abs(customTotal - totalWithCharge) > 0.01;

    return (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-semibold text-foreground mb-3">
                {t('bills.splitType')}: {t(`bills.${splitType}Split`)}
            </h3>

            {/* Total Summary */}
            <div className="mb-4 pb-3 border-b border-border">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{t('bills.totalAmount')}</span>
                    <span className="font-medium">{formatThaiCurrency(totalAmount)}</span>
                </div>
                {serviceCharge > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                            {t('bills.serviceCharge')} ({serviceCharge}%)
                        </span>
                        <span className="font-medium">
                            {formatThaiCurrency(totalAmount * (serviceCharge / 100))}
                        </span>
                    </div>
                )}
                <div className="flex justify-between text-base font-bold mt-2">
                    <span>{t('common.total')}</span>
                    <span className="text-primary">{formatThaiCurrency(totalWithCharge)}</span>
                </div>
            </div>

            {/* Per Person Breakdown */}
            {participants.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium mb-2">{t('bills.participants')}</h4>
                    <div className="space-y-2">
                        {splitType === 'equal' ? (
                            <>
                                <div className="text-sm bg-background rounded-md p-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('bills.perPerson').replace('{{amount}}', formatThaiCurrency(perPersonAmount))}
                                        </span>
                                        <span className="font-medium text-primary">
                                            × {participants.length}
                                        </span>
                                    </div>
                                </div>
                                {participants.map((p, idx) => (
                                    <div key={idx} className="flex justify-between text-sm pl-2">
                                        <span className="text-muted-foreground">
                                            {p.user?.display_name || p.user?.username || `Participant ${idx + 1}`}
                                        </span>
                                        <span className="font-medium">{formatThaiCurrency(perPersonAmount)}</span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {participants.map((p, idx) => (
                                    <div key={idx} className="flex justify-between text-sm bg-background rounded-md p-2">
                                        <span className="text-foreground">
                                            {p.user?.display_name || p.user?.username || `Participant ${idx + 1}`}
                                        </span>
                                        <span className="font-medium">
                                            {formatThaiCurrency(p.amount || 0)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-border">
                                    <span>{t('common.total')}</span>
                                    <span className={customMismatch ? 'text-destructive' : 'text-primary'}>
                                        {formatThaiCurrency(customTotal)}
                                    </span>
                                </div>
                                {customMismatch && (
                                    <p className="text-xs text-destructive mt-1">
                                        {t('errors.customSplitMismatch')}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SplitCalculator;
