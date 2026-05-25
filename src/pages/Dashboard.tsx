import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { SummaryCard } from '../components/SummaryCard';
import { CategoryChart } from '../components/CategoryChart';
import { MonthlyBarChart } from '../components/MonthlyBarChart';
import { ExchangeRatesWidget } from '../components/ExchangeRatesWidget';
import { SummaryCardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import { convertAmount, formatCurrency } from '../utils/currency';
import { isCurrentMonth, formatDate } from '../utils/dates';
import type { ExpenseCategory } from '../types';

export function Dashboard() {
  const { expenses, goals, settings } = useApp();
  const { rates, loading, error } = useExchangeRates();
  const currency = settings.preferredCurrency;
  const ratesMap = rates?.rates ?? {};

  const totalSaved = goals.reduce((sum, goal) => {
    return sum + convertAmount(goal.savedAmount, goal.currency, currency, ratesMap);
  }, 0);

  const thisMonthExpenses = expenses.filter((e) => isCurrentMonth(e.date));

  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, expense) => {
    return sum + convertAmount(expense.amount, expense.currency, currency, ratesMap);
  }, 0);

  const categoryTotals = thisMonthExpenses.reduce<Record<string, number>>((acc, expense) => {
    const amount = convertAmount(expense.amount, expense.currency, currency, ratesMap);
    acc[expense.category] = (acc[expense.category] ?? 0) + amount;
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None';

  const goalCount = goals.length;
  const completedGoals = goals.filter((g) => g.savedAmount >= g.targetAmount).length;

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const categoryBadgeColors: Record<ExpenseCategory, string> = {
    Food: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your financial overview</p>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Saved"
            value={formatCurrency(totalSaved, currency)}
            numericValue={totalSaved}
            formatter={(n) => formatCurrency(n, currency)}
            subtitle={`${completedGoals}/${goalCount} goals complete`}
            valueColorClass="text-indigo-600 dark:text-indigo-400"
            delay={0}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <SummaryCard
            title="Spent This Month"
            value={formatCurrency(totalSpentThisMonth, currency)}
            numericValue={totalSpentThisMonth}
            formatter={(n) => formatCurrency(n, currency)}
            subtitle={`${thisMonthExpenses.length} transactions`}
            valueColorClass="text-orange-500 dark:text-orange-400"
            delay={0.07}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            }
          />
          <SummaryCard
            title="Top Category"
            value={topCategory}
            subtitle="This month"
            valueColorClass="text-purple-600 dark:text-purple-400"
            delay={0.14}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />
          <SummaryCard
            title="Active Goals"
            value={String(goalCount)}
            numericValue={goalCount}
            formatter={(n) => String(Math.round(n))}
            subtitle={goalCount > 0 ? `${completedGoals} completed` : 'Create a goal to start'}
            valueColorClass="text-green-600 dark:text-green-400"
            delay={0.21}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
          >
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
            <CategoryChart expenses={expenses} displayCurrency={currency} rates={ratesMap} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
          >
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Monthly Spending</h2>
            <MonthlyBarChart expenses={expenses} displayCurrency={currency} rates={ratesMap} />
          </motion.div>
        </div>
      )}

      {/* Exchange rates */}
      <ExchangeRatesWidget
        rates={rates}
        loading={loading}
        error={error}
        baseCurrency={currency}
      />

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Expenses</h2>
          <div className="space-y-3">
            {recentExpenses.map((expense) => {
              const converted = convertAmount(expense.amount, expense.currency, currency, ratesMap);
              return (
                <div key={expense.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${categoryBadgeColors[expense.category]}`}
                    >
                      {expense.category}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{expense.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(converted, currency)}
                    </span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(expense.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
