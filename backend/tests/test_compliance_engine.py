import pytest
from fastapi.testclient import TestClient
from main import app

def test_compliance_status():
    client = TestClient(app)
    response = client.get("/enterprise/compliance/status")
    assert response.status_code == 200
    assert "compliance_engine" in response.json()

def test_generate_compliance_report():
    client = TestClient(app)
    response = client.post("/enterprise/compliance/generate_report", json={"report_type": "SEC_17a-4"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "generated"
    assert "report_id" in data

def test_compliance_history():
    client = TestClient(app)
    client.post("/enterprise/compliance/generate_report", json={"report_type": "SEC_17a-4"})
    response = client.get("/enterprise/compliance/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
