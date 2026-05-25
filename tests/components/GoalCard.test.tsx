import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalCard } from '../../src/components/GoalCard';
import type { SavingsGoal } from '../../src/types';

const RATES = { EUR: 1, USD: 1.09, GBP: 0.86, JPY: 160.5, TRY: 35.2 };

const makeGoal = (overrides: Partial<SavingsGoal> = {}): SavingsGoal => ({
  id: 'goal-1',
  name: 'Buy a laptop',
  targetAmount: 1200,
  savedAmount: 600,
  currency: 'EUR',
  createdAt: '2024-01-01',
  history: [],
  ...overrides,
});

describe('GoalCard', () => {
  const noop = () => undefined;

  it('renders goal name', () => {
    render(
      <GoalCard
        goal={makeGoal()}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={noop}
        onEdit={noop}
        onAddFunds={noop}
      />,
    );
    expect(screen.getByText('Buy a laptop')).toBeInTheDocument();
  });

  it('shows correct percentage', () => {
    render(
      <GoalCard
        goal={makeGoal({ savedAmount: 600, targetAmount: 1200 })}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={noop}
        onEdit={noop}
        onAddFunds={noop}
      />,
    );
    expect(screen.getByTestId('goal-percentage')).toHaveTextContent('50%');
  });

  it('shows 100% when goal is complete', () => {
    render(
      <GoalCard
        goal={makeGoal({ savedAmount: 1200, targetAmount: 1200 })}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={noop}
        onEdit={noop}
        onAddFunds={noop}
      />,
    );
    expect(screen.getByTestId('goal-percentage')).toHaveTextContent('100%');
    expect(screen.getByText('Goal reached!')).toBeInTheDocument();
  });

  it('shows Add Funds input when button is clicked', () => {
    render(
      <GoalCard
        goal={makeGoal()}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={noop}
        onEdit={noop}
        onAddFunds={noop}
      />,
    );
    fireEvent.click(screen.getByTestId('add-funds-button'));
    expect(screen.getByTestId('add-funds-input')).toBeInTheDocument();
  });

  it('calls onAddFunds with correct amount', () => {
    const onAddFunds = jest.fn();
    render(
      <GoalCard
        goal={makeGoal()}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={noop}
        onEdit={noop}
        onAddFunds={onAddFunds}
      />,
    );
    fireEvent.click(screen.getByTestId('add-funds-button'));
    fireEvent.change(screen.getByTestId('add-funds-input'), { target: { value: '200' } });
    fireEvent.click(screen.getByTestId('add-funds-confirm'));
    expect(onAddFunds).toHaveBeenCalledWith('goal-1', 200);
  });

  it('shows error for invalid funds amount', () => {
    render(
      <GoalCard
        goal={makeGoal()}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={noop}
        onEdit={noop}
        onAddFunds={noop}
      />,
    );
    fireEvent.click(screen.getByTestId('add-funds-button'));
    fireEvent.change(screen.getByTestId('add-funds-input'), { target: { value: '-5' } });
    fireEvent.click(screen.getByTestId('add-funds-confirm'));
    expect(screen.getByText('Enter a valid positive amount')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(
      <GoalCard
        goal={makeGoal()}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={onDelete}
        onEdit={noop}
        onAddFunds={noop}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-goal-button'));
    expect(onDelete).toHaveBeenCalledWith('goal-1');
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    const goal = makeGoal();
    render(
      <GoalCard
        goal={goal}
        displayCurrency="EUR"
        rates={RATES}
        onDelete={noop}
        onEdit={onEdit}
        onAddFunds={noop}
      />,
    );
    fireEvent.click(screen.getByTestId('edit-goal-button'));
    expect(onEdit).toHaveBeenCalledWith(goal);
  });

  it('converts and displays amounts in display currency', () => {
    render(
      <GoalCard
        goal={makeGoal({ savedAmount: 100, targetAmount: 1000, currency: 'EUR' })}
        displayCurrency="USD"
        rates={RATES}
        onDelete={noop}
        onEdit={noop}
        onAddFunds={noop}
      />,
    );
    // 100 EUR → 109 USD saved, 1000 EUR → 1090 USD target
    expect(screen.getByText(/109/)).toBeInTheDocument();
  });
});
