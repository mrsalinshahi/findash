import { motion, type Variants } from 'framer-motion';
import type { ExchangeRates, Currency } from '../types';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../utils/currency';
import { RatesWidgetSkeleton } from './SkeletonLoader';

interface ExchangeRatesWidgetProps {
  rates: ExchangeRates | null;
  loading: boolean;
  error: string | null;
  baseCurrency: Currency;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE } },
};

export function ExchangeRatesWidget({ rates, loading, error, baseCurrency }: ExchangeRatesWidgetProps) {
  if (loading) return <RatesWidgetSkeleton />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Exchange Rates</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">Base: EUR</span>
      </div>

      {error && !rates && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-4"
        >
          Could not fetch live rates. Showing cached data.
        </motion.p>
      )}

      {rates ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-5 gap-4"
        >
          {SUPPORTED_CURRENCIES.map((currency) => {
            const rate = rates.rates[currency] ?? 1;
            const isBase = baseCurrency === currency;

            return (
              <motion.div
                key={currency}
                variants={cardVariants}
                whileHover={{ y: -3, boxShadow: '0 8px 20px -6px rgba(99,102,241,0.18)' }}
                className={`rounded-xl p-3 cursor-default transition-colors ${
                  isBase
                    ? 'bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/40 dark:to-violet-900/40 border border-indigo-200 dark:border-indigo-700'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'
                }`}
                data-testid={`rate-${currency}`}
              >
                <p className={`text-xs font-bold tracking-wide ${isBase ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {currency}
                </p>
                <p className={`text-xl font-bold mt-0.5 ${isBase ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                  {formatCurrency(rate, currency)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">per €1</p>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">No rate data available.</p>
      )}

      {rates && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Last updated: {new Date(rates.lastUpdated).toLocaleTimeString()}
          {error && ' (stale cache)'}
        </p>
      )}
    </div>
  );
}
