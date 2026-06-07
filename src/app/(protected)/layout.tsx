'use client';

import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageTransition } from '@/components/layout/page-transition';

interface ProtectedLayoutProps {
    children: ReactNode;
}

/**
 * Protected Layout
 * Desktop: Sidebar on left (72px collapsed → 240px on hover)
 * Mobile: BottomNav fixed at bottom
 * Page transitions: fade + slide-up on every route change
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main content with page transition */}
            <main className="flex-1 min-h-screen pb-20 md:pb-0 md:pl-[72px]">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>

            {/* Bottom Navigation — mobile only */}
            <BottomNav />
        </div>
    );
}
