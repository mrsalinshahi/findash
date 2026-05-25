# FinDash — Savings & Expense Tracker

A full-stack personal finance web app built with React 18, TypeScript, and Vite. Track expenses by category, set savings goals with progress bars, view live exchange rates, and visualise spending with Chart.js.

## Features

| Feature | Detail |
|---|---|
| **Expense Tracker** | Log expenses with name, amount, currency, category (Food / Transport / Entertainment / Health / Other), and date |
| **Savings Goals** | Create goals with a target amount; add funds incrementally; see live progress bars |
| **Live Exchange Rates** | Fetches from `open.er-api.com` (1-hour cache); supports EUR, USD, GBP, JPY, TRY |
| **Charts** | Doughnut (category breakdown), Bar (monthly spending), Line (savings progress over time) |
| **Dashboard** | Summary cards, recent expenses, exchange rates widget |
| **Currency conversion** | All amounts displayed in your preferred currency using live rates |
| **Responsive** | Mobile-first layout (390 px) with bottom tab nav; adapts to 1280 px desktop |
| **Offline-friendly** | Data persisted in `localStorage`; stale exchange rate cache used on API failure |

## Tech Stack

- **React 18** + **TypeScript** + **Vite 5**
- **React Router v6** — Dashboard / Expenses / Savings / Settings
- **Chart.js 4** + **react-chartjs-2**
- **Tailwind CSS v3** — utility-first styling
- **Jest 29** + **React Testing Library** — unit tests
- **Playwright** — end-to-end tests (desktop + mobile viewports)

## Project Structure

```
findash/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # AppContext — shared state via localStorage
│   ├── hooks/            # useLocalStorage, useExchangeRates
│   ├── pages/            # Dashboard, Expenses, Savings, Settings
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # currency, dates, storage helpers
│   └── App.tsx
├── tests/                # Jest unit tests
│   ├── components/
│   ├── utils/
│   └── __mocks__/
├── e2e/                  # Playwright E2E tests
├── public/
├── vite.config.ts
├── jest.config.cjs
├── playwright.config.ts
└── package.json
```

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+ (`npm install -g pnpm`)

### Install

```bash
pnpm install
```

### Run development server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
pnpm build
pnpm preview
```

## Running Tests

### Unit tests (Jest)

```bash
# Run once
pnpm test

# Watch mode
pnpm test:watch

# With coverage report
pnpm test:coverage
```

Tests cover:

- `utils/currency` — `convertAmount`, `formatCurrency`, constants
- `utils/dates` — date helpers, month prefix utilities
- `components/GoalCard` — rendering, add funds flow, edit/delete callbacks
- `components/ExpenseForm` — validation, submission, prefill, cancel
- `components/CategoryChart` — chart rendering, empty state

### End-to-end tests (Playwright)

```bash
# Headless (starts dev server automatically)
pnpm test:e2e

# With browser UI
pnpm test:e2e:headed

# Playwright UI mode
pnpm test:e2e:ui
```

E2E tests run against both **Desktop Chrome** (1280×720) and **Mobile Safari** (390×844) and cover:

- Adding an expense and verifying it appears in the list
- Creating a savings goal and updating progress with funds
- Switching currency and verifying converted amounts update

### Install Playwright browsers (first time)

```bash
pnpm exec playwright install
```

## Configuration

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite / React plugin config |
| `tailwind.config.js` | Tailwind content paths |
| `jest.config.cjs` | Jest with ts-jest, jsdom, chart mocks |
| `playwright.config.ts` | Desktop + Mobile projects, auto web server |

## Key Design Decisions

- **Context over prop drilling** — `AppContext` holds all app state and syncs to `localStorage` on every change.
- **1-hour exchange rate cache** — avoids hammering the free API; stale data is used on failure rather than crashing.
- **No backend** — all data lives in the browser via `localStorage`.
- **Mobile-first** — Tailwind base styles target 390 px; responsive breakpoints add desktop layout.
- **TypeScript strict mode** — `strict: true`, no `any` types.
