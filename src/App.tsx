import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { AnimatedPage } from './components/AnimatedPage';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Savings } from './pages/Savings';
import { Settings } from './pages/Settings';

/**
 * Syncs settings.theme → document.documentElement class so Tailwind's
 * dark: variants activate globally. Rendered inside AppProvider so it can
 * read from context, but outside BrowserRouter since it has no routing needs.
 */
function ThemeSync() {
  const { settings } = useApp();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);
  return null;
}

/**
 * AnimatedRoutes is a separate component (not inlined in App) because
 * useLocation() requires a Router ancestor — it cannot be called in the same
 * component that renders <BrowserRouter>.
 *
 * The key={location.pathname} on <Routes> forces React to unmount and remount
 * the outgoing page, which is required for AnimatePresence to run the exit
 * animation before the new page mounts.
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="expenses" element={<AnimatedPage><Expenses /></AnimatedPage>} />
          <Route path="savings" element={<AnimatedPage><Savings /></AnimatedPage>} />
          <Route path="settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ThemeSync />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
