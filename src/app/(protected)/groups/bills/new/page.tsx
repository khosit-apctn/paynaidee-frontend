'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useGroups, useGroup } from '@/lib/hooks/use-groups';
import { useCreateBill } from '@/lib/hooks/use-bills';
import { BillForm } from '@/components/forms/bill-form';
import { PageContainer } from '@/components/layout/page-container';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import type { CreateBillInput } from '@/lib/utils/validation';
import { showSuccessToast, showErrorToast } from '@/lib/stores/ui-store';

/**
 * Global Create Bill Page
 * Allows user to select a group first, then loads its members and shows the BillForm
 * _Matches mockup behavior (bill-new page with group selector)_
 */
export default function GlobalNewBillPage() {
    const t = useTranslation();
    const router = useRouter();
    
    // Fetch all user groups
    const { data: groups, isLoading: isLoadingGroups, error: groupsError } = useGroups();
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Default to the first group once loaded
    useEffect(() => {
        if (groups && groups.length > 0 && selectedGroupId === null) {
            setSelectedGroupId(groups[0].id);
        }
    }, [groups, selectedGroupId]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch details/members for the selected group
    const { data: group, isLoading: isLoadingGroup } = useGroup(selectedGroupId || 0);
    
    // Mutation to create a bill under the selected group
    const createBillMutation = useCreateBill(selectedGroupId || 0);

    const handleSubmit = async (data: CreateBillInput) => {
        if (!selectedGroupId) return;
        try {
            await createBillMutation.mutateAsync(data);
            showSuccessToast(t('bills.createSuccess'));
            router.push(`/groups/${selectedGroupId}`);
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

    if (isLoadingGroups) {
        return (
            <PageContainer title={t('bills.createBill')}>
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (groupsError || !groups || groups.length === 0) {
        return (
            <PageContainer title={t('bills.createBill')}>
                <div className="text-center py-12">
                    <p className="text-destructive mb-4">
                        ไม่พบกลุ่มที่คุณเข้าร่วม กรุณาสร้างกลุ่มก่อนสร้างบิล
                    </p>
                    <Button onClick={() => router.push('/groups')}>
                        {t('groups.createGroup')}
                    </Button>
                </div>
            </PageContainer>
        );
    }

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    return (
        <PageContainer
            title={t('bills.createBill')}
            description="สร้างบิลเพื่อหารค่าใช้จ่ายกับสมาชิกในกลุ่ม"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Custom Group Selector */}
                <div className="form-group relative z-30 bg-card/45 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-md">
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                        กลุ่มที่ต้องการสร้างบิล *
                    </label>
                    
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl input-glass text-sm text-[var(--text-primary)] focus:outline-none bg-[var(--bg-primary)] border border-border focus:border-primary/50 transition-all cursor-pointer shadow-inner"
                        >
                            {selectedGroup ? (
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={selectedGroup.avatar}
                                        alt={selectedGroup.name}
                                        fallback={selectedGroup.name}
                                        size="sm"
                                    />
                                    <div className="text-left">
                                        <span className="block text-sm font-semibold text-[var(--text-primary)]">
                                            {selectedGroup.name}
                                        </span>
                                        <span className="block text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">
                                            {selectedGroup.members?.length || 0} สมาชิก
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-[var(--text-muted)]">เลือกกลุ่ม...</span>
                            )}
                            <span className={`text-[var(--text-muted)] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>

                        {isDropdownOpen && (
                            <div 
                                className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-border/80 p-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 shadow-2xl bg-[#0f1322]/95 backdrop-blur-xl"
                            >
                                <div className="space-y-1">
                                    {groups.map((g) => {
                                        const isCurrent = g.id === selectedGroupId;
                                        return (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedGroupId(g.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-primary/15 border border-primary/20 text-primary animate-pulse'
                                                        : 'hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                            >
                                                <Avatar
                                                    src={g.avatar}
                                                    alt={g.name}
                                                    fallback={g.name}
                                                    size="sm"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className={`block text-sm truncate ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                                                        {g.name}
                                                    </span>
                                                    <span className="block text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">
                                                        {g.members?.length || 0} สมาชิก
                                                    </span>
                                                </div>
                                                {isCurrent && (
                                                    <span className="text-primary font-bold text-xs mr-2">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isLoadingGroup ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="md" />
                    </div>
                ) : group ? (
                    <div className="bg-card/30 backdrop-blur-md p-6 rounded-2xl border border-border/60 shadow-lg">
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
                                className="w-full justify-center"
                            >
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </PageContainer>
    );
}
