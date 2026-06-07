'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useGroup, useGroupBalances, useSettleWithCreditor } from '@/lib/hooks/use-groups';
import { useGroupBills } from '@/lib/hooks/use-bills';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BillCard } from '@/components/bills/bill-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { Modal } from '@/components/ui/modal';
import { QRCodeDisplay } from '@/components/bills/qr-code-display';
import { ChatContainer } from '@/components/chat/chat-container';
import { generatePromptPayPayload } from '@/lib/utils/promptpay';
import { showSuccessToast, showErrorToast } from '@/lib/stores/ui-store';
import { formatThaiCurrency } from '@/lib/utils/currency';

interface GroupDetailPageProps {
    params: Promise<{ id: string }>;
}

type TabType = 'summary' | 'bills' | 'chat';

/**
 * Group Detail Page
 * Tabs: Summary (balances), Bills, Chat
 * Balances: real data from GET /groups/:id/balances
 */
export default function GroupDetailPage({ params }: GroupDetailPageProps) {
    const { id } = use(params);
    const groupId = parseInt(id, 10);
    const t = useTranslation();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('summary');
    const [settleCreditor, setSettleCreditor] = useState<{ id: number; name: string; amount: number } | null>(null);

    const { data: group, isLoading, error } = useGroup(groupId);
    const { data: balances, isLoading: balancesLoading } = useGroupBalances(groupId);
    const { data: bills, isLoading: billsLoading } = useGroupBills(groupId);
    const settleMutation = useSettleWithCreditor(groupId);

    // Check if current user is admin
    const currentUserMember = group?.members?.find(m => m.user_id === user?.id);
    const isAdmin = currentUserMember?.role === 'admin';

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="text-center py-12">
                <p className="text-error mb-4">
                    {t('errors.groupNotFound')}
                </p>
                <Link href="/groups">
                    <Button variant="outline">{t('common.back')}</Button>
                </Link>
            </div>
        );
    }

    const tabs: { id: TabType; label: string }[] = [
        { id: 'summary', label: '📊 สรุป' },
        { id: 'bills', label: '🧾 บิล' },
        { id: 'chat', label: `💬 ${t('nav.chat')}` },
    ];

    // Calculate my balance from the balances response
    const myOwed = balances?.filter(b => b.debtor_id === user?.id)
        .reduce((sum, b) => sum + b.amount, 0) ?? 0;

    // Calculate total group expenses and user paid share dynamically
    const totalExpenses = bills?.reduce((sum, b) => sum + Number(b.total_amount), 0) ?? 0;
    const myPaid = bills?.reduce((sum, b) => {
        const myPart = b.participants?.find(p => p.user_id === user?.id);
        if (myPart && myPart.payment_status === 'PAID') {
            return sum + Number(myPart.amount);
        }
        return sum;
    }, 0) ?? 0;

    const handleOpenSettleModal = (creditorId: number, creditorName: string, amount: number) => {
        setSettleCreditor({ id: creditorId, name: creditorName, amount });
    };

    const handleConfirmSettle = async () => {
        if (!settleCreditor) return;
        try {
            await settleMutation.mutateAsync(settleCreditor.id);
            showSuccessToast('เคลียร์ยอดเงินสำเร็จแล้ว');
            setSettleCreditor(null);
        } catch (err: any) {
            showErrorToast('เคลียร์ยอดเงินล้มเหลว', err.message || 'กรุณาลองใหม่อีกครั้ง');
        }
    };

    // Find creditor user's phone number for PromptPay QR code
    const creditorMember = group?.members?.find(m => m.user_id === settleCreditor?.id);
    const creditorPhone = creditorMember?.user?.phone_number;

    let qrData = '';
    let qrError = '';
    if (settleCreditor && creditorPhone) {
        try {
            qrData = generatePromptPayPayload(creditorPhone, settleCreditor.amount, `${group.name} Settle`);
        } catch (e: any) {
            qrError = e.message || 'ไม่สามารถสร้างข้อมูล PromptPay ได้';
        }
    } else if (settleCreditor) {
        qrError = 'ผู้รับเงินยังไม่ได้ตั้งค่าเบอร์โทรศัพท์สำหรับรับเงิน PromptPay';
    }


    return (
        <div className="space-y-6">
            {/* Group Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={group.avatar}
                        alt={group.name}
                        fallback={group.name}
                        size="lg"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {group.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('groups.memberCount').replace('{{count}}', String(group.members?.length || 0))}
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <Link href={`/groups/${groupId}/settings`}>
                        <Button variant="ghost" size="sm">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t('groups.settings')}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Link href={`/groups/${groupId}/chat`}>
                    <Button variant="outline" size="md">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {t('nav.chat')}
                    </Button>
                </Link>
                <Link href={`/groups/${groupId}/bills/new`}>
                    <Button variant="primary" size="md">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        สร้างบิล
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {/* Summary Tab — real balances */}
                {activeTab === 'summary' && (
                    <div className="space-y-4">
                        {/* Stats Grid from Mockup */}
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div className="stat-card purple !min-h-0 !p-3">
                                <span className="stat-label text-xs">ค่าใช้จ่ายรวม</span>
                                <span className="stat-value text-base sm:text-lg mt-1 font-bold">
                                    {formatThaiCurrency(totalExpenses)}
                                </span>
                            </div>
                            <div className="stat-card amber !min-h-0 !p-3">
                                <span className="stat-label text-xs">ยอดค้างจ่ายคุณ</span>
                                <span className="stat-value text-base sm:text-lg mt-1 font-bold text-amber-400">
                                    {formatThaiCurrency(myOwed)}
                                </span>
                            </div>
                            <div className="stat-card green !min-h-0 !p-3">
                                <span className="stat-label text-xs">คุณจ่ายแล้ว</span>
                                <span className="stat-value text-base sm:text-lg mt-1 font-bold text-emerald-400">
                                    {formatThaiCurrency(myPaid)}
                                </span>
                            </div>
                        </div>

                        {/* My balance summary card */}
                        {myOwed > 0 && (
                            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3">
                                <div className="text-2xl">💸</div>
                                <div>
                                    <p className="text-sm text-amber-400 font-medium">ยอดที่คุณต้องจ่าย</p>
                                    <p className="text-xl font-bold text-amber-300">฿{myOwed.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        )}

                        {/* Balance list */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ใครค้างใคร</CardTitle>
                            </CardHeader>
                            <CardBody>
                                {balancesLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} className="h-14 w-full" />
                                        ))}
                                    </div>
                                ) : balances && balances.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {balances.map((entry, idx) => (
                                            <div key={idx} className="py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium text-foreground">
                                                        {entry.debtor_id === user?.id ? 'คุณ' : entry.debtor_name}
                                                    </span>
                                                    <span className="text-muted-foreground">ค้าง</span>
                                                    <span className="font-medium text-foreground">
                                                        {entry.creditor_id === user?.id ? 'คุณ' : entry.creditor_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${entry.debtor_id === user?.id ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        ฿{entry.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    {/* Settle Up: opens PromptPay modal */}
                                                    {entry.debtor_id === user?.id && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs"
                                                            onClick={() => handleOpenSettleModal(entry.creditor_id, entry.creditor_name, entry.amount)}
                                                        >
                                                            เคลียร์เงิน
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">✅</div>
                                        <p className="text-muted-foreground text-sm">ทุกอย่างเคลียร์แล้ว!</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Bills Tab */}
                {activeTab === 'bills' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                                บิลทั้งหมด ({bills?.length ?? 0} บิล)
                            </p>
                            <Link href={`/groups/${groupId}/bills/new`}>
                                <Button size="sm" variant="primary">+ สร้างบิล</Button>
                            </Link>
                        </div>
                        {billsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        ) : bills && bills.length > 0 ? (
                            <div className="space-y-3">
                                {bills.map((bill) => (
                                    <Link key={bill.id} href={`/groups/${groupId}/bills/${bill.id}`}>
                                        <BillCard bill={bill} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">ยังไม่มีบิล</p>
                                <Link href={`/groups/${groupId}/bills/new`}>
                                    <Button variant="primary" size="md" className="mt-4">
                                        สร้างบิลแรก
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="rounded-xl border border-border overflow-hidden bg-background">
                        <ChatContainer
                            groupId={groupId}
                            className="h-[500px]"
                        />
                    </div>
                )}
            </div>

            {/* Settle Up PromptPay Modal */}
            <Modal
                isOpen={!!settleCreditor}
                onClose={() => setSettleCreditor(null)}
                title="สแกนเพื่อจ่ายเงิน (PromptPay)"
            >
                {settleCreditor && (
                    <div className="space-y-6">
                        {qrError ? (
                            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-center text-sm">
                                {qrError}
                            </div>
                        ) : qrData ? (
                            <QRCodeDisplay
                                qrData={qrData}
                                amount={settleCreditor.amount}
                                header={`จ่ายเงินให้ ${settleCreditor.name}`}
                            />
                        ) : (
                            <div className="flex justify-center py-8">
                                <Spinner size="lg" />
                            </div>
                        )}

                        <div className="flex flex-col gap-2 pt-4 border-t border-border">
                            <Button
                                variant="primary"
                                onClick={handleConfirmSettle}
                                disabled={settleMutation.isPending}
                                className="w-full justify-center"
                            >
                                {settleMutation.isPending ? 'กำลังบันทึก...' : 'ฉันโอนเงินแล้ว (ยืนยันการเคลียร์ยอด)'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSettleCreditor(null)}
                                className="w-full justify-center"
                            >
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

