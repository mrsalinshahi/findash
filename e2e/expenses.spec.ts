import { test, expect } from '@playwright/test';

test.describe('Expenses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure a clean state
    await page.evaluate(() => {
      localStorage.removeItem('findash_expenses');
      localStorage.removeItem('findash_goals');
    });
    await page.goto('/expenses');
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.getByText('No expenses yet')).toBeVisible();
  });

  test('opens expense form when Add Expense button is clicked', async ({ page }) => {
    await page.getByTestId('toggle-expense-form').click();
    await expect(page.getByTestId('expense-form')).toBeVisible();
  });

  test('adds a new expense and it appears in the list', async ({ page }) => {
    await page.getByTestId('toggle-expense-form').click();

    await page.getByTestId('expense-name-input').fill('Coffee');
    await page.getByTestId('expense-amount-input').fill('3.50');
    await page.getByTestId('expense-currency-select').selectOption('EUR');
    await page.getByTestId('expense-category-select').selectOption('Food');
    await page.getByTestId('expense-date-input').fill('2024-06-15');

    await page.getByTestId('expense-submit-button').click();

    await expect(page.getByTestId('expense-list')).toBeVisible();
    await expect(page.getByText('Coffee')).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.getByTestId('toggle-expense-form').click();
    await page.getByTestId('expense-submit-button').click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Enter a valid positive amount')).toBeVisible();
  });

  test('multiple expenses appear in the list', async ({ page }) => {
    await page.getByTestId('toggle-expense-form').click();

    const addExpense = async (name: string, amount: string) => {
      await page.getByTestId('expense-name-input').fill(name);
      await page.getByTestId('expense-amount-input').fill(amount);
      await page.getByTestId('expense-date-input').fill('2024-06-15');
      await page.getByTestId('expense-submit-button').click();
      // Re-open form after auto-close
      await page.getByTestId('toggle-expense-form').click();
    };

    await addExpense('Grocery', '45.00');
    await addExpense('Bus ticket', '2.50');

    await expect(page.getByText('Grocery')).toBeVisible();
    await expect(page.getByText('Bus ticket')).toBeVisible();
  });

  test('deletes an expense', async ({ page }) => {
    // Seed via localStorage
    await page.evaluate(() => {
      const expense = {
        id: 'test-exp-1',
        name: 'Lunch',
        amount: 12,
        currency: 'EUR',
        category: 'Food',
        date: '2024-06-10',
      };
      localStorage.setItem('findash_expenses', JSON.stringify([expense]));
    });
    await page.reload();

    await expect(page.getByText('Lunch')).toBeVisible();
    await page.getByTestId('delete-expense-button').first().click();
    await expect(page.getByText('Lunch')).not.toBeVisible();
  });

  test('can filter expenses by category', async ({ page }) => {
    // Seed two expenses with different categories
    await page.evaluate(() => {
      const expenses = [
        { id: 'e1', name: 'Pizza', amount: 15, currency: 'EUR', category: 'Food', date: '2024-06-01' },
        { id: 'e2', name: 'Metro', amount: 2.5, currency: 'EUR', category: 'Transport', date: '2024-06-01' },
      ];
      localStorage.setItem('findash_expenses', JSON.stringify(expenses));
    });
    await page.reload();

    await page.getByTestId('filter-Food').click();
    await expect(page.getByText('Pizza')).toBeVisible();
    await expect(page.getByText('Metro')).not.toBeVisible();

    await page.getByTestId('filter-Transport').click();
    await expect(page.getByText('Metro')).toBeVisible();
    await expect(page.getByText('Pizza')).not.toBeVisible();
  });
});
