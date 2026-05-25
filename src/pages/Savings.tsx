import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { GoalCard } from '../components/GoalCard';
import { GoalForm } from '../components/GoalForm';
import { SavingsLineChart } from '../components/SavingsLineChart';
import { Modal } from '../components/Modal';
import type { SavingsGoal } from '../types';
import { todayISO } from '../utils/dates';

const NewGoalIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const GoalIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export function Savings() {
  const { goals, setGoals, settings } = useApp();
  const { rates } = useExchangeRates();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const ratesMap = rates?.rates ?? {};

  const handleCreateGoal = (goal: SavingsGoal) => {
    setGoals((prev) => [goal, ...prev]);
    setCreateOpen(false);
  };

  const handleUpdateGoal = (updated: SavingsGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAddFunds = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newSaved = g.savedAmount + amount;
        return {
          ...g,
          savedAmount: newSaved,
          history: [...g.history, { date: todayISO(), amount: newSaved }],
        };
      }),
    );
  };

  const completedGoals = goals.filter((g) => g.savedAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {completedGoals}/{goals.length} goals reached
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
          data-testid="toggle-goal-form"
        >
          {NewGoalIcon}
          New Goal
        </motion.button>
      </div>

      {/* Create goal modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Savings Goal"
        size="md"
        icon={GoalIcon}
      >
        <GoalForm
          onSubmit={handleCreateGoal}
          onCancel={() => setCreateOpen(false)}
          defaultCurrency={settings.preferredCurrency}
        />
      </Modal>

      {/* Edit goal modal */}
      <Modal
        open={editingGoal !== null}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
        size="md"
        icon={GoalIcon}
      >
        {editingGoal && (
          <GoalForm
            onSubmit={handleUpdateGoal}
            onCancel={() => setEditingGoal(null)}
            defaultCurrency={settings.preferredCurrency}
            initialGoal={editingGoal}
          />
        )}
      </Modal>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-gray-400 dark:text-gray-600"
        >
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-60">
            {GoalIcon}
          </div>
          <p className="font-medium text-gray-500 dark:text-gray-400">No savings goals yet</p>
          <p className="text-sm mt-1">Create your first goal to start tracking</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              displayCurrency={settings.preferredCurrency}
              rates={ratesMap}
              index={i}
              onDelete={handleDeleteGoal}
              onEdit={(g) => setEditingGoal(g)}
              onAddFunds={handleAddFunds}
            />
          ))}
        </div>
      )}

      {/* Savings progress chart */}
      {goals.some((g) => g.history.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Savings Progress</h2>
          <SavingsLineChart
            goals={goals}
            displayCurrency={settings.preferredCurrency}
            rates={ratesMap}
          />
        </motion.div>
      )}
    </div>
  );
}
