import React, { useState } from "react";

export default function ComplianceCheckWidget() {
  const [accountId, setAccountId] = useState("ACC-001");
  const [rule, setRule] = useState("SEC_17a-4");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/enterprise/compliance/compliance_check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId, rule })
      });
      if (!res.ok) throw new Error("Failed to check compliance");
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-2">Ad-hoc Compliance Check</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 rounded"
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          placeholder="Account ID"
          style={{ width: 120 }}
        />
        <input
          className="border px-2 py-1 rounded"
          value={rule}
          onChange={e => setRule(e.target.value)}
          placeholder="Rule"
          style={{ width: 100 }}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          onClick={runCheck}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {result && (
        <div className="text-sm">
          <div><b>Account:</b> {result.account_id}</div>
          <div><b>Rule:</b> {result.rule}</div>
          <div><b>Status:</b> {result.status}</div>
          <div><b>Timestamp:</b> {result.timestamp}</div>
        </div>
      )}
    </div>
  );
}
