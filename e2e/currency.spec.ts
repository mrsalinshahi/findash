import { test, expect } from '@playwright/test';

test.describe('Currency switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('findash_settings');
      localStorage.removeItem('findash_expenses');
      localStorage.removeItem('findash_goals');
    });
  });

  test('settings page shows all supported currencies', async ({ page }) => {
    await page.goto('/settings');
    for (const currency of ['EUR', 'USD', 'GBP', 'JPY', 'TRY']) {
      await expect(page.getByTestId(`currency-option-${currency}`)).toBeVisible();
    }
  });

  test('selecting a currency updates the preference', async ({ page }) => {
    await page.goto('/settings');

    await page.getByTestId('currency-option-USD').click();

    // USD button should now show as selected (has the indigo border class)
    const usdBtn = page.getByTestId('currency-option-USD');
    await expect(usdBtn).toHaveClass(/border-indigo-500/);
  });

  test('switching currency updates displayed amounts on expenses page', async ({ page }) => {
    // Seed an expense in EUR
    await page.evaluate(() => {
      const expense = {
        id: 'e1',
        name: 'Dinner',
        amount: 100,
        currency: 'EUR',
        category: 'Food',
        date: '2024-06-01',
      };
      localStorage.setItem('findash_expenses', JSON.stringify([expense]));
      localStorage.setItem('findash_settings', JSON.stringify({ preferredCurrency: 'EUR' }));
    });

    await page.goto('/expenses');
    // With EUR preference the amount shows as EUR
    await expect(page.getByText('Dinner')).toBeVisible();

    // Switch to USD
    await page.goto('/settings');
    await page.getByTestId('currency-option-USD').click();

    // Go back to expenses — the expense amount should now show USD
    await page.goto('/expenses');
    await expect(page.getByText('Dinner')).toBeVisible();
    // The converted amount should appear ($ sign from USD formatting)
    await expect(page.locator('[data-testid="expense-item"]').first()).toContainText('$');
  });

  test('switching currency updates dashboard summary cards', async ({ page }) => {
    await page.evaluate(() => {
      const expense = {
        id: 'e1',
        name: 'Test',
        amount: 50,
        currency: 'EUR',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem('findash_expenses', JSON.stringify([expense]));
      localStorage.setItem('findash_settings', JSON.stringify({ preferredCurrency: 'EUR' }));
    });

    await page.goto('/');
    // Wait for exchange rates or skeleton to resolve
    await page.waitForTimeout(1000);

    // Switch to GBP
    await page.goto('/settings');
    await page.getByTestId('currency-option-GBP').click();

    await page.goto('/');
    await page.waitForTimeout(500);
    // GBP symbol should appear somewhere in the summary
    const body = await page.locator('body').textContent();
    expect(body).toContain('£');
  });

  test('EUR is selected by default', async ({ page }) => {
    await page.goto('/settings');
    const eurBtn = page.getByTestId('currency-option-EUR');
    await expect(eurBtn).toHaveClass(/border-indigo-500/);
  });
});
