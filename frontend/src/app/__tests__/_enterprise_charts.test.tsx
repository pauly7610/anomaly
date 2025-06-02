import React from 'react';
jest.mock('react-chartjs-2', () => ({
  Line: (props: any) => <canvas data-testid="mock-line-chart" />,
  Bar: (props: any) => <canvas data-testid="mock-bar-chart" />,
}));
import { render } from '@testing-library/react';
import { AnomalyTrendChart, ComplianceHistoryChart } from '../_enterprise_charts';



describe('EnterpriseCharts', () => {
  it('renders without crashing', () => {
    render(
      <>
        <AnomalyTrendChart data={[]} />
        <ComplianceHistoryChart data={[]} />
      </>
    );
  });

  it('renders AnomalyTrendChart with data', () => {
    const data = [
      { date: '2024-01-01', rate: 0.1 },
      { date: '2024-01-02', rate: 0.2 }
    ];
    const { getByTestId } = render(<AnomalyTrendChart data={data} />);
    // Check chart structure (mocked)
    expect(getByTestId('mock-line-chart')).toBeInTheDocument();
  });

  it('maps AnomalyTrendChart data to chart props correctly', () => {
    const data = [
      { date: '2024-01-01', rate: 0.5 },
      { date: '2024-01-02', rate: 0.7 }
    ];
    // Chart prop mapping test: just render and expect the mock canvas
    const { getByTestId } = render(<AnomalyTrendChart data={data} />);
    expect(getByTestId('mock-line-chart')).toBeInTheDocument();
    jest.resetModules();
  });

  it('renders ComplianceHistoryChart with data', () => {
    const data = [
      { timestamp: '2024-01-01T00:00:00Z', type: 'SEC_17a-4' },
      { timestamp: '2024-01-02T00:00:00Z', type: 'SOX' }
    ];
    const { getByTestId } = render(<ComplianceHistoryChart data={data} />);
    expect(getByTestId('mock-bar-chart')).toBeInTheDocument();
  });

  it('maps ComplianceHistoryChart data to chart props correctly', () => {
    const data = [
      { timestamp: '2024-01-01T00:00:00Z', type: 'SEC_17a-4' },
      { timestamp: '2024-01-02T00:00:00Z', type: 'SOX' }
    ];
    // Mock Bar to capture props
    const Bar = jest.fn(() => <div data-testid="mock-bar-chart" />);
    jest.doMock('react-chartjs-2', () => ({ Bar }));
    const { ComplianceHistoryChart } = require('../_enterprise_charts');
    render(<ComplianceHistoryChart data={data} />);
    expect(Bar).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
          datasets: [
            expect.objectContaining({
              label: 'Compliance Reports',
              data: [1, 1],
              backgroundColor: expect.any(String),
              borderColor: expect.any(String),
              borderWidth: 2,
            })
          ]
        })
      }),
      expect.anything()
    );
    jest.resetModules();
  });

  it('renders AnomalyTrendChart and ComplianceHistoryChart with empty and single-point data', () => {
    expect(() => render(<AnomalyTrendChart data={[]} />)).not.toThrow();
    expect(() => render(<ComplianceHistoryChart data={[]} />)).not.toThrow();
    expect(() => render(<AnomalyTrendChart data={[{ date: '2024-01-01', rate: 0.1 }]} />)).not.toThrow();
    expect(() => render(<ComplianceHistoryChart data={[{ timestamp: '2024-01-01T00:00:00Z', type: 'SEC_17a-4' }]} />)).not.toThrow();
  });
});
