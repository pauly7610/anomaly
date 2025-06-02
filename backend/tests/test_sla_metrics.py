import pytest
from fastapi.testclient import TestClient
from main import app

def test_get_sla_metrics():
    client = TestClient(app)
    response = client.get("/dashboard/sla_metrics/")
    assert response.status_code == 200
    data = response.json()
    assert "sla_ms" in data
    assert "sla_breaches" in data
