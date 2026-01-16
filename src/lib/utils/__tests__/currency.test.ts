import { describe, it, expect } from 'vitest';
import { formatThaiCurrency, formatCompactCurrency } from '../currency';

describe('formatThaiCurrency', () => {
  it('formats positive amounts with Thai Baht symbol', () => {
    expect(formatThaiCurrency(1234.56)).toBe('฿1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatThaiCurrency(0)).toBe('฿0.00');
  });

  it('formats negative amounts', () => {
    expect(formatThaiCurrency(-500)).toBe('-฿500.00');
  });

  it('formats large amounts with thousand separators', () => {
    expect(formatThaiCurrency(1234567.89)).toBe('฿1,234,567.89');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatThaiCurrency(99.999)).toBe('฿100.00');
  });

  it('pads with zeros for whole numbers', () => {
    expect(formatThaiCurrency(100)).toBe('฿100.00');
  });

  it('handles small decimal amounts', () => {
    expect(formatThaiCurrency(0.01)).toBe('฿0.01');
  });
});

describe('formatCompactCurrency', () => {
  it('formats millions with M suffix', () => {
    expect(formatCompactCurrency(1000000)).toBe('฿1.0M');
    expect(formatCompactCurrency(1500000)).toBe('฿1.5M');
    expect(formatCompactCurrency(12345678)).toBe('฿12.3M');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCompactCurrency(1000)).toBe('฿1.0K');
    expect(formatCompactCurrency(1500)).toBe('฿1.5K');
    expect(formatCompactCurrency(999000)).toBe('฿999.0K');
  });

  it('formats amounts under 1000 as regular currency', () => {
    expect(formatCompactCurrency(999)).toBe('฿999.00');
    expect(formatCompactCurrency(500)).toBe('฿500.00');
    expect(formatCompactCurrency(0)).toBe('฿0.00');
  });

  it('handles edge cases at boundaries', () => {
    expect(formatCompactCurrency(999.99)).toBe('฿999.99');
    expect(formatCompactCurrency(1000)).toBe('฿1.0K');
    expect(formatCompactCurrency(999999)).toBe('฿1000.0K');
    expect(formatCompactCurrency(1000000)).toBe('฿1.0M');
  });
});
