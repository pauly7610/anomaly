import React from "react";

type AlertGroup = {
  customer_id: string;
  type: string;
  start_time: string;
  end_time: string;
  count: number;
  anomalies: { id: number; timestamp: string; amount: number; type: string }[];
};

type Props = {
  group: AlertGroup | null;
  onClose: () => void;
};

export const CorrelatedAlertsDetailsModal: React.FC<Props> = ({ group, onClose }) => {
  if (!group) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[340px] max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        <h3 className="font-semibold text-lg mb-2">Correlated Alert Details</h3>
        <div className="mb-2 text-xs text-gray-700">
          <b>Customer:</b> {group.customer_id} <b>Type:</b> {group.type}<br />
          <b>Window:</b> {new Date(group.start_time).toLocaleString()} – {new Date(group.end_time).toLocaleString()}<br />
          <b>Total anomalies:</b> {group.count}
        </div>
        <div className="overflow-x-auto max-h-40">
          <table className="text-xs w-full">
            <thead>
              <tr className="text-left text-gray-600">
                <th>ID</th>
                <th>Timestamp</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {group.anomalies.map((a, i) => (
                <tr key={i} className="border-b">
                  <td>{a.id}</td>
                  <td>{new Date(a.timestamp).toLocaleString()}</td>
                  <td>{a.amount}</td>
                  <td>{a.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
