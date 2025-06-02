import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MLUploadPanel } from '../MLUploadPanel';

function mockFile(name = 'test.csv', type = 'text/csv') {
  return new File(['data'], name, { type });
}

describe('MLUploadPanel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it('renders without crashing', () => {
    render(<MLUploadPanel />);
    expect(screen.getByText(/ML Operations/i)).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<MLUploadPanel />);
    const input = screen.getByTestId('ml-upload-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [mockFile()] } });
    expect(input.files?.[0].name).toBe('test.csv');
  });

  it('shows loading and result on Ensemble Predict', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ result: 'ok' }) });
    render(<MLUploadPanel />);
    const input = screen.getByTestId('ml-upload-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [mockFile()] } });
    const btn = screen.getByText(/Ensemble Predict/i);
    fireEvent.click(btn);
    expect(await screen.findByText(/Processing ensemble/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/result/i)).toBeInTheDocument());
  });

  it('shows error on failed upload', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<MLUploadPanel />);
    const input = screen.getByTestId('ml-upload-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [mockFile()] } });
    const btn = screen.getByText(/Ensemble Predict/i);
    fireEvent.click(btn);
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument());
  });

  it('handles all action buttons', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<MLUploadPanel />);
    const input = screen.getByTestId('ml-upload-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [mockFile()] } });
    const labelToKey: Record<string, string> = {
      'Ensemble Predict': 'ensemble',
      'Drift Detect': 'drift',
      'SHAP Explain': 'shap',
      'Auto Retrain': 'retrain',
    };
    for (const label of Object.keys(labelToKey)) {
      fireEvent.click(screen.getByText(new RegExp(label, 'i')));
      expect(await screen.findByText(new RegExp(`Processing ${labelToKey[label]}`, 'i'))).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByText(/Processing/i)).not.toBeInTheDocument());
    }
  });
});
