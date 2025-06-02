import pytest
from fastapi.testclient import TestClient
from main import app

def test_integration_status():
    client = TestClient(app)
    response = client.get("/enterprise/integration/status")
    assert response.status_code == 200
    data = response.json()
    assert data["core_banking"] == "connected"
    assert data["trading_platform"] == "connected"

def test_simulate_integration_event():
    client = TestClient(app)
    response = client.get("/enterprise/integration/simulate_event?system=core_banking")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "core_banking"
    assert data["event"] == "heartbeat"

def test_validate_transaction():
    client = TestClient(app)
    resp = client.post("/enterprise/integration/validate_transaction", json={"account_id": "ACC-1001", "amount": 50.0})
    assert resp.status_code == 200
    data = resp.json()
    assert data["validation_status"] == "approved"
    # Edge: amount triggers manual_review
    resp2 = client.post("/enterprise/integration/validate_transaction", json={"account_id": "ACC-1001", "amount": 20000.0})
    assert resp2.status_code == 200
    print('DEBUG validate_transaction manual_review:', resp2.json())
    assert resp2.json()["validation_status"] == "manual_review"

def test_verify_account():
    client = TestClient(app)
    resp = client.post("/enterprise/integration/verify_account", json={"account_id": "ACC-1001"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["verified"] is True
    assert data["status"] == "active"

def test_market_data():
    client = TestClient(app)
    resp = client.post("/enterprise/integration/market_data", json={"symbol": "AAPL"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["symbol"] == "AAPL"
    assert "price" in data
    assert "volume" in data
    assert data["trading_halt"] is False

def test_trading_halt_trigger():
    client = TestClient(app)
    resp = client.post("/enterprise/integration/trading_halt_trigger", json={"symbol": "AAPL", "reason": "anomaly_detected"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["symbol"] == "AAPL"
    assert data["action"] == "trading_halt"
    assert data["status"] == "halted"

def test_risk_aggregation():
    client = TestClient(app)
    resp = client.post("/enterprise/integration/risk_aggregation", json={"portfolio_id": "PORT-001"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["portfolio_id"] == "PORT-001"
    assert "exposure" in data
    assert "risk_score" in data

def test_regulatory_report():
    client = TestClient(app)
    resp = client.post("/enterprise/integration/regulatory_report", json={"report_type": "SEC_17a-4"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["report_type"] == "SEC_17a-4"
    assert data["status"] == "generated"
    assert "download_url" in data
