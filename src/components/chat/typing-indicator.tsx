'use client';

import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n';
import { useChatStore } from '@/lib/stores/chat-store';

interface TypingIndicatorProps {
    groupId: number;
    className?: string;
}

/**
 * TypingIndicator Component
 * Shows who is currently typing in the chat
 * Automatically displays typing users from the chat store
 * _Requirements: 2.7_
 */
export function TypingIndicator({ groupId, className }: TypingIndicatorProps) {
    const t = useTranslation();
    const typingUsers = useChatStore((state) => state.getTypingUsers(groupId));

    if (typingUsers.length === 0) {
        return null;
    }

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return t('chat.typing').replace('{{name}}', typingUsers[0].username);
        }
        return t('chat.typingMultiple').replace('{{count}}', String(typingUsers.length));
    };

    return (
        <div className={cn('flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground', className)}>
            {/* Animated dots */}
            <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
            </div>
            <span>{getTypingText()}</span>
        </div>
    );
}

export default TypingIndicator;
