'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { useBill, useBillQR, useParticipantQR, useUpdatePaymentStatus, billKeys } from '@/lib/hooks/use-bills';
import { useAuthStore } from '@/lib/stores/auth-store';
import { usePaymentUpdates } from '@/lib/websocket/hooks';
import { BillDetail } from '@/components/bills/bill-detail';
import { ParticipantList } from '@/components/bills/participant-list';
import { QRCodeDisplay } from '@/components/bills/qr-code-display';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { PageContainer } from '@/components/layout/page-container';
import { showSuccessToast, showErrorToast } from '@/lib/stores/ui-store';

interface BillDetailPageProps {
    params: {
        id: string;
        billId: string;
    };
}

/**
 * Bill Detail Page
 * Displays complete bill information with participants and QR code options
 * _Requirements: 5.6_
 */
export default function BillDetailPage({ params }: BillDetailPageProps) {
    const t = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const groupId = parseInt(params.id);
    const billId = parseInt(params.billId);
    const currentUser = useAuthStore((state) => state.user);

    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const { data: bill, isLoading, error } = useBill(billId);
    const { data: billQR } = useBillQR(billId);
    const { data: participantQR } = useParticipantQR(
        billId,
        selectedUserId || 0
    );
    const updatePaymentMutation = useUpdatePaymentStatus(billId, groupId);

    // WebSocket integration for real-time payment updates
    // _Requirements: 6.4, 6.5, 6.6_
    usePaymentUpdates(
        (payload) => {
            // Handle payment_update event
            if (payload.bill_id === billId) {
                queryClient.invalidateQueries({ queryKey: billKeys.detail(billId) });
                showSuccessToast(
                    t('bills.paymentUpdated'),
                    t('bills.paymentStatusChanged')
                );
            }
        },
        (payload) => {
            // Handle bill_settled event
            if (payload.bill_id === billId) {
                queryClient.invalidateQueries({ queryKey: billKeys.detail(billId) });
                queryClient.invalidateQueries({ queryKey: billKeys.byGroup(groupId) });
                showSuccessToast(
                    t('bills.billSettled'),
                    t('bills.allPaymentsCompleted')
                );
            }
        }
    );

    const handleUpdatePaymentStatus = async (userId: number, status: 'paid' | 'pending') => {
        try {
            await updatePaymentMutation.mutateAsync({
                userId,
                data: { status },
            });
            showSuccessToast(t('bills.paymentStatusUpdated'));
        } catch (error: any) {
            showErrorToast(
                t('errors.updateFailed'),
                error.message || t('errors.unknown')
            );
        }
    };

    const handleShowQR = (userId?: number) => {
        setSelectedUserId(userId || null);
        setShowQRModal(true);
    };

    const qrData = selectedUserId ? participantQR : billQR;
    const canUpdateStatus = bill && currentUser && bill.created_by === currentUser.id;

    if (isLoading) {
        return (
            <PageContainer title={t('nav.bills')}>
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (error || !bill) {
        return (
            <PageContainer title={t('nav.bills')}>
                <div className="text-center py-12">
                    <p className="text-destructive mb-4">
                        {t('errors.billNotFound')}
                    </p>
                    <Button onClick={() => router.push(`/groups/${groupId}/bills`)}>
                        {t('common.back')}
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={t('nav.bills')}
            headerRight={
                <Button onClick={() => handleShowQR()}>
                    {t('bills.generateQR')}
                </Button>
            }
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Bill Details */}
                <BillDetail bill={bill} />

                {/* Participants */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">
                        {t('bills.participants')}
                    </h3>
                    <ParticipantList
                        participants={bill.participants || []}
                        onUpdateStatus={canUpdateStatus ? handleUpdatePaymentStatus : undefined}
                        canUpdate={!!canUpdateStatus}
                    />
                </div>

                {/* Individual QR Codes for Each Participant */}
                <div className="grid gap-4 md:grid-cols-2">
                    {bill.participants?.map((participant) => (
                        <Button
                            key={participant.id}
                            variant="outline"
                            onClick={() => handleShowQR(participant.user_id)}
                            className="justify-between"
                        >
                            <span>
                                {participant.user.display_name || participant.user.username}
                            </span>
                            <span className="text-primary font-semibold">
                                {t('bills.viewQR')}
                            </span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* QR Code Modal */}
            <Modal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                title={t('bills.paymentQR')}
            >
                {qrData ? (
                    <QRCodeDisplay
                        qrData={qrData.qr_data}
                        amount={qrData.amount}
                        header={qrData.header}
                    />
                ) : (
                    <div className="flex justify-center py-8">
                        <Spinner size="lg" />
                    </div>
                )}
            </Modal>
        </PageContainer>
    );
}
