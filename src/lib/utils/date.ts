/**
 * Date/time formatting utilities with Asia/Bangkok timezone support
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';

// Configure Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const BANGKOK_TZ = 'Asia/Bangkok';

/**
 * Format a date string with a custom format
 * @param date - ISO date string or Date object
 * @param format - Day.js format string (default: 'DD MMM YYYY')
 * @returns Formatted date string in Bangkok timezone
 */
export function formatDate(date: string | Date, format = 'DD MMM YYYY'): string {
  return dayjs(date).tz(BANGKOK_TZ).format(format);
}

/**
 * Format a date with time
 * @param date - ISO date string or Date object
 * @returns Formatted date and time string (e.g., "15 Jan 2025 14:30")
 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).tz(BANGKOK_TZ).format('DD MMM YYYY HH:mm');
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param date - ISO date string or Date object
 * @param locale - Locale for relative time ('en' or 'th')
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date, locale: 'en' | 'th' = 'th'): string {
  return dayjs(date).tz(BANGKOK_TZ).locale(locale).fromNow();
}

/**
 * Format a date for chat messages (smart formatting based on recency)
 * - Today: "14:30"
 * - Yesterday: "Yesterday 14:30"
 * - Older: "15/01 14:30"
 * @param date - ISO date string or Date object
 * @returns Smart formatted time string
 */
export function formatChatTime(date: string | Date): string {
  const d = dayjs(date).tz(BANGKOK_TZ);
  const now = dayjs().tz(BANGKOK_TZ);

  if (d.isSame(now, 'day')) {
    return d.format('HH:mm');
  }
  if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return `Yesterday ${d.format('HH:mm')}`;
  }
  return d.format('DD/MM HH:mm');
}

/**
 * Get the configured Day.js instance with Bangkok timezone
 * Useful for custom date operations
 */
export function getBangkokTime(date?: string | Date): dayjs.Dayjs {
  return dayjs(date).tz(BANGKOK_TZ);
}

/**
 * Check if a date is today in Bangkok timezone
 */
export function isToday(date: string | Date): boolean {
  return dayjs(date).tz(BANGKOK_TZ).isSame(dayjs().tz(BANGKOK_TZ), 'day');
}

/**
 * Check if a date is yesterday in Bangkok timezone
 */
export function isYesterday(date: string | Date): boolean {
  return dayjs(date).tz(BANGKOK_TZ).isSame(dayjs().tz(BANGKOK_TZ).subtract(1, 'day'), 'day');
}
