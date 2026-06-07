'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTranslation, useLocale, useSetLocale } from '@/lib/i18n';
import { locales, localeNames } from '@/lib/i18n/config';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/forms/profile-form';

/**
 * Profile Page
 * Displays user profile information and settings
 * Includes language switcher and profile editing
 */
export default function ProfilePage() {
    const t = useTranslation();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const locale = useLocale();
    const setLocale = useSetLocale();
    const [isEditing, setIsEditing] = useState(false);

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const handleEditSuccess = () => {
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    if (!user) {
        return (
            <PageContainer title={t('profile.title')}>
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title={t('profile.title')}>
            <div className="space-y-6 max-w-2xl mx-auto animate-in">
                {/* Profile Information Card */}
                <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-surface-raised)',
                        backdropFilter: 'var(--blur-glass)',
                        WebkitBackdropFilter: 'var(--blur-glass)',
                        border: '1px solid var(--border-glass)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Accent glowing spot */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

                    <div className="p-6 relative">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                            {/* Avatar with beautiful gradient ring */}
                            <div className="relative p-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                                <div className="rounded-full overflow-hidden bg-[var(--bg-base)] p-0.5">
                                    <Avatar
                                        src={user.avatar}
                                        alt={user.display_name || user.username}
                                        size="xl"
                                        className="h-24 w-24 object-cover"
                                    />
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center sm:text-left space-y-1">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                                    {user.display_name || user.username}
                                </h2>
                                <p className="text-sm text-[var(--text-accent)] font-medium">@{user.username}</p>

                                <div className="mt-4 pt-3 space-y-2 border-t border-[var(--border-subtle)] flex flex-col items-center sm:items-start">
                                    {/* Email */}
                                    <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                                        <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>{user.email}</span>
                                    </div>

                                    {/* Phone Number */}
                                    {user.phone_number && (
                                        <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                                            <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{user.phone_number}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Edit Profile Button */}
                                {!isEditing && (
                                    <div className="mt-5 pt-1 text-center sm:text-left">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                            className="px-5 border-[var(--border-glass)] hover:bg-[var(--bg-glass-hover)] transition-all"
                                        >
                                            {t('profile.editProfile')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Edit Form */}
                        {isEditing && (
                            <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                                <ProfileForm
                                    onSuccess={handleEditSuccess}
                                    onCancel={handleCancelEdit}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Preferences Card */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-surface-raised)',
                        backdropFilter: 'var(--blur-glass)',
                        WebkitBackdropFilter: 'var(--blur-glass)',
                        border: '1px solid var(--border-glass)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                >
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                            {t('profile.preferences')}
                        </h3>

                        {/* Language Switcher */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">
                                {t('profile.language')}
                            </label>
                            <div className="flex gap-3">
                                {locales.map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => setLocale(loc)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${locale === loc
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                                                : 'bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)] border border-[var(--border-glass)]'
                                            }`}
                                    >
                                        {localeNames[loc]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Actions Card */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-surface-raised)',
                        backdropFilter: 'var(--blur-glass)',
                        WebkitBackdropFilter: 'var(--blur-glass)',
                        border: '1px solid var(--border-glass)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                >
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                            {t('profile.account')}
                        </h3>

                        {/* Logout Button */}
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleLogout}
                            className="w-full sm:w-auto text-[var(--rose-400)] border-[var(--rose-500)]/30 hover:bg-[var(--rose-500)]/15 hover:text-white transition-all justify-center"
                        >
                            <svg className="h-5 w-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {t('auth.logout')}
                        </Button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}



