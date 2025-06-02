import React from 'react';
import { render } from '@testing-library/react';
import { SLAStatsCard } from '../SLAStatsCard';

describe('SLAStatsCard', () => {
  it('renders without crashing', () => {
    render(<SLAStatsCard stats={{
      count: 0,
      average_latency_ms: 0,
      max_latency_ms: 0,
      min_latency_ms: 0,
      sla_ms: 100,
      sla_breaches: 0
    }} loading={false} />);
  });
});
