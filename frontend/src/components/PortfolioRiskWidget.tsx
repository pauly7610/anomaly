import React, { useState } from "react";

export default function PortfolioRiskWidget() {
  const [portfolioId, setPortfolioId] = useState("PORT-001");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/enterprise/integration/risk_aggregation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio_id: portfolioId })
      });
      if (!res.ok) throw new Error("Failed to fetch risk data");
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-2">Portfolio Risk</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 rounded"
          value={portfolioId}
          onChange={e => setPortfolioId(e.target.value)}
          placeholder="Portfolio ID"
          style={{ width: 120 }}
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
          onClick={fetchRisk}
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {data && (
        <div className="text-sm">
          <div><b>Portfolio:</b> {data.portfolio_id ?? '-'}</div>
          <div><b>Exposure:</b> {typeof data.exposure === 'number' ? `$${data.exposure.toLocaleString()}` : '-'}</div>
          <div><b>Risk Score:</b> {data.risk_score ?? '-'}</div>
          <div><b>Timestamp:</b> {data.timestamp ?? '-'}</div>
        </div>
      )}
    </div>
  );
}
