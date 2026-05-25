import type { Currency } from '../types';

export const SUPPORTED_CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'JPY', 'TRY'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  TRY: '₺',
};

/**
 * Converts an amount between any two supported currencies.
 *
 * The exchange-rate API returns all rates relative to EUR as the base, so every
 * conversion goes through EUR as an intermediate step:
 *   fromCurrency → EUR → toCurrency
 *
 * If either rate is missing (API not yet loaded), the original amount is
 * returned unchanged rather than showing zero or crashing.
 */
export function convertAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount;
  if (!rates[fromCurrency] || !rates[toCurrency]) return amount;

  const amountInEUR = fromCurrency === 'EUR' ? amount : amount / rates[fromCurrency];
  const result = toCurrency === 'EUR' ? amountInEUR : amountInEUR * rates[toCurrency];
  return Math.round(result * 100) / 100;
}

/**
 * Formats a number as a locale-aware currency string.
 * JPY has no fractional units, so maximumFractionDigits is 0 for it.
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const maximumFractionDigits = currency === 'JPY' ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(amount);
}
