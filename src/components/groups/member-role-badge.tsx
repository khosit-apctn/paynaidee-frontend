'use client';

import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

interface MemberRoleBadgeProps {
    role: 'admin' | 'member';
}

/**
 * MemberRoleBadge — glassmorphic role pill
 */
export function MemberRoleBadge({ role }: MemberRoleBadgeProps) {
    const t = useTranslation();

    if (role === 'admin') {
        return (
            <Badge variant="primary">
                ⭐ {t('groups.admin')}
            </Badge>
        );
    }

    return (
        <Badge variant="default">
            {t('groups.member')}
        </Badge>
    );
}

export default MemberRoleBadge;
