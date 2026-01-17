'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

interface NavItem {
    href: string;
    labelKey: string;
    IconComponent: React.ComponentType<{ active: boolean }>;
}

// SVG Icons for navigation
const DashboardIcon = ({ active }: { active: boolean }) => (
    <svg
        className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
    </svg>
);

const GroupsIcon = ({ active }: { active: boolean }) => (
    <svg
        className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
    </svg>
);

const FriendsIcon = ({ active }: { active: boolean }) => (
    <svg
        className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
    </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg
        className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
    </svg>
);

/**
 * BottomNav Component
 * Fixed bottom navigation for mobile devices
 * Displays Dashboard, Groups, Friends, Profile tabs
 */
export function BottomNav() {
    const pathname = usePathname();
    const t = useTranslation();

    const navItems: NavItem[] = [
        {
            href: '/dashboard',
            labelKey: 'nav.dashboard',
            IconComponent: DashboardIcon,
        },
        {
            href: '/groups',
            labelKey: 'nav.groups',
            IconComponent: GroupsIcon,
        },
        {
            href: '/friends',
            labelKey: 'nav.friends',
            IconComponent: FriendsIcon,
        },
        {
            href: '/profile',
            labelKey: 'nav.profile',
            IconComponent: ProfileIcon,
        },
    ];

    const isActive = (href: string): boolean => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const IconComponent = item.IconComponent;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${active
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <IconComponent active={active} />
                            <span
                                className={`text-xs ${active ? 'font-semibold' : 'font-medium'
                                    }`}
                            >
                                {t(item.labelKey)}
                            </span>
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
            {/* Safe area padding for iOS devices */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
}

export default BottomNav;
