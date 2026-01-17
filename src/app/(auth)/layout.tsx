'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation, useLocale, useSetLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';

/**
 * Auth Layout
 * Centered layout for public auth pages (login, register)
 * Includes PayNaiDee branding and language switcher
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslation();
    const locale = useLocale();
    const setLocale = useSetLocale();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const handleLanguageChange = (newLocale: Locale) => {
        setLocale(newLocale);
        setIsLangMenuOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-neutral-900 dark:via-background dark:to-neutral-900">
            {/* Header with Language Switcher */}
            <header className="flex items-center justify-between p-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                        PN
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        {t('common.appName')}
                    </span>
                </Link>

                {/* Language Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                        </svg>
                        <span className="uppercase">{locale}</span>
                    </button>

                    {isLangMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted ${locale === 'en' ? 'text-primary font-medium' : 'text-foreground'
                                    }`}
                            >
                                🇺🇸 English
                            </button>
                            <button
                                onClick={() => handleLanguageChange('th')}
                                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted ${locale === 'th' ? 'text-primary font-medium' : 'text-foreground'
                                    }`}
                            >
                                🇹🇭 ไทย
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content (Centered) */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} PayNaiDee. All rights reserved.
            </footer>
        </div>
    );
}
