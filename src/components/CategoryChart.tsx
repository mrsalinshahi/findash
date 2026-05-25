import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { Expense, Currency } from '../types';
import { convertAmount } from '../utils/currency';
import { useApp } from '../context/AppContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_PALETTE: Record<string, string> = {
  Food: '#10b981',
  Transport: '#3b82f6',
  Entertainment: '#8b5cf6',
  Health: '#ef4444',
  Other: '#6b7280',
};

interface CategoryChartProps {
  expenses: Expense[];
  displayCurrency: Currency;
  rates: Record<string, number>;
}

export function CategoryChart({ expenses, displayCurrency, rates }: CategoryChartProps) {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const totals: Record<string, number> = {};
  for (const expense of expenses) {
    const converted = convertAmount(expense.amount, expense.currency, displayCurrency, rates);
    totals[expense.category] = (totals[expense.category] ?? 0) + converted;
  }

  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        No expense data yet
      </div>
    );
  }

  const data: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((l) => CATEGORY_PALETTE[l] ?? '#6b7280'),
        borderWidth: 2,
        borderColor: isDark ? '#1f2937' : '#ffffff',
      },
    ],
  };

  const legendLabelColor = isDark ? '#9ca3af' : '#374151';

  return (
    <div className="relative h-48 sm:h-56" data-testid="category-chart">
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 12,
                font: { size: 12 },
                color: legendLabelColor,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.formattedValue}`,
              },
            },
          },
          cutout: '65%',
        }}
      />
    </div>
  );
}
