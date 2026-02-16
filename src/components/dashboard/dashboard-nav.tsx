'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation, useLocale, useSetLocale } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Avatar } from '@/components/ui/avatar';
import type { Locale } from '@/lib/i18n/config';

/**
 * DashboardNav
 * Far-left icon-only navigation rail (72px wide)
 * Features: nav icons with tooltips, active indicator, language toggle, user avatar
 */
export function DashboardNav() {
    const t = useTranslation();
    const pathname = usePathname();
    const locale = useLocale();
    const setLocale = useSetLocale();
    const { user } = useAuthStore();

    const navItems = [
        {
            href: '/dashboard',
            labelKey: 'nav.dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
        },
        {
            href: '/groups',
            labelKey: 'nav.groups',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            href: '/friends',
            labelKey: 'nav.friends',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
        },
        {
            href: '#',
            labelKey: 'nav.wallet',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
        },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        if (href === '#') return false;
        return pathname.startsWith(href);
    };

    const handleLanguageToggle = () => {
        const newLocale: Locale = locale === 'en' ? 'th' : 'en';
        setLocale(newLocale);
    };

    return (
        <nav className="flex flex-col items-center w-[72px] h-full bg-dash-bg border-r border-dash-border py-6">
            {/* Logo */}
            <div className="mb-8">
                <div className="w-10 h-10 rounded-xl bg-dash-accent flex items-center justify-center">
                    <span className="text-dash-bg font-bold text-sm">P</span>
                </div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col items-center gap-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.labelKey}
                            href={item.href}
                            className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${active
                                ? 'bg-dash-accent/10 text-dash-accent'
                                : 'text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-hover'
                                }`}
                            title={t(item.labelKey)}
                        >
                            {item.icon}
                            {/* Active indicator dot */}
                            {active && (
                                <span className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-dash-accent" />
                            )}
                            {/* Tooltip */}
                            <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-dash-surface text-dash-text text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg border border-dash-border">
                                {t(item.labelKey)}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom: Language Toggle + User Avatar */}
            <div className="flex flex-col items-center gap-3 mt-auto">
                {/* Language Toggle */}
                <button
                    onClick={handleLanguageToggle}
                    className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-dash-text-muted hover:text-dash-accent hover:bg-dash-surface-hover transition-all duration-200"
                    title={t('dashboard.language')}
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {locale === 'en' ? 'EN' : 'TH'}
                    </span>
                    <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-dash-surface text-dash-text text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg border border-dash-border">
                        {t('dashboard.switchLang')}
                    </span>
                </button>

                {/* Settings */}
                <Link
                    href="/profile"
                    className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-hover transition-all duration-200"
                    title={t('nav.settings')}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </Link>

                {/* User Avatar */}
                <div className="relative">
                    <Avatar
                        src={user?.avatar}
                        alt={user?.display_name || user?.username}
                        fallback={user?.display_name || user?.username}
                        size="sm"
                        className="ring-2 ring-dash-border hover:ring-dash-accent transition-all duration-200 cursor-pointer"
                    />
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dash-bg" />
                </div>
            </div>
        </nav>
    );
}

export default DashboardNav;
