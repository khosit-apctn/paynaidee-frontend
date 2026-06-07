'use client';

import type { ReactNode } from 'react';

/**
 * Dashboard Layout
 * Bypasses custom full screen sizing so it integrates cleanly with the main Layout Shell
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
    return children;
}

