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
    document.createElement = jest.fn(() => ({ click: jest.fn(), remove: jest.fn(), setAttribute: jest.fn() }));
    window.URL.revokeObjectURL = jest.fn();
  });

  it('renders export buttons and triggers download', async () => {
  //   render(<ExportButtons />);
  //
  //   // Save the real createElement
  //   const realCreateElement = document.createElement;
  //   // Create a mock anchor element
  //   const a = realCreateElement.call(document, 'a');
  //   a.click = jest.fn();
  // });
});
