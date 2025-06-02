import React from "react";

import Spinner from "./Spinner";

export default function IncidentDrilldownModal({ open, onClose, incident, loading, error }: { open: boolean; onClose: () => void; incident: any, loading?: boolean, error?: string | null }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-xl font-semibold mb-4">Incident Details</h2>
        {loading ? (
          <div className="flex justify-center items-center py-8"><Spinner /></div>
        ) : error ? (
          <div className="text-red-600 text-sm py-4">{error}</div>
        ) : incident ? (
          <div className="text-sm space-y-1">
            {Object.entries(incident).map(([k, v]) => (
              <div key={k}><b>{k}:</b> {String(v)}</div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm py-4">No incident data found.</div>
        )}
      </div>
    </div>
  );
}
