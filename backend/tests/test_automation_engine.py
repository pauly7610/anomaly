import pytest
from fastapi.testclient import TestClient
from main import app

def test_trigger_incident():
    client = TestClient(app)
    response = client.post("/enterprise/automation/trigger_incident", json={"incident_type": "anomaly", "severity": "high"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "triggered"
    assert "incident_id" in data

def test_automation_status():
    client = TestClient(app)
    response = client.get("/enterprise/automation/status")
    assert response.status_code == 200
    data = response.json()
    assert data["engine_status"] == "operational"

def test_trading_halt():
    client = TestClient(app)
    resp = client.post("/enterprise/automation/trading_halt", json={"reason": "anomaly_threshold_exceeded"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["action"] == "trading_halt"
    assert data["status"] == "executed"

def test_compliance_violation():
    client = TestClient(app)
    resp = client.post("/enterprise/automation/compliance_violation", json={"account_id": "ACC-001", "rule": "SEC_17a-4"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["action"] == "compliance_violation_reported"
    assert data["account_id"] == "ACC-001"
    assert data["rule"] == "SEC_17a-4"
    assert data["status"] == "reported"

def test_fraud_response():
    client = TestClient(app)
    resp = client.post("/enterprise/automation/fraud_response", json={"account_id": "ACC-002"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["action"] == "account_frozen"
    assert data["account_id"] == "ACC-002"
    assert data["status"] == "frozen"
    assert data["investigation"] == "initiated"

def test_risk_mitigation():
    client = TestClient(app)
    resp = client.post("/enterprise/automation/risk_mitigation", json={"account_id": "ACC-003", "position_limit": 1000000.0})
    assert resp.status_code == 200
    data = resp.json()
    assert data["action"] == "risk_mitigation_enforced"
    assert data["account_id"] == "ACC-003"
    assert data["position_limit"] == 1000000.0
    assert data["status"] == "enforced"
