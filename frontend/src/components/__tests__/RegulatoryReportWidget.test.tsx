import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegulatoryReportWidget from "../RegulatoryReportWidget";

global.fetch = jest.fn();

describe("RegulatoryReportWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input and button", () => {
    render(<RegulatoryReportWidget />);
    expect(screen.getByPlaceholderText(/Report Type/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generate/i })).toBeInTheDocument();
  });

  it("shows loading spinner on submit", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ url: "http://example.com/report.pdf" }) });
    render(<RegulatoryReportWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Generate/i }));
    expect(screen.getByText(/Generating.../i)).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it("shows error on failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ detail: "Error" }) });
    render(<RegulatoryReportWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Generate/i }));
    await screen.findByText(/Report generation failed/i);
  });

  it("shows result on success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({
      report_type: 'Annual',
      status: 'Complete',
      timestamp: '2025-01-01T00:00:00Z',
      download_url: 'http://example.com/report.pdf'
    }) });
    render(<RegulatoryReportWidget />);
    fireEvent.change(screen.getByPlaceholderText(/Report Type/i), { target: { value: 'Annual' } });
    fireEvent.click(screen.getByRole("button", { name: /Generate/i }));
    const link = await screen.findByRole('link', { name: /Download PDF/i });
    expect(link).toHaveAttribute("href", "http://example.com/report.pdf");
    expect(screen.getByText(/Annual/)).toBeInTheDocument();
    expect(screen.getByText(/Complete/)).toBeInTheDocument();
    expect(screen.getByText(/2025-01-01T00:00:00Z/)).toBeInTheDocument();
  });

  it("handles empty/null/missing API response gracefully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<RegulatoryReportWidget />);
    let button = await screen.findByRole("button", { name: /Generate/i });
    fireEvent.click(button);
    const nodes1 = await screen.findAllByText((content, node) =>
      !!/report|no result|error|download|status/i.test(node?.textContent || "")
    );
    expect(nodes1.length).toBeGreaterThan(0);
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => null });
    button = await screen.findByRole("button", { name: /Generate/i });
    fireEvent.click(button);
    const nodes2 = await screen.findAllByText((content, node) =>
      !!/report|no result|error|download|status/i.test(node?.textContent || "")
    );
    expect(nodes2.length).toBeGreaterThan(0);
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ report_type: 'Monthly' }) });
    button = await screen.findByRole("button", { name: /Generate/i });
    fireEvent.click(button);
    await screen.findByText(/Monthly/);
  });
});
