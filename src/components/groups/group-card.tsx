'use client';

import { useTranslation } from '@/lib/i18n';
import type { Group } from '@/types/models';

interface GroupCardProps {
    group: Group;
    /** Compact list-row style (for sidebar) vs full card */
    compact?: boolean;
}

// Deterministic color palette for group emoji boxes
const GROUP_COLORS = [
    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#a5b4fc' },  // indigo
    { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#c4b5fd' },  // violet
    { bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.25)', text: '#67e8f9' },  // cyan
    { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)', text: '#6ee7b7' },  // emerald
    { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)', text: '#fde68a' },  // amber
    { bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.25)', text: '#fda4af' }, // rose
];

function getGroupColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
}

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

/** ตรวจสอบว่า avatar เป็น URL รูปภาพหรือไม่ */
function isImageUrl(value?: string): boolean {
    if (!value) return false;
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
}

/** Render avatar content — รูปภาพ, emoji, หรือ initials */
function AvatarContent({ avatar, name, color, className = '' }: {
    avatar?: string;
    name: string;
    color: { bg: string; border: string; text: string };
    className?: string;
}) {
    if (isImageUrl(avatar)) {
        return (
            <div
                className={`flex-shrink-0 rounded-2xl overflow-hidden ${className}`}
                style={{ background: color.bg, border: `1px solid ${color.border}` }}
            >
                <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // fallback ถ้าโหลดรูปไม่ได้
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            parent.style.color = color.text;
                            parent.textContent = getInitials(name);
                            parent.style.display = 'flex';
                            parent.style.alignItems = 'center';
                            parent.style.justifyContent = 'center';
                            parent.style.fontWeight = '700';
                        }
                    }}
                />
            </div>
        );
    }
    return <>{avatar || getInitials(name)}</>;
}

/**
 * GroupCard — glassmorphic group item
 * Shows group with emoji icon box (glass, NOT solid circle)
 * Member count badge, chevron arrow
 */
export function GroupCard({ group, compact = false }: GroupCardProps) {
    const t = useTranslation();
    const memberCount = group.members?.length || 0;
    const color = getGroupColor(group.name);

    if (compact) {
        // List row style for sidebar
        if (isImageUrl(group.avatar)) {
            return (
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all hover:bg-white/[0.04] group">
                    {/* รูปภาพ avatar สำหรับ compact */}
                    <div
                        className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden backdrop-blur-sm"
                        style={{ background: color.bg, border: `1px solid ${color.border}` }}
                    >
                        <img
                            src={group.avatar}
                            alt={group.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{group.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {t('groups.memberCount').replace('{{count}}', String(memberCount))}
                        </p>
                    </div>
                    <svg className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all hover:bg-white/[0.04] group">
                {/* Glassmorphic emoji box */}
                <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold backdrop-blur-sm"
                    style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}
                >
                    {group.avatar || getInitials(group.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{group.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                        {t('groups.memberCount').replace('{{count}}', String(memberCount))}
                    </p>
                </div>
                <svg className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        );
    }

    // Full card style for groups page
    return (
        <div
            className="relative rounded-2xl p-4 cursor-pointer transition-all duration-200 group overflow-hidden"
            style={{
                background: 'var(--bg-surface)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-subtle)',
            }}
        >
            {/* Hover effect: accent border */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ border: `1px solid ${color.border}` }}
            />

            <div className="flex items-center gap-3.5">
                {/* Avatar — รูปภาพหรือ glassmorphic emoji icon box */}
                {isImageUrl(group.avatar) ? (
                    <div
                        className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden backdrop-blur-sm"
                        style={{ background: color.bg, border: `1px solid ${color.border}` }}
                    >
                        <img
                            src={group.avatar}
                            alt={group.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                ) : (
                    <div
                        className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold backdrop-blur-sm"
                        style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}
                    >
                        {group.avatar || getInitials(group.name)}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">
                        {group.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            👤 {memberCount} {memberCount === 1 ? 'คน' : 'คน'}
                        </span>
                    </div>
                </div>

                <svg className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
}

export default GroupCard;
