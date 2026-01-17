'use client';

import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

interface MemberRoleBadgeProps {
    role: 'admin' | 'member';
}

/**
 * MemberRoleBadge Component
 * Displays a badge indicating the member's role (Admin or Member)
 */
export function MemberRoleBadge({ role }: MemberRoleBadgeProps) {
    const t = useTranslation();

    if (role === 'admin') {
        return (
            <Badge variant="primary">
                {t('groups.admin')}
            </Badge>
        );
    }

    return (
        <Badge variant="secondary">
            {t('groups.member')}
        </Badge>
    );
}

export default MemberRoleBadge;
