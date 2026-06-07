'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useTranslation, useLocale, useSetLocale } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogout } from '@/lib/hooks/use-auth';
import { useClickOutside } from '@/lib/hooks/use-click-outside';
import { Avatar } from '@/components/ui/avatar';
import type { Locale } from '@/lib/i18n/config';

/**
 * Header — glassmorphic top bar
 * Frosted glass with subtle bottom border separator
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
        <header
            className="sticky top-0 z-50 w-full"
            style={{
                background: 'rgba(13,11,30,0.85)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <div className="flex h-14 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link
                    href={isAuthenticated ? '/dashboard' : '/login'}
                    className="flex items-center gap-2.5 group"
                >
                    {/* Logo mark: gradient glass box */}
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-bold text-sm select-none"
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
                        }}
                    >
                        PN
                    </div>
                    <span className="text-base font-bold text-[var(--text-primary)] hidden sm:inline-block tracking-tight group-hover:text-[var(--indigo-300)] transition-colors">
                        {t('common.appName')}
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <div className="relative" ref={langMenuRef}>
                        <button
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] transition-all hover:bg-white/5 hover:text-[var(--text-primary)]"
                            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span className="uppercase">{locale}</span>
                        </button>

                        {isLangMenuOpen && (
                            <div
                                className="absolute right-0 mt-2 w-32 rounded-2xl py-1.5 z-50 animate-scale-in"
                                style={{
                                    background: 'var(--bg-surface-raised)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid var(--border-glass)',
                                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                                }}
                            >
                                {[
                                    { code: 'en' as Locale, flag: '🇺🇸', label: 'English' },
                                    { code: 'th' as Locale, flag: '🇹🇭', label: 'ไทย' },
                                ].map(({ code, flag, label }) => (
                                    <button
                                        key={code}
                                        onClick={() => handleLanguageChange(code)}
                                        className={`flex w-full items-center gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-white/5 ${locale === code ? 'text-[var(--indigo-300)] font-semibold' : 'text-[var(--text-secondary)]'}`}
                                    >
                                        {flag} {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    {isAuthenticated && user && (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-white/5"
                            >
                                <Avatar
                                    src={user.avatar}
                                    alt={user.display_name || user.username}
                                    fallback={user.display_name || user.username}
                                    size="sm"
                                />
                                <span className="hidden md:inline-block text-sm font-medium text-[var(--text-primary)]">
                                    {user.display_name || user.username}
                                </span>
                                <svg
                                    className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isUserMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-52 rounded-2xl py-1.5 z-50 animate-scale-in"
                                    style={{
                                        background: 'var(--bg-surface-raised)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid var(--border-glass)',
                                        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    <div className="px-4 py-3 border-b border-white/[0.06]">
                                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                            {user.display_name || user.username}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {t('nav.profile')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--rose-400)] hover:bg-[var(--rose-400)]/5 transition-colors disabled:opacity-40"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {isLoggingOut ? t('common.loading') : t('auth.logout')}
                                        </button>
                                    </div>
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
