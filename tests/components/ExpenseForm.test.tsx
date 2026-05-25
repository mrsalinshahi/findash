import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExpenseForm } from '../../src/components/ExpenseForm';
import type { Expense } from '../../src/types';

describe('ExpenseForm', () => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" />);
    expect(screen.getByTestId('expense-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('expense-amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('expense-currency-select')).toBeInTheDocument();
    expect(screen.getByTestId('expense-category-select')).toBeInTheDocument();
    expect(screen.getByTestId('expense-date-input')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" />);
    fireEvent.click(screen.getByTestId('expense-submit-button'));
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Enter a valid positive amount')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data', async () => {
    render(<ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" />);

    fireEvent.change(screen.getByTestId('expense-name-input'), {
      target: { value: 'Coffee' },
    });
    fireEvent.change(screen.getByTestId('expense-amount-input'), {
      target: { value: '3.50' },
    });
    fireEvent.change(screen.getByTestId('expense-currency-select'), {
      target: { value: 'EUR' },
    });
    fireEvent.change(screen.getByTestId('expense-category-select'), {
      target: { value: 'Food' },
    });
    fireEvent.change(screen.getByTestId('expense-date-input'), {
      target: { value: '2024-06-15' },
    });

    fireEvent.click(screen.getByTestId('expense-submit-button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submitted: Expense = onSubmit.mock.calls[0][0];
    expect(submitted.name).toBe('Coffee');
    expect(submitted.amount).toBe(3.5);
    expect(submitted.currency).toBe('EUR');
    expect(submitted.category).toBe('Food');
    expect(submitted.date).toBe('2024-06-15');
    expect(submitted.id).toBeTruthy();
  });

  it('pre-fills fields when initialExpense is provided', () => {
    const initial: Expense = {
      id: 'exp-1',
      name: 'Bus ticket',
      amount: 2.5,
      currency: 'GBP',
      category: 'Transport',
      date: '2024-05-20',
    };

    render(<ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" initialExpense={initial} />);

    expect(screen.getByTestId('expense-name-input')).toHaveValue('Bus ticket');
    expect(screen.getByTestId('expense-amount-input')).toHaveValue(2.5);
    expect(screen.getByTestId('expense-currency-select')).toHaveValue('GBP');
    expect(screen.getByTestId('expense-category-select')).toHaveValue('Transport');
  });

  it('shows Update label when editing', () => {
    const initial: Expense = {
      id: 'exp-1',
      name: 'Existing',
      amount: 10,
      currency: 'EUR',
      category: 'Other',
      date: '2024-01-01',
    };
    render(
      <ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" initialExpense={initial} onCancel={onCancel} />,
    );
    expect(screen.getByTestId('expense-submit-button')).toHaveTextContent('Update Expense');
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('rejects zero amount', async () => {
    render(<ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" />);
    fireEvent.change(screen.getByTestId('expense-name-input'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('expense-amount-input'), { target: { value: '0' } });
    fireEvent.click(screen.getByTestId('expense-submit-button'));
    await waitFor(() => {
      expect(screen.getByText('Enter a valid positive amount')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('defaults to EUR currency', () => {
    render(<ExpenseForm onSubmit={onSubmit} defaultCurrency="EUR" />);
    expect(screen.getByTestId('expense-currency-select')).toHaveValue('EUR');
  });

  it('uses defaultCurrency for initial currency selection', () => {
    render(<ExpenseForm onSubmit={onSubmit} defaultCurrency="USD" />);
    expect(screen.getByTestId('expense-currency-select')).toHaveValue('USD');
  });
});
