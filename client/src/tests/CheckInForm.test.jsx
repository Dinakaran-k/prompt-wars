import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckInForm from '../components/CheckInForm';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { post: vi.fn() }
}));

describe('CheckInForm', () => {
  beforeEach(() => {
    api.post.mockReset();
  });

  test('renders the check-in fields', () => {
    render(<CheckInForm onCheckedIn={vi.fn()} />);
    expect(screen.getByLabelText(/Screen time today/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check in/i })).toBeInTheDocument();
  });

  test('shows a validation error for invalid screen time and does not submit', () => {
    const onCheckedIn = vi.fn();
    render(<CheckInForm onCheckedIn={onCheckedIn} />);

    fireEvent.click(screen.getByRole('button', { name: /Check in/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
    expect(onCheckedIn).not.toHaveBeenCalled();
  });

  test('submits a valid check-in and calls onCheckedIn with the response', async () => {
    const mockResponse = {
      data: { checkIn: { date: '2026-07-18', screenTimeMinutes: 45 }, coaching: { status: 'SUCCESS', dailyMessage: 'Nice.', nudgePlan: ['Walk'] } }
    };
    api.post.mockResolvedValueOnce(mockResponse);

    const onCheckedIn = vi.fn();
    render(<CheckInForm onCheckedIn={onCheckedIn} />);

    fireEvent.change(screen.getByLabelText(/Screen time today/i), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: /Check in/i }));

    await waitFor(() => expect(onCheckedIn).toHaveBeenCalledWith(mockResponse.data));
    expect(api.post).toHaveBeenCalledWith('/checkins', expect.objectContaining({ screenTimeMinutes: 45 }));
  });

  test('shows an error state when the API call fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { error: 'Server error' } } });

    render(<CheckInForm onCheckedIn={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Screen time today/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Check in/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });
});
