'use client';

import { Card, CardBody } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import type { User } from '@/types/models';

interface FriendCardProps {
    friend: User;
}

/**
 * FriendCard Component
 * Displays friend information
 * Used in friends list tab
 */
export function FriendCard({ friend }: FriendCardProps) {

    return (
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
                </div>
            </CardBody>
        </Card>
    );
}

export default FriendCard;
