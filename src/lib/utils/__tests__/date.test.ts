import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatChatTime,
  isToday,
  isYesterday,
} from '../date';

describe('formatDate', () => {
  it('formats date with default format', () => {
    const result = formatDate('2025-01-15T10:30:00Z');
    expect(result).toMatch(/15 Jan 2025/);
  });

  it('formats date with custom format', () => {
    const result = formatDate('2025-01-15T10:30:00Z', 'YYYY-MM-DD');
    expect(result).toBe('2025-01-15');
  });

  it('handles Date objects', () => {
    const date = new Date('2025-06-20T08:00:00Z');
    const result = formatDate(date, 'DD/MM/YYYY');
    expect(result).toBe('20/06/2025');
  });
});

describe('formatDateTime', () => {
  it('formats date with time', () => {
    // 10:30 UTC = 17:30 Bangkok (UTC+7)
    const result = formatDateTime('2025-01-15T10:30:00Z');
    expect(result).toMatch(/15 Jan 2025 17:30/);
  });

  it('handles midnight correctly', () => {
    // 17:00 UTC = 00:00 next day Bangkok
    const result = formatDateTime('2025-01-15T17:00:00Z');
    expect(result).toMatch(/16 Jan 2025 00:00/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats recent time in English', () => {
    const result = formatRelativeTime('2025-01-16T11:00:00Z', 'en');
    expect(result).toMatch(/hour ago/i);
  });

  it('formats recent time in Thai', () => {
    const result = formatRelativeTime('2025-01-16T11:00:00Z', 'th');
    // Thai locale should return Thai text
    expect(result).toBeTruthy();
  });

  it('formats days ago', () => {
    const result = formatRelativeTime('2025-01-14T12:00:00Z', 'en');
    expect(result).toMatch(/2 days ago/i);
  });
});

describe('formatChatTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set current time to Jan 16, 2025 19:00 Bangkok (12:00 UTC)
    vi.setSystemTime(new Date('2025-01-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats today as time only', () => {
    // 10:30 UTC = 17:30 Bangkok, same day
    const result = formatChatTime('2025-01-16T10:30:00Z');
    expect(result).toBe('17:30');
  });

  it('formats yesterday with "Yesterday" prefix', () => {
    // Jan 15 10:30 UTC = Jan 15 17:30 Bangkok
    const result = formatChatTime('2025-01-15T10:30:00Z');
    expect(result).toBe('Yesterday 17:30');
  });

  it('formats older dates with date and time', () => {
    // Jan 10 10:30 UTC = Jan 10 17:30 Bangkok
    const result = formatChatTime('2025-01-10T10:30:00Z');
    expect(result).toBe('10/01 17:30');
  });
});

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for today', () => {
    expect(isToday('2025-01-16T10:00:00Z')).toBe(true);
  });

  it('returns false for yesterday', () => {
    expect(isToday('2025-01-15T10:00:00Z')).toBe(false);
  });

  it('returns false for tomorrow', () => {
    expect(isToday('2025-01-17T10:00:00Z')).toBe(false);
  });
});

describe('isYesterday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for yesterday', () => {
    expect(isYesterday('2025-01-15T10:00:00Z')).toBe(true);
  });

  it('returns false for today', () => {
    expect(isYesterday('2025-01-16T10:00:00Z')).toBe(false);
  });

  it('returns false for two days ago', () => {
    expect(isYesterday('2025-01-14T10:00:00Z')).toBe(false);
  });
});
