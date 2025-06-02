import React from "react";

export default function ComplianceAuditSection({ complianceHistory }: { complianceHistory: any[] | null }) {
  const safeHistory = Array.isArray(complianceHistory) ? complianceHistory : [];
  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200">
      <h2 className="text-lg font-semibold mb-2">Compliance Audit History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {safeHistory.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="py-1 px-3">{row.timestamp}</td>
                <td className="py-1 px-3">{row.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
