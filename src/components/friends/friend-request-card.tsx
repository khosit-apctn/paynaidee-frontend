'use client';

import { useTranslation } from '@/lib/i18n';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAcceptFriendRequest, useRejectFriendRequest } from '@/lib/hooks/use-friends';
import { useUIStore } from '@/lib/stores/ui-store';
import { formatRelativeTime } from '@/lib/utils/date';
import type { Friendship } from '@/types/models';

interface FriendRequestCardProps {
    request: Friendship;
}

/**
 * FriendRequestCard Component
 * Displays incoming friend request with accept/reject buttons
 * Used in friend requests tab
 */
export function FriendRequestCard({ request }: FriendRequestCardProps) {
    const t = useTranslation();
    const addToast = useUIStore((state) => state.addToast);
    const acceptRequest = useAcceptFriendRequest();
    const rejectRequest = useRejectFriendRequest();

    // The requester is the one who sent us the request
    const requester = request.requester;

    const handleAccept = async () => {
        try {
            await acceptRequest.mutateAsync(request.id);
            addToast({
                type: 'success',
                title: t('friends.requestAccepted'),
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: t('errors.updateFailed'),
            });
        }
    };

    const handleReject = async () => {
        try {
            await rejectRequest.mutateAsync(request.id);
            addToast({
                type: 'success',
                title: t('friends.requestRejected'),
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: t('errors.updateFailed'),
            });
        }
    };

    const isProcessing = acceptRequest.isPending || rejectRequest.isPending;

    return (
        <div
            className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            style={{
                background: 'var(--bg-surface-raised)',
                backdropFilter: 'var(--blur-glass)',
                WebkitBackdropFilter: 'var(--blur-glass)',
                border: '1px solid var(--border-glass)',
            }}
        >
            <div className="p-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative">
                <div className="flex items-center gap-3.5 w-full min-w-0">
                    <Avatar
                        src={requester.avatar}
                        alt={requester.display_name || requester.username}
                        fallback={requester.display_name || requester.username}
                        size="md"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--text-primary)] truncate">
                            {requester.display_name || requester.username}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] truncate">
                            @{requester.username}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">
                            {formatRelativeTime(request.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="px-4 py-2 border-[var(--border-glass)] hover:bg-[var(--bg-glass-hover)] transition-all font-semibold"
                    >
                        {t('friends.reject')}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAccept}
                        loading={acceptRequest.isPending}
                        disabled={isProcessing}
                        className="px-4 py-2 font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-md shadow-indigo-500/20"
                    >
                        {t('friends.accept')}
                    </Button>
                </div>
            </div>
        </div>
    );

}

export default FriendRequestCard;
