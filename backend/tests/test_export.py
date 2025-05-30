import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import datetime, timedelta

@pytest.fixture
def client():
    # Ensure isolation and DB setup
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool
    from database import Base
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
    from routes import transactions, dashboard, auth, export, auth_utils
    app.dependency_overrides[transactions.get_db] = override_get_db
    app.dependency_overrides[dashboard.get_db] = override_get_db
    app.dependency_overrides[auth.get_db] = override_get_db
    app.dependency_overrides[export.get_db] = override_get_db
    app.dependency_overrides[auth_utils.get_db] = override_get_db
    # Patch auth
    from routes.auth_utils import oauth2_scheme, get_current_user
    app.dependency_overrides[oauth2_scheme] = lambda: "faketoken"
    app.dependency_overrides[get_current_user] = lambda: {"id": 1, "email": "test@example.com"}
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    engine.dispose()

CSV_DATA = "timestamp,amount,type,customer_id\n2023-01-01T00:00:00,100.0,deposit,abc\n2023-01-02T00:00:00,200.0,withdrawal,def\n"

@pytest.fixture
def setup_transactions(client):
    files = {"file": ("test.csv", CSV_DATA, "text/csv")}
    resp = client.post("/transactions/upload", files=files)
    assert resp.status_code == 200

# --- CSV EXPORT TESTS ---
def test_export_csv_success(client, setup_transactions):
    resp = client.get("/export/csv")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    content = resp.text
    assert "timestamp,amount,type,customer_id" in content or "id" in content
    assert "abc" in content and "def" in content

def test_export_csv_filters(client, setup_transactions):
    resp = client.get("/export/csv?customer_id=abc")
    assert resp.status_code == 200
    assert "abc" in resp.text and "def" not in resp.text

    resp = client.get("/export/csv?is_anomaly=true")
    assert resp.status_code in (200, 404)  # If no anomalies, may be empty

def test_export_csv_no_data(client):
    resp = client.get("/export/csv")
    assert resp.status_code == 404
    assert "No transactions found" in resp.text or "not found" in resp.text.lower()

def test_export_csv_invalid_date(client, setup_transactions):
    resp = client.get("/export/csv?start_date=2023-13-01")
    assert resp.status_code == 400
    assert "Invalid start_date format" in resp.text

# --- PDF EXPORT TESTS ---
def test_export_pdf_success(client, setup_transactions):
    resp = client.get("/export/pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/pdf")
    assert resp.content[:4] == b"%PDF"

def test_export_pdf_filters(client, setup_transactions):
    resp = client.get("/export/pdf?customer_id=abc")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/pdf")

    resp = client.get("/export/pdf?is_anomaly=true")
    assert resp.status_code in (200, 404)

def test_export_pdf_no_data(client):
    resp = client.get("/export/pdf")
    assert resp.status_code == 404
    assert "No transactions found" in resp.text or "not found" in resp.text.lower()

def test_export_pdf_invalid_date(client, setup_transactions):
    resp = client.get("/export/pdf?start_date=2023-13-01")
    assert resp.status_code == 400
    assert "Invalid start_date format" in resp.text
