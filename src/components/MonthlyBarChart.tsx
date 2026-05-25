import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Expense, Currency } from '../types';
import { convertAmount } from '../utils/currency';
import { getLast6MonthPrefixes, getMonthLabel } from '../utils/dates';
import { useApp } from '../context/AppContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MonthlyBarChartProps {
  expenses: Expense[];
  displayCurrency: Currency;
  rates: Record<string, number>;
}

export function MonthlyBarChart({ expenses, displayCurrency, rates }: MonthlyBarChartProps) {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const months = getLast6MonthPrefixes();
  const monthlyTotals = months.map((prefix) => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(prefix));
    return monthExpenses.reduce((sum, e) => {
      return sum + convertAmount(e.amount, e.currency, displayCurrency, rates);
    }, 0);
  });

  const tickColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  const data: ChartData<'bar'> = {
    labels: months.map(getMonthLabel),
    datasets: [
      {
        label: `Spending (${displayCurrency})`,
        data: monthlyTotals,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="relative h-48 sm:h-56" data-testid="monthly-bar-chart">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.formattedValue} ${displayCurrency}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: gridColor },
              ticks: { font: { size: 11 }, color: tickColor },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: tickColor },
            },
          },
        }}
      />
    </div>
  );
}
