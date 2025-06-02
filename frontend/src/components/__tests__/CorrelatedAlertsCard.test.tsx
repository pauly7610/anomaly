import React from 'react';
import { render } from '@testing-library/react';
import { CorrelatedAlertsCard } from '../CorrelatedAlertsCard';

describe('CorrelatedAlertsCard', () => {
  it('renders without crashing', () => {
    render(<CorrelatedAlertsCard alerts={[]} loading={false} />);
  });

  it('shows loading state', () => {
    const { getByText } = render(<CorrelatedAlertsCard alerts={[]} loading={true} />);
    expect(getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    const { getByText } = render(<CorrelatedAlertsCard alerts={[]} loading={false} />);
    expect(getByText(/No correlated alerts/i)).toBeInTheDocument();
  });

  it('shows alerts and top 5 message if more than 5', () => {
    const alerts = Array.from({ length: 7 }).map((_, i) => ({
      customer_id: `CUST-${i}`,
      type: 'fraud',
      start_time: new Date(2024, 0, i + 1).toISOString(),
      end_time: new Date(2024, 0, i + 2).toISOString(),
      count: i + 1,
      anomalies: []
    }));
    const { getByText, queryByText } = render(<CorrelatedAlertsCard alerts={alerts} loading={false} />);
    expect(getByText(/CUST-0/)).toBeInTheDocument();
    expect(getByText(/CUST-4/)).toBeInTheDocument();
    expect(queryByText(/CUST-5/)).not.toBeInTheDocument();
    expect(getByText(/Showing top 5 of 7 groups/i)).toBeInTheDocument();
  });

  it('opens details modal on row click', async () => {
    const alerts = [
      {
        customer_id: 'CUST-1',
        type: 'fraud',
        start_time: new Date(2024, 0, 1).toISOString(),
        end_time: new Date(2024, 0, 2).toISOString(),
        count: 3,
        anomalies: [{ id: 1, timestamp: '2024-01-01T00:00:00Z', amount: 100, type: 'fraud' }]
      }
    ];
    const { getByText, findByText } = render(<CorrelatedAlertsCard alerts={alerts} loading={false} />);
    const row = getByText(/CUST-1/).closest('tr');
    expect(row).toBeInTheDocument();
    if (row) row.click();
    // Modal should open: check for the modal heading
    const modalHeading = await findByText('Correlated Alert Details');
    expect(modalHeading).toBeInTheDocument();
  });

  it('does not render modal when no alert is selected', () => {
    const { queryByText } = render(<CorrelatedAlertsCard alerts={[]} loading={false} />);
    // Modal should not appear
    expect(queryByText('Correlated Alert Details')).not.toBeInTheDocument();
  });
});
