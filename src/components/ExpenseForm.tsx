import { useState } from 'react';
import type { Expense, ExpenseCategory, Currency } from '../types';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { todayISO } from '../utils/dates';

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Entertainment', 'Health', 'Other'];

const INPUT_CLS = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400';
const LABEL_CLS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  defaultCurrency: Currency;
  initialExpense?: Expense;
  onCancel?: () => void;
}

export function ExpenseForm({ onSubmit, defaultCurrency, initialExpense, onCancel }: ExpenseFormProps) {
  const [name, setName] = useState(initialExpense?.name ?? '');
  const [amount, setAmount] = useState(initialExpense?.amount.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initialExpense?.currency ?? defaultCurrency);
  const [category, setCategory] = useState<ExpenseCategory>(initialExpense?.category ?? 'Food');
  const [date, setDate] = useState(initialExpense?.date ?? todayISO());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) errs.amount = 'Enter a valid positive amount';
    if (!date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const expense: Expense = {
      id: initialExpense?.id ?? crypto.randomUUID(),
      name: name.trim(),
      amount: parseFloat(amount),
      currency,
      category,
      date,
    };

    onSubmit(expense);

    if (!initialExpense) {
      setName('');
      setAmount('');
      setDate(todayISO());
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="expense-form">
      <div>
        <label className={LABEL_CLS}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Grocery shopping"
          className={INPUT_CLS}
          data-testid="expense-name-input"
        />
        {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={INPUT_CLS}
            data-testid="expense-amount-input"
          />
          {errors.amount && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className={LABEL_CLS}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className={INPUT_CLS}
            data-testid="expense-currency-select"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className={INPUT_CLS}
            data-testid="expense-category-select"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLS}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLS}
            data-testid="expense-date-input"
          />
          {errors.date && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          data-testid="expense-submit-button"
        >
          {initialExpense ? 'Update Expense' : 'Add Expense'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
