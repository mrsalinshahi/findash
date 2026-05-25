/**
 * Navbar renders two separate nav surfaces:
 *  - A sticky top header on md+ screens (desktop)
 *  - A sticky top header + fixed bottom tab bar on mobile
 *
 * The active-indicator pill (desktop) and active bar + bubble (mobile) use
 * framer-motion layoutId so they animate smoothly between tabs.
 * Both sets must be wrapped in separate LayoutGroups (different id props) to
 * prevent framer-motion from trying to share the same layout animation between
 * the desktop and mobile DOM trees, which would produce incorrect movement.
 */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/expenses',
    label: 'Expenses',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    path: '/savings',
    label: 'Savings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function ThemeToggle({ className = '' }: { className?: string }) {
  const { settings, setSettings } = useApp();
  const isDark = settings.theme === 'dark';

  const toggle = () =>
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          // Sun — shown in dark mode to switch back to light
          <motion.svg
            key="sun"
            initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 text-amber-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </motion.svg>
        ) : (
          // Moon — shown in light mode to switch to dark
          <motion.svg
            key="moon"
            initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Tighten the header border/shadow once the user scrolls past 8 px so the
  // header visually "lifts" away from the content beneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ─────────────────── Desktop header ─────────────────── */}
      <header
        className={`hidden md:block sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-shadow duration-300 ${
          scrolled
            ? 'shadow-sm border-b border-gray-200 dark:border-gray-700'
            : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 flex items-center h-16 gap-8">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 text-lg tracking-tight">
              FinDash
            </span>
          </NavLink>

          {/* LayoutGroup scopes the shared "desktop-pill" layoutId so it doesn't
              conflict with the mobile "mobile-bar" / "mobile-bubble" layoutIds. */}
          <LayoutGroup id="desktop-nav">
            <nav className="flex gap-1">
              {navItems.map(({ path, label, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium outline-none"
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="desktop-pill"
                          className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg"
                          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                        />
                      )}
                      <span
                        className={`relative z-10 flex items-center gap-2 transition-colors duration-150 ${
                          isActive
                            ? 'text-indigo-700 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {icon}
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </LayoutGroup>

          {/* Right side: live indicator + theme toggle */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full" title="Live data" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Live</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─────────────────── Mobile top header ───────────────── */}
      <header
        className={`md:hidden sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-shadow duration-300 ${
          scrolled
            ? 'shadow-sm border-b border-gray-200 dark:border-gray-700'
            : 'border-b border-transparent'
        }`}
      >
        <div className="px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 text-base tracking-tight">
              FinDash
            </span>
          </NavLink>

          {/* Right side: page title + theme toggle */}
          <div className="flex items-center gap-1">
            {/* Page title cross-fades on every route change; key forces remount */}
            <AnimatePresence mode="wait">
              <motion.span
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {navItems.find((n) =>
                  n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path),
                )?.label ?? ''}
              </motion.span>
            </AnimatePresence>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─────────────────── Mobile bottom tab bar ───────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
        <LayoutGroup id="mobile-nav">
          <div className="grid grid-cols-4">
            {navItems.map(({ path, label, icon }) => {
              const isActive =
                path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

              return (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className="relative flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-medium outline-none"
                >
                  {/* Top bar slides between tabs via shared layout animation */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-bar"
                      className="absolute top-0 inset-x-4 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <div className="relative flex items-center justify-center w-9 h-7">
                    {/* Background bubble also slides between tabs independently */}
                    {isActive && (
                      <motion.div
                        layoutId="mobile-bubble"
                        className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/40 rounded-full"
                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}
                    >
                      {icon}
                    </span>
                  </div>

                  <span
                    className={`transition-colors duration-150 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </LayoutGroup>
      </nav>
    </>
  );
}
