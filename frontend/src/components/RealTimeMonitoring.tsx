import React from "react";

export default function RealTimeMonitoring({ wsEvents }: { wsEvents: any[] }) {
  return (
    <section className="mb-8">
      <div className="bg-white rounded shadow p-4 border border-gray-200 mb-4">
        <h2 className="text-xl font-semibold mb-2">Live System Events (WebSocket)</h2>
        {wsEvents.length === 0 ? (
          <div className="text-gray-400">No events received yet.</div>
        ) : (
          <ul className="text-xs max-h-60 overflow-y-auto">
            {wsEvents.map((evt, i) => (
              <li key={i} className="border-b border-gray-100 py-1">
                <span className="text-gray-500 mr-2">[{evt.received}]</span>
                <span>{evt.type}: {evt.message || evt.status || evt.event_id || evt.event}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
