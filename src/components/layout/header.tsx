'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useTranslation, useLocale, useSetLocale } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogout } from '@/lib/hooks/use-auth';
import { useClickOutside } from '@/lib/hooks/use-click-outside';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n/config';

// Static SVG icons (Vercel best practice: rendering-hoist-jsx)
const GlobeIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
    </svg>
);

const ChevronDownIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const UserIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LogoutIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

/**
 * Header Component
 * Displays logo, language switcher, and user menu
 * Hidden on mobile in favor of BottomNav
 */
export function Header() {
    const t = useTranslation();
    const locale = useLocale();
    const setLocale = useSetLocale();


    const { user, isAuthenticated } = useAuthStore();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside (Vercel best practice: client-event-listeners)
    useClickOutside([userMenuRef, langMenuRef], () => {
        setIsUserMenuOpen(false);
        setIsLangMenuOpen(false);
    });

    const handleLogout = () => {
        setIsUserMenuOpen(false);
        logout();
    };

    const handleLanguageChange = (newLocale: Locale) => {
        setLocale(newLocale);
        setIsLangMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    href={isAuthenticated ? '/dashboard' : '/login'}
                    className="flex items-center gap-2"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                        PN
                    </div>
                    <span className="text-lg font-semibold text-foreground hidden sm:inline-block">
                        {t('common.appName')}
                    </span>
                </Link>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <div className="relative" ref={langMenuRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="gap-1 px-2"
                        >
                            {GlobeIcon}
                            <span className="uppercase text-xs">{locale}</span>
                        </Button>

                        {isLangMenuOpen && (
                            <div className="absolute right-0 mt-2 w-28 rounded-lg border border-border bg-card shadow-lg py-1">
                                <button
                                    onClick={() => handleLanguageChange('en')}
                                    className={`flex w-full items-center px-3 py-2 text-sm hover:bg-muted ${locale === 'en' ? 'text-primary font-medium' : 'text-foreground'}`}
                                >
                                    🇺🇸 English
                                </button>
                                <button
                                    onClick={() => handleLanguageChange('th')}
                                    className={`flex w-full items-center px-3 py-2 text-sm hover:bg-muted ${locale === 'th' ? 'text-primary font-medium' : 'text-foreground'}`}
                                >
                                    🇹🇭 ไทย
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Menu (only when authenticated) */}
                    {isAuthenticated && user && (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors"
                            >
                                <Avatar
                                    src={user.avatar}
                                    alt={user.display_name || user.username}
                                    fallback={user.display_name || user.username}
                                    size="sm"
                                />
                                <span className="hidden md:inline-block text-sm font-medium text-foreground">
                                    {user.display_name || user.username}
                                </span>
                                <div className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                                    {ChevronDownIcon}
                                </div>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg py-1">
                                    <div className="px-3 py-2 border-b border-border">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {user.display_name || user.username}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-muted"
                                    >
                                        <span className="mr-2">{UserIcon}</span>
                                        {t('nav.profile')}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex w-full items-center px-3 py-2 text-sm text-error hover:bg-muted disabled:opacity-50"
                                    >
                                        <span className="mr-2">{LogoutIcon}</span>
                                        {isLoggingOut ? t('common.loading') : t('auth.logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
