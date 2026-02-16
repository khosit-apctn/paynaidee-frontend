'use client';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/lib/stores/ui-store';
import { Modal } from '@/components/ui/modal';
import { SplitCalculator } from '@/components/bills/split-calculator';

/**
 * SplitCalculatorModal
 * Dark glassmorphism modal wrapping the existing SplitCalculator component
 * Triggered via openModal('splitCalculator', { groupId, billId })
 */
export function SplitCalculatorModal() {
    const t = useTranslation();
    const activeModal = useUIStore((s) => s.activeModal);
    const modalData = useUIStore((s) => s.modalData);
    const closeModal = useUIStore((s) => s.closeModal);

    const isOpen = activeModal === 'splitCalculator';

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title={t('dashboard.splitCalculator')}
            className="!bg-dash-surface !border-dash-border !text-dash-text max-w-lg"
        >
            <div className="p-6">
                <SplitCalculator
                    totalAmount={modalData?.amount || 0}
                    splitType={modalData?.splitType || 'equal'}
                    participants={modalData?.participants || []}
                />
            </div>
        </Modal>
    );
}

export default SplitCalculatorModal;
