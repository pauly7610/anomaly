"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export function AnomalyTrendChart({ data }: { data: { date: string; rate: number }[] }) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: "Anomaly Rate",
        data: data.map(d => d.rate),
        backgroundColor: "rgba(255,99,132,0.5)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 2,
        fill: true,
        tension: 0.2,
      },
    ],
  };
  return <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}

export function ComplianceHistoryChart({ data }: { data: { timestamp: string; type: string }[] }) {
  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: "Compliance Reports",
        data: data.map(() => 1),
        backgroundColor: "rgba(54,162,235,0.5)",
        borderColor: "rgba(54,162,235,1)",
        borderWidth: 2,
      },
    ],
  };
  return <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}
