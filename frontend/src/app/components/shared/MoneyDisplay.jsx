import { formatCurrency } from "../../lib/formatCurrency.js";

/**
 * MoneyDisplay — renders a formatted currency value for display only.
 *
 * NEVER use this inside a form input. Form state must store raw numbers.
 * This component is for displaying money in cards, tables, summaries, etc.
 *
 * Props:
 *   amount   — number (raw value, e.g. 5000)
 *   currency — string (ISO 4217 code, default "USD")
 *   locale   — string (BCP 47 locale tag, default "en-US")
 *   className — string (additional CSS classes)
 *
 * Examples:
 *   <MoneyDisplay amount={5000} />                     → "$5,000"
 *   <MoneyDisplay amount={1500.50} currency="EUR" />   → "€1,500.50"
 *   <MoneyDisplay amount={null} />                     → (renders fallback)
 *   <MoneyDisplay amount={0} />                        → "$0"
 */
export function MoneyDisplay({ amount, currency = "USD", locale, className = "" }) {
  const formatted = formatCurrency(amount, currency, locale);

  // If formatCurrency returned empty string, show a safe fallback
  if (!formatted) {
    // Distinguish "zero" from "not provided"
    if (amount === 0 || amount === "0") {
      return (
        <span className={className}>
          {formatCurrency(0, currency, locale)}
        </span>
      );
    }
    return <span className={`text-gray-400 italic ${className}`}>—</span>;
  }

  return <span className={className}>{formatted}</span>;
}
