import React from 'react';
import { render, waitFor } from '@testing-library/react';
import EnterpriseDashboard from '../enterprise-dashboard';



describe('EnterpriseDashboard', () => {
  it('renders without crashing', async () => {
    await waitFor(() => {
      render(<EnterpriseDashboard />);
    });
  });
});
