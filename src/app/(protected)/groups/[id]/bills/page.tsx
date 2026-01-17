'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useGroupBills } from '@/lib/hooks/use-bills';
import { BillCard } from '@/components/bills/bill-card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PageContainer } from '@/components/layout/page-container';

interface GroupBillsPageProps {
    params: {
        id: string;
    };
}

/**
 * Group Bills Page
 * Displays paginated list of bills for a specific group
 * _Requirements: 5.7_
 */
export default function GroupBillsPage({ params }: GroupBillsPageProps) {
    const t = useTranslation();
    const router = useRouter();
    const groupId = parseInt(params.id);
    const [page, setPage] = useState(0);
    const limit = 20;
    const offset = page * limit;

    const { data, isLoading, error } = useGroupBills(groupId, limit, offset);

    const bills = data?.bills || [];
    const hasMore = bills.length === limit;

    const handleBillClick = (billId: number) => {
        router.push(`/groups/${groupId}/bills/${billId}`);
    };

    const handleCreateBill = () => {
        router.push(`/groups/${groupId}/bills/new`);
    };

    return (
        <PageContainer
            title={t('nav.bills')}
            headerRight={
                <Button onClick={handleCreateBill}>
                    {t('bills.createBill')}
                </Button>
            }
        >
            {/* Bills List */}
            {isLoading && page === 0 ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-destructive mb-4">
                        {t('errors.loadFailed')}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        {t('common.retry')}
                    </Button>
                </div>
            ) : bills.length === 0 ? (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-muted-foreground mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p className="text-muted-foreground mb-2">{t('bills.noBills')}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('bills.createFirst')}
                    </p>
                    <Button onClick={handleCreateBill}>
                        {t('bills.createBill')}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        {bills.map((bill) => (
                            <BillCard
                                key={bill.id}
                                bill={bill}
                                onClick={() => handleBillClick(bill.id)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {(hasMore || page > 0) && (
                        <div className="flex justify-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0 || isLoading}
                            >
                                {t('common.previous')}
                            </Button>
                            <span className="flex items-center text-sm text-muted-foreground">
                                {t('common.page')} {page + 1}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasMore || isLoading}
                            >
                                {t('common.next')}
                            </Button>
                        </div>
                    )}

                    {isLoading && page > 0 && (
                        <div className="flex justify-center py-4">
                            <Spinner />
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}
