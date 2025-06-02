import React, { useState } from "react";

type ResultType = "ensemble" | "drift" | "shap" | "retrain";

export const MLUploadPanel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<ResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const upload = async (endpoint: string, type: ResultType) => {
    if (!file) return;
    setLoading(type);
    setError(null);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(endpoint, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-8">
      <h3 className="font-semibold text-lg mb-2">ML Operations</h3>
      <input type="file" accept=".csv" onChange={handleFile} className="mb-2" data-testid="ml-upload-input" />
      <div className="flex flex-wrap gap-2 mb-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-60" disabled={!file || loading === "ensemble"} onClick={() => upload("/dashboard/ml_extended/ensemble_predict", "ensemble")}>Ensemble Predict</button>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded disabled:opacity-60" disabled={!file || loading === "drift"} onClick={() => upload("/dashboard/ml_extended/drift_detect", "drift")}>Drift Detect</button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded disabled:opacity-60" disabled={!file || loading === "shap"} onClick={() => upload("/dashboard/ml_extended/shap_explain", "shap")}>SHAP Explain</button>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded disabled:opacity-60" disabled={!file || loading === "retrain"} onClick={() => upload("/dashboard/ml_extended/auto_retrain", "retrain")}>Auto Retrain</button>
      </div>
      {loading && <div className="text-xs text-gray-500 mb-2">Processing {loading}...</div>}
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      {result && (
        <div className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
