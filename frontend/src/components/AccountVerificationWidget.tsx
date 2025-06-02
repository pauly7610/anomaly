import React, { useState } from "react";

export default function AccountVerificationWidget() {
  const [accountId, setAccountId] = useState("ACC-1001");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/enterprise/integration/verify_account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId })
      });
      if (!res.ok) throw new Error("Verification failed");
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200 mb-6 flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Account Verification</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 rounded"
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          placeholder="Account ID"
          style={{ width: 120 }}
        />
        <button
          type="button"
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded"
          onClick={verifyAccount}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button> 
      </div>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {result && (
        <div className="text-sm">
          <div><b>Account:</b> {result.account_id}</div>
          <div><b>Status:</b> {result.status}</div>
          <div><b>Verified:</b> {result.verified ? "Yes" : "No"}</div>
          <div><b>Timestamp:</b> {result.timestamp}</div>
        </div>
      )}
    </div>
  );
}
