"use client";
import React, { useEffect, useState } from "react";

interface Transaction {
  id: number;
  timestamp: string;
  amount: number;
  type: string;
  customer_id: string;
  is_anomaly: boolean;
}

interface TableProps {
  refreshSignal?: number;
}

export default function TransactionsTable({ refreshSignal }: TableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState<number | null>(null);
  // Simple filters
  const [customerId, setCustomerId] = useState("");
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [page, refreshSignal, onlyAnomalies]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:8000/transactions/?skip=${(page - 1) * limit}&limit=${limit}`;
      if (customerId) url += `&customer_id=${encodeURIComponent(customerId)}`;
      if (onlyAnomalies) url += `&is_anomaly=true`;
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || res.statusText);
        setTransactions([]);
        setTotal(null);
      } else {
        const data = await res.json();
        setTransactions(data);
        setTotal(data.length < limit && page === 1 ? data.length : null); // crude total
      }
    } catch (err) {
      setError("Failed to fetch transactions.");
      setTransactions([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by Customer ID"
          className="border px-2 py-1 rounded"
          value={customerId}
          onChange={e => setCustomerId(e.target.value)}
        />
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={onlyAnomalies}
            onChange={e => setOnlyAnomalies(e.target.checked)}
          />
          Only anomalies
        </label>
        <button
          className="ml-auto bg-gray-200 px-3 py-1 rounded"
          onClick={() => fetchTransactions()}
        >
          Refresh
        </button>
      </div>
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left">ID</th>
              <th className="py-2 px-3 text-left">Timestamp</th>
              <th className="py-2 px-3 text-left">Amount</th>
              <th className="py-2 px-3 text-left">Type</th>
              <th className="py-2 px-3 text-left">Customer</th>
              <th className="py-2 px-3 text-left">Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center text-red-600 py-8">{error}</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">No transactions found.</td>
              </tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id} className={tx.is_anomaly ? "bg-red-50" : ""}>
                  <td className="px-3 py-2 font-mono">{tx.id}</td>
                  <td className="px-3 py-2">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2">${tx.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">{tx.type}</td>
                  <td className="px-3 py-2">{tx.customer_id}</td>
                  <td className="px-3 py-2">
                    {tx.is_anomaly ? (
                      <span className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs">Anomaly</span>
                    ) : (
                      <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Normal</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage(page + 1)}
          disabled={transactions.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
}
