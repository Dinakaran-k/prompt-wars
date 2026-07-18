import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import CoachingCard from '../components/CoachingCard';

describe('CoachingCard', () => {
  test('renders a SUCCESS coaching response with message and nudge plan', () => {
    render(
      <CoachingCard
        coaching={{ status: 'SUCCESS', dailyMessage: 'You are doing great.', nudgePlan: ['Take a walk'] }}
        date="2026-07-18"
      />
    );

    expect(screen.getByText('You are doing great.')).toBeInTheDocument();
    expect(screen.getByText('Take a walk')).toBeInTheDocument();
  });

  test('renders an honest UNAVAILABLE state without fabricating content', () => {
    render(<CoachingCard coaching={{ status: 'UNAVAILABLE' }} date="2026-07-18" />);

    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
  });

  test('renders nothing when coaching is null', () => {
    const { container } = render(<CoachingCard coaching={null} date="2026-07-18" />);
    expect(container).toBeEmptyDOMElement();
  });
});
