import React from 'react';

type SLAStats = {
  count: number;
  average_latency_ms: number;
  max_latency_ms: number;
  min_latency_ms: number;
  sla_ms: number;
  sla_breaches: number;
};

type Props = {
  stats: SLAStats | null;
  loading: boolean;
};

export const SLAStatsCard: React.FC<Props> = ({ stats, loading }) => (
  <div className="bg-white rounded shadow p-4 min-w-[230px] flex flex-col items-center">
    <h3 className="font-semibold text-lg mb-2">SLA Metrics</h3>
    {loading || !stats ? (
      <div className="text-gray-400">Loading...</div>
    ) : (
      <>
        <div className="flex flex-row gap-4 mb-2">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.sla_breaches}</div>
            <div className="text-xs text-gray-500">Breaches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.count}</div>
            <div className="text-xs text-gray-500">Calls</div>
          </div>
        </div>
        <div className="flex flex-row gap-2 text-xs justify-center">
          <span>Avg: <b>{typeof stats.average_latency_ms === 'number' ? stats.average_latency_ms.toFixed(1) : '--'}</b>ms</span>
          <span>Max: <b>{typeof stats.max_latency_ms === 'number' ? stats.max_latency_ms.toFixed(1) : '--'}</b>ms</span>
          <span>Min: <b>{typeof stats.min_latency_ms === 'number' ? stats.min_latency_ms.toFixed(1) : '--'}</b>ms</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">SLA Target: {stats.sla_ms}ms</div>
      </>
    )}
  </div>
);
