import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../utils/currency';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Currency } from '../types';
import { useState } from 'react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Settings() {
  const { settings, setSettings, setExpenses, setGoals } = useApp();
  const { rates } = useExchangeRates();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCurrencyChange = (currency: Currency) => {
    setSettings((prev) => ({ ...prev, preferredCurrency: currency }));
  };

  const handleClearData = () => {
    setExpenses([]);
    setGoals([]);
  };

  const sections = [
    {
      delay: 0,
      content: (
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Preferred Currency</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            All amounts will be displayed in this currency using live exchange rates.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SUPPORTED_CURRENCIES.map((currency, i) => {
              const isSelected = settings.preferredCurrency === currency;
              const rateDisplay = rates?.rates[currency]
                ? formatCurrency(rates.rates[currency], currency)
                : '—';
              return (
                <motion.button
                  key={currency}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22, ease: EASE, delay: 0.12 + i * 0.055 }}
                  whileHover={{ y: -2, boxShadow: '0 6px 18px -4px rgba(99,102,241,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCurrencyChange(currency)}
                  className={`rounded-xl p-3 text-left border-2 transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/40 dark:to-violet-900/40'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  data-testid={`currency-option-${currency}`}
                >
                  <p className={`text-sm font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                    {currency}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">per €1: {rateDisplay}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      delay: 0.08,
      content: (
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">About</h2>
          <dl className="space-y-0 divide-y divide-gray-50 dark:divide-gray-700 text-sm">
            {[
              { label: 'App', value: 'FinDash' },
              { label: 'Version', value: '0.1.0' },
              { label: 'Exchange rates', value: 'open.er-api.com (1h cache)' },
              { label: 'Storage', value: 'Browser localStorage' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2.5">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ),
    },
    {
      delay: 0.16,
      isDanger: true,
      content: (
        <div>
          <h2 className="text-base font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Permanently delete all your expenses and savings goal data. This cannot be undone.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
            data-testid="clear-data-button"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </motion.button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your preferences</p>
      </motion.div>

      {sections.map(({ delay, isDanger, content }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 ${
            isDanger
              ? 'border border-red-100 dark:border-red-900/50'
              : 'border border-gray-100 dark:border-gray-700'
          }`}
        >
          {content}
        </motion.div>
      ))}

      {/* Clear data confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleClearData}
        title="Clear All Data"
        message="This will permanently delete all your expenses and savings goals. This action cannot be undone."
        confirmLabel="Yes, clear everything"
        danger
      />
    </div>
  );
}
