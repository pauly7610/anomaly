import pytest
from fastapi.testclient import TestClient
from main import app

def test_simulate_stream_event():
    client = TestClient(app)
    response = client.post("/enterprise/streaming/simulate_event", json={"event_type": "anomaly_detected"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "published"
    assert data["type"] == "anomaly_detected"

def test_streaming_status():
    client = TestClient(app)
    response = client.get("/enterprise/streaming/status")
    assert response.status_code == 200
    data = response.json()
    assert data["streaming_engine"] == "operational"
