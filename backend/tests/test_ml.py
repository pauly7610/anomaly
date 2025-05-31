import pandas as pd
from ml import detect_anomalies

def test_anomaly_detection_consistency():
    normal_data = pd.DataFrame({"amount": [100, 105, 95]})
    anomaly_data = pd.DataFrame({"amount": [10000]})
    normal_result = detect_anomalies(normal_data)
    anomaly_result = detect_anomalies(anomaly_data)
    assert list(normal_result) == [False, False, True]
    assert list(anomaly_result) == [False]

def test_detect_anomalies_empty_df():
    df = pd.DataFrame({"amount": []})
    import pytest
    with pytest.raises(ValueError):
        detect_anomalies(df)

def test_detect_anomalies_non_numeric():
    df = pd.DataFrame({"amount": ["a", "b", "c"]})
    try:
        detect_anomalies(df)
    except Exception:
        assert True
    else:
        assert False, "Expected exception for non-numeric data"

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
    from ml import detect_anomalies_with_fraud
    result = detect_anomalies_with_fraud(df)
    assert "is_anomaly" in result.columns
    assert result["is_anomaly"].dtype == bool
