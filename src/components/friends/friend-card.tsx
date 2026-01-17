'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardBody } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useRemoveFriend } from '@/lib/hooks/use-friends';
import { useUIStore } from '@/lib/stores/ui-store';
import type { User } from '@/types/models';

interface FriendCardProps {
    friend: User;
}

/**
 * FriendCard Component
 * Displays friend information with unfriend action
 * Used in friends list tab
 */
export function FriendCard({ friend }: FriendCardProps) {
    const t = useTranslation();
    const addToast = useUIStore((state) => state.addToast);
    const [showConfirm, setShowConfirm] = useState(false);
    const removeFriend = useRemoveFriend();

    const handleUnfriend = async () => {
        try {
            // Note: We need the friendship ID, not the user ID
            // For now, we'll assume the friend object has the friendship_id
            // This may need adjustment based on actual API response
            await removeFriend.mutateAsync(friend.id);
            addToast({
                type: 'success',
                title: t('friends.removed'),
            });
            setShowConfirm(false);
        } catch (error) {
            addToast({
                type: 'error',
                title: t('errors.updateFailed'),
            });
        }
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={friend.avatar}
                            alt={friend.display_name || friend.username}
                            fallback={friend.display_name || friend.username}
                            size="md"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                                {friend.display_name || friend.username}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                                @{friend.username}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowConfirm(true)}
                            className="shrink-0"
                        >
                            {t('friends.unfriend')}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Unfriend Confirmation Modal */}
            <Modal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                title={t('common.confirm')}
            >
                <div className="space-y-4">
                    <p className="text-foreground">
                        {t('friends.unfriendConfirm').replace(
                            '{{name}}',
                            friend.display_name || friend.username
                        )}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirm(false)}
                            disabled={removeFriend.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUnfriend}
                            loading={removeFriend.isPending}
                        >
                            {t('common.confirm')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default FriendCard;
