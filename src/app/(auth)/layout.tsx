'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation, useLocale, useSetLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';

/**
 * Auth Layout — glassmorphic centered auth pages
 * Deep indigo gradient background with floating glass card
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslation();
    const locale = useLocale();
    const setLocale = useSetLocale();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const handleLanguageChange = (newLocale: Locale) => {
        setLocale(newLocale);
        setIsLangMenuOpen(false);
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: 'var(--bg-base)',
                backgroundImage: `
                    radial-gradient(ellipse 80% 60% at 20% -10%, rgba(79,70,229,0.22) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 50% at 80% 110%, rgba(139,92,246,0.15) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(30,27,75,0.50) 0%, transparent 80%)
                `,
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Header */}
            <header className="flex items-center justify-between p-5">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-sm select-none"
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            boxShadow: '0 4px 16px rgba(79,70,229,0.40)',
                        }}
                    >
                        PN
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--indigo-300)] transition-colors">
                        {t('common.appName')}
                    </span>
                </Link>

                {/* Language Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] transition-all hover:bg-white/5 hover:text-[var(--text-primary)]"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
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
            </header>

            {/* Main centered content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-slide-up">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-5 text-center text-xs text-[var(--text-muted)]">
                © {new Date().getFullYear()} PayNaiDee. All rights reserved.
            </footer>
        </div>
    );
}
