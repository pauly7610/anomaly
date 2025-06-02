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

def test_alert_correlation_grouping(monkeypatch):
    from routes import alert_correlation
    now = datetime.now()
    # Two anomalies, same customer/type, within 1 hour
    anomalies = [
        make_anomaly(1, "C1", "fraud", now, 100),
        make_anomaly(2, "C1", "fraud", now + timedelta(minutes=30), 200)
    ]
    anomalies.sort(key=lambda x: (x.customer_id, x.type, x.timestamp))
    FakeTransaction = type("FakeTransaction", (), {})
    app.dependency_overrides[alert_correlation.get_db] = lambda: iter([anomalies])
    app.dependency_overrides[alert_correlation.get_current_user] = lambda: object()
    monkeypatch.setattr(alert_correlation, "Transaction", FakeTransaction)
    client = TestClient(app)
    resp = client.get("/dashboard/alert_correlation/")

    assert resp.status_code == 200
    data = resp.json()["correlated_alerts"]
    assert len(data) == 1
    assert data[0]["count"] == 2
    assert data[0]["customer_id"] == "C1"
    assert data[0]["type"] == "fraud"
    # Now test edge: different type triggers new group
    anomalies2 = [
        make_anomaly(3, "C1", "fraud", now, 100),
        make_anomaly(4, "C1", "error", now, 200)
    ]
    anomalies2.sort(key=lambda x: (x.customer_id, x.type, x.timestamp))
    app.dependency_overrides[alert_correlation.get_db] = lambda: iter([anomalies2])
    resp2 = client.get("/dashboard/alert_correlation/")
    data2 = resp2.json()["correlated_alerts"]
    assert len(data2) == 2
    app.dependency_overrides = {}
    assert data2[0]["type"] != data2[1]["type"]
