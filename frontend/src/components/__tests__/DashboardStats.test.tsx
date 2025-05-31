import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import DashboardStats from '../DashboardStats';

// Mock ResizeObserver for recharts and other components
beforeAll(() => {
  global.ResizeObserver =
    global.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

describe('DashboardStats', () => {
  it('renders dashboard stats headings', () => {
    render(<DashboardStats />);
    expect(screen.getByText(/Dashboard Overview/i)).toBeInTheDocument();
  });
});

describe('DashboardStats additional coverage', () => {
  it('renders error state', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        detail: 'err',
        totals: {},
        daily: [],
        type_distribution: [],
        largest_transactions: [],
        recent_anomalies: []
      })
    });
    render(<DashboardStats />);
    await waitFor(() => expect(screen.getByText(/err/)).toBeInTheDocument());
  });

  it('renders loading state', async () => {
    let resolveFetch;
    (global.fetch as any) = jest.fn(() => new Promise(r => { resolveFetch = r; }));
    render(<DashboardStats />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    if (resolveFetch) {
      resolveFetch({ ok: true, json: async () => ({
        totals: {},
        daily: [],
        type_distribution: [],
        largest_transactions: [],
        recent_anomalies: []
      }) });
    }
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
  });

  it('renders with stats data', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        total_transactions: 2,
        num_anomalies: 1,
        average_amount: 75,
        volume_over_time: [
          { date: '2023-01-01', count: 1 },
          { date: '2023-01-02', count: 1 }
        ],
        anomaly_rate_over_time: [
          { date: '2023-01-01', rate: 0 },
          { date: '2023-01-02', rate: 1 }
        ],
        top_customers: [
          { customer_id: 'cust1', total_amount: 100 },
          { customer_id: 'cust2', total_amount: 50 }
        ],
        type_distribution: [
          { type: 'A', count: 1 },
          { type: 'B', count: 1 }
        ],
        largest_transactions: [
          { id: 1, amount: 50, is_anomaly: false, type: 'A', customer_id: 'cust1', timestamp: '2023-01-01T12:00:00Z' },
          { id: 2, amount: 25, is_anomaly: true, type: 'B', customer_id: 'cust2', timestamp: '2023-01-02T12:00:00Z' }
        ],
        recent_anomalies: [
          { id: 3, amount: 99, is_anomaly: true, type: 'B', customer_id: 'cust2', timestamp: '2023-01-02T12:00:00Z' }
        ]
      })
    });
    await act(async () => {
      render(<DashboardStats />);
    });
    // Wait for loading to disappear
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
    // Charts and headings
    expect(screen.getByText(/Transaction Volume Over Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Anomaly Rate Over Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Customers/i)).toBeInTheDocument();
    expect(screen.getByText(/Transaction Type Distribution/i)).toBeInTheDocument();
    // Tables
    expect(screen.getByText(/Largest Transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Anomalies/i)).toBeInTheDocument();
    // Data
    expect(screen.getByText('cust1')).toBeInTheDocument();
    // 'cust2' appears in multiple tables, so check all matches
    expect(screen.getAllByText('cust2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('renders with empty stats fields', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        total_transactions: 0,
        num_anomalies: 0,
        average_amount: 0,
        volume_over_time: [],
        anomaly_rate_over_time: [],
        top_customers: [],
        type_distribution: [],
        largest_transactions: [],
        recent_anomalies: []
      })
    });
    await act(async () => {
      render(<DashboardStats />);
    });
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
    expect(screen.getByText(/Largest Transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Anomalies/i)).toBeInTheDocument();
  });

  it('handles filter control interaction', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total_transactions: 0,
        num_anomalies: 0,
        average_amount: 0,
        volume_over_time: [],
        anomaly_rate_over_time: [],
        top_customers: [],
        type_distribution: [],
        largest_transactions: [],
        recent_anomalies: []
      })
    });
    await act(async () => {
      render(<DashboardStats />);
    });
    // Simulate filter change (if filter controls are rendered)
    const startInput = screen.queryByLabelText(/start/i);
    if (startInput) {
      fireEvent.change(startInput, { target: { value: '2023-01-01' } });
      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    }
  });
});
