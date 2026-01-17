'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardBody } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import type { Group } from '@/types/models';

interface GroupCardProps {
    group: Group;
}

/**
 * GroupCard Component
 * Displays group information in a card format
 * Used in groups list and dashboard
 */
export function GroupCard({ group }: GroupCardProps) {
    const t = useTranslation();

    const memberCount = group.members?.length || 0;

    return (
        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={group.avatar}
                        alt={group.name}
                        fallback={group.name}
                        size="lg"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                            {group.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('groups.memberCount').replace('{{count}}', String(memberCount))}
                        </p>
                    </div>
                    <svg
                        className="h-5 w-5 text-muted-foreground flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </CardBody>
        </Card>
    );
}

export default GroupCard;
