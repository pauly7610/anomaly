"use client";
import React, { useState } from "react";

interface ExportFilters {
  start_date?: string;
  end_date?: string;
}

export default function ExportButtons({ filters }: { filters?: ExportFilters }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);

  const handleDownload = async (type: "csv" | "pdf") => {
    setDownloading(type);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:8000/export/${type}`;
      const params = [];
      if (filters?.start_date) params.push(`start_date=${filters.start_date}`);
      if (filters?.end_date) params.push(`end_date=${filters.end_date}`);
      if (params.length) url += `?${params.join("&")}`;
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || res.statusText);
        return;
      }
      const blob = await res.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = `transactions.${type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlObj);
    } catch (err) {
      setError("Download failed. Try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex gap-4 items-center mb-6">
      <button
        onClick={() => handleDownload("csv")}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
        disabled={downloading !== null}
      >
        {downloading === "csv" ? "Downloading..." : "Export CSV"}
      </button>
      <button
        onClick={() => handleDownload("pdf")}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
        disabled={downloading !== null}
      >
        {downloading === "pdf" ? "Downloading..." : "Export PDF"}
      </button>
      {error && <span className="ml-4 text-red-600 text-sm">{error}</span>}
      {/* New: Export advanced observability/ML data as JSON */}
      <button
        onClick={async () => {
          setDownloading("alerts"); setError("");
          try {
            const res = await fetch("/dashboard/alert_correlation");
            if (!res.ok) throw new Error("Failed to fetch alerts");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlObj;
            a.download = "correlated_alerts.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(urlObj);
          } catch (err) { setError("Export alerts failed"); } finally { setDownloading(null); }
        }}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-60"
        disabled={downloading !== null}
      >
        {downloading === "alerts" ? "Exporting..." : "Export Alerts"}
      </button>
      <button
        onClick={async () => {
          setDownloading("sla"); setError("");
          try {
            const res = await fetch("/dashboard/sla_metrics");
            if (!res.ok) throw new Error("Failed to fetch SLA");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlObj;
            a.download = "sla_metrics.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(urlObj);
          } catch (err) { setError("Export SLA failed"); } finally { setDownloading(null); }
        }}
        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:opacity-60"
        disabled={downloading !== null}
      >
        {downloading === "sla" ? "Exporting..." : "Export SLA"}
      </button>
      <button
        onClick={async () => {
          setDownloading("ml"); setError("");
          try {
            const res = await fetch("/dashboard/ml_extended/ensemble_predict", { method: "POST", body: new Blob([], { type: 'text/csv' }) });
            if (!res.ok) throw new Error("Failed to fetch ML predictions");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlObj;
            a.download = "ml_predictions.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(urlObj);
          } catch (err) { setError("Export ML failed"); } finally { setDownloading(null); }
        }}
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-60"
        disabled={downloading !== null}
      >
        {downloading === "ml" ? "Exporting..." : "Export ML"}
      </button>
    </div>
  );
}
