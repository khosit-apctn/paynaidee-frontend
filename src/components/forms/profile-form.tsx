'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/utils/validation';
import { updateProfile } from '@/lib/api/users';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/ui-store';

interface ProfileFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * ProfileForm Component
 * Form for editing user profile (display name, avatar, phone number)
 * Uses React Hook Form with Zod validation
 */
export function ProfileForm({ onSuccess, onCancel }: ProfileFormProps) {
    const t = useTranslation();
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const addToast = useUIStore((state) => state.addToast);
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            display_name: user?.display_name || '',
            avatar: user?.avatar || '',
            phone_number: user?.phone_number || '',
        },
    });

    const { mutate: updateProfileMutation, isPending } = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            // Update auth store with new user data
            updateUser(data);

            // Invalidate user queries
            queryClient.invalidateQueries({ queryKey: ['user'] });

            // Show success toast
            addToast({
                title: t('profile.editProfile'),
                message: t('profile.updateSuccess'),
                type: 'success',
            });

            // Call onSuccess callback
            onSuccess?.();
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : t('errors.updateFailed');
            addToast({
                title: t('errors.updateFailed'),
                message: errorMessage,
                type: 'error',
            });
        },
    });

    const onSubmit = (data: UpdateProfileInput) => {
        // Only send non-empty fields
        const payload: UpdateProfileInput = {};
        if (data.display_name && data.display_name.trim()) {
            payload.display_name = data.display_name.trim();
        }
        if (data.avatar && data.avatar.trim()) {
            payload.avatar = data.avatar.trim();
        }
        if (data.phone_number && data.phone_number.trim()) {
            payload.phone_number = data.phone_number.trim();
        }

        updateProfileMutation(payload);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Name Field */}
            <Input
                id="display_name"
                label={t('auth.displayName')}
                type="text"
                placeholder={t('auth.displayName')}
                disabled={isPending}
                error={errors.display_name?.message}
                {...register('display_name')}
            />

            {/* Avatar URL Field */}
            <Input
                id="avatar"
                label={t('profile.changeAvatar')}
                type="text"
                placeholder="https://example.com/avatar.jpg"
                disabled={isPending}
                error={errors.avatar?.message}
                helperText={t('common.optional')}
                {...register('avatar')}
            />

            {/* Phone Number Field */}
            <Input
                id="phone_number"
                label={t('auth.phoneNumber')}
                type="tel"
                placeholder="0812345678"
                disabled={isPending}
                error={errors.phone_number?.message}
                helperText={t('common.optional')}
                {...register('phone_number')}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isPending}
                    disabled={!isDirty}
                    className="flex-1"
                >
                    {t('common.save')}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={onCancel}
                        disabled={isPending}
                        className="flex-1"
                    >
                        {t('common.cancel')}
                    </Button>
                )}
            </div>
        </form>
    );
}

export default ProfileForm;
