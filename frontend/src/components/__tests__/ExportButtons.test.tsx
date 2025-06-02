import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportButtons from '../ExportButtons';

let realCreateElement: typeof document.createElement;

beforeAll(() => {
  realCreateElement = document.createElement;
});

afterEach(() => {
  document.createElement = realCreateElement;
});

describe('ExportButtons', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['test']) });
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/blobid');
  });
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['test']) });
    window.URL.createObjectURL = jest.fn(() => 'blob:url');
    document.createElement = ((tagName: string) => {
  if (tagName === 'a') {
    // Return a real anchor element so appendChild works
    const anchor = realCreateElement.call(document, 'a');
    anchor.click = jest.fn();
    anchor.remove = jest.fn();
    anchor.setAttribute = jest.fn();
    return anchor;
  }
  // For all other tags, return a real element
  return realCreateElement.call(document, tagName);
}) as typeof document.createElement;
    window.URL.revokeObjectURL = jest.fn();
  });

  it('renders export buttons', () => {
    render(<ExportButtons />);
    expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument();
  });

  it('handles CSV export', async () => {
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export CSV/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/export/csv'), expect.any(Object)));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('handles PDF export', async () => {
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export PDF/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/export/pdf'), expect.any(Object)));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('shows error if no token', async () => {
    localStorage.getItem = jest.fn(() => null);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'No token' }) });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export CSV/i));
    await waitFor(() => expect(screen.getByText(/No token/i)).toBeInTheDocument());
  });

  it('triggers CSV download on click', async () => {
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export CSV/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/csv'), expect.any(Object)));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    // Anchor click and remove called
    const anchor = document.createElement('a');
    document.body.appendChild(anchor);
    fireEvent.click(anchor);
    expect(anchor.click).toBeDefined();
    anchor.remove();
  });

  it('triggers PDF download on click', async () => {
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export PDF/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/pdf'), expect.any(Object)));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('triggers Alerts export on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, foo: 'bar' }]
    });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export Alerts/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/dashboard/alert_correlation'));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('triggers SLA export on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sla: 'metrics' })
    });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export SLA/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/dashboard/sla_metrics'));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('triggers ML export on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ml: 'predictions' })
    });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export ML/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/dashboard/ml_extended/ensemble_predict',
      expect.objectContaining({ method: 'POST' })
    ));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('shows error if Alerts export fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export Alerts/i));
    expect(await screen.findByText(/Export alerts failed/i)).toBeInTheDocument();
  });

  it('shows error if SLA export fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export SLA/i));
    expect(await screen.findByText(/Export SLA failed/i)).toBeInTheDocument();
  });

  it('shows error if ML export fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export ML/i));
    expect(await screen.findByText(/Export ML failed/i)).toBeInTheDocument();
  });

  it('includes filters in export URL', async () => {
    render(<ExportButtons filters={{ start_date: '2023-01-01', end_date: '2023-01-31' }} />);
    fireEvent.click(screen.getByText(/Export CSV/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('start_date=2023-01-01'),
      expect.any(Object)
    ));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('end_date=2023-01-31'),
      expect.any(Object)
    ));
  });

  it('shows error if download fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ detail: 'fail' }), statusText: 'Bad' });
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export CSV/i));
    expect(await screen.findByText(/fail|bad/i)).toBeInTheDocument();
  });

  it('shows fallback error if fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));
    render(<ExportButtons />);
    fireEvent.click(screen.getByText(/Export CSV/i));
    expect(await screen.findByText(/Download failed/i)).toBeInTheDocument();
  });
});
