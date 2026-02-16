'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SplitCalculatorModal } from '@/components/dashboard/split-calculator-modal';

/**
 * Dashboard Page
 * Composes the 4-column DashboardLayout with SplitCalculator modal.
 * WebSocket connections are managed by individual hooks in each column component.
 * All data fetching and state management is handled by individual column components.
 */
export default function DashboardPage() {
    return (
        <>
            <DashboardLayout />
            <SplitCalculatorModal />
        </>
    );
}
