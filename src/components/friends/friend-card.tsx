'use client';

import { Avatar } from '@/components/ui/avatar';
import type { User } from '@/types/models';

interface FriendCardProps {
    friend: User;
}

/**
 * FriendCard Component
 * Displays friend information with dark glassmorphic styling
 * _Requirements: Rich aesthetics, micro-animations_
 */
export function FriendCard({ friend }: FriendCardProps) {
    return (
        <div
            className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
                background: 'var(--bg-surface-raised)',
                backdropFilter: 'var(--blur-glass)',
                WebkitBackdropFilter: 'var(--blur-glass)',
                border: '1px solid var(--border-glass)',
            }}
        >
            {/* Top glass reflection light */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-4 flex items-center gap-3.5 relative">
                {/* Avatar with gradient outline on hover */}
                <div className="relative p-0.5 rounded-full transition-all duration-300 group-hover:bg-gradient-to-tr group-hover:from-indigo-500 group-hover:to-purple-500">
                    <div className="rounded-full overflow-hidden bg-[var(--bg-surface-raised)] p-0.5">
                        <Avatar
                            src={friend.avatar}
                            alt={friend.display_name || friend.username}
                            fallback={friend.display_name || friend.username}
                            size="md"
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors truncate">
                        {friend.display_name || friend.username}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] truncate">
                        @{friend.username}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FriendCard;

