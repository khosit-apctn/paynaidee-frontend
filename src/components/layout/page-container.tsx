'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PageContainerProps {
    children: React.ReactNode;
    /** Page title displayed at the top */
    title?: string;
    /** Description text below the title */
    description?: string;
    /** Show back button */
    showBack?: boolean;
    /** Custom back URL (default: browser back) */
    backUrl?: string;
    /** Header right section for action buttons */
    headerRight?: React.ReactNode;
    /** Additional CSS classes for the container */
    className?: string;
    /** Whether to include padding at the bottom for BottomNav */
    withBottomNav?: boolean;
}

/**
 * PageContainer Component
 * Provides consistent page layout with title, optional back button, and proper spacing
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
        if (backUrl) {
            router.push(backUrl);
        } else {
            router.back();
        }
    };

    return (
        <div
            className={`flex-1 flex flex-col min-h-0 ${withBottomNav ? 'pb-20 md:pb-0' : ''
                } ${className}`}
        >
            {/* Page Header */}
            {(title || showBack || headerRight) && (
                <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                {showBack && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBack}
                                        className="shrink-0 -ml-2"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    </Button>
                                )}
                                <div className="min-w-0">
                                    {title && (
                                        <h1 className="text-xl font-semibold text-foreground truncate">
                                            {title}
                                        </h1>
                                    )}
                                    {description && (
                                        <p className="text-sm text-muted-foreground truncate">
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

            {/* Page Content */}
            <div className="flex-1 container mx-auto px-4 py-4">
                {children}
            </div>
        </div>
    );
}

export default PageContainer;
