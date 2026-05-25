/**
 * SavingsLineChart — multi-line chart showing cumulative savings over time,
 * one line per goal with history entries.
 *
 * Because different goals have fund-adds on different dates, a unified date
 * axis is built from the union of all dates. Each goal's data is then
 * "forward-filled" (last known value carried forward) so every line spans the
 * full axis rather than having gaps where no add occurred.
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SavingsGoal, Currency } from '../types';
import { convertAmount, formatCurrency } from '../utils/currency';
import { useApp } from '../context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface SavingsLineChartProps {
  goals: SavingsGoal[];
  displayCurrency: Currency;
  rates: Record<string, number>;
}

const LINE_COLORS = [
  { border: 'rgba(99, 102, 241, 1)', background: 'rgba(99, 102, 241, 0.08)' },
  { border: 'rgba(16, 185, 129, 1)', background: 'rgba(16, 185, 129, 0.08)' },
  { border: 'rgba(245, 158, 11, 1)', background: 'rgba(245, 158, 11, 0.08)' },
  { border: 'rgba(239, 68, 68, 1)', background: 'rgba(239, 68, 68, 0.08)' },
  { border: 'rgba(139, 92, 246, 1)', background: 'rgba(139, 92, 246, 0.08)' },
];

export function SavingsLineChart({ goals, displayCurrency, rates }: SavingsLineChartProps) {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const goalsWithHistory = goals.filter((g) => g.history.length > 0);

  if (goalsWithHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        Add funds to a goal to see progress
      </div>
    );
  }

  // Build a unified sorted date axis across all goals
  const allDates = Array.from(
    new Set(goalsWithHistory.flatMap((g) => g.history.map((h) => h.date))),
  ).sort();

  const datasets = goalsWithHistory.map((goal, idx) => {
    const colors = LINE_COLORS[idx % LINE_COLORS.length];

    // Index the goal's history by date for O(1) lookups during forward-fill
    const dateToAmount: Record<string, number> = {};
    for (const entry of goal.history) {
      dateToAmount[entry.date] = convertAmount(entry.amount, goal.currency, displayCurrency, rates);
    }

    // Forward-fill: for any date where this goal has no entry, carry the
    // last known amount forward so the line is continuous, not broken.
    let lastKnown = 0;
    const points = allDates.map((date) => {
      if (dateToAmount[date] !== undefined) {
        lastKnown = dateToAmount[date];
      }
      return lastKnown;
    });

    return {
      label: goal.name,
      data: points,
      borderColor: colors.border,
      backgroundColor: colors.background,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  const chartData: ChartData<'line'> = {
    labels: allDates,
    datasets,
  };

  const tickColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const legendLabelColor = isDark ? '#9ca3af' : '#374151';

  return (
    <div className="relative h-56 sm:h-64" data-testid="savings-line-chart">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 12,
                font: { size: 12 },
                color: legendLabelColor,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.dataset.label ?? ''}: ${formatCurrency(ctx.parsed.y ?? 0, displayCurrency)}`,
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
          // mode: 'index' shows all datasets for the hovered x position,
          // giving a cross-goal comparison tooltip without requiring precise mouse aim.
          interaction: { mode: 'index', intersect: false },
        }}
      />
    </div>
  );
}
