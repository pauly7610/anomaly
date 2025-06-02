import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadForm from '../UploadForm';

describe('UploadForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ inserted: 1, anomalies: 0 }) });
    localStorage.getItem = jest.fn(() => 'token');
  });

  it('renders upload button and handles file upload', async () => {
    render(<UploadForm />);
    const file = new File(['1,2,3'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Upload/i);
    fireEvent.change(input, { target: { files: [file] } });
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });
});

describe('UploadForm additional coverage', () => {
  it('shows error when no file is selected', async () => {
    render(<UploadForm />);
    const input = screen.getByLabelText(/Upload/i);
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    await waitFor(() => expect(screen.getByText(/Please select/i)).toBeInTheDocument());
  });

  it('shows error on failed upload', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'fail' }) });
    render(<UploadForm />);
    const file = new File(['1,2,3'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Upload/i);
    fireEvent.change(input, { target: { files: [file] } });
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form as Element); // Add null check and type casting
    }
    await waitFor(() => expect(screen.getByText(/fail/)).toBeInTheDocument());
  });

  it('shows upload failed on network error', async () => {
    (global.fetch as any) = jest.fn().mockRejectedValueOnce(new Error('network'));
    render(<UploadForm />);
    const file = new File(['1,2,3'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Upload/i);
    fireEvent.change(input, { target: { files: [file] } });
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    await waitFor(() => expect(screen.getByText(/Upload failed/i)).toBeInTheDocument());
  });
});
