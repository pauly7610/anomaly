import React, { useState } from "react";

export default function RegulatoryReportWidget() {
  const [reportType, setReportType] = useState("SEC_17a-4");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/enterprise/integration/regulatory_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_type: reportType })
      });
      if (!res.ok) throw new Error("Report generation failed");
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200 mb-6 flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Regulatory Report Generation</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 rounded"
          value={reportType}
          onChange={e => setReportType(e.target.value)}
          placeholder="Report Type"
          style={{ width: 120 }}
        />
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded"
          onClick={generateReport}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {result && (
        <div className="text-sm">
          <div><b>Type:</b> {result.report_type}</div>
          <div><b>Status:</b> {result.status}</div>
          <div><b>Timestamp:</b> {result.timestamp}</div>
          <div><b>Download:</b> <a className="text-blue-600 underline" href={result.download_url} target="_blank" rel="noopener noreferrer">Download PDF</a></div>
        </div>
      )}
    </div>
  );
}
