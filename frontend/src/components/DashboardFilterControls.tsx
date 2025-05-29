"use client";
import React from "react";

export default function DashboardFilterControls({ filters, setFilters }: {
  filters: { start_date: string; end_date: string; };
  setFilters: (f: { start_date: string; end_date: string; }) => void;
}) {
  return (
    <div className="flex gap-4 items-center mb-4">
      <label className="text-sm font-medium">Date Range:</label>
      <input
        type="date"
        className="border rounded p-1"
        value={filters.start_date}
        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
      />
      <span>-</span>
      <input
        type="date"
        className="border rounded p-1"
        value={filters.end_date}
        onChange={e => setFilters({ ...filters, end_date: e.target.value })}
      />
    </div>
  );
}
