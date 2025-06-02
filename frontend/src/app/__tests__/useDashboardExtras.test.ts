import { renderHook, waitFor } from '@testing-library/react';
import { useSLAStats, useCorrelatedAlerts, useMLInsights } from '../useDashboardExtras';

describe('useDashboardExtras', () => {
  it('runs without error', async () => {
    (global.fetch as any) = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({}) }));
    await waitFor(() => renderHook(() => useSLAStats()));
    await waitFor(() => renderHook(() => useCorrelatedAlerts()));
    await waitFor(() => renderHook(() => useMLInsights()));
  });
});
