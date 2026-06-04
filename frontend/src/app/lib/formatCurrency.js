/**
 * Currency formatting utilities.
 *
 * All functions in this module are for DISPLAY ONLY.
 * Form state must always store raw numbers — never formatted strings.
 *
 * Usage:
 *   formatCurrency(5000)          // "$5,000.00" (en-US)
 *   formatCurrency(5000, "EUR")  // "€5,000.00"
 *   formatCurrency(5000, "USD", "de-DE")  // "5.000,00 $" (German locale)
 */

/**
 * Format a numeric amount as a currency string for display.
 *
 * @param {number} amount   - Raw numeric value (e.g. 5000, not "$5,000")
 * @param {string} currency - ISO 4217 currency code (default "USD")
 * @param {string} locale   - BCP 47 locale tag (default "en-US")
 * @returns {string} Formatted currency string, or empty string if input is invalid
 */
export function formatCurrency(amount, currency = "USD", locale = "en-US") {
  // Guard against non-numeric values
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }

  const num = Number(amount);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return "";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // Fallback for environments that don't support Intl (very unlikely in 2026)
    return `${currency} ${num.toFixed(2)}`;
  }
}

/**
 * Format a numeric amount without the currency symbol (useful for compact displays).
 *
 * @param {number} amount
 * @param {string} locale - BCP 47 locale tag (default "en-US")
 * @returns {string}
 */
export function formatCompactCurrency(amount, locale = "en-US") {
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }

  const num = Number(amount);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return "";
  }

  // Abbreviate large numbers: 5000 → "5K", 1500000 → "1.5M"
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Parse a currency string back to a number (for cleaning up user input).
 * Handles "$5,000.00", "5,000", "5000", "€1.234,56", etc.
 *
 * @param {string} value - Raw input that may contain currency symbols/formatting
 * @returns {number} Clean numeric value, or 0 if unparseable
 */
export function parseCurrencyInput(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const str = String(value);

  // Remove currency symbols, whitespace
  let cleaned = str.replace(/[$€£¥₩₹]/g, "").trim();

  // Detect European format (e.g. "1.234,56" where comma is decimal separator)
  // If there's a comma followed by exactly 2 digits at the end, treat comma as decimal
  if (/,\d{2}$/.test(cleaned) && !/\.\d{2}$/.test(cleaned)) {
    // European: "1.234,56" → remove grouping dots, then comma → decimal point
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // US/International: "1,234.56" → remove grouping commas
    cleaned = cleaned.replace(/,/g, "");
  }

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}
