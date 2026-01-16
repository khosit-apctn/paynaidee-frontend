/**
 * i18n Configuration
 * Defines supported locales and default settings for PayNaiDee
 */

export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'th';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  th: '🇹🇭',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
