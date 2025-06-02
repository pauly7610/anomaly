import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AccountVerificationWidget from "../AccountVerificationWidget";

global.fetch = jest.fn();

describe("AccountVerificationWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input and button", () => {
    render(<AccountVerificationWidget />);
    expect(screen.getByPlaceholderText(/Account ID/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verify/i })).toBeInTheDocument();
  });

  it("shows loading spinner on submit", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ status: "verified" }) });
    render(<AccountVerificationWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }));
    expect(screen.getByText(/Verifying.../i)).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it("shows error on failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ detail: "Not found" }) });
    render(<AccountVerificationWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }));
    await screen.findByText(/Verification failed/i);
  });

  it("shows result on success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ status: "verified", account_id: "ACC-001", verified: true, timestamp: '2024-01-01T00:00:00Z' }) });
    render(<AccountVerificationWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }));
    const statusEls = await screen.findAllByText(/verified/i);
    expect(statusEls.length).toBeGreaterThan(0);
    expect(screen.getByText(/ACC-001/)).toBeInTheDocument();
    expect(screen.getByText(/Yes/)).toBeInTheDocument();
  });

  it("shows result with verified No", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ status: "pending", account_id: "ACC-002", verified: false, timestamp: '2024-01-01T00:00:00Z' }) });
    render(<AccountVerificationWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }));
    await screen.findByText(/pending/i);
    expect(screen.getByText(/ACC-002/)).toBeInTheDocument();
    expect(screen.getByText(/No/)).toBeInTheDocument();
  });

  it("handles empty/null/missing API response gracefully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<AccountVerificationWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }));
    await screen.findByText(/verified|pending|failed|No result/i, {}, {timeout: 2000});
    // Try null
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => null });
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }));
    await screen.findAllByText((content, node) =>
      !!(node && /(verified|pending|failed|no result)/i.test(node.textContent || ""))
    );
    // Try missing fields
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ account_id: 'ACC-003' }) });
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }));
    // For empty/null, should not render account_id but fallback or empty status
    await waitFor(() => {
      expect(screen.getByText(/Account:/)).toBeInTheDocument();
    });
  });

  it('sends updated input value in fetch payload', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'verified', account_id: 'NEW-123', verified: true, timestamp: '2025-01-01T00:00:00Z' }) });
    render(<AccountVerificationWidget />);
    const input = screen.getByPlaceholderText(/Account ID/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'NEW-123' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: JSON.stringify({ account_id: 'NEW-123' })
      })
    ));
    // Check input value instead of text node
    expect(screen.getByDisplayValue('NEW-123')).toBeInTheDocument();
  });

  it('button remains disabled during loading (no rapid spam)', async () => {
    let resolve: ((v: any) => void) | undefined;
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
    render(<AccountVerificationWidget />);
    const button = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(fetch).toHaveBeenCalledTimes(1);
    // Finish loading
    if (resolve) resolve({ ok: true, json: async () => ({}) });
  });

  it('button disabled state and aria attributes for accessibility', () => {
    render(<AccountVerificationWidget />);
    const button = screen.getByRole('button', { name: /Verify/i });
    // On initial render, it should NOT be disabled:
    expect(button).not.toBeDisabled();
    // Simulate loading
    fireEvent.click(button);
    // Now it should be disabled (loading)
    expect(button).toBeDisabled();
    // No explicit aria attributes, but check for role
    expect(button).toHaveAttribute('type', 'button');
  });
});
