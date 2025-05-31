import pandas as pd
import pytest
from ml import check_fraud_rules, detect_anomalies_with_fraud

def test_check_fraud_rules_rapid_sequence():
    df = pd.DataFrame({
        "timestamp": pd.to_datetime(["2023-01-01T00:00:00", "2023-01-01T00:00:02"]),
        "amount": [100, 200]
    })
    result = check_fraud_rules(df)
    assert result["is_fraud"].any()
    assert "rapid_sequence" in result["fraud_reason"].values

def test_check_fraud_rules_high_amount():
    df = pd.DataFrame({
        "timestamp": pd.to_datetime(["2023-01-01T00:00:00", "2023-01-01T00:01:00"]),
        "amount": [50, 20000]
    })
    result = check_fraud_rules(df)
    assert result["is_fraud"].iloc[1]
    assert result["fraud_reason"].iloc[1] == "high_amount"

def test_detect_anomalies_with_fraud(monkeypatch):
    import mlflow
    monkeypatch.setattr(mlflow, "start_run", lambda *a, **kw: __import__("contextlib").nullcontext())
    monkeypatch.setattr(mlflow, "log_param", lambda *a, **kw: None)
    monkeypatch.setattr(mlflow, "log_metric", lambda *a, **kw: None)
    monkeypatch.setattr(mlflow.sklearn, "log_model", lambda *a, **kw: None)
    df = pd.DataFrame({
        "timestamp": pd.to_datetime(["2023-01-01T00:00:00", "2023-01-01T00:01:00"]),
        "amount": [100, 10000]
    })
    result = detect_anomalies_with_fraud(df)
    assert "is_anomaly" in result.columns
    assert result["is_anomaly"].dtype == bool
