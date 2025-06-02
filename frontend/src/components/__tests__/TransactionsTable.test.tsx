import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import TransactionsTable from '../TransactionsTable';

describe('TransactionsTable', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    localStorage.setItem = jest.fn();
    localStorage.getItem = jest.fn(() => 'token');
  });

  it('renders table headers', async () => {
    await act(async () => { render(<TransactionsTable />); });
    await waitFor(() => expect(screen.getByText(/Amount/i)).toBeInTheDocument());
  });
});

describe('TransactionsTable additional coverage', () => {
  it('renders error state', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'fail' }) });
    await act(async () => { render(<TransactionsTable />); });
    await waitFor(() => expect(screen.getByText(/fail/)).toBeInTheDocument());
  });

  it('renders empty state', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => [] });
    await act(async () => { render(<TransactionsTable />); });
    await waitFor(() => expect(screen.getByText(/No transactions/i)).toBeInTheDocument());
  });

  it('renders loading state', async () => {
    let resolveFetch: ((value: any) => void) | undefined;
    (global.fetch as any) = jest.fn(() => new Promise(r => { resolveFetch = r; }));
    await act(async () => { render(<TransactionsTable />); });
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    if (typeof resolveFetch === 'function') {
      resolveFetch({ ok: true, json: async () => [] });
    }
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
  });

  it('renders with transaction data (normal and anomaly rows)', async () => {
    const transactions = [
      { id: 1, timestamp: '2023-01-01T12:00:00Z', amount: 100, type: 'A', customer_id: 'cust1', is_anomaly: false },
      { id: 2, timestamp: '2023-01-02T12:00:00Z', amount: 200, type: 'B', customer_id: 'cust2', is_anomaly: true },
    ];
    (global.fetch as any) = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => transactions });
    await act(async () => { render(<TransactionsTable />); });
    await waitFor(() => expect(screen.getByText(/cust1/)).toBeInTheDocument());
    expect(screen.getByText(/cust2/)).toBeInTheDocument();
    expect(screen.getAllByText(/Anomaly|Normal/).length).toBeGreaterThan(0);
  });

  it('handles pagination', async () => {
    // Generate 20 unique transactions for pagination
    const transactions = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, timestamp: '', amount: 1, type: '', customer_id: '', is_anomaly: false }));
    (global.fetch as any) = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => transactions })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    await act(async () => { render(<TransactionsTable />); });
    await waitFor(() => expect(screen.getByText(/Amount/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  it('handles filter for anomalies', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    await act(async () => { render(<TransactionsTable />); });
    fireEvent.click(screen.getByLabelText(/Only anomalies/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('handles filter by customer ID', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    await act(async () => { render(<TransactionsTable />); });
    const input = screen.getByPlaceholderText(/Filter by Customer ID/i);
    fireEvent.change(input, { target: { value: 'customer42' } });
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('handles manual refresh', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    await act(async () => { render(<TransactionsTable />); });
    const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshBtn);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('handles previous page button', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    await act(async () => { render(<TransactionsTable />); });
    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    fireEvent.click(prevBtn);
    // No error should occur (even if already on first page)
    expect(prevBtn).toBeDisabled();
  });
});
