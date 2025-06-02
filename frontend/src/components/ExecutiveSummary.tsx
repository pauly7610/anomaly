import React from "react";

export default function ExecutiveSummary({ summary, kpis }: { summary: any; kpis: any }) {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <SummaryCard label="Total Anomalies" value={kpis.anomalies} color="red" />
        <SummaryCard label="Compliance Reports" value={kpis.complianceReports} color="blue" />
        <SummaryCard label="System Health" value={summary.healthy ? "Operational" : "Issues"} color={summary.healthy ? "green" : "yellow"} />
      </div>
      <div>
        {summary.healthy ? (
          <div className="bg-green-100 text-green-800 p-3 rounded text-center">All systems operational</div>
        ) : (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-center">
            <b>Issues detected:</b> {summary.issues.join(", ")}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: any; color: string }) {
  const colorMap: any = {
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <div className={`rounded shadow border p-6 flex flex-col items-center justify-center ${colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className="uppercase tracking-wide text-xs font-semibold">{label}</div>
    </div>
  );
}
