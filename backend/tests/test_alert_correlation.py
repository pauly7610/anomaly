import pytest
from fastapi.testclient import TestClient
from main import app

import pytest
from fastapi.testclient import TestClient
from main import app
from routes.auth_utils import get_current_user

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test@user.com"}
    yield
    app.dependency_overrides = {}

@pytest.fixture
def client():
    return TestClient(app)

def test_correlated_alerts_empty_db(monkeypatch, client):
    # Monkeypatch DB to return no anomalies
    from routes import alert_correlation
    monkeypatch.setattr(alert_correlation, "get_db", lambda: iter([[]]))
    monkeypatch.setattr(alert_correlation, "Transaction", type("FakeTransaction", (), {}))
    response = client.get("/dashboard/alert_correlation/")
    assert response.status_code == 200
    assert response.json()["correlated_alerts"] == []
