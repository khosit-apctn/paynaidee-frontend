'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { useTranslation } from '@/lib/i18n';
import { useFriends, useFriendRequests } from '@/lib/hooks/use-friends';
import { FriendCard } from '@/components/friends/friend-card';
import { FriendRequestCard } from '@/components/friends/friend-request-card';
import { FriendSearch } from '@/components/friends/friend-search';
import { Skeleton } from '@/components/ui/skeleton';

type TabType = 'friends' | 'requests' | 'search';

/**
 * Friends Page
 * Main page for managing friendships with tabbed interface
 * Tabs: Friends, Requests, Search
 */
export default function FriendsPage() {
    const t = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('friends');

    const { data: friends, isLoading: friendsLoading } = useFriends();
    const { data: requests, isLoading: requestsLoading } = useFriendRequests();

    const tabs = [
        { id: 'friends' as const, label: t('friends.title') },
        { id: 'requests' as const, label: t('friends.friendRequests') },
        { id: 'search' as const, label: t('common.search') },
    ];

    return (
        <PageContainer title={t('friends.title')}>
            {/* Tabs */}
            <div className="mb-6">
                <div className="flex gap-2 border-b border-border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
                {/* Friends Tab */}
                {activeTab === 'friends' && (
                    <div>
                        {friendsLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : friends && friends.length > 0 ? (
                            <div className="space-y-3">
                                {friends.map((friend) => (
                                    <FriendCard key={friend.id} friend={friend} />
                                ))}
                            </div>
                        ) : (
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
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                <p className="text-muted-foreground font-medium">
                                    {t('friends.noFriends')}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('friends.findFriends')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div>
                        {requestsLoading ? (
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        ) : requests && requests.length > 0 ? (
                            <div className="space-y-3">
                                {requests.map((request) => (
                                    <FriendRequestCard key={request.id} request={request} />
                                ))}
                            </div>
                        ) : (
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-muted-foreground font-medium">
                                    {t('friends.noRequests')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <div>
                        <FriendSearch />
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
