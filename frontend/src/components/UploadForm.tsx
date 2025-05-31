"use client";
import React, { useRef, useState } from "react";

export default function UploadForm({ onUpload }: { onUpload?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileType(e.target.files[0].type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult("");
    if (!file) {
      setResult("Please select a CSV or PDF file.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/transactions/upload", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setResult(`Error: ${err.detail || res.statusText}`);
      } else {
        const data = await res.json();
        setResult(
          `Inserted: ${data.inserted}, Anomalies: ${data.anomalies}` +
            (data.errors && data.errors.length
              ? `\nErrors:\n${data.errors.join("\n")}`
              : "")
        );
        if (onUpload) onUpload();
      }
    } catch (err) {
      setResult("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="bg-white shadow rounded px-6 py-6 flex flex-col items-center gap-4 w-full max-w-md"
      onSubmit={handleSubmit}
    >
      <label
        className="font-medium"
        htmlFor="file-upload"
      >
        Upload Transactions (CSV or PDF):
      </label>
      <input
        ref={inputRef}
        id="file-upload"
        type="file"
        accept=".csv,application/pdf"
        className="block w-full border border-gray-300 rounded p-2"
        onChange={handleFileChange}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {result && (
        <div className="w-full text-sm text-center whitespace-pre-wrap mt-2 text-gray-700">
          {result}
        </div>
      )}
    </form>
  );
}
