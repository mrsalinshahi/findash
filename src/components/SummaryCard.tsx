import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  numericValue?: number;
  formatter?: (n: number) => string;
  subtitle?: string;
  valueColorClass?: string;
  icon?: ReactNode;
  delay?: number;
}

export function SummaryCard({
  title,
  value,
  numericValue,
  formatter,
  subtitle,
  valueColorClass = 'text-gray-900',
  icon,
  delay = 0,
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -3, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)' }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 cursor-default"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {icon && (
          <motion.div
            whileHover={{ rotate: 10, scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
          >
            {icon}
          </motion.div>
        )}
      </div>

      <p className={`text-2xl font-bold ${valueColorClass} dark:brightness-110 truncate`}>
        {numericValue !== undefined && formatter ? (
          <AnimatedNumber value={numericValue} formatter={formatter} duration={1.1} />
        ) : (
          value
        )}
      </p>

      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{subtitle}</p>}
    </motion.div>
  );
}
