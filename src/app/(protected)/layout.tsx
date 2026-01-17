'use client';

import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';

interface ProtectedLayoutProps {
    children: ReactNode;
}

/**
 * Protected Layout
 * Wraps all protected routes with Header, BottomNav, and PageContainer
 * This layout is only rendered for authenticated users (middleware handles redirect)
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header - visible on all screen sizes */}
            <Header />

            {/* Main content area with bottom padding for mobile nav */}
            <main className="pb-20 md:pb-0">
                <PageContainer>
                    {children}
                </PageContainer>
            </main>

            {/* Bottom Navigation - visible only on mobile */}
            <BottomNav />
        </div>
    );
}
