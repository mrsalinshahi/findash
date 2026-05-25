import { test, expect } from '@playwright/test';

test.describe('Savings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('findash_expenses');
      localStorage.removeItem('findash_goals');
    });
    await page.goto('/savings');
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.getByText('No savings goals yet')).toBeVisible();
  });

  test('opens goal form when New Goal is clicked', async ({ page }) => {
    await page.getByTestId('toggle-goal-form').click();
    await expect(page.getByTestId('goal-form')).toBeVisible();
  });

  test('creates a new savings goal', async ({ page }) => {
    await page.getByTestId('toggle-goal-form').click();

    await page.getByTestId('goal-name-input').fill('New MacBook');
    await page.getByTestId('goal-target-input').fill('2000');
    await page.getByTestId('goal-currency-select').selectOption('EUR');
    await page.getByTestId('goal-submit-button').click();

    await expect(page.getByTestId('goal-card')).toBeVisible();
    await expect(page.getByText('New MacBook')).toBeVisible();
    await expect(page.getByTestId('goal-percentage')).toHaveText('0%');
  });

  test('shows validation errors for empty goal form', async ({ page }) => {
    await page.getByTestId('toggle-goal-form').click();
    await page.getByTestId('goal-submit-button').click();
    await expect(page.getByText('Goal name is required')).toBeVisible();
    await expect(page.getByText('Enter a valid target amount')).toBeVisible();
  });

  test('adds funds to a goal and updates progress bar', async ({ page }) => {
    // Create a goal first
    await page.getByTestId('toggle-goal-form').click();
    await page.getByTestId('goal-name-input').fill('Vacation Fund');
    await page.getByTestId('goal-target-input').fill('1000');
    await page.getByTestId('goal-submit-button').click();

    await expect(page.getByTestId('goal-card')).toBeVisible();
    expect(await page.getByTestId('goal-percentage').textContent()).toBe('0%');

    // Add funds
    await page.getByTestId('add-funds-button').click();
    await page.getByTestId('add-funds-input').fill('250');
    await page.getByTestId('add-funds-confirm').click();

    await expect(page.getByTestId('goal-percentage')).toHaveText('25%');
  });

  test('reaching 100% shows goal reached message', async ({ page }) => {
    await page.evaluate(() => {
      const goal = {
        id: 'g1',
        name: 'Emergency Fund',
        targetAmount: 500,
        savedAmount: 500,
        currency: 'EUR',
        createdAt: '2024-01-01',
        history: [{ date: '2024-06-01', amount: 500 }],
      };
      localStorage.setItem('findash_goals', JSON.stringify([goal]));
    });
    await page.reload();

    await expect(page.getByText('Goal reached!')).toBeVisible();
    await expect(page.getByTestId('goal-percentage')).toHaveText('100%');
  });

  test('deletes a savings goal', async ({ page }) => {
    await page.evaluate(() => {
      const goal = {
        id: 'g1',
        name: 'Delete Me',
        targetAmount: 100,
        savedAmount: 0,
        currency: 'EUR',
        createdAt: '2024-01-01',
        history: [],
      };
      localStorage.setItem('findash_goals', JSON.stringify([goal]));
    });
    await page.reload();

    await expect(page.getByText('Delete Me')).toBeVisible();
    await page.getByTestId('delete-goal-button').click();
    await expect(page.getByText('Delete Me')).not.toBeVisible();
  });

  test('can edit an existing goal', async ({ page }) => {
    await page.evaluate(() => {
      const goal = {
        id: 'g1',
        name: 'Old Name',
        targetAmount: 500,
        savedAmount: 0,
        currency: 'EUR',
        createdAt: '2024-01-01',
        history: [],
      };
      localStorage.setItem('findash_goals', JSON.stringify([goal]));
    });
    await page.reload();

    await page.getByTestId('edit-goal-button').click();
    await page.getByTestId('goal-name-input').fill('New Name');
    await page.getByTestId('goal-submit-button').click();

    await expect(page.getByText('New Name')).toBeVisible();
    await expect(page.getByText('Old Name')).not.toBeVisible();
  });
});
