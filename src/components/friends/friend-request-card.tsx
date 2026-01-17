'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardBody } from '@/components/ui/card';
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
        <Card>
            <CardBody className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar
                        src={requester.avatar}
                        alt={requester.display_name || requester.username}
                        fallback={requester.display_name || requester.username}
                        size="md"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                            {requester.display_name || requester.username}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                            @{requester.username}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(request.created_at)}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReject}
                            disabled={isProcessing}
                        >
                            {t('friends.reject')}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAccept}
                            loading={acceptRequest.isPending}
                            disabled={isProcessing}
                        >
                            {t('friends.accept')}
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

export default FriendRequestCard;
