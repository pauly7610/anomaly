import React, { useState } from "react";

export default function TransactionValidationWidget() {
  const [accountId, setAccountId] = useState("ACC-1001");
  const [amount, setAmount] = useState(1000);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateTransaction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/enterprise/integration/validate_transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId, amount })
      });
      if (!res.ok) throw new Error("Validation failed");
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200 mb-6 flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Transaction Validation</h2>
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
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          placeholder="Amount"
          style={{ width: 100 }}
        />
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded"
          onClick={validateTransaction}
          disabled={loading}
        >
          {loading ? "Validating..." : "Validate"}
        </button>
      </div>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {result && (
        <div className="text-sm">
          <div><b>Account:</b> {result.account_id}</div>
          <div><b>Amount:</b> ${result.amount}</div>
          <div><b>Status:</b> {result.validation_status}</div>
          <div><b>Timestamp:</b> {result.timestamp}</div>
        </div>
      )}
    </div>
  );
}
