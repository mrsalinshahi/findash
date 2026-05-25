import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavingsGoal, Currency } from '../types';
import { formatCurrency, convertAmount } from '../utils/currency';
import { ConfirmDialog } from './ConfirmDialog';

interface GoalCardProps {
  goal: SavingsGoal;
  displayCurrency: Currency;
  rates: Record<string, number>;
  onDelete: (id: string) => void;
  onEdit: (goal: SavingsGoal) => void;
  onAddFunds: (id: string, amount: number) => void;
  index?: number;
}

export function GoalCard({ goal, displayCurrency, rates, onDelete, onEdit, onAddFunds, index = 0 }: GoalCardProps) {
  const [addingFunds, setAddingFunds] = useState(false);
  const [fundsInput, setFundsInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [shake, setShake] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const displayedSaved = convertAmount(goal.savedAmount, goal.currency, displayCurrency, rates);
  const displayedTarget = convertAmount(goal.targetAmount, goal.currency, displayCurrency, rates);
  const percentage = goal.targetAmount > 0
    ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
    : 0;
  const isComplete = percentage >= 100;

  const handleAddFunds = () => {
    const amount = parseFloat(fundsInput);
    if (isNaN(amount) || amount <= 0) {
      setInputError('Enter a valid positive amount');
      // Shake the input row to give tactile feedback without an intrusive alert.
      // The flag is reset after 400 ms — just long enough for the animation to
      // complete — so subsequent invalid submissions can shake again.
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onAddFunds(goal.id, amount);
    setFundsInput('');
    setInputError('');
    setAddingFunds(false);
  };

  const handleCancel = () => {
    setAddingFunds(false);
    setFundsInput('');
    setInputError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px -12px rgba(99,102,241,0.2)' }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 cursor-default"
      data-testid="goal-card"
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug">{goal.name}</h3>
        {/* key=percentage causes the badge to re-animate each time the value changes */}
        <motion.span
          key={percentage}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-sm font-bold ml-2 shrink-0 ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`}
          data-testid="goal-percentage"
        >
          {percentage}%
        </motion.span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {formatCurrency(displayedSaved, displayCurrency)}
        {' / '}
        {formatCurrency(displayedTarget, displayCurrency)}
      </p>

      {/* Progress bar animates from 0 on mount; delay staggers with the card entrance */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
        <motion.div
          className={`h-2.5 rounded-full ${isComplete
            ? 'bg-gradient-to-r from-green-400 to-green-500'
            : 'bg-gradient-to-r from-indigo-500 to-violet-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 + 0.15 }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goal.name} progress: ${percentage}%`}
        />
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-green-600 dark:text-green-400 font-medium mb-3"
          >
            Goal reached!
          </motion.p>
        )}
      </AnimatePresence>

      {/* AnimatePresence mode="wait" ensures the add-funds row and actions row
          never overlap — the old one exits fully before the new one enters. */}
      <AnimatePresence mode="wait">
        {addingFunds ? (
          <motion.div
            key="funds-input"
            initial={{ opacity: 0, y: 6 }}
            // x array drives the shake: negative/positive offsets produce a jitter
            animate={{ opacity: 1, y: 0, x: shake ? [0, -6, 6, -4, 4, 0] : 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="number"
                value={fundsInput}
                onChange={(e) => {
                  setFundsInput(e.target.value);
                  setInputError('');
                }}
                placeholder={`Amount in ${goal.currency}`}
                className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
                min="0"
                step="0.01"
                data-testid="add-funds-input"
                onKeyDown={(e) => e.key === 'Enter' && handleAddFunds()}
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleAddFunds}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors font-medium"
                data-testid="add-funds-confirm"
              >
                Add
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleCancel}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
            {inputError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 dark:text-red-400 text-xs"
              >
                {inputError}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setAddingFunds(true)}
              className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              data-testid="add-funds-button"
            >
              + Add Funds
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(goal)}
              className="px-3 py-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
              aria-label="Edit goal"
              data-testid="edit-goal-button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setConfirmDeleteOpen(true)}
              className="px-3 py-2 text-red-300 dark:text-red-700 hover:text-red-600 dark:hover:text-red-400 text-sm transition-colors"
              aria-label="Delete goal"
              data-testid="delete-goal-button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => onDelete(goal.id)}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </motion.div>
  );
}
