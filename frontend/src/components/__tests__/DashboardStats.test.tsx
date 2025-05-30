import { render, screen } from '@testing-library/react';
import DashboardStats from '../DashboardStats';

describe('DashboardStats', () => {
  it('renders dashboard stats headings', () => {
    render(<DashboardStats />);
    expect(screen.getByText(/Dashboard Overview/i)).toBeInTheDocument();
  });
});
