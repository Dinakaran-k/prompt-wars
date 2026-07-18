import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlannerForm from '../components/PlannerForm';

describe('PlannerForm Component Tests', () => {
  test('renders form elements properly', () => {
    render(<PlannerForm onSubmit={vi.fn()} loading={false} />);
    
    expect(screen.getByLabelText(/Day's Schedule/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of People/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dietary Preference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Plan/i })).toBeInTheDocument();
  });

  test('validates blank input fields', async () => {
    const handleSubmit = vi.fn();
    render(<PlannerForm onSubmit={handleSubmit} loading={false} />);

    // Click submit with empty form values
    fireEvent.click(screen.getByRole('button', { name: /Generate Plan/i }));

    expect(screen.getByText(/Schedule context is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Budget is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('validates negative/invalid values', async () => {
    const handleSubmit = vi.fn();
    render(<PlannerForm onSubmit={handleSubmit} loading={false} />);

    // Fill in schedule
    fireEvent.change(screen.getByLabelText(/Day's Schedule/i), {
      target: { value: 'some context' }
    });

    // Fill in invalid people (e.g. decimal)
    fireEvent.change(screen.getByLabelText(/Number of People/i), {
      target: { value: '2.5' }
    });

    // Fill in invalid budget (negative)
    fireEvent.change(screen.getByLabelText(/Budget/i), {
      target: { value: '-20' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate Plan/i }));

    expect(screen.getByText(/Number of people must be a positive integer/i)).toBeInTheDocument();
    expect(screen.getByText(/Budget must be a positive number/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('submits form with correct data when values are valid', async () => {
    const handleSubmit = vi.fn();
    render(<PlannerForm onSubmit={handleSubmit} loading={false} />);

    // Fill in all valid fields
    fireEvent.change(screen.getByLabelText(/Day's Schedule/i), {
      target: { value: 'meetings till 6 PM, 30 min for dinner' }
    });

    fireEvent.change(screen.getByLabelText(/Number of People/i), {
      target: { value: '3' }
    });

    fireEvent.change(screen.getByLabelText(/Dietary Preference/i), {
      target: { value: 'Vegan' }
    });

    fireEvent.change(screen.getByLabelText(/Budget/i), {
      target: { value: '60' }
    });

    fireEvent.change(screen.getByLabelText(/Currency/i), {
      target: { value: '$' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate Plan/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      schedule: 'meetings till 6 PM, 30 min for dinner',
      people: 3,
      diet: 'Vegan',
      budget: 60,
      currency: '$'
    });
  });
});
