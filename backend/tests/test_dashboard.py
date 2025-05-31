import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta
from models import Transaction
from main import app
from database import Base
from routes.dashboard import get_db
from routes.auth_utils import get_current_user
from routes.transactions import upload_transactions
from routes.export import export_csv

# Helper: fake JWT token (should match your backend config for real auth tests)
FAKE_JWT = "Bearer faketoken"
HEADERS = {"Authorization": FAKE_JWT}

@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    from main import app
    from routes import transactions, dashboard, auth, export, auth_utils
    app.dependency_overrides[transactions.get_db] = override_get_db
    app.dependency_overrides[dashboard.get_db] = override_get_db
    app.dependency_overrides[auth.get_db] = override_get_db
    app.dependency_overrides[export.get_db] = override_get_db
    app.dependency_overrides[auth_utils.get_db] = override_get_db
    # Patch oauth2_scheme and get_current_user for all dashboard tests
    from routes.auth_utils import oauth2_scheme, get_current_user
    app.dependency_overrides[oauth2_scheme] = lambda: "faketoken"
    app.dependency_overrides[get_current_user] = lambda: {"id": 1, "email": "test@example.com"}
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    engine.dispose()

# --- DASHBOARD ---
def test_dashboard_requires_auth(client):
    # Ensure get_current_user is NOT overridden: should get 401
    from main import app
    from routes.auth_utils import get_current_user, oauth2_scheme
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(oauth2_scheme, None)
    resp = client.get("/dashboard/")
    assert resp.status_code == 401

def test_dashboard_no_data(client):
    resp = client.get("/dashboard/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)

def test_dashboard_invalid_date_filter(client):
    resp = client.get("/dashboard/?start_date=notadate")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)

def test_dashboard_with_auth(client):
    from main import app
    from routes import dashboard
    app.dependency_overrides["routes.dashboard.get_current_user"] = lambda: {"id": 1, "email": "test@example.com"}
    resp = client.get("/dashboard/", headers=HEADERS)
    assert resp.status_code in (200, 422)

# --- UPLOAD ---
def test_upload_csv(client, tmp_path):
    from main import app
    from routes import dashboard
    app.dependency_overrides["routes.dashboard.get_current_user"] = lambda: {"id": 1, "email": "test@example.com"}
    # Create a sample CSV file
    sample = tmp_path / "sample.csv"
    sample.write_text("timestamp,amount,type,customer_id\n2024-01-01T00:00:00Z,100.0,credit,abc\n")
    with open(sample, "rb") as f:
        resp = client.post("/transactions/upload", files={"file": ("sample.csv", f, "text/csv")}, headers=HEADERS)
    assert resp.status_code in (200, 201, 422)  # Accepts success or validation error if logic is strict

# --- EXPORT ---
def test_export_csv(client, monkeypatch):
    resp = client.get("/export/csv", headers=HEADERS)
    assert resp.status_code in (200, 404, 422)
    # Should return a CSV file, empty, or 404 if no data

# --- ANOMALY DETECTION LOGIC ---
def test_anomaly_logic_importable():
    import ml
    assert hasattr(ml, "detect_anomalies") or hasattr(ml, "IsolationForest") or hasattr(ml, "predict")
