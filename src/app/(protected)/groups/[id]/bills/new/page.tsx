'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useGroup } from '@/lib/hooks/use-groups';
import { useCreateBill } from '@/lib/hooks/use-bills';
import { BillForm } from '@/components/forms/bill-form';
import { PageContainer } from '@/components/layout/page-container';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import type { CreateBillInput } from '@/lib/utils/validation';
import { showSuccessToast, showErrorToast } from '@/lib/stores/ui-store';

interface NewBillPageProps {
    params: {
        id: string;
    };
}

/**
 * New Bill Page
 * Form page for creating a new bill in a group
 * _Requirements: 5.1_
 */
export default function NewBillPage({ params }: NewBillPageProps) {
    const t = useTranslation();
    const router = useRouter();
    const groupId = parseInt(params.id);

    const { data: group, isLoading: isLoadingGroup, error: groupError } = useGroup(groupId);
    const createBillMutation = useCreateBill(groupId);

    const handleSubmit = async (data: CreateBillInput) => {
        try {
            await createBillMutation.mutateAsync(data);
            showSuccessToast(t('bills.createSuccess'));
            router.push(`/groups/${groupId}/bills`);
        } catch (error: any) {
            showErrorToast(
                t('errors.createFailed'),
                error.message || t('errors.unknown')
            );
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (isLoadingGroup) {
        return (
            <PageContainer title={t('bills.createBill')}>
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (groupError || !group) {
        return (
            <PageContainer title={t('bills.createBill')}>
                <div className="text-center py-12">
                    <p className="text-destructive mb-4">
                        {t('errors.groupNotFound')}
                    </p>
                    <Button onClick={() => router.push(`/groups/${groupId}`)}>
                        {t('common.back')}
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={t('bills.createBill')}
            description={group.name}
        >
            <div className="max-w-2xl mx-auto">
                <BillForm
                    groupMembers={group.members || []}
                    onSubmit={handleSubmit}
                    isSubmitting={createBillMutation.isPending}
                />

                <div className="mt-6">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={createBillMutation.isPending}
                        className="w-full"
                    >
                        {t('common.cancel')}
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}
