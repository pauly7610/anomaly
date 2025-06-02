"use client";
import React, { useEffect, useState, useRef } from "react";
import { AnomalyTrendChart, ComplianceHistoryChart } from "./_enterprise_charts";
import ExecutiveSummary from "../components/ExecutiveSummary";
import RealTimeMonitoring from "../components/RealTimeMonitoring";
import ComplianceAuditSection from "../components/ComplianceAuditSection";
import MarketDataWidget from "../components/MarketDataWidget";
import PortfolioRiskWidget from "../components/PortfolioRiskWidget";
import ComplianceCheckWidget from "../components/ComplianceCheckWidget";
import AccountVerificationWidget from "../components/AccountVerificationWidget";
import TransactionValidationWidget from "../components/TransactionValidationWidget";
import RegulatoryReportWidget from "../components/RegulatoryReportWidget";
import AnomalyDrilldownModal from "../components/modals_AnomalyDrilldownModal";
import IncidentDrilldownModal from "../components/modals_IncidentDrilldownModal";
import ComplianceViolationDrilldownModal from "../components/modals_ComplianceViolationDrilldownModal";
import Spinner from "../components/Spinner";
import { SLAStatsCard } from "../components/SLAStatsCard";
import { CorrelatedAlertsCard } from "../components/CorrelatedAlertsCard";
import { MLInsightsCard } from "../components/MLInsightsCard";
import { useSLAStats, useCorrelatedAlerts, useMLInsights } from "./useDashboardExtras";
import { MLUploadPanel } from "../components/MLUploadPanel";
import LiveAnomalyFeed from "../components/LiveAnomalyFeed";

// Simple fetch helpers
async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

// --- Executive summary logic ---
function getSummary(automation: any, integration: any, compliance: any, streaming: any) {
  let issues = [];
  if (automation && automation.engine_status !== "operational") issues.push("Automation Engine");
  if (integration && Object.values(integration).some((v) => v !== "connected")) issues.push("Integration Hub");
  if (compliance && compliance.compliance_engine !== "operational") issues.push("Compliance Engine");
  if (streaming && streaming.streaming_engine !== "operational") issues.push("Streaming Processor");
  return {
    healthy: issues.length === 0,
    issues,
  };
}

function MLOpsCollapsible() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mb-6">
      <button
        className="mb-2 text-sm text-indigo-700 hover:underline focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="ml-ops-panel"
      >
        {open ? '▼' : '►'} ML Operations (Advanced)
      </button>
      {open && (
        <div id="ml-ops-panel">
          <MLUploadPanel />
        </div>
      )}
    </div>
  );
}

function DashboardExtrasRow() {
  const { stats, loading: slaLoading } = useSLAStats();
  const { alerts, loading: alertsLoading } = useCorrelatedAlerts();
  const { drift, driftLoading, shap, shapLoading } = useMLInsights();
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <SLAStatsCard stats={stats} loading={slaLoading} />
      <CorrelatedAlertsCard alerts={alerts} loading={alertsLoading} />
      <MLInsightsCard drift={drift} driftLoading={driftLoading} shap={shap} shapLoading={shapLoading} />
    </div>
  );
}

export default function EnterpriseDashboard() {
  // --- Action handlers ---
  const handleTriggerIncident = async () => {
    try {
      await fetchJSON("/enterprise/automation/trigger-incident", { method: "POST" });
      setError(null);
    } catch {
      setError("Failed to trigger incident");
    }
  };
  const handleGenerateReport = async () => {
    try {
      await fetchJSON("/enterprise/compliance/generate-report", { method: "POST" });
      setError(null);
    } catch {
      setError("Failed to generate compliance report");
    }
  };
  const handleSimulateIntegrationEvent = async () => {
    try {
      await fetchJSON("/enterprise/integration/simulate-event", { method: "POST" });
      setError(null);
    } catch {
      setError("Failed to simulate integration event");
    }
  };
  const handleSimulateStreamEvent = async () => {
    try {
      await fetchJSON("/enterprise/streaming/simulate-event", { method: "POST" });
      setError(null);
    } catch {
      setError("Failed to simulate stream event");
    }
  };

  // State for each enterprise API
  const [automation, setAutomation] = useState<any>(null);
  const [integration, setIntegration] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [streaming, setStreaming] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [wsEvents, setWsEvents] = useState<any[]>([]);
  // Drilldown modal state
  const [anomalyModalOpen, setAnomalyModalOpen] = useState(false);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyError, setAnomalyError] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentLoading, setIncidentLoading] = useState(false);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [violationLoading, setViolationLoading] = useState(false);
  const [violationError, setViolationError] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [anomalyTrend, setAnomalyTrend] = useState<any[]>([]);
  const [complianceHistory, setComplianceHistory] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({ anomalies: 0, complianceReports: 0, systemHealth: "Operational" });
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch all enterprise statuses and analytics on mount
  useEffect(() => {
    fetchJSON("/enterprise/automation/status").then(setAutomation).catch(() => setError("Automation API error"));
    fetchJSON("/enterprise/integration/status").then(setIntegration).catch(() => setError("Integration API error"));
    fetchJSON("/enterprise/compliance/status").then(setCompliance).catch(() => setError("Compliance API error"));
    fetchJSON("/enterprise/streaming/status").then(setStreaming).catch(() => setError("Streaming API error"));
    fetchJSON("/dashboard").then((res) => {
      setAnomalyTrend(res.anomaly_rate_over_time || []);
      setKpis((k: any) => ({ ...k, anomalies: res.num_anomalies || 0 }));
    }).catch(() => setError("Dashboard analytics error"));
    fetchJSON("/enterprise/compliance/history").then((res) => {
      setComplianceHistory(res);
      setKpis((k: any) => ({ ...k, complianceReports: res.length }));
    }).catch(() => setError("Compliance history error"));
  }, []);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new window.WebSocket("ws://localhost:8000/ws/updates");
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const evt = JSON.parse(event.data);
      setWsEvents((prev) => [{ ...evt, received: new Date().toISOString() }, ...prev.slice(0, 19)]);
      // Real-time KPI/analytics update
      if (evt.type === "anomaly_detected") {
        setKpis((k: any) => ({ ...k, anomalies: (k.anomalies || 0) + 1 }));
        setAnomalyTrend((trend: any[]) => {
          if (trend.length === 0) return trend;
          // Bump last day's anomaly rate for demo
          const newTrend = [...trend];
          newTrend[newTrend.length - 1] = { ...newTrend[newTrend.length - 1], rate: (newTrend[newTrend.length - 1].rate || 0) + 0.01 };
          return newTrend;
        });
      }
      if (evt.type === "compliance_report_generated") {
        setKpis((k: any) => ({ ...k, complianceReports: (k.complianceReports || 0) + 1 }));
        setComplianceHistory((hist: any[]) => [{ timestamp: new Date().toISOString(), type: "SEC_17a-4" }, ...((Array.isArray(hist) ? hist : []).slice(0, 24))]);
      }
    };
    ws.onerror = () => setError("WebSocket connection error");
    ws.onclose = () => {};
    return () => ws.close();
  }, []);

  // Executive summary
  const summary = getSummary(automation, integration, compliance, streaming);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center tracking-tight">Enterprise Observability Platform</h1>
      {/* Executive summary & KPIs */}
      <ExecutiveSummary summary={summary} kpis={kpis} />
      {/* Real-time Monitoring */}
      {/* Real-time Monitoring (clickable for anomaly drilldown) */}
      <div>
        <RealTimeMonitoring wsEvents={wsEvents} />
        {/* Clickable anomaly feed for drilldown */}
        {wsEvents.length > 0 && (
          <ul className="text-xs max-h-60 overflow-y-auto">
            {wsEvents.filter(evt => evt.type === "anomaly_detected").map((evt, i) => (
              <li
                key={i}
                className="border-b border-gray-100 py-1 cursor-pointer hover:bg-blue-50"
                onClick={async () => {
                  setAnomalyLoading(true);
                  setAnomalyError(null);
                  setAnomalyModalOpen(true);
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`/transactions/${evt.id || evt.event_id || evt.transaction_id || evt.anomaly_id || evt.id}`, {
                      headers: { Authorization: token ? `Bearer ${token}` : "" }
                    });
                    if (!res.ok) throw new Error("Failed to fetch anomaly details");
                    const data = await res.json();
                    setSelectedAnomaly(data);
                  } catch (e: any) {
                    setAnomalyError(e.message || "Error loading anomaly");
                    setSelectedAnomaly(null);
                  } finally {
                    setAnomalyLoading(false);
                  }
                }}
                title="Click for details"
              >
                <span className="text-gray-500 mr-2">[{evt.received}]</span>
                <span>{evt.type}: {evt.message || evt.status || evt.event_id || evt.event}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Enterprise Widgets: Market Data, Portfolio Risk, Compliance Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MarketDataWidget />
        <PortfolioRiskWidget />
        <ComplianceCheckWidget />
      </div>

      {/* Second Enterprise Widget Row: Account Verification, Transaction Validation, Regulatory Report */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AccountVerificationWidget />
        <TransactionValidationWidget />
        <RegulatoryReportWidget />
      </div>

      {/* New: Observability & ML cards */}
      <DashboardExtrasRow />
      {/* ML Operations Panel (collapsible) */}
      <MLOpsCollapsible />
      {error && <div className="bg-red-100 text-red-800 p-2 mb-4">{error}</div>}
      {/* Action buttons (incident & compliance violation drilldown demo) */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        <button
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
          onClick={async () => {
            setIncidentLoading(true);
            setIncidentError(null);
            setIncidentModalOpen(true);
            try {
              const token = localStorage.getItem("token");
              // Replace with actual incident ID if available
              const res = await fetch(`/enterprise/automation/trigger_incident`, {
                method: "POST",
                headers: { Authorization: token ? `Bearer ${token}` : "" }
              });
              if (!res.ok) throw new Error("Failed to fetch incident details");
              const data = await res.json();
              setSelectedIncident(data);
            } catch (e: any) {
              setIncidentError(e.message || "Error loading incident");
              setSelectedIncident(null);
            } finally {
              setIncidentLoading(false);
            }
          }}
        >
          Demo Incident Drilldown
        </button>
        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          onClick={async () => {
            setViolationLoading(true);
            setViolationError(null);
            setViolationModalOpen(true);
            try {
              const token = localStorage.getItem("token");
              // Replace with actual violation ID if available
              const res = await fetch(`/enterprise/automation/compliance_violation`, {
                method: "POST",
                headers: { Authorization: token ? `Bearer ${token}` : "" }
              });
              if (!res.ok) throw new Error("Failed to fetch compliance violation details");
              const data = await res.json();
              setSelectedViolation(data);
            } catch (e: any) {
              setViolationError(e.message || "Error loading violation");
              setSelectedViolation(null);
            } finally {
              setViolationLoading(false);
            }
          }}
        >
          Demo Compliance Violation Drilldown
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={handleTriggerIncident}>Trigger Incident</button>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded" onClick={handleGenerateReport}>Generate Compliance Report</button>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded" onClick={handleSimulateIntegrationEvent}>Simulate Integration Event</button>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded" onClick={handleSimulateStreamEvent}>Simulate Stream Event</button>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Anomaly Trends (30 days)</h2>
          <AnomalyTrendChart data={anomalyTrend} />
        </div>
        <ComplianceAuditSection complianceHistory={complianceHistory} />
      </div>
      {/* Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Panel title="Automation Engine" data={automation} />
        <Panel title="Integration Hub" data={integration} />
        <Panel title="Compliance Engine" data={compliance} />
        <Panel title="Streaming Processor" data={streaming} />
      </div>
      {/* Real-time WebSocket event feed */}
      <div className="bg-white rounded shadow p-4 border border-gray-200 mb-8">
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
    </div>
  );
}

export function KPIWidget({ label, value, color }: { label: string; value: any; color: string }) {
  const colorMap: any = {
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <div className={`rounded shadow border p-6 flex flex-col items-center justify-center ${colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className="uppercase tracking-wide text-xs font-semibold">{label}</div>
    </div>
  );
}


function Panel({ title, data }: { title: string; data: any }) {
  return (
    <div className="bg-white rounded shadow p-4 border border-gray-200">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {data ? (
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div className="text-gray-400">Loading...</div>
      )}
    </div>
  );
}
