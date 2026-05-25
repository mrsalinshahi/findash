# FinDash — Architecture

A complete description of how the application is structured, how data flows through it, and why key decisions were made. Reading this document gives you a full mental model of the app without running it.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Data Model](#4-data-model)
5. [State Management](#5-state-management)
6. [Persistence Layer](#6-persistence-layer)
7. [Currency & Exchange Rates](#7-currency--exchange-rates)
8. [Routing & Page Transitions](#8-routing--page-transitions)
9. [Component Architecture](#9-component-architecture)
10. [Charts](#10-charts)
11. [UI Patterns](#11-ui-patterns)
12. [Testing](#12-testing)
13. [Build & Bundling](#13-build--bundling)
14. [Data Flow Diagram](#14-data-flow-diagram)

---

## 1. Overview

FinDash is a **client-only** personal finance tracker. There is no backend, no database server, and no authentication. All state lives in the browser's `localStorage` and all currency conversion uses a public REST API cached locally. The app can be deployed as a plain static site.

Two core features:

| Feature | What it does |
|---|---|
| **Expenses** | Record, categorise, and filter spending. Inline editing in the list. Charts by category and by month. |
| **Savings Goals** | Create goals with a target amount. Add funds incrementally. Tracks a cumulative history used to draw a progress chart. |

A **Dashboard** aggregates summary cards and charts across both features. **Settings** lets the user pick a preferred display currency and toggle between light and dark mode.

---

## 2. Tech Stack

| Concern | Library / Tool |
|---|---|
| UI framework | React 18 (function components + hooks) |
| Language | TypeScript 5 (strict mode) |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Animations | Framer Motion v12 |
| Charts | Chart.js v4 + react-chartjs-2 |
| Styling | Tailwind CSS v3 — utility-first, `darkMode: 'class'` |
| Unit tests | Jest 29 + ts-jest + React Testing Library |
| E2E tests | Playwright |
| Package manager | pnpm |

---

## 3. Project Structure

```
findash/
├── src/
│   ├── main.tsx              # React root mount point
│   ├── App.tsx               # Router setup, provider tree, ThemeSync
│   ├── index.css             # Global CSS (dot grid, shimmer, dark mode body, smooth-transition rule)
│   │
│   ├── types/
│   │   └── index.ts          # All shared TypeScript interfaces and type aliases
│   │
│   ├── utils/
│   │   ├── currency.ts       # convertAmount(), formatCurrency(), SUPPORTED_CURRENCIES
│   │   ├── dates.ts          # Date helpers: todayISO(), getLast6MonthPrefixes(), etc.
│   │   └── storage.ts        # localStorage get/set with JSON parse error handling
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.ts   # useState backed by localStorage (functional updater support)
│   │   └── useExchangeRates.ts  # Fetches EUR rates, 1h cache, stale-cache fallback
│   │
│   ├── context/
│   │   └── AppContext.tsx    # Single React context that holds expenses, goals, settings
│   │
│   ├── components/
│   │   ├── Layout.tsx            # Shell: Navbar + <Outlet /> (main content area)
│   │   ├── Navbar.tsx            # Desktop header + mobile top header + mobile bottom tab bar + ThemeToggle
│   │   ├── Modal.tsx             # Portal-based dialog (bottom-sheet on mobile)
│   │   ├── ConfirmDialog.tsx     # Thin Modal wrapper for destructive confirmations
│   │   ├── ErrorBoundary.tsx     # Class component that catches render errors
│   │   ├── AnimatedPage.tsx      # Framer Motion enter/exit wrapper for each route
│   │   ├── AnimatedNumber.tsx    # Tweens a number and formats it on every frame
│   │   ├── SummaryCard.tsx       # KPI card with optional AnimatedNumber value
│   │   ├── SkeletonLoader.tsx    # Shimmer placeholder shapes (card, chart, rates widget)
│   │   ├── ExchangeRatesWidget.tsx  # Grid of live rate cards
│   │   ├── CategoryChart.tsx     # Doughnut chart (Chart.js)
│   │   ├── MonthlyBarChart.tsx   # Bar chart — last 6 months (Chart.js)
│   │   ├── SavingsLineChart.tsx  # Multi-line chart per goal (Chart.js)
│   │   ├── ExpenseForm.tsx       # Controlled form — add or edit an expense
│   │   ├── ExpenseList.tsx       # Animated list with inline edit expansion
│   │   ├── GoalForm.tsx          # Controlled form — create or edit a savings goal
│   │   └── GoalCard.tsx          # Goal card with progress bar and add-funds inline row
│   │
│   └── pages/
│       ├── Dashboard.tsx   # Aggregated KPIs, charts, recent expenses
│       ├── Expenses.tsx    # Full expense list with category filter and chart
│       ├── Savings.tsx     # Goal cards grid and savings line chart
│       └── Settings.tsx    # Currency picker, app info, danger zone
│
├── tests/
│   ├── components/         # React Testing Library unit tests
│   ├── utils/              # Pure function unit tests
│   └── __mocks__/          # Jest module mocks (framer-motion, chart.js, react-chartjs-2)
│
├── e2e/                    # Playwright end-to-end tests
│
├── index.html              # App shell — includes anti-flash dark-mode script
├── vite.config.ts          # Vite + React plugin, manual chunk splitting
├── jest.config.cjs         # Jest config (CJS extension required with "type": "module")
├── playwright.config.ts    # Desktop Chrome + Mobile Safari viewports
├── tailwind.config.js      # darkMode: 'class' + custom colours
└── tsconfig.json
```

---

## 4. Data Model

All types are defined in `src/types/index.ts`. Amounts are **always stored in the currency the user entered** — never pre-converted. Conversion to the display currency happens at render time.

```
Currency        'EUR' | 'USD' | 'GBP' | 'JPY' | 'TRY'
ExpenseCategory 'Food' | 'Transport' | 'Entertainment' | 'Health' | 'Other'

Expense {
  id         string          crypto.randomUUID()
  name       string          e.g. "Grocery shopping"
  amount     number          in the expense's own currency
  currency   Currency
  category   ExpenseCategory
  date       string          "YYYY-MM-DD" local timezone
}

SavingsGoal {
  id           string
  name         string          e.g. "Buy a laptop"
  targetAmount number          in the goal's own currency
  savedAmount  number          cumulative total in the goal's own currency
  currency     Currency
  createdAt    string          "YYYY-MM-DD"
  history      SavingsEntry[]  append-only log for the line chart
}

SavingsEntry {
  date   string   "YYYY-MM-DD" — snapshot date
  amount number   cumulative saved at that date (not a delta)
}

ExchangeRates {
  base        string              always "EUR"
  rates       Record<string,number>  e.g. { USD: 1.08, GBP: 0.86 }
  lastUpdated number              Unix timestamp (ms)
}

AppSettings {
  preferredCurrency Currency
  theme             'light' | 'dark'   persisted in localStorage; default 'light'
}
```

---

## 5. State Management

There is no Redux, Zustand, or external state library. State is managed in three layers:

```
localStorage
     │  read on mount / write on every change
     ▼
useLocalStorage (hook)
     │  useState + automatic JSON serialisation
     ▼
AppContext (context)
     │  exposes: expenses, setExpenses, goals, setGoals, settings, setSettings
     ▼
Page components  ──▶  read and mutate via useApp()
```

**AppContext** (`src/context/AppContext.tsx`) is the single provider. It initialises three `useLocalStorage` slices and passes them to all children via `AppContext.Provider`. Any component that needs data calls `useApp()`.

`settings.theme` is part of this same context slice — changing it via `setSettings` triggers a re-render of `ThemeSync` (see §9), which applies or removes the `dark` class on `<html>`.

**Why no Redux?** The app has three flat arrays of simple objects. A shared context is enough — extra complexity of reducers, actions, and selectors would not pay off at this scale.

---

## 6. Persistence Layer

```
useLocalStorage
  └── getStorageItem / setStorageItem  (src/utils/storage.ts)
        └── localStorage.getItem / setItem  (browser API)
```

Storage keys:
| Key | Contents |
|---|---|
| `findash_expenses` | `Expense[]` |
| `findash_goals` | `SavingsGoal[]` |
| `findash_settings` | `AppSettings` (includes `theme`) |
| `findash_exchange_rates` | `ExchangeRates` (cache, 1h TTL) |

`getStorageItem` wraps `JSON.parse` in a `try/catch` so a corrupt entry (e.g. from a partial write during tab close) silently falls back to the default value instead of crashing on startup.

`useLocalStorage` accepts functional updaters — `set(prev => [...prev, item])` — using the same pattern as `useState`. The functional updater runs inside React's own `setValue` callback so batching is respected and the resolved value is always written to storage.

---

## 7. Currency & Exchange Rates

### Conversion model

All rates come from `open.er-api.com/v6/latest/EUR`. EUR is the fixed base, so every rate is "how many X per 1 EUR". Conversion between any two currencies uses EUR as an intermediate step:

```
amount (fromCurrency)
  → ÷ rates[fromCurrency]  →  amountInEUR
  → × rates[toCurrency]   →  amount (toCurrency)
```

If either rate is missing (API not yet loaded), the original amount is returned unchanged rather than showing zero.

### Caching

`useExchangeRates` (`src/hooks/useExchangeRates.ts`) checks `findash_exchange_rates` in localStorage on mount. If the cache is fresh (< 1 hour old) it is used immediately without a network request. On error the hook falls back to the stale cache rather than setting rates to `null` — this keeps conversion working when offline.

### Display vs. storage

Amounts are stored in their entered currency. The display currency (from `settings.preferredCurrency`) is applied at render time by passing `rates` down to every component that shows money. Changing the display currency requires no data migration.

---

## 8. Routing & Page Transitions

React Router v6 nested routes:

```
/              → Layout (Navbar + main)
  /            → Dashboard
  /expenses    → Expenses
  /savings     → Savings
  /settings    → Settings
```

`AnimatedPage` wraps each route's content with a Framer Motion `motion.div`. `AnimatePresence mode="wait"` in `AnimatedRoutes` ensures the outgoing page's exit animation completes before the incoming page's enter animation starts.

The `key={location.pathname}` on `<Routes>` is critical: it forces React to unmount the old page component, which is required for `AnimatePresence` to detect the exit. Without this key, the routes would swap content in place and no exit animation would run.

`AnimatedRoutes` is a **child** component of `App` (not inlined) because `useLocation()` requires a `<BrowserRouter>` ancestor that must be rendered in an outer component.

---

## 9. Component Architecture

### Shell

```
App
└── ErrorBoundary
    └── AppProvider
        ├── ThemeSync               (syncs settings.theme → <html class="dark">)
        └── BrowserRouter
            └── AnimatedRoutes
                └── AnimatePresence
                    └── Routes
                        └── Layout              (sticky Navbar + <Outlet />)
                            └── AnimatedPage
                                └── [Dashboard | Expenses | Savings | Settings]
```

### Modal system

`Modal` (`src/components/Modal.tsx`) renders into `document.body` via `createPortal`. This bypasses the stacking context of the sticky header and any `overflow: hidden` on parent elements. It has:

- Escape key listener (added when open, cleaned up when closed)
- Body scroll lock (`overflow: hidden` on `document.body`)
- `aria-labelledby` pointing to the modal's `<h2>` title via `useId()`
- Animated backdrop (fade) and panel (scale + slide up)
- Mobile bottom-sheet: `items-end` on the container, `rounded-t-2xl` on the panel, a drag-handle bar

`ConfirmDialog` is a thin wrapper around `Modal` that adds a warning icon and a confirm/cancel button pair, used for the "Clear All Data" action in Settings.

### Navbar layout animations

The active-indicator elements use Framer Motion `layoutId` so they animate between tabs as the user navigates:

- Desktop: `layoutId="desktop-pill"` — a background `div` slides under the active nav item
- Mobile: `layoutId="mobile-bar"` (top line) + `layoutId="mobile-bubble"` (icon background)

Each pair is wrapped in a separate `LayoutGroup` (`id="desktop-nav"` and `id="mobile-nav"`) because both DOM trees exist at the same time on a device where CSS breakpoints overlap during resize. Without scoping, Framer Motion would try to animate between a desktop element and a mobile element, producing incorrect cross-screen movement.

### Dark mode

Dark mode is implemented via Tailwind's `class` strategy — `dark:` utility variants activate when `<html>` carries the `dark` class.

**Toggle flow:**
1. User clicks the `ThemeToggle` button (sun/moon icon) in the Navbar
2. `setSettings(prev => ({ ...prev, theme: 'dark' | 'light' }))` is called
3. `AppContext` writes the updated `AppSettings` to `localStorage`
4. `ThemeSync` (a renderless component inside `AppProvider`) runs its `useEffect` on `settings.theme` and calls `document.documentElement.classList.toggle('dark', isDark)`
5. Tailwind's `dark:` variants activate/deactivate across all components

**Anti-flash script:** `index.html` contains an inline `<script>` that reads `findash_settings` from `localStorage` and adds `class="dark"` to `<html>` synchronously before the first paint. Without this, users with dark mode saved would see a brief flash of the light theme while React mounts.

**Smooth transitions:** `index.css` sets a `transition` rule on `*` inside `@layer base`:
```css
*, *::before, *::after {
  transition: color 250ms ease, background-color 250ms ease,
              border-color 250ms ease, fill 250ms ease,
              stroke 250ms ease, box-shadow 250ms ease;
}
```
Because it is in `@layer base` (lowest Tailwind cascade priority), any Tailwind utility class (`transition-colors` at 150ms, `transition-none`) overrides it for interactive elements, keeping hover and focus feedback snappy while the theme switch itself animates smoothly.

**Chart colors:** Chart.js renders to `<canvas>`, so `dark:` CSS classes have no effect on chart text or grid lines. `CategoryChart`, `MonthlyBarChart`, and `SavingsLineChart` each call `useApp()` to read `settings.theme` and pass explicit color values to Chart.js options (`ticks.color`, `grid.color`, `labels.color`). Because `settings.theme` lives in context, all three charts re-render automatically when the theme changes.

### Skeleton loaders

While exchange rates are loading, `SkeletonLoader.tsx` exports three shapes:
- `SummaryCardSkeleton` — 4 up in the Dashboard card grid
- `ChartSkeleton` — 2 up in the Dashboard chart grid
- `RatesWidgetSkeleton` — 5 currency cards

All use the `.skeleton-shimmer` CSS class defined in `index.css`, which animates a gradient sweep from left to right.

---

## 10. Charts

All three charts use Chart.js v4 with manual component registration (`ChartJS.register(...)`) at module level — only the required Chart.js plugins are bundled, not the entire library.

| Component | Chart type | Data source |
|---|---|---|
| `CategoryChart` | Doughnut | All expenses, grouped and summed by category |
| `MonthlyBarChart` | Bar | Last 6 calendar months, total spending per month |
| `SavingsLineChart` | Line (multi-series) | Each goal's history array, forward-filled to a shared date axis |

**Forward-fill in SavingsLineChart:** Goals receive fund additions on different dates, so a unified date axis is built from the union of all history dates. For each goal, dates with no entry carry the last known amount forward. This produces continuous lines rather than broken segments.

**Dark mode colors:** Each chart component calls `useApp()` to get `settings.theme` and derives `isDark`. Tick labels, grid lines, and legend text are set to `#9ca3af` (gray-400) in dark mode and `#6b7280` / `#374151` in light mode. Grid color switches from a near-transparent black (`0,0,0` at 4% opacity) to a near-transparent white (`255,255,255` at 6% opacity). This is necessary because Chart.js writes directly to a `<canvas>` element and does not respond to CSS class changes.

---

## 11. UI Patterns

### Amounts stored, display currency applied at render

Every component that shows money receives `displayCurrency` and `rates` as props. It calls `convertAmount(expense.amount, expense.currency, displayCurrency, rates)` inline. Changing `preferredCurrency` in Settings immediately re-renders every amount across all pages.

### Controlled forms with inline validation

`ExpenseForm` and `GoalForm` are fully controlled (all fields as `useState`). Validation runs on submit, not on every keystroke. Errors are stored in a `Record<string, string>` keyed by field name and displayed beneath their respective input.

Both forms serve double duty: when given `initialExpense` / `initialGoal`, they populate pre-filled fields and show "Update" instead of "Add / Create" on the submit button.

### Inline editing in ExpenseList

When the user clicks the edit pencil on an expense row, `editingId` is set to that expense's id. The list renders the `ExpenseForm` in place of the row, using `motion.div layout` so the list reflows smoothly. Submitting or cancelling clears `editingId`.

---

## 12. Testing

### Unit tests (Jest + React Testing Library)

Tests live in `tests/`. Jest is configured in `jest.config.cjs` (CJS extension required because `package.json` sets `"type": "module"`, which would make a `.js` config file use ESM by default).

Three Jest module mocks replace dependencies that are incompatible with jsdom:

| Mock file | Replaces | Reason |
|---|---|---|
| `tests/__mocks__/framer-motion.tsx` | `framer-motion` | `motion` components start at `initial` state (e.g. `opacity: 0`), making elements invisible in tests |
| `tests/__mocks__/react-chartjs-2.tsx` | `react-chartjs-2` | Chart.js requires a real Canvas API not available in jsdom |
| `tests/__mocks__/chartjs.ts` | `chart.js` | `ChartJS.register()` is called at module level; the mock provides the stub |

`src/setupTests.ts` also polyfills `crypto.randomUUID` because jsdom 20 does not implement it, and the forms call it to generate IDs.

### E2E tests (Playwright)

`playwright.config.ts` runs against two viewports:
- Desktop Chrome: 1280 × 720
- Mobile Safari: 390 × 844

The `webServer` option auto-starts `pnpm dev` before tests run, so no manual setup is needed.

---

## 13. Build & Bundling

`vite.config.ts` splits the bundle into four chunks to avoid a single 500 KB file and to maximise long-term cache hits (vendor chunks change only when dependencies are updated):

| Chunk | Contents | Approximate size |
|---|---|---|
| `react-vendor` | react, react-dom, react-router-dom | ~163 KB |
| `chart-vendor` | chart.js, react-chartjs-2 | ~185 KB |
| `motion-vendor` | framer-motion | ~136 KB |
| `app` | All application source | ~45 KB |

Build command: `pnpm build` → `tsc && vite build`

---

## 14. Data Flow Diagram

```
Browser localStorage
        │
        │  read on startup
        ▼
  useLocalStorage (hook)
        │  expenses[], goals[], settings{}
        ▼
    AppContext
        │  useApp() in any component
        ▼
┌───────────────────────────────────────────────────────┐
│                    Page Components                     │
│                                                       │
│  Dashboard    Expenses      Savings      Settings     │
│      │            │             │             │       │
│  reads:        reads:        reads:        reads:     │
│  expenses      expenses      goals         settings   │
│  goals         settings      settings                 │
│  settings                                             │
│                                                       │
│  writes via:   setExpenses   setGoals      setSettings│
└───────────────────────────────────────────────────────┘
        │
        │  display currency + rates passed as props
        ▼
  Child components (charts, cards, lists, forms)
        │
        │  convertAmount(amount, fromCurrency, displayCurrency, rates)
        ▼
  Formatted amounts in the user's preferred currency

──────────────────────────────────────────────
Exchange rate data flow (separate from app state):

open.er-api.com/v6/latest/EUR
        │
        │  fetch (skipped if cache is fresh)
        ▼
  useExchangeRates (hook)
        │  rates | loading | error
        ▼
  Dashboard / Expenses / Savings / Settings
        │
        │  rates passed down to charts and cards as props
```
