import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import datetime, timedelta

@pytest.fixture(autouse=True)
def override_auth():
    from routes.auth_utils import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test@user.com"}
    yield
    app.dependency_overrides = {}

def make_anomaly(id, customer_id, type_, timestamp, amount):
    class Tx:
        def __init__(self, id, customer_id, type_, timestamp, amount):
            self.id = id
            self.customer_id = customer_id
            self.type = type_
            self.timestamp = timestamp
            self.amount = amount
            self.is_anomaly = True
    return Tx(id, customer_id, type_, timestamp, amount)

def test_alert_correlation_multiple_groups(monkeypatch):
    from routes import alert_correlation
    now = datetime.now()
    anomalies = [
        make_anomaly(1, "C1", "fraud", now, 100),
        make_anomaly(2, "C1", "fraud", now + timedelta(minutes=30), 200),
        make_anomaly(3, "C2", "fraud", now, 100),
        make_anomaly(4, "C1", "error", now + timedelta(minutes=90), 300)
    ]
    anomalies.sort(key=lambda x: (x.customer_id, x.type, x.timestamp))
    FakeTransaction = type("FakeTransaction", (), {})
    app.dependency_overrides[alert_correlation.get_db] = lambda: iter([anomalies])
    app.dependency_overrides[alert_correlation.get_current_user] = lambda: object()
    monkeypatch.setattr(alert_correlation, "Transaction", FakeTransaction)
    client = TestClient(app)
    resp = client.get("/dashboard/alert_correlation/")

    app.dependency_overrides = {}
    assert resp.status_code == 200
    data = resp.json().get("correlated_alerts", [])
    assert len(data) >= 2  # At least two groups: C1/fraud and C2/fraud, possibly more
    # Check grouping by customer and type
    group_types = set((g["customer_id"], g["type"]) for g in data)
    assert ("C1", "fraud") in group_types
    assert ("C2", "fraud") in group_types
    # Edge: anomaly outside 1hr window triggers new group
    assert any(g["type"] == "error" for g in data)
