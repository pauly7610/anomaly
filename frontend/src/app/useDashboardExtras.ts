import { useEffect, useState } from "react";

export function useSLAStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("/dashboard/sla_metrics")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);
  return { stats, loading };
}

export function useCorrelatedAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("/dashboard/alert_correlation")
      .then((r) => r.json())
      .then((res) => setAlerts(res.correlated_alerts || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);
  return { alerts, loading };
}

export function useMLInsights() {
  const [drift, setDrift] = useState<boolean | null>(null);
  const [driftLoading, setDriftLoading] = useState(true);
  const [shap, setShap] = useState<number[] | null>(null);
  const [shapLoading, setShapLoading] = useState(true);

  useEffect(() => {
    setDriftLoading(true);
    fetch("/dashboard/ml_extended/drift_detect", { method: "POST", body: new Blob([], { type: 'text/csv' }) })
      .then((r) => r.json())
      .then((res) => setDrift(res.drift_detected))
      .catch(() => setDrift(null))
      .finally(() => setDriftLoading(false));
    setShapLoading(true);
    fetch("/dashboard/ml_extended/shap_explain", { method: "POST", body: new Blob([], { type: 'text/csv' }) })
      .then((r) => r.json())
      .then((res) => setShap(res.shap_values || null))
      .catch(() => setShap(null))
      .finally(() => setShapLoading(false));
  }, []);

  return { drift, driftLoading, shap, shapLoading };
}
