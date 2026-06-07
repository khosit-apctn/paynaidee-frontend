'use client';

import { useState } from 'react';
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
 * Tabs: Friends, Requests (real backend data), Search
 */
export default function FriendsPage() {
    const t = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('friends');

    const { data: friends, isLoading: friendsLoading } = useFriends();
    const { data: requests, isLoading: requestsLoading } = useFriendRequests();

    const pendingCount = requests?.length ?? 0;

    const tabs = [
        { id: 'friends' as const, label: t('friends.title') },
        {
            id: 'requests' as const,
            label: t('friends.friendRequests'),
            badge: pendingCount > 0 ? pendingCount : undefined,
        },
        { id: 'search' as const, label: t('common.search') },
    ];

    return (
        <div className="space-y-6 px-4 py-5">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t('friends.title')}</h1>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-[var(--border-glass)] pb-px">
                <div className="flex gap-1.5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 rounded-t-xl text-sm font-bold transition-all relative flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'text-[var(--text-primary)] bg-[var(--bg-surface-raised)] border-t border-l border-r border-[var(--border-glass)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]'
                            }`}
                        >
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm">
                                    {tab.badge}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
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
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('friends.title')} ({friends?.length ?? 0} {t('friends.title').toLowerCase()})
                        </p>
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

                {/* Requests Tab — real data from backend */}
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
                                {requests.map((req) => (
                                    <FriendRequestCard key={req.id} request={req} />
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
        </div>
    );
}
