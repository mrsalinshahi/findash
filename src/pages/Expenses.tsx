import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { CategoryChart } from '../components/CategoryChart';
import { Modal } from '../components/Modal';
import type { Expense, ExpenseCategory } from '../types';

const ALL_CATEGORIES = 'All';
type CategoryFilter = ExpenseCategory | typeof ALL_CATEGORIES;

const CATEGORY_OPTIONS: CategoryFilter[] = [
  'All', 'Food', 'Transport', 'Entertainment', 'Health', 'Other',
];

const AddIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export function Expenses() {
  const { expenses, setExpenses, settings } = useApp();
  const { rates } = useExchangeRates();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(ALL_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);

  const ratesMap = rates?.rates ?? {};

  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
    setModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEditExpense = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const filteredExpenses =
    categoryFilter === ALL_CATEGORIES
      ? sortedExpenses
      : sortedExpenses.filter((e) => e.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{expenses.length} total expenses</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
          data-testid="toggle-expense-form"
        >
          {AddIcon}
          Add Expense
        </motion.button>
      </div>

      {/* Add Expense modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Expense"
        size="md"
        icon={AddIcon}
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          defaultCurrency={settings.preferredCurrency}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Category filter pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_OPTIONS.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                data-testid={`filter-${cat}`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <ExpenseList
            expenses={filteredExpenses}
            displayCurrency={settings.preferredCurrency}
            rates={ratesMap}
            onDelete={handleDeleteExpense}
            onEdit={handleEditExpense}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">By Category</h2>
          <CategoryChart
            expenses={expenses}
            displayCurrency={settings.preferredCurrency}
            rates={ratesMap}
          />
        </div>
      </div>
    </div>
  );
}
