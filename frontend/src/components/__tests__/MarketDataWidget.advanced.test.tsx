import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MarketDataWidget from "../MarketDataWidget";

global.fetch = jest.fn();

describe("MarketDataWidget (advanced/edge cases)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts different symbol inputs (case insensitivity)', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ symbol: 'msft', price: 99 }) });
    render(<MarketDataWidget />);
    const input = screen.getByPlaceholderText(/Symbol/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'msft' } });
    expect(input.value).toBe('MSFT');
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await screen.findByText(/msft/i);
    await screen.findByText(/99/);
  });

  it('updates UI when switching symbols after a result', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ symbol: 'AAPL', price: 123 }) });
    render(<MarketDataWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await screen.findByText(/AAPL/);
    const input = screen.getByPlaceholderText(/Symbol/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'TSLA' } });
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ symbol: 'TSLA', price: 456 }) });
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await screen.findByText(/TSLA/);
    await screen.findByText(/456/);
  });

  it('handles edge case: empty string as symbol', async () => {
    render(<MarketDataWidget />);
    const input = screen.getByPlaceholderText(/Symbol/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    // Should still call fetch, but UI should handle gracefully
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('handles edge case: very long symbol', async () => {
    const longSymbol = 'A'.repeat(100);
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ symbol: longSymbol, price: 1 }) });
    render(<MarketDataWidget />);
    const input = screen.getByPlaceholderText(/Symbol/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: longSymbol } });
    expect(input.value).toBe(longSymbol.toUpperCase());
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await screen.findByText(longSymbol.toUpperCase());
    await screen.findByText(/1/);
  });
});
