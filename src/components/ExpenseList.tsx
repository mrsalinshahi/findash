import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { Expense, Currency } from '../types';
import { formatCurrency, convertAmount } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { ExpenseForm } from './ExpenseForm';
import { ConfirmDialog } from './ConfirmDialog';

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, x: 20, height: 0, marginBottom: 0, transition: { duration: 0.2 } },
};

interface ExpenseListProps {
  expenses: Expense[];
  displayCurrency: Currency;
  rates: Record<string, number>;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export function ExpenseList({ expenses, displayCurrency, rates, onDelete, onEdit }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 text-gray-400 dark:text-gray-600"
      >
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="font-medium text-gray-500 dark:text-gray-400">No expenses yet</p>
        <p className="text-sm mt-1">Add your first expense above</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="space-y-2"
      data-testid="expense-list"
    >
      <AnimatePresence initial={false}>
        {expenses.map((expense) => {
          const converted = convertAmount(expense.amount, expense.currency, displayCurrency, rates);

          if (editingId === expense.id) {
            return (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, scaleY: 0.95 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-700 p-4 origin-top"
              >
                <ExpenseForm
                  onSubmit={(updated) => {
                    onEdit(updated);
                    setEditingId(null);
                  }}
                  defaultCurrency={displayCurrency}
                  initialExpense={expense}
                  onCancel={() => setEditingId(null)}
                />
              </motion.div>
            );
          }

          return (
            <motion.div
              key={expense.id}
              layout
              variants={itemVariants}
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3.5 flex items-center gap-3 group"
              data-testid="expense-item"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{expense.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[expense.category]}`}>
                    {expense.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(expense.date)}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(converted, displayCurrency)}</p>
                {expense.currency !== displayCurrency && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatCurrency(expense.amount, expense.currency)}</p>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setEditingId(expense.id)}
                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors"
                  aria-label="Edit expense"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setDeletingId(expense.id)}
                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                  aria-label="Delete expense"
                  data-testid="delete-expense-button"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) onDelete(deletingId);
          setDeletingId(null);
        }}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </motion.div>
  );
}
