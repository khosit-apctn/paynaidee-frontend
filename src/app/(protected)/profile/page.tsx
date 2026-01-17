'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTranslation, useLocale, useSetLocale } from '@/lib/i18n';
import { locales, localeNames } from '@/lib/i18n/config';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Profile Information Card */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <Avatar
                                src={user.avatar}
                                alt={user.display_name || user.username}
                                size="xl"
                            />

                            {/* User Info */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {user.display_name || user.username}
                                </h2>
                                <p className="text-muted-foreground">@{user.username}</p>

                                <div className="mt-4 space-y-2">
                                    {/* Email */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-foreground">{user.email}</span>
                                    </div>

                                    {/* Phone Number */}
                                    {user.phone_number && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span className="text-foreground">{user.phone_number}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Edit Profile Button */}
                                {!isEditing && (
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            {t('profile.editProfile')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Edit Form */}
                        {isEditing && (
                            <div className="mt-6 pt-6 border-t border-border">
                                <ProfileForm
                                    onSuccess={handleEditSuccess}
                                    onCancel={handleCancelEdit}
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Preferences Card */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            {t('profile.preferences')}
                        </h3>

                        {/* Language Switcher */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('profile.language')}
                            </label>
                            <div className="flex gap-3">
                                {locales.map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => setLocale(loc)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${locale === loc
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        {localeNames[loc]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Account Actions Card */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            {t('profile.account')}
                        </h3>

                        {/* Logout Button */}
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleLogout}
                            className="w-full sm:w-auto text-error border-error hover:bg-error hover:text-white"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {t('auth.logout')}
                        </Button>
                    </div>
                </Card>
            </div>
        </PageContainer>
    );
}
