import React from 'react';
import { render } from '@testing-library/react';
import { MLInsightsCard } from '../MLInsightsCard';

describe('MLInsightsCard', () => {
  it('renders without crashing', () => {
    render(<MLInsightsCard drift={null} driftLoading={false} shap={null} shapLoading={false} />);
  });

  it('shows drift detected', () => {
    const { getByText } = render(<MLInsightsCard drift={true} driftLoading={false} shap={null} shapLoading={false} />);
    expect(getByText(/Detected/i)).toBeInTheDocument();
  });

  it('shows drift none', () => {
    const { getByText } = render(<MLInsightsCard drift={false} driftLoading={false} shap={null} shapLoading={false} />);
    expect(getByText(/None/i)).toBeInTheDocument();
  });

  it('shows drift loading', () => {
    const { getByText } = render(<MLInsightsCard drift={null} driftLoading={true} shap={null} shapLoading={false} />);
    expect(getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('shows drift N/A', () => {
    const { getAllByText } = render(<MLInsightsCard drift={null} driftLoading={false} shap={null} shapLoading={false} />);
    // Should render N/A for both drift and SHAP
    expect(getAllByText(/N\/A/i).length).toBeGreaterThanOrEqual(2);
  });

  it('shows SHAP values', () => {
    const { getByText, getAllByText } = render(<MLInsightsCard drift={null} driftLoading={false} shap={[1.23, 2.34, 3.45, 4.56, 5.67, 6.78]} shapLoading={false} />);
    // There may be multiple 1.23 nodes, but at least one should be present in the SHAP section
    expect(getAllByText(/1.23/).length).toBeGreaterThan(0);
    // The SHAP section should contain the ellipsis
    expect(getAllByText(/\.\.\./).length).toBeGreaterThan(0);
  });

  it('shows SHAP loading', () => {
    const { getByText } = render(<MLInsightsCard drift={null} driftLoading={false} shap={null} shapLoading={true} />);
    expect(getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('shows SHAP N/A', () => {
    const { getAllByText } = render(<MLInsightsCard drift={null} driftLoading={false} shap={null} shapLoading={false} />);
    // Should render N/A for both drift and SHAP
    expect(getAllByText(/N\/A/i).length).toBeGreaterThanOrEqual(2);
  });
});
