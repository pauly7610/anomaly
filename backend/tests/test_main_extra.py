import pytest
from fastapi.testclient import TestClient
from main import app

def test_metrics_business():
    client = TestClient(app)
    resp = client.get("/metrics/business")
    assert resp.status_code == 200
    data = resp.json()
    assert "financial_anomaly_severity_score" in data
    assert "trading_volume_deviation_percentage" in data
    assert "compliance_risk_score" in data

def test_integration_status():
    client = TestClient(app)
    resp = client.get("/integration/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["core_banking"] == "connected"
    assert data["trading_platform"] == "connected"
    assert data["risk_management"] == "degraded"
    assert data["regulatory_reporting"] == "connected"
