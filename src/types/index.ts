// ─── Domain types ────────────────────────────────────────────────────────────
// All data the app works with is expressed in these five interfaces.
// Every amount is stored in the currency the user entered (never pre-converted)
// so that changing the display currency never loses precision.

export type Currency = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'TRY';

export type ExpenseCategory = 'Food' | 'Transport' | 'Entertainment' | 'Health' | 'Other';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  currency: Currency;   // the currency the user typed, not the display currency
  category: ExpenseCategory;
  date: string;         // ISO 8601 date string: "YYYY-MM-DD"
}

export interface SavingsEntry {
  date: string;   // snapshot date — "YYYY-MM-DD"
  amount: number; // cumulative saved amount at that date (not a delta)
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: Currency;
  createdAt: string;       // ISO date string
  history: SavingsEntry[]; // append-only log used to draw the savings line chart
}

export interface ExchangeRates {
  base: string;                    // always "EUR"
  rates: Record<string, number>;   // e.g. { USD: 1.08, GBP: 0.86, ... }
  lastUpdated: number;             // Unix timestamp (ms) — used for 1h TTL check
}

export interface AppSettings {
  preferredCurrency: Currency;
  theme: 'light' | 'dark';
}
