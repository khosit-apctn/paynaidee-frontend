'use client';
import { DashboardNav } from './dashboard-nav';
import { GroupSidebar } from './group-sidebar';
import { DashboardChat } from './dashboard-chat';
import { ContextSidebar } from './context-sidebar';

/**
 * DashboardLayout
 * 4-column responsive grid shell:
 * - Desktop (xl): nav rail | group sidebar | chat | context sidebar
 * - Tablet (md): nav rail | group sidebar | chat
 * - Mobile: single column with bottom nav
 */
export function DashboardLayout() {
    return (
        <div className="h-screen bg-dash-bg text-dash-text overflow-hidden">
            {/* 4-column grid */}
            <div className="flex h-full">
                {/* Column 1: Nav Rail — hidden on mobile */}
                <div className="hidden md:block">
                    <DashboardNav />
                </div>

                {/* Column 2: Group Sidebar — hidden on mobile, shown as overlay on tablet */}
                <div className="hidden md:block md:w-80 md:flex-shrink-0 border-r border-dash-border">
                    <GroupSidebar />
                </div>

                {/* Column 3: Main Chat Area — always visible */}
                <div className="flex-1 min-w-0">
                    <DashboardChat />
                </div>

                {/* Column 4: Context Sidebar — only on xl+ */}
                <div className="hidden xl:block xl:w-[360px] xl:flex-shrink-0 border-l border-dash-border">
                    <ContextSidebar />
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
                <MobileBottomNav />
            </div>
        </div>
    );
}

/** Minimal mobile bottom nav for dashboard */
function MobileBottomNav() {
    const navItems = [
        { icon: '⊞', label: 'Dashboard' },
        { icon: '👥', label: 'Groups' },
        { icon: '💬', label: 'Chat' },
        { icon: '👤', label: 'Profile' },
    ];

    return (
        <nav className="flex items-center justify-around glass-card rounded-none border-t border-dash-border px-2 py-3">
            {navItems.map((item) => (
                <button
                    key={item.label}
                    className="flex flex-col items-center gap-1 text-dash-text-muted hover:text-dash-accent transition-colors"
                >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px]">{item.label}</span>
                </button>
            ))}
        </nav>
    );
}

export default DashboardLayout;
