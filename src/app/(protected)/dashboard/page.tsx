'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useGroups } from '@/lib/hooks/use-groups';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Dashboard Page
 * Main landing page for authenticated users
 * Shows groups overview, recent activity, and quick actions
 */
export default function DashboardPage() {
    const t = useTranslation();
    const { user } = useAuthStore();
    const { data: groups, isLoading: isLoadingGroups } = useGroups();

    // Get display name for welcome message
    const displayName = user?.display_name || user?.username || '';

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                    {t('dashboard.welcome').replace('{{name}}', displayName)}
                </h1>
                <p className="text-muted-foreground">
                    {t('dashboard.title')}
                </p>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/groups">
                            <Button variant="primary" size="md">
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {t('nav.groups')}
                            </Button>
                        </Link>
                        <Link href="/friends">
                            <Button variant="outline" size="md">
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                {t('nav.friends')}
                            </Button>
                        </Link>
                    </div>
                </CardBody>
            </Card>

            {/* Groups Overview */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>{t('nav.groups')}</CardTitle>
                    <Link href="/groups">
                        <Button variant="ghost" size="sm">
                            {t('common.next')} →
                        </Button>
                    </Link>
                </CardHeader>
                <CardBody>
                    {isLoadingGroups ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : groups && groups.length > 0 ? (
                        <div className="space-y-3">
                            {groups.slice(0, 5).map((group) => (
                                <Link
                                    key={group.id}
                                    href={`/groups/${group.id}`}
                                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <Avatar
                                        src={group.avatar}
                                        alt={group.name}
                                        fallback={group.name}
                                        size="md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {group.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t('groups.memberCount').replace('{{count}}', String(group.members?.length || 0))}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground mb-4">
                                {t('groups.noGroups')}
                            </p>
                            <Link href="/groups">
                                <Button variant="primary" size="sm">
                                    {t('groups.createFirst')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="text-center py-6">
                        <p className="text-muted-foreground">
                            {t('dashboard.noActivity')}
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
