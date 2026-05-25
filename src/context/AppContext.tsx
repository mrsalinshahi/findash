/**
 * AppContext — single source of truth for all persisted application state.
 *
 * Three slices of state live here (expenses, goals, settings), each backed by
 * useLocalStorage so every mutation is automatically written to the browser.
 * Components read state via the useApp() hook; they never touch localStorage
 * directly.
 *
 * Hierarchy in the component tree:
 *   <ErrorBoundary>
 *     <AppProvider>       ← this file
 *       <BrowserRouter>
 *         <AnimatedRoutes />
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Expense, SavingsGoal, AppSettings } from '../types';

interface AppContextValue {
  expenses: Expense[];
  setExpenses: (v: Expense[] | ((prev: Expense[]) => Expense[])) => void;
  goals: SavingsGoal[];
  setGoals: (v: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])) => void;
  settings: AppSettings;
  setSettings: (v: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('findash_expenses', []);
  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>('findash_goals', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('findash_settings', {
    preferredCurrency: 'EUR',
    theme: 'light',
  });

  return (
    <AppContext.Provider value={{ expenses, setExpenses, goals, setGoals, settings, setSettings }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Throws if called outside AppProvider so the error surfaces immediately
 * rather than manifesting as a confusing "cannot read properties of undefined".
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
