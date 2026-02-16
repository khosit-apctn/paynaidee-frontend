'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { searchUsers } from '@/lib/api/users';
import { Card, CardBody } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { useSendFriendRequest } from '@/lib/hooks/use-friends';
import { useUIStore } from '@/lib/stores/ui-store';
import type { User } from '@/types/models';

const SEARCH_LIMIT = 10;

/**
 * FriendSearch Component
 * Search for users with paginated results
 * Shows friendship status and allows sending friend requests
 */
export function FriendSearch() {
    const t = useTranslation();
    const addToast = useUIStore((state) => state.addToast);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [offset, setOffset] = useState(0);
    const sendFriendRequest = useSendFriendRequest();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setOffset(0); // Reset offset when query changes
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search users query
    const { data, isLoading, error } = useQuery({
        queryKey: ['users', 'search', debouncedQuery, offset],
        queryFn: () =>
            searchUsers({
                query: debouncedQuery,
                limit: SEARCH_LIMIT,
                offset,
            }),
        enabled: debouncedQuery.length > 0,
    });

    const handleSendRequest = async (userId: number) => {
        try {
            await sendFriendRequest.mutateAsync({ addressee_id: userId });
            addToast({
                type: 'success',
                title: t('friends.requestSentSuccess'),
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: t('errors.createFailed'),
            });
        }
    };

    const loadMore = () => {
        setOffset((prev) => prev + SEARCH_LIMIT);
    };

    const hasMore = data && data.length === SEARCH_LIMIT;

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <Input
                type="text"
                placeholder={t('friends.searchFriends')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
            />

            {/* Search Results */}
            {debouncedQuery.length === 0 ? (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-muted-foreground mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <p className="text-muted-foreground font-medium">
                        {t('friends.searchUsers')}
                    </p>
                </div>
            ) : isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-destructive">{t('errors.loadFailed')}</p>
                </div>
            ) : data && data.length > 0 ? (
                <>
                    <div className="space-y-3">
                        {data.map((user) => (
                            <UserSearchCard
                                key={user.id}
                                user={user}
                                onSendRequest={handleSendRequest}
                            />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="flex justify-center pt-2">
                            <Button variant="outline" onClick={loadMore}>
                                {t('chat.loadMore')}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('common.noResults')}</p>
                </div>
            )}
        </div>
    );
}

interface UserSearchCardProps {
    user: User;
    onSendRequest: (userId: number) => Promise<void>;
}

/**
 * UserSearchCard Component
 * Displays user in search results with friendship status
 */
function UserSearchCard({ user, onSendRequest }: UserSearchCardProps) {
    const t = useTranslation();
    const sendFriendRequest = useSendFriendRequest();

    return (
        <Card>
            <CardBody className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={user.avatar}
                        alt={user.display_name || user.username}
                        fallback={user.display_name || user.username}
                        size="md"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                            {user.display_name || user.username}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                            @{user.username}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onSendRequest(user.id)}
                            loading={sendFriendRequest.isPending}
                        >
                            {t('friends.sendRequest')}
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

export default FriendSearch;
