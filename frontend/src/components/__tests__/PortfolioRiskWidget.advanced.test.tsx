import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PortfolioRiskWidget from "../PortfolioRiskWidget";

global.fetch = jest.fn();

describe("PortfolioRiskWidget (advanced/edge cases)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts different portfolio IDs', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ portfolio_id: 'PORT-888', risk: 0.5, exposure: 1000, risk_score: 0.5, timestamp: '2025-06-01T00:00:00Z' }) });
    render(<PortfolioRiskWidget />);
    const input = screen.getByPlaceholderText(/Portfolio ID/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'PORT-888' } });
    expect(input.value).toBe('PORT-888');
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await screen.findByText(/PORT-888/);
    // Risk score may appear more than once, so check all matches
    const riskNodes = await screen.findAllByText(/0.5/);
    expect(riskNodes.length).toBeGreaterThan(0);
    const thousandNodes = await screen.findAllByText((content, node) =>
      !!(node && node.textContent && node.textContent.replace(/,/g, '').includes('1000'))
    );
    expect(thousandNodes.length).toBeGreaterThan(0);
    await screen.findByText(/2025-06-01T00:00:00Z/);
  }, 10000);

  it('updates UI when switching portfolio IDs after a result', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ portfolio_id: 'P-001', risk: 0.1, exposure: 2000, risk_score: 0.1, timestamp: '2025-06-01T00:00:00Z' }) });
    render(<PortfolioRiskWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await screen.findByText(/P-001/);
    const input = screen.getByPlaceholderText(/Portfolio ID/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'P-NEW' } });
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ portfolio_id: 'P-NEW', risk: 0.9, exposure: 5000, risk_score: 0.9, timestamp: '2025-06-01T00:00:00Z' }) });
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await screen.findByText(/P-NEW/);
    await screen.findByText(/0.9/);
  });

  it('handles edge case: empty string as portfolio ID', async () => {
    render(<PortfolioRiskWidget />);
    const input = screen.getByPlaceholderText(/Portfolio ID/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('handles edge case: very long portfolio ID', async () => {
    const longId = 'P'.repeat(100);
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ portfolio_id: longId, risk: 1, exposure: 9999, risk_score: 1, timestamp: '2025-06-01T00:00:00Z' }) });
    render(<PortfolioRiskWidget />);
    const input = screen.getByPlaceholderText(/Portfolio ID/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: longId } });
    expect(input.value).toBe(longId);
    fireEvent.click(screen.getByRole('button', { name: /Fetch/i }));
    // Check the long portfolio ID is shown
    await screen.findByText(longId);
    // Find the risk score by label and value, even if split across nodes
    const riskScoreDiv = screen.getByText((content, node) => {
      if (!node) return false;
      return node.textContent?.replace(/\s+/g, '') === 'RiskScore:1';
    });
    expect(riskScoreDiv).toBeInTheDocument();
  }, 10000);
});
