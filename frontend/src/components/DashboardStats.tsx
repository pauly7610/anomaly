"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#f59e42", "#f43f5e", "#10b981", "#fbbf24"];

import DashboardFilterControls from "./DashboardFilterControls";

interface DashboardStatsProps {
  filters?: { start_date: string; end_date: string };
  setFilters?: (f: { start_date: string; end_date: string }) => void;
}

export default function DashboardStats({ filters: parentFilters, setFilters: parentSetFilters }: DashboardStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [internalFilters, setInternalFilters] = useState<{ start_date: string; end_date: string }>({ start_date: "", end_date: "" });
  const filters = parentFilters ?? internalFilters;
  const setFilters = parentSetFilters ?? setInternalFilters;

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [filters]);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let url = "http://localhost:8000/dashboard/";
      const params = [];
      if (filters.start_date) params.push(`start_date=${filters.start_date}`);
      if (filters.end_date) params.push(`end_date=${filters.end_date}`);
      if (params.length) url += `?${params.join("&")}`;
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || res.statusText);
        setStats(null);
      } else {
        setStats(await res.json());
      }
    } catch (err) {
      setError("Failed to fetch stats.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-xl p-2 md:p-6">
      <DashboardFilterControls filters={filters} setFilters={setFilters} />
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-8">
        <h2 className="text-2xl font-bold mb-4 md:mb-0 md:w-1/4">Dashboard Overview</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : stats ? (
          <div className="flex gap-6 md:gap-8 w-full md:w-auto justify-center">
            <div className="flex flex-col items-center bg-blue-100 rounded-lg px-5 py-3 shadow transition-shadow hover:shadow-lg">
              <span className="block text-gray-500 text-xs">Total Transactions</span>
              <span className="block text-3xl font-extrabold text-blue-700">{stats.total_transactions}</span>
            </div>
            <div className="flex flex-col items-center bg-red-100 rounded-lg px-5 py-3 shadow transition-shadow hover:shadow-lg">
              <span className="block text-gray-500 text-xs">Anomalies</span>
              <span className="block text-3xl font-extrabold text-red-600">{stats.num_anomalies}</span>
            </div>
            <div className="flex flex-col items-center bg-green-100 rounded-lg px-5 py-3 shadow transition-shadow hover:shadow-lg">
              <span className="block text-gray-500 text-xs">Avg. Amount</span>
              <span className="block text-3xl font-extrabold text-green-700">${Number(stats.average_amount).toFixed(2)}</span>
            </div>
          </div>
        ) : null}
      </div>
      {/* Charts & Analytics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Volume Over Time */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 17V7m4 10V3m4 14v-7m4 7V9m4 8v-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
              <h3 className="font-semibold text-lg">Transaction Volume Over Time</h3>
            </div>
            <div className="bg-white rounded-lg shadow transition-shadow hover:shadow-lg p-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.volume_over_time} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} angle={-45} textAnchor="end" height={40} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Anomaly Rate Over Time */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 19V5m7 7H5" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round"/></svg>
              <h3 className="font-semibold text-lg">Anomaly Rate Over Time</h3>
            </div>
            <div className="bg-white rounded-lg shadow transition-shadow hover:shadow-lg p-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.anomaly_rate_over_time} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} angle={-45} textAnchor="end" height={40} />
                  <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip formatter={v => `${(Number(v) * 100).toFixed(2)}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Top Customers */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#22d3ee"/></svg>
              <h3 className="font-semibold text-lg">Top Customers</h3>
            </div>
            <div className="bg-white rounded-lg shadow transition-shadow hover:shadow-lg p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.top_customers} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="customer_id" fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_amount" fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Type Distribution */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#f59e42" strokeWidth="2" fill="none"/><path d="M12 3a9 9 0 0 1 8.94 8H12z" fill="#6366f1"/></svg>
              <h3 className="font-semibold text-lg">Transaction Type Distribution</h3>
            </div>
            <div className="bg-white rounded-lg shadow transition-shadow hover:shadow-lg p-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.type_distribution ?? []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label>
                    {(stats.type_distribution ?? []).map((entry: any, idx: number) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend content={({ payload }) => (
                    <ul className="flex flex-wrap gap-2 mt-2">
                      {(payload ?? []).map((entry: any, idx: number) => (
                        <li key={entry.value} className="flex items-center gap-1">
                          <span style={{ backgroundColor: entry.color }} className="inline-block w-3 h-3 rounded-full border border-gray-200"></span>
                          <span className="text-xs font-medium">{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      {/* Tables for largest transactions & recent anomalies */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" stroke="#10b981" strokeWidth="2" fill="none"/><path d="M7 7v10" stroke="#10b981" strokeWidth="2"/></svg>
              <h3 className="font-semibold text-lg">Largest Transactions</h3>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow transition-shadow hover:shadow-lg">
              <table className="min-w-full text-xs border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">ID</th>
                    <th className="px-2 py-1 text-left">Amount</th>
                    <th className="px-2 py-1 text-left">Type</th>
                    <th className="px-2 py-1 text-left">Customer</th>
                    <th className="px-2 py-1 text-left">Timestamp</th>
                    <th className="px-2 py-1 text-left">Anomaly?</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(stats.largest_transactions) ? stats.largest_transactions : []).map((tx: any, idx: number) => (
                    <tr key={tx.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 ${tx.is_anomaly ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                      <td className="px-2 py-1 font-mono">{tx.id}</td>
                      <td className="px-2 py-1">${Number(tx.amount).toFixed(2)}</td>
                      <td className="px-2 py-1">{tx.type}</td>
                      <td className="px-2 py-1">{tx.customer_id}</td>
                      <td className="px-2 py-1">{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-1">
                        {tx.is_anomaly ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-red-200 text-red-800 text-xs font-semibold">Yes</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#f43f5e" strokeWidth="2" fill="none"/><path d="M12 8v4l3 3" stroke="#f43f5e" strokeWidth="2"/></svg>
              <h3 className="font-semibold text-lg">Recent Anomalies</h3>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow transition-shadow hover:shadow-lg">
              <table className="min-w-full text-xs border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">ID</th>
                    <th className="px-2 py-1 text-left">Amount</th>
                    <th className="px-2 py-1 text-left">Type</th>
                    <th className="px-2 py-1 text-left">Customer</th>
                    <th className="px-2 py-1 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(stats.recent_anomalies) ? stats.recent_anomalies : []).map((tx: any, idx: number) => (
                    <tr key={tx.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-red-50' : 'bg-white'} hover:bg-red-100`}>
                      <td className="px-2 py-1 font-mono">{tx.id}</td>
                      <td className="px-2 py-1">${Number(tx.amount).toFixed(2)}</td>
                      <td className="px-2 py-1">{tx.type}</td>
                      <td className="px-2 py-1">{tx.customer_id}</td>
                      <td className="px-2 py-1">{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
