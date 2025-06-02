import pytest
from fastapi.testclient import TestClient
from main import app

def test_compliance_history_truncation():
    client = TestClient(app)
    # Generate 30 reports to exceed the 25-history limit
    for i in range(30):
        client.post("/enterprise/compliance/generate_report", json={"report_type": f"SEC_{i}"})
    response = client.get("/enterprise/compliance/history")
    history = response.json()
    assert len(history) == 25
    # Oldest report should be the 6th (index 5) generated
    assert history[0]["type"] == "SEC_5"
