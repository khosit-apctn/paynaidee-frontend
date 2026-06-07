'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/utils/validation';
import { useRegister } from '@/lib/hooks/use-auth';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * RegisterForm — glassmorphic register card
 * Deep glass surface with gradient logo, glass inputs, accent gradient submit
 */
export function RegisterForm() {
    const t = useTranslation();
    const { mutate: registerUser, isPending, error } = useRegister();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            phone_number: '',
            display_name: '',
        },
    });

    // Helper to format 10-digit Thai phone number to E.164
    const formatToE164 = (phone: string): string => {
        if (!phone) return '';
        const trimmed = phone.trim();
        // Check if it's 10 digits starting with '0'
        if (/^0\d{9}$/.test(trimmed)) {
            return `+66${trimmed.substring(1)}`;
        }
        return trimmed;
    };

    const onSubmit = (data: RegisterInput) => {
        // Format phone number to E.164 if provided
        const payload = {
            ...data,
            phone_number: data.phone_number ? formatToE164(data.phone_number) : undefined,
            display_name: data.display_name || undefined,
        };
        registerUser(payload);
    };

    const getApiErrorMessage = (): string | null => {
        if (!error) return null;
        if (error instanceof Error) {
            if (error.message.includes('duplicate_username') || error.message.includes('409')) {
                return t('errors.usernameTaken') || 'Username is already taken';
            }
            if (error.message.includes('duplicate_email')) {
                return t('errors.emailTaken') || 'Email is already registered';
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
        <div
            className="relative rounded-3xl overflow-hidden animate-in"
            style={{
                background: 'var(--bg-surface-raised)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
        >
            {/* Top gradient shimmer line */}
            <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.50), transparent)' }} />

            {/* Ambient inner glow */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)' }} />

            <div className="relative p-8">
                {/* Logo */}
                <div className="flex items-center gap-3 justify-center mb-8">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-extrabold text-2xl select-none"
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            boxShadow: '0 6px 20px rgba(79,70,229,0.45)',
                        }}
                    >
                        P
                    </div>
                    <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                        PayNaiDee
                    </span>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {t('auth.createAccount') || 'Create Account'}
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                        {t('auth.signUpSubtitle') || 'Join PayNaiDee to easily share bills with friends'}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* API Error */}
                    {apiError && (
                        <div
                            className="rounded-xl p-3.5 text-sm flex items-center gap-2.5"
                            style={{
                                background: 'rgba(251,113,133,0.10)',
                                border: '1px solid rgba(251,113,133,0.25)',
                                color: 'var(--rose-400)',
                            }}
                        >
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apiError}
                        </div>
                    )}

                    {/* Username */}
                    <Input
                        id="username"
                        label={t('auth.username') || 'Username'}
                        type="text"
                        placeholder={t('auth.usernamePlaceholder') || 'Enter username'}
                        autoComplete="username"
                        disabled={isPending}
                        error={errors.username?.message}
                        leftIcon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                        {...register('username')}
                    />

                    {/* Email */}
                    <Input
                        id="email"
                        label={t('auth.email') || 'Email'}
                        type="email"
                        placeholder={t('auth.emailPlaceholder') || 'Enter email address'}
                        autoComplete="email"
                        disabled={isPending}
                        error={errors.email?.message}
                        leftIcon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                        {...register('email')}
                    />

                    {/* Phone Number */}
                    <Input
                        id="phone_number"
                        label={t('auth.phoneNumber') || 'Phone Number'}
                        type="tel"
                        placeholder={t('auth.phoneNumberPlaceholder') || 'e.g. 0812345678'}
                        disabled={isPending}
                        error={errors.phone_number?.message}
                        leftIcon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        }
                        {...register('phone_number')}
                    />

                    {/* Display Name */}
                    <Input
                        id="display_name"
                        label={t('auth.displayName') || 'Display Name'}
                        type="text"
                        placeholder={t('auth.displayNamePlaceholder') || 'e.g. Somchai'}
                        disabled={isPending}
                        error={errors.display_name?.message}
                        leftIcon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        {...register('display_name')}
                    />

                    {/* Password */}
                    <Input
                        id="password"
                        label={t('auth.password') || 'Password'}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.passwordPlaceholder') || 'Choose a password'}
                        autoComplete="new-password"
                        disabled={isPending}
                        error={errors.password?.message}
                        leftIcon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        }
                        {...register('password')}
                    />

                    {/* Submit */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={isPending}
                        className="w-full mt-4"
                    >
                        {t('auth.register') || 'Register'}
                    </Button>
                </form>

                {/* Login link */}
                <div className="mt-6 text-center text-sm">
                    <span className="text-[var(--text-muted)]">{t('auth.hasAccount') || 'Already have an account?'}{' '}</span>
                    <Link
                        href="/login"
                        className="font-semibold text-[var(--indigo-300)] hover:text-[var(--indigo-400)] transition-colors"
                    >
                        {t('auth.login') || 'Login'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterForm;
