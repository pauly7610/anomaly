import React from 'react';
import { render, screen } from '@testing-library/react';
import RealTimeMonitoring from '../RealTimeMonitoring';

describe('RealTimeMonitoring', () => {
  it('renders empty state', () => {
    render(<RealTimeMonitoring wsEvents={[]} />);
    expect(screen.getByText(/No events received yet/i)).toBeInTheDocument();
  });

  it('renders a list of events', () => {
    const events = [
      { received: '2024-01-01T00:00:00Z', type: 'ALERT', message: 'Test alert' },
      { received: '2024-01-01T01:00:00Z', type: 'INFO', status: 'System OK' },
      { received: '2024-01-01T02:00:00Z', type: 'WARN', event_id: 'E123', event: 'Warning' }
    ];
    render(<RealTimeMonitoring wsEvents={events} />);
    expect(screen.getByText(/Test alert/)).toBeInTheDocument();
    expect(screen.getByText(/System OK/)).toBeInTheDocument();
    const e123Node = screen.getByText(/E123/);
    // The event row should contain both 'WARN' and 'E123' in its textContent
    expect(e123Node.closest('li')?.textContent).toContain('WARN');
    expect(e123Node.closest('li')?.textContent).toContain('E123');
  });
});
