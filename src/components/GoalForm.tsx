import { useState } from 'react';
import type { SavingsGoal, Currency } from '../types';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { todayISO } from '../utils/dates';

const INPUT_CLS = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400';
const LABEL_CLS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

interface GoalFormProps {
  onSubmit: (goal: SavingsGoal) => void;
  onCancel: () => void;
  defaultCurrency: Currency;
  initialGoal?: SavingsGoal;
}

export function GoalForm({ onSubmit, onCancel, defaultCurrency, initialGoal }: GoalFormProps) {
  const [name, setName] = useState(initialGoal?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(initialGoal?.targetAmount.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(initialGoal?.currency ?? defaultCurrency);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Goal name is required';
    const parsed = parseFloat(targetAmount);
    if (isNaN(parsed) || parsed <= 0) errs.targetAmount = 'Enter a valid target amount';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const goal: SavingsGoal = {
      id: initialGoal?.id ?? crypto.randomUUID(),
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      savedAmount: initialGoal?.savedAmount ?? 0,
      currency,
      createdAt: initialGoal?.createdAt ?? todayISO(),
      history: initialGoal?.history ?? [],
    };

    onSubmit(goal);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="goal-form">
      <div>
        <label className={LABEL_CLS}>Goal Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Buy a laptop"
          className={INPUT_CLS}
          data-testid="goal-name-input"
        />
        {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Target Amount</label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={INPUT_CLS}
            data-testid="goal-target-input"
          />
          {errors.targetAmount && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.targetAmount}</p>
          )}
        </div>

        <div>
          <label className={LABEL_CLS}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className={INPUT_CLS}
            data-testid="goal-currency-select"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          data-testid="goal-submit-button"
        >
          {initialGoal ? 'Update Goal' : 'Create Goal'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
