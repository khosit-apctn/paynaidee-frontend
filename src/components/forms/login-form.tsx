'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/utils/validation';
import { useLogin } from '@/lib/hooks/use-auth';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * LoginForm Component
 * Login form with username/password fields, validation, and error handling
 * Uses React Hook Form with Zod validation
 */
export function LoginForm() {
    const t = useTranslation();
    const { mutate: login, isPending, error } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginInput) => {
        login(data);
    };

    // Get error message for API errors
    const getApiErrorMessage = (): string | null => {
        if (!error) return null;

        // Handle different error types
        if (error instanceof Error) {
            // Check for specific error codes
            if (error.message.includes('invalid_credentials') || error.message.includes('401')) {
                return t('errors.invalidCredentials');
            }
            if (error.message.includes('network') || error.message.includes('fetch')) {
                return t('errors.networkError');
            }
            return error.message;
        }

        return t('errors.unknown');
    };

    const apiError = getApiErrorMessage();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* API Error Alert */}
            {apiError && (
                <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
                    <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{apiError}</span>
                    </div>
                </div>
            )}

            {/* Username Field */}
            <Input
                id="username"
                label={t('auth.username')}
                type="text"
                placeholder={t('auth.username')}
                autoComplete="username"
                disabled={isPending}
                error={errors.username?.message}
                {...register('username')}
            />

            {/* Password Field */}
            <div className="relative">
                <Input
                    id="password"
                    label={t('auth.password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    autoComplete="current-password"
                    disabled={isPending}
                    error={errors.password?.message}
                    {...register('password')}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isPending}
                className="w-full"
            >
                {t('auth.login')}
            </Button>
        </form>
    );
}

export default LoginForm;
