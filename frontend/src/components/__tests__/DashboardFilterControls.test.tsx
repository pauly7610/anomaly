import { render, screen, fireEvent } from '@testing-library/react';
import DashboardFilterControls from '../DashboardFilterControls';

describe('DashboardFilterControls', () => {
  it('renders date inputs and updates filters', () => {
    const filters = { start_date: '', end_date: '' };
    const setFilters = jest.fn();
    render(<DashboardFilterControls filters={filters} setFilters={setFilters} />);
    expect(screen.getByLabelText(/Date Range/i)).toBeInTheDocument();
    fireEvent.change(screen.getAllByLabelText(/Date Range/i)[0], { target: { value: '2024-01-01' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('updates end date', () => {
    const filters = { start_date: '', end_date: '' };
    const setFilters = jest.fn();
    render(<DashboardFilterControls filters={filters} setFilters={setFilters} />);
    const inputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[1], { target: { value: '2024-01-31' } });
    expect(setFilters).toHaveBeenCalledWith({ start_date: '', end_date: '2024-01-31' });
  });

  it('renders dash separator', () => {
    const filters = { start_date: '', end_date: '' };
    const setFilters = jest.fn();
    render(<DashboardFilterControls filters={filters} setFilters={setFilters} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
