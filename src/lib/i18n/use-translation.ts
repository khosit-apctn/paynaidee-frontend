/**
 * i18n Translation Hook
 * Zustand store for managing locale and translations with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from './config';
import { defaultLocale, isValidLocale } from './config';

// Import translation files
import en from './locales/en.json';
import th from './locales/th.json';

const translations: Record<Locale, Record<string, unknown>> = { en, th };

type TranslationParams = Record<string, string | number>;

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[key];
  }

  return value;
}

/**
 * Interpolate parameters into a translation string
 * Supports {{param}} syntax
 */
function interpolate(str: string, params: TranslationParams): string {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    str
  );
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: defaultLocale,

      setLocale: (locale: Locale) => {
        if (isValidLocale(locale)) {
          set({ locale });
        }
      },

      t: (key: string, params?: TranslationParams): string => {
        const { locale } = get();
        const value = getNestedValue(translations[locale], key);

        // Return key if translation not found
        if (typeof value !== 'string') {
          // Fallback to English if not found in current locale
          if (locale !== 'en') {
            const fallbackValue = getNestedValue(translations.en, key);
            if (typeof fallbackValue === 'string') {
              return params ? interpolate(fallbackValue, params) : fallbackValue;
            }
          }
          return key;
        }

        return params ? interpolate(value, params) : value;
      },
    }),
    {
      name: 'paynaidee-i18n',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

/**
 * Hook to get the current locale
 */
export function useLocale(): Locale {
  return useI18n((state) => state.locale);
}

/**
 * Hook to get the setLocale function
 */
export function useSetLocale(): (locale: Locale) => void {
  return useI18n((state) => state.setLocale);
}

/**
 * Hook to get the translation function
 */
export function useTranslation(): (key: string, params?: TranslationParams) => string {
  return useI18n((state) => state.t);
}
