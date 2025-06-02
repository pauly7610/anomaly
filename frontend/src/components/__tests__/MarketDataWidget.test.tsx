import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MarketDataWidget from "../MarketDataWidget";

global.fetch = jest.fn();

describe("MarketDataWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input and button", () => {
    render(<MarketDataWidget />);
    expect(screen.getByPlaceholderText(/Symbol/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fetch/i })).toBeInTheDocument();
  });

  it("shows loading spinner on submit", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ symbol: "AAPL", price: 123.45 }) });
    render(<MarketDataWidget />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Fetch/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Fetch/i }));
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it("shows error on failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ detail: "Error" }) });
    render(<MarketDataWidget />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Fetch/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Fetch/i }));
    await screen.findByText(/Failed to fetch market data/i);
  });

  it("shows result on success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ symbol: "AAPL", price: 123.45, volume: 1000000, trading_halt: false, timestamp: "2025-06-01T00:00:00Z" }) });
    render(<MarketDataWidget />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Fetch/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Fetch/i }));
    await screen.findByText(/AAPL/);
    expect(screen.getByText(/123.45/)).toBeInTheDocument();
  }, 15000);

  it("updates symbol input", () => {
    render(<MarketDataWidget />);
    const input = screen.getByPlaceholderText(/Symbol/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'msft' } });
    expect(input.value).toBe('MSFT');
  });

  it("handles empty/null/missing API response gracefully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<MarketDataWidget />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Fetch/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Fetch/i }));
    // Use a function matcher for fallback/empty state
    await waitFor(() => {
      const nodes = screen.queryAllByText((content, node) =>
        /AAPL|no result|error|price|symbol/i.test(node?.textContent || "")
      );
      expect(nodes.length).toBeGreaterThan(0);
    });
    // Try null
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => null });
    await waitFor(() => expect(screen.getByRole("button", { name: /Fetch/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Fetch/i }));
    // Check for any of the expected fallback/empty/error texts
    const fallbackNodes = await screen.findAllByText(
      (content, node) => {
        if (!node) return false;
        const txt = node.textContent?.toLowerCase() || '';
        return (
          txt.includes('aapl') ||
          txt.includes('no result') ||
          txt.includes('error') ||
          txt.includes('price') ||
          txt.includes('symbol')
        );
      },
      {},
    );
    expect(fallbackNodes.length).toBeGreaterThan(0);
    // Try missing fields
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ symbol: 'TSLA' }) });
    await waitFor(() => expect(screen.getByRole("button", { name: /Fetch/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Fetch/i }));
    await screen.findByText(/TSLA/);
  });

  it("shows error if fetch throws", async () => {
    (global.fetch as any) = jest.fn(() => { throw new Error('Network fail'); });
    render(<MarketDataWidget />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Fetch/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Fetch/i }));
    await screen.findByText(/Network fail/i);
  });
});
