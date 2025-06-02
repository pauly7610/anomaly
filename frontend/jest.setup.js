// Global Jest setup for frontend tests

// Add jest-dom for custom matchers
import '@testing-library/jest-dom';

// Mock fetch for all tests
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}), blob: () => Promise.resolve(new Blob(["test"])) })
  );
}

// Mock react-chartjs-2 to prevent Chart.js DOM errors in jsdom
global.React = require('react');
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart" />,
  Bar: () => <div data-testid="mock-chart" />,
  Pie: () => <div data-testid="mock-chart" />,
  Doughnut: () => <div data-testid="mock-chart" />,
  // Add more chart types as needed
}));

// Mock canvas getContext for Chart.js/react-chartjs-2
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    writable: true,
    value: function(type) {
      if (type === '2d') {
        return {
          fillRect: jest.fn(),
          clearRect: jest.fn(),
          getImageData: jest.fn(() => ({ data: [] })),
          putImageData: jest.fn(),
          createImageData: jest.fn(),
          setTransform: jest.fn(),
          drawImage: jest.fn(),
          save: jest.fn(),
          restore: jest.fn(),
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          closePath: jest.fn(),
          stroke: jest.fn(),
          translate: jest.fn(),
          scale: jest.fn(),
          rotate: jest.fn(),
          arc: jest.fn(),
          fill: jest.fn(),
          measureText: jest.fn(() => ({ width: 0 })),
          transform: jest.fn(),
          rect: jest.fn(),
          clip: jest.fn(),
          // Add more as needed for Chart.js compatibility
        };
      }
      return null;
    }
  });
}

// Suppress all DOM dumps and console output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});

  // Strong suppression: patch process.stdout.write and process.stderr.write
  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stdout.write = (...args) => true;
  process.stderr.write = (...args) => true;
});
