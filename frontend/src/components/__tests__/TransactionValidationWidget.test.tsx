import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionValidationWidget from "../TransactionValidationWidget";

global.fetch = jest.fn();

describe("TransactionValidationWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input and button", () => {
    render(<TransactionValidationWidget />);
    expect(screen.getByPlaceholderText(/Account ID/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Validate/i })).toBeInTheDocument();
  });

  it("shows loading spinner on submit", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ valid: true }) });
    render(<TransactionValidationWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Validate/i }));
    expect(screen.getByText(/Validating.../i)).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it("shows error on failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ detail: "Error" }) });
    render(<TransactionValidationWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Validate/i }));
    await screen.findByText(/Validation failed/i);
  });

  it("shows result on success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({
      account_id: 'ACC-1001',
      amount: 1000,
      validation_status: 'Valid',
      timestamp: '2025-01-01T00:00:00Z'
    }) });
    render(<TransactionValidationWidget />);
    fireEvent.change(screen.getByPlaceholderText(/Account ID/i), { target: { value: 'ACC-1001' } });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole("button", { name: /Validate/i }));
    // Find all elements with the text 'Valid' and ensure at least one is present
    const statusEls = await screen.findAllByText('Valid');
    expect(statusEls.length).toBeGreaterThan(0);
    expect(screen.getByText(/ACC-1001/)).toBeInTheDocument();
    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/2025-01-01T00:00:00Z/)).toBeInTheDocument();
  });
});
