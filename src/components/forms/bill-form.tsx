'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBillSchema, type CreateBillInput } from '@/lib/utils/validation';
import { SplitCalculator } from '@/components/bills/split-calculator';
import type { GroupMember } from '@/types/models';

interface BillFormProps {
    groupMembers: GroupMember[];
    onSubmit: (data: CreateBillInput) => void;
    isSubmitting?: boolean;
}

/**
 * BillForm Component
 * Form for creating a new bill with React Hook Form and Zod validation
 * Supports equal and custom split types with participant selection
 * Shows client-side preview of calculated amounts
 * _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8, 5.9_
 */
export function BillForm({ groupMembers, onSubmit, isSubmitting = false }: BillFormProps) {
    const t = useTranslation();
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [customAmounts, setCustomAmounts] = useState<Record<number, number>>({});

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateBillInput>({
        resolver: zodResolver(createBillSchema),
        defaultValues: {
            title: '',
            description: '',
            total_amount: 0,
            service_charge: 0,
            split_type: 'equal',
            qr_header: '',
            participants: [],
        },
    });

    const splitType = watch('split_type');
    const totalAmount = watch('total_amount') || 0;
    const serviceCharge = watch('service_charge') || 0;

    // Auto-calculate equal split amounts when participants or settings change
    useEffect(() => {
        if (splitType === 'equal' && selectedParticipants.length > 0) {
            const totalWithCharge = totalAmount * (1 + serviceCharge / 100);
            const perPerson = totalWithCharge / selectedParticipants.length;

            const participants = selectedParticipants.map((userId) => ({
                user_id: userId,
                amount: perPerson,
            }));

            setValue('participants', participants);
        }
    }, [splitType, selectedParticipants, totalAmount, serviceCharge, setValue]);

    // Update custom split amounts
    useEffect(() => {
        if (splitType === 'custom' && selectedParticipants.length > 0) {
            const participants = selectedParticipants.map((userId) => ({
                user_id: userId,
                amount: customAmounts[userId] || 0,
            }));

            setValue('participants', participants);
        }
    }, [splitType, selectedParticipants, customAmounts, setValue]);

    const handleParticipantToggle = (userId: number) => {
        setSelectedParticipants((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCustomAmountChange = (userId: number, amount: number) => {
        setCustomAmounts((prev) => ({
            ...prev,
            [userId]: amount,
        }));
    };

    const participantsForPreview = selectedParticipants.map((userId) => {
        const member = groupMembers.find((m) => m.user_id === userId);
        const totalWithCharge = totalAmount * (1 + serviceCharge / 100);
        const perPerson = selectedParticipants.length > 0 ? totalWithCharge / selectedParticipants.length : 0;

        return {
            user_id: userId,
            amount: splitType === 'equal' ? perPerson : (customAmounts[userId] || 0),
            user: member?.user,
        };
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
                <Input
                    label={t('bills.billTitle')}
                    error={errors.title?.message}
                    {...register('title')}
                    placeholder={t('bills.billTitlePlaceholder')}
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    {t('bills.description')} ({t('common.optional')})
                </label>
                <textarea
                    {...register('description')}
                    className="w-full min-h-20 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('bills.descriptionPlaceholder')}
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
                )}
            </div>

            {/* Total Amount */}
            <div>
                <Input
                    type="number"
                    step="0.01"
                    label={t('bills.totalAmount')}
                    error={errors.total_amount?.message}
                    {...register('total_amount', { valueAsNumber: true })}
                    placeholder="0.00"
                />
            </div>

            {/* Service Charge */}
            <div>
                <Input
                    type="number"
                    step="0.01"
                    label={`${t('bills.serviceCharge')} (%)`}
                    error={errors.service_charge?.message}
                    {...register('service_charge', { valueAsNumber: true })}
                    placeholder="0"
                />
            </div>

            {/* Split Type */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    {t('bills.splitType')}
                </label>
                <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value="equal"
                            {...register('split_type')}
                            className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span>{t('bills.equalSplit')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value="custom"
                            {...register('split_type')}
                            className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span>{t('bills.customSplit')}</span>
                    </label>
                </div>
                {errors.split_type && (
                    <p className="mt-1 text-sm text-destructive">{errors.split_type.message}</p>
                )}
            </div>

            {/* QR Header (Optional) */}
            <div>
                <Input
                    label={`${t('bills.qrHeader')} (${t('common.optional')})`}
                    error={errors.qr_header?.message}
                    {...register('qr_header')}
                    placeholder={t('bills.qrHeaderPlaceholder')}
                />
            </div>

            {/* Participant Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    {t('bills.selectParticipants')}
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-md p-3">
                    {groupMembers.map((member) => (
                        <div key={member.user_id} className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={selectedParticipants.includes(member.user_id)}
                                onChange={() => handleParticipantToggle(member.user_id)}
                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                            />
                            <span className="flex-1">
                                {member.user.display_name || member.user.username}
                            </span>

                            {/* Custom amount input for custom split */}
                            {splitType === 'custom' && selectedParticipants.includes(member.user_id) && (
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={customAmounts[member.user_id] || ''}
                                    onChange={(e) =>
                                        handleCustomAmountChange(member.user_id, parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="0.00"
                                    className="w-32"
                                />
                            )}
                        </div>
                    ))}
                </div>
                {errors.participants && (
                    <p className="mt-1 text-sm text-destructive">{errors.participants.message}</p>
                )}
            </div>

            {/* Split Calculator Preview */}
            {selectedParticipants.length > 0 && totalAmount > 0 && (
                <SplitCalculator
                    totalAmount={totalAmount}
                    serviceCharge={serviceCharge}
                    splitType={splitType}
                    participants={participantsForPreview}
                />
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? t('common.loading') : t('bills.createBill')}
                </Button>
            </div>
        </form>
    );
}

export default BillForm;
