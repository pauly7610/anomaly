import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from opentelemetry import trace
from utils.sla import sla_tracker
import shap
import threading
import time

tracer = trace.get_tracer(__name__)

# Demo ensemble model orchestrator
class EnsembleOrchestrator:
    def __init__(self):
        self.isolation = IsolationForest(contamination=0.05, random_state=42)
        self.rf = RandomForestClassifier(n_estimators=10, random_state=42)
        self.lr = LogisticRegression(max_iter=200)
        self.fitted = False
        self.lock = threading.Lock()

    def fit(self, df: pd.DataFrame):
        X = df[["amount"]]
        y = df["is_anomaly"] if "is_anomaly" in df else None
        with self.lock:
            self.isolation.fit(X)
            if y is not None:
                self.rf.fit(X, y)
                self.lr.fit(X, y)
            self.fitted = True

    def predict(self, df: pd.DataFrame):
        X = df[["amount"]]
        with self.lock:
            scores = self.isolation.decision_function(X)
            rf_pred = self.rf.predict_proba(X)[:,1] if self.fitted else np.zeros(len(X))
            lr_pred = self.lr.predict_proba(X)[:,1] if self.fitted else np.zeros(len(X))
            # Simple ensemble: average
            ensemble_score = (scores + rf_pred + lr_pred) / 3
            return ensemble_score > 0.5

ensemble = EnsembleOrchestrator()

# Real-time drift detection (simple mean/variance demo)
class DriftDetector:
    def __init__(self):
        self.ref_mean = None
        self.ref_std = None
        self.threshold = 3  # z-score threshold
        self.lock = threading.Lock()

    def update_reference(self, df: pd.DataFrame):
        with self.lock:
            self.ref_mean = df["amount"].mean()
            self.ref_std = df["amount"].std()

    def detect(self, df: pd.DataFrame):
        with self.lock:
            if self.ref_mean is None or self.ref_std is None:
                return False
            z_scores = np.abs((df["amount"] - self.ref_mean) / (self.ref_std + 1e-6))
            return (z_scores > self.threshold).any()

drift_detector = DriftDetector()

# SHAP explainability for RandomForest (demo)
def shap_explain(df: pd.DataFrame):
    X = df[["amount"]]
    explainer = shap.TreeExplainer(ensemble.rf)
    shap_values = explainer.shap_values(X)
    return shap_values[1] if isinstance(shap_values, list) else shap_values

# Automated retraining pipeline (demo)
def auto_retrain(df: pd.DataFrame):
    with tracer.start_as_current_span("auto_retrain"):
        start = time.time()
        ensemble.fit(df)
        drift_detector.update_reference(df)
        latency_ms = (time.time() - start) * 1000
        sla_tracker.record(latency_ms)
        return {"status": "retrained", "latency_ms": latency_ms}
