import React, { useState } from 'react';
import { CorrelatedAlertsDetailsModal } from './CorrelatedAlertsDetailsModal';

type AlertGroup = {
  customer_id: string;
  type: string;
  start_time: string;
  end_time: string;
  count: number;
  anomalies: { id: number; timestamp: string; amount: number; type: string }[];
};

type Props = {
  alerts: AlertGroup[];
  loading: boolean;
};

export const CorrelatedAlertsCard: React.FC<Props> = ({ alerts, loading }) => {
  const [selected, setSelected] = useState<AlertGroup | null>(null);
  return (
    <div className="bg-white rounded shadow p-4 min-w-[300px] flex flex-col">
      <h3 className="font-semibold text-lg mb-2">Correlated Alerts</h3>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="text-gray-400">No correlated alerts</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="text-left text-gray-600">
                <th>Customer</th>
                <th>Type</th>
                <th>Count</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 5).map((g, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(g)}>
                  <td>{g.customer_id}</td>
                  <td>{g.type}</td>
                  <td>{g.count}</td>
                  <td>{new Date(g.start_time).toLocaleString()}</td>
                  <td>{new Date(g.end_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {alerts.length > 5 && (
            <div className="mt-2 text-xs text-gray-400">Showing top 5 of {alerts.length} groups</div>
          )}
        </div>
      )}
      <CorrelatedAlertsDetailsModal group={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
