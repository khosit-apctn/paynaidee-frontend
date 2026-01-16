'use client';

import { useEffect, type ReactNode } from 'react';
import { useI18n } from '@/lib/i18n/use-translation';
import { isValidLocale, type Locale } from '@/lib/i18n/config';

interface I18nProviderProps {
  children: ReactNode;
  /** Optional initial locale to set on mount */
  initialLocale?: Locale;
}

/**
 * I18n Provider Component
 * 
 * Handles initialization of the i18n system including:
 * - Restoring persisted locale preference
 * - Detecting browser language preference as fallback
 * - Setting document lang attribute for accessibility
 */
export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const locale = useI18n((state) => state.locale);
  const setLocale = useI18n((state) => state.setLocale);

  // Set initial locale on mount if provided
  useEffect(() => {
    if (initialLocale && isValidLocale(initialLocale)) {
      setLocale(initialLocale);
    }
  }, [initialLocale, setLocale]);

  // Detect browser language preference on first load (if no persisted preference)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if there's already a persisted locale
    const stored = localStorage.getItem('paynaidee-i18n');
    if (stored) return; // Already has a preference, don't override

    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (isValidLocale(browserLang)) {
      setLocale(browserLang);
    }
  }, [setLocale]);

  // Update document lang attribute when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return <>{children}</>;
}

export default I18nProvider;
