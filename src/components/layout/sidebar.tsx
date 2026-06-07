'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLogout } from '@/lib/hooks/use-auth';
import { useFriendRequests } from '@/lib/hooks/use-friends';;

interface NavItem {
    href: string;
    labelKey: string;
    emoji: string;
}

/**
 * Sidebar — desktop left navigation
 * 72px collapsed, expands to 240px on hover (following mockup design).
 * Nav items: simple icon + text row, NO nested icon boxes — matches mockup .sidebar-item style.
 */
export function Sidebar() {
    const pathname = usePathname();
    const t = useTranslation();
    const { user } = useAuthStore();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();
    const { data: requests } = useFriendRequests();
    const pendingCount = requests?.length ?? 0;

    const navItems: NavItem[] = [
        { href: '/dashboard', labelKey: 'nav.dashboard', emoji: '🏠' },
        { href: '/groups',    labelKey: 'nav.groups',    emoji: '👥' },
        { href: '/friends',   labelKey: 'nav.friends',   emoji: '💛' },
        { href: '/profile',   labelKey: 'nav.profile',   emoji: '⚙️' },
    ];

    const isActive = (href: string): boolean => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    /** ตัวอักษรย่อจาก display_name */
    const initials = (name?: string | null) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    return (
        <aside
            className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-50 overflow-hidden group/sidebar"
            style={{
                width: '72px',
                transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'rgba(12, 15, 26, 0.97)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.width = '240px'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.width = '72px'; }}
        >
            {/* ── Logo ───────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 mt-4 mb-6 overflow-hidden whitespace-nowrap" style={{ minHeight: '44px' }}>
                {/* Logo icon — fixed size, no shrink */}
                <div
                    className="flex items-center justify-center rounded-xl text-white font-extrabold text-lg shadow-md select-none"
                    style={{
                        minWidth: '40px',
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }}
                >
                    P
                </div>
                <span
                    className="text-lg font-bold text-[var(--text-primary)] whitespace-nowrap overflow-hidden"
                    style={{ opacity: 0, transition: 'opacity 0.2s', maxWidth: 0 }}
                    ref={(el) => {
                        if (!el) return;
                        const parent = el.closest('aside')!;
                        const show = () => { el.style.opacity = '1'; el.style.maxWidth = '160px'; };
                        const hide = () => { el.style.opacity = '0'; el.style.maxWidth = '0'; };
                        parent.addEventListener('mouseenter', show);
                        parent.addEventListener('mouseleave', hide);
                    }}
                >
                    PayNaiDee
                </span>
            </div>

            {/* ── Nav Items ──────────────────────────────── */}
            <nav className="flex-1 flex flex-col gap-1 px-[10px]">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg overflow-hidden whitespace-nowrap relative transition-all duration-200"
                            style={{
                                padding: '10px 12px',
                                color: active ? 'var(--text-accent, #818cf8)' : 'var(--text-secondary)',
                                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                textDecoration: 'none',
                            }}
                        >
                            {/* Active indicator bar */}
                            {active && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r"
                                    style={{ width: '3px', height: '20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                                />
                            )}

                            {/* Emoji icon — fixed size, centered */}
                            <span
                                className="flex items-center justify-center text-lg leading-none"
                                style={{ minWidth: '24px', width: '24px', textAlign: 'center' }}
                            >
                                {item.emoji}
                            </span>

                            {/* Label — hidden when collapsed */}
                            <span
                                className="text-sm font-medium flex-1 flex items-center justify-between"
                                style={{ opacity: 0, transition: 'opacity 0.2s' }}
                                ref={(el) => {
                                    if (!el) return;
                                    const sidebar = el.closest('aside')!;
                                    const show = () => { el.style.opacity = '1'; };
                                    const hide = () => { el.style.opacity = '0'; };
                                    sidebar.addEventListener('mouseenter', show);
                                    sidebar.addEventListener('mouseleave', hide);
                                }}
                            >
                                {t(item.labelKey)}
                                {item.href === '/friends' && pendingCount > 0 && (
                                    <span className="min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
                                        {pendingCount}
                                    </span>
                                )}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Footer: User + Logout ──────────────────── */}
            {user && (
                <div className="mt-auto" style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* User info */}
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 rounded-lg overflow-hidden whitespace-nowrap transition-all duration-200 hover:bg-white/[0.04]"
                        style={{ padding: '8px 12px' }}
                    >
                        {/* Avatar circle — initials only, no nested boxes */}
                        <div
                            className="flex items-center justify-center rounded-full text-white font-semibold text-sm flex-shrink-0"
                            style={{
                                minWidth: '32px',
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #f472b6, #ec4899)',
                            }}
                        >
                            {initials(user.display_name || user.username)}
                        </div>
                        <div
                            className="flex-1 min-w-0 overflow-hidden"
                            style={{ opacity: 0, transition: 'opacity 0.2s' }}
                            ref={(el) => {
                                if (!el) return;
                                const sidebar = el.closest('aside')!;
                                const show = () => { el.style.opacity = '1'; };
                                const hide = () => { el.style.opacity = '0'; };
                                sidebar.addEventListener('mouseenter', show);
                                sidebar.addEventListener('mouseleave', hide);
                            }}
                        >
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {user.display_name || user.username}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate">@{user.username}</p>
                        </div>
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-lg overflow-hidden whitespace-nowrap transition-all duration-200 disabled:opacity-40"
                        style={{
                            padding: '8px 12px',
                            marginTop: '4px',
                            color: '#fb7185',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(251,113,133,0.06)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                        <span
                            className="text-lg leading-none flex items-center justify-center"
                            style={{ minWidth: '24px', width: '24px', textAlign: 'center' }}
                        >
                            🚪
                        </span>
                        <span
                            className="text-sm font-medium"
                            style={{ opacity: 0, transition: 'opacity 0.2s' }}
                            ref={(el) => {
                                if (!el) return;
                                const sidebar = el.closest('aside')!;
                                const show = () => { el.style.opacity = '1'; };
                                const hide = () => { el.style.opacity = '0'; };
                                sidebar.addEventListener('mouseenter', show);
                                sidebar.addEventListener('mouseleave', hide);
                            }}
                        >
                            {isLoggingOut ? t('common.loading') : t('auth.logout')}
                        </span>
                    </button>
                </div>
            )}
        </aside>
    );
}

export default Sidebar;
