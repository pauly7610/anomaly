import React from 'react';
import { render } from '@testing-library/react';
import { CorrelatedAlertsDetailsModal } from '../CorrelatedAlertsDetailsModal';

describe('CorrelatedAlertsDetailsModal', () => {
  it('renders without crashing', () => {
    render(<CorrelatedAlertsDetailsModal group={null} onClose={() => {}} />);
  });
});
