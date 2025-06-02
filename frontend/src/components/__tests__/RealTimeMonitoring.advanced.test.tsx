import React from 'react';
import { render, screen } from '@testing-library/react';
import RealTimeMonitoring from '../RealTimeMonitoring';

describe('RealTimeMonitoring (advanced/edge cases)', () => {
  it('renders events with missing fields', () => {
    const events = [
      { received: '2025-01-01T00:00:00Z' },
      { received: '2025-01-01T01:00:00Z', type: 'ALERT' },
      { received: '2025-01-01T02:00:00Z', message: 'Only message' },
      { received: '2025-01-01T03:00:00Z', event_id: 'E999' }
    ];
    render(<RealTimeMonitoring wsEvents={events} />);
    expect(screen.getByText(/2025-01-01T00:00:00Z/)).toBeInTheDocument();
    expect(screen.getByText(/2025-01-01T01:00:00Z/)).toBeInTheDocument();
    expect(screen.getByText(/2025-01-01T02:00:00Z/)).toBeInTheDocument();
    expect(screen.getByText(/2025-01-01T03:00:00Z/)).toBeInTheDocument();
    expect(screen.getByText(/E999/)).toBeInTheDocument();
    expect(screen.getByText(/Only message/)).toBeInTheDocument();
  });

  it('renders a very large event list (overflow/scroll)', () => {
    const events = Array.from({ length: 100 }, (_, i) => ({
      received: `2025-01-01T00:${i.toString().padStart(2, '0')}:00Z`,
      type: 'INFO',
      message: `Event ${i}`
    }));
    render(<RealTimeMonitoring wsEvents={events} />);
    expect(screen.getByText(/Event 0/)).toBeInTheDocument();
    expect(screen.getByText(/Event 99/)).toBeInTheDocument();
    // The list should have scroll/overflow, but we can't test scrolling directly in jsdom
    const list = screen.getByRole('list');
    expect(list.className).toMatch(/overflow-y-auto/);
  });

  it('has proper accessibility roles/attributes', () => {
    // Only check for role=list when events exist
    const events = [
      { received: '2025-01-01T00:00:00Z', type: 'ALERT', message: 'Alert' }
    ];
    render(<RealTimeMonitoring wsEvents={events} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});
