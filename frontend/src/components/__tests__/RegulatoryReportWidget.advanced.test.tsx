import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegulatoryReportWidget from "../RegulatoryReportWidget";

global.fetch = jest.fn();

describe("RegulatoryReportWidget (advanced/edge cases)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends updated report type value in fetch payload', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ report_type: 'NEWTYPE', status: 'Complete', timestamp: '2025-01-01T00:00:00Z', download_url: 'http://example.com/report.pdf' }) });
    render(<RegulatoryReportWidget />);
    const input = screen.getByPlaceholderText(/Report Type/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'NEWTYPE' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: JSON.stringify({ report_type: 'NEWTYPE' })
      })
    ));
    await screen.findByText(/NEWTYPE/);
  });

  it('button remains disabled during loading (no rapid spam)', async () => {
    let resolve: (v: any) => void;
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
    render(<RegulatoryReportWidget />);
    const button = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(fetch).toHaveBeenCalledTimes(1);
    // Finish loading
    resolve!({ ok: true, json: async () => ({}) });
  });

  it('handles edge case: empty string as report type', async () => {
    render(<RegulatoryReportWidget />);
    const input = screen.getByPlaceholderText(/Report Type/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('handles edge case: very long report type', async () => {
    const longType = 'X'.repeat(100);
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ report_type: longType, status: 'Complete', timestamp: '2025-01-01T00:00:00Z', download_url: 'http://example.com/report.pdf' }) });
    render(<RegulatoryReportWidget />);
    const input = screen.getByPlaceholderText(/Report Type/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: longType } });
    expect(input.value).toBe(longType);
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }));
    await screen.findByText(longType);
  });
});
