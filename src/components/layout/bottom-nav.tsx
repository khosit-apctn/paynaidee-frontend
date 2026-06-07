'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useFriendRequests } from '@/lib/hooks/use-friends';

interface NavItem {
    href: string;
    labelKey: string;
    emoji: string;
}

const leftNavItems: NavItem[] = [
    {
        href: '/dashboard',
        labelKey: 'nav.dashboard',
        emoji: '🏠',
    },
    {
        href: '/groups',
        labelKey: 'nav.groups',
        emoji: '👥',
    },
];

const rightNavItems: NavItem[] = [
    {
        href: '/friends',
        labelKey: 'nav.friends',
        emoji: '💛',
    },
    {
        href: '/profile',
        labelKey: 'nav.profile',
        emoji: '👤',
    },
];

/**
 * BottomNav — glassmorphic mobile bottom bar
 * Glass surface with central floating FAB button and action sheet overlay
 */
export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslation();
    const [isFabOpen, setIsFabOpen] = useState(false);
    const { data: requests } = useFriendRequests();
    const pendingCount = requests?.length ?? 0;

    const isActive = (href: string): boolean => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const renderNavItem = (item: NavItem) => {
        const active = isActive(item.href);
        return (
            <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all"
            >
                {/* Active background pill */}
                {active && (
                    <span
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full animate-fade-in"
                        style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
                    />
                )}

                {/* Icon */}
                <span
                    className={`text-xl leading-none transition-transform relative ${active ? 'scale-110' : 'scale-100'}`}
                >
                    {item.emoji}
                    {item.href === '/friends' && pendingCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] bg-rose-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center px-0.5 border border-[#0a0818] shadow-sm">
                            {pendingCount}
                        </span>
                    )}
                </span>

                {/* Label */}
                <span
                    className={`text-[10px] font-semibold tracking-wide transition-colors ${
                        active ? 'text-[var(--text-accent)]' : 'text-[var(--text-muted)]'
                    }`}
                >
                    {t(item.labelKey)}
                </span>
            </Link>
        );
    };

    return (
        <>
            {/* FAB Options Sheet */}
            {isFabOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                        onClick={() => setIsFabOpen(false)}
                    />
                    {/* Sheet */}
                    <div 
                        className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl p-4 space-y-3 animate-slide-up md:hidden"
                        style={{
                            background: 'var(--bg-surface-raised)',
                            border: '1px solid var(--border-glass)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                        }}
                    >
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-center mb-1">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setIsFabOpen(false);
                                    router.push('/groups?create=true');
                                }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl glass-card-sm hover:bg-white/[0.06] border border-white/[0.05] transition-all gap-2 text-center"
                            >
                                <span className="text-2xl">👥</span>
                                <span className="text-xs font-semibold text-[var(--text-primary)]">
                                    Create Group
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setIsFabOpen(false);
                                    const match = pathname.match(/^\/groups\/(\d+)/);
                                    if (match && match[1]) {
                                        router.push(`/groups/${match[1]}/bills/new`);
                                    } else {
                                        router.push('/groups/bills/new');
                                    }
                                }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl glass-card-sm hover:bg-white/[0.06] border border-white/[0.05] transition-all gap-2 text-center"
                            >
                                <span className="text-2xl">📝</span>
                                <span className="text-xs font-semibold text-[var(--text-primary)]">
                                    Create Bill
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Bottom Navigation Bar */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                style={{
                    background: 'rgba(10,8,24,0.92)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <div className="relative flex h-16 items-center justify-between px-2">
                    {/* Left Items */}
                    <div className="flex flex-1 justify-around">
                        {leftNavItems.map(renderNavItem)}
                    </div>

                    {/* Central Floating FAB Button */}
                    <div className="relative flex justify-center w-16 h-16 -mt-6 z-50">
                        <button
                            onClick={() => setIsFabOpen(!isFabOpen)}
                            className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg border-4 transition-all hover:scale-105 active:scale-95 duration-200"
                            style={{
                                background: 'var(--accent-gradient)',
                                borderColor: '#0a0818',
                                boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
                            }}
                        >
                            <svg 
                                className={`h-6 w-6 transition-transform duration-300 ${isFabOpen ? 'rotate-45' : ''}`}
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {/* Right Items */}
                    <div className="flex flex-1 justify-around">
                        {rightNavItems.map(renderNavItem)}
                    </div>
                </div>
                {/* Safe area support */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </nav>
        </>
    );
}

export default BottomNav;
