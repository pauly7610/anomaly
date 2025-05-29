import UploadForm from "../components/UploadForm";
import TransactionsTable from "../components/TransactionsTable";
import DashboardStats from "../components/DashboardStats";
import ExportButtons from "../components/ExportButtons";
import React, { useState } from "react";

export default function Home() {
  const [refreshSignal, setRefreshSignal] = React.useState(0);
  const [dashboardFilters, setDashboardFilters] = React.useState<{ start_date: string; end_date: string }>({ start_date: "", end_date: "" });
  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
      <DashboardStats filters={dashboardFilters} setFilters={setDashboardFilters} />
      <h1 className="text-3xl font-bold mb-4">Anomaly Detection Dashboard</h1>
      <p className="text-gray-700 mb-8">Welcome! Upload a CSV or PDF of transactions to get started.</p>
      <UploadForm onUpload={() => setRefreshSignal(s => s + 1)} />
      <div className="my-12 w-full max-w-4xl border-t border-gray-200"></div>
      <ExportButtons filters={dashboardFilters} />
      <TransactionsTable refreshSignal={refreshSignal} />
    </main>
  );
}
