import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryChart } from '../../src/components/CategoryChart';
import { AppProvider } from '../../src/context/AppContext';
import type { Expense } from '../../src/types';

// Chart components now call useApp() to read the theme for chart colors,
// so they must be rendered inside AppProvider.
const renderWithProvider = (ui: React.ReactElement) =>
  render(<AppProvider>{ui}</AppProvider>);

const RATES = { EUR: 1, USD: 1.09, GBP: 0.86, JPY: 160.5, TRY: 35.2 };

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: crypto.randomUUID(),
  name: 'Test',
  amount: 10,
  currency: 'EUR',
  category: 'Food',
  date: '2024-06-01',
  ...overrides,
});

describe('CategoryChart', () => {
  it('renders the chart container when expenses exist', () => {
    const expenses = [
      makeExpense({ category: 'Food', amount: 50 }),
      makeExpense({ category: 'Transport', amount: 30 }),
    ];
    renderWithProvider(
      <CategoryChart expenses={expenses} displayCurrency="EUR" rates={RATES} />,
    );
    expect(screen.getByTestId('category-chart')).toBeInTheDocument();
  });

  it('shows empty state when no expenses', () => {
    renderWithProvider(<CategoryChart expenses={[]} displayCurrency="EUR" rates={RATES} />);
    expect(screen.getByText('No expense data yet')).toBeInTheDocument();
  });

  it('does not render chart container when expenses are empty', () => {
    renderWithProvider(<CategoryChart expenses={[]} displayCurrency="EUR" rates={RATES} />);
    expect(screen.queryByTestId('category-chart')).not.toBeInTheDocument();
  });

  it('renders when expenses span multiple categories', () => {
    const expenses = [
      makeExpense({ category: 'Food', amount: 100 }),
      makeExpense({ category: 'Health', amount: 200 }),
      makeExpense({ category: 'Entertainment', amount: 50 }),
      makeExpense({ category: 'Transport', amount: 75 }),
      makeExpense({ category: 'Other', amount: 25 }),
    ];
    renderWithProvider(
      <CategoryChart expenses={expenses} displayCurrency="EUR" rates={RATES} />,
    );
    expect(screen.getByTestId('category-chart')).toBeInTheDocument();
  });

  it('renders with currency conversion applied', () => {
    const expenses = [
      makeExpense({ category: 'Food', amount: 100, currency: 'EUR' }),
    ];
    expect(() =>
      renderWithProvider(
        <CategoryChart expenses={expenses} displayCurrency="USD" rates={RATES} />,
      ),
    ).not.toThrow();
  });

  it('handles empty rates gracefully', () => {
    const expenses = [makeExpense({ category: 'Food', amount: 50, currency: 'EUR' })];
    expect(() =>
      renderWithProvider(<CategoryChart expenses={expenses} displayCurrency="USD" rates={{}} />),
    ).not.toThrow();
  });
});
