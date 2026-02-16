'use client';

import type { ReactNode } from 'react';

/**
 * Dashboard Layout Override
 * Bypasses the default protected layout (Header, BottomNav, PageContainer)
 * because the dashboard has its own 4-column full-screen layout.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="h-screen overflow-hidden">
            {children}
        </div>
    );
}
