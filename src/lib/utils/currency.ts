/**
 * Currency formatting utilities for Thai Baht (THB)
 */

/**
 * Format a number as Thai Baht currency
 * @param amount - The amount to format
 * @returns Formatted string with ฿ symbol (e.g., "฿1,234.56")
 */
export function formatThaiCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as compact Thai Baht currency (K, M abbreviations)
 * @param amount - The amount to format
 * @returns Abbreviated formatted string (e.g., "฿1.2M", "฿500K", "฿999.00")
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `฿${millions.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const thousands = amount / 1_000;
    return `฿${thousands.toFixed(1)}K`;
  }
  return formatThaiCurrency(amount);
}
