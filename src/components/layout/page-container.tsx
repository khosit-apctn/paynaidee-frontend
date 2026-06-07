'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PageContainerProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    showBack?: boolean;
    backUrl?: string;
    headerRight?: React.ReactNode;
    className?: string;
    withBottomNav?: boolean;
}

/**
 * PageContainer — glassmorphic page wrapper
 * Sticky sub-header with glass blur when title is provided
 */
export function PageContainer({
    children,
    title,
    description,
    showBack = false,
    backUrl,
    headerRight,
    className = '',
    withBottomNav = true,
}: PageContainerProps) {
    const router = useRouter();

    const handleBack = () => {
        if (backUrl) router.push(backUrl);
        else router.back();
    };

    return (
        <div className={`flex-1 flex flex-col min-h-0 ${withBottomNav ? 'pb-20 md:pb-0' : ''} ${className}`}>
            {/* Sticky sub-header */}
            {(title || showBack || headerRight) && (
                <div
                    className="sticky top-0 z-40"
                    style={{
                        background: 'rgba(10,8,24,0.80)',
                        backdropFilter: 'blur(16px)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                >
                    <div className="container mx-auto px-4 py-3.5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                {showBack && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBack}
                                        className="shrink-0 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Button>
                                )}
                                <div className="min-w-0">
                                    {title && (
                                        <h1 className="text-base font-bold text-[var(--text-primary)] truncate">
                                            {title}
                                        </h1>
                                    )}
                                    {description && (
                                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {headerRight && (
                                <div className="shrink-0 flex items-center gap-2">
                                    {headerRight}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-5">
                {children}
            </div>
        </div>
    );
}

export default PageContainer;
