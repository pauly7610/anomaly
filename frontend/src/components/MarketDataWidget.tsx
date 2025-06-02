import React, { useState } from "react";

export default function MarketDataWidget() {
  const [symbol, setSymbol] = useState("AAPL");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/enterprise/integration/market_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol })
      });
      if (!res.ok) throw new Error("Failed to fetch market data");
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-2">Market Data</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 rounded"
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol"
          style={{ width: 100 }}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          onClick={fetchMarketData}
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {data && (
        <div className="text-sm">
          <div><b>Symbol:</b> {data?.symbol ?? ""}</div>
          <div><b>Price:</b> {typeof data?.price === "number" ? `$${data.price}` : ""}</div>
          <div><b>Volume:</b> {typeof data?.volume === "number" ? data.volume.toLocaleString() : ""}</div>
          <div><b>Trading Halt:</b> {typeof data?.trading_halt === "boolean" ? (data.trading_halt ? "Yes" : "No") : ""}</div>
          <div><b>Timestamp:</b> {data?.timestamp ?? ""}</div>
        </div>
      )}
    </div>
  );
}
