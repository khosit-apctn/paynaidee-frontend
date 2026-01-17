'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/lib/i18n';
import { useCreateGroup, useUpdateGroup } from '@/lib/hooks/use-groups';
import { createGroupSchema, type CreateGroupInput } from '@/lib/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Group } from '@/types/models';

interface GroupFormProps {
    mode: 'create' | 'edit';
    group?: Group;
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * GroupForm Component
 * Form for creating or editing groups
 * Uses React Hook Form with Zod validation
 */
export function GroupForm({ mode, group, onSuccess, onCancel }: GroupFormProps) {
    const t = useTranslation();
    const createGroup = useCreateGroup();
    const updateGroup = useUpdateGroup(group?.id || 0);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateGroupInput>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: group?.name || '',
            avatar: group?.avatar || '',
        },
    });

    const onSubmit = async (data: CreateGroupInput) => {
        try {
            if (mode === 'create') {
                await createGroup.mutateAsync({
                    name: data.name,
                    avatar: data.avatar || undefined,
                });
            } else if (group) {
                await updateGroup.mutateAsync({
                    name: data.name,
                    avatar: data.avatar || undefined,
                });
            }
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save group:', error);
        }
    };

    const isPending = createGroup.isPending || updateGroup.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Group Name */}
            <Input
                label={t('groups.groupName')}
                placeholder={t('groups.groupName')}
                error={errors.name?.message}
                disabled={isPending}
                {...register('name')}
            />

            {/* Group Avatar URL */}
            <Input
                label={t('groups.groupAvatar')}
                placeholder="https://example.com/avatar.png"
                error={errors.avatar?.message}
                disabled={isPending}
                {...register('avatar')}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isPending}
                    >
                        {t('common.cancel')}
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="primary"
                    loading={isPending}
                    disabled={isPending}
                >
                    {mode === 'create' ? t('common.create') : t('common.save')}
                </Button>
            </div>
        </form>
    );
}

export default GroupForm;
