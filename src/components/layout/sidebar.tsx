'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogout } from '@/lib/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';

interface NavItem {
    href: string;
    labelKey: string;
    icon: React.ReactNode;
}

/**
 * Sidebar Component
 * Desktop/tablet navigation sidebar
 * Hidden on mobile (< md breakpoint)
 */
export function Sidebar() {
    const pathname = usePathname();
    const t = useTranslation();
    const { user } = useAuthStore();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    const navItems: NavItem[] = [
        {
            href: '/dashboard',
            labelKey: 'nav.dashboard',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            href: '/groups',
            labelKey: 'nav.groups',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            href: '/friends',
            labelKey: 'nav.friends',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            href: '/profile',
            labelKey: 'nav.profile',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    const isActive = (href: string): boolean => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-14">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto border-r border-border bg-card px-4 py-6">
                {/* User Info Section */}
                {user && (
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                        <Avatar
                            src={user.avatar}
                            alt={user.display_name || user.username}
                            fallback={user.display_name || user.username}
                            size="md"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user.display_name || user.username}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {item.icon}
                                {t(item.labelKey)}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <button
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {isLoggingOut ? t('common.loading') : t('auth.logout')}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
