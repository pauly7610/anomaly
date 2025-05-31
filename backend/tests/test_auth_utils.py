import pytest
from fastapi.testclient import TestClient
from main import app
from jose import jwt
import os

@pytest.fixture
def client():
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
    # Patch only oauth2_scheme to extract the token from the Authorization header
    from routes.auth_utils import oauth2_scheme
    from fastapi import Request
    def extract_token(request: Request):
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            return auth.split(" ", 1)[1]
        return ""
    app.dependency_overrides[oauth2_scheme] = extract_token
    # DO NOT override get_current_user here!
    with TestClient(app) as c:
        c.sessionmaker = TestingSessionLocal
        yield c
    app.dependency_overrides.clear()
    engine.dispose()

# Helper to generate JWT
@pytest.fixture
def make_token():
    def _make_token(email="test@example.com"):
        from routes.auth_utils import SECRET_KEY, ALGORITHM
        return jwt.encode({"sub": email}, SECRET_KEY, algorithm=ALGORITHM)
    return _make_token

# --- TESTS ---
def test_get_current_user_valid(client, make_token):
    # Create user in DB to match the token using the correct in-memory session
    from models import User
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_get_current_user_missing_sub(client, make_token):
    from routes.auth_utils import SECRET_KEY, ALGORITHM
    import jwt
    bad_token = jwt.encode({}, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {bad_token}"}
    resp = client.get("/dashboard/", headers=headers)
    assert resp.status_code == 401

def test_get_current_user_invalid_signature(client, make_token):
    import jwt
    bad_token = jwt.encode({"sub": "test@example.com"}, "wrongkey", algorithm="HS256")
    headers = {"Authorization": f"Bearer {bad_token}"}
    resp = client.get("/dashboard/", headers=headers)
    assert resp.status_code == 401

    # Insert user into the test DB before valid token request
    from models import User
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = client.sessionmaker()
    try:
        user = User(email="test@example.com", hashed_password=pwd_context.hash("password"))
        db.add(user)
        db.commit()
    finally:
        db.close()

    token = make_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/dashboard/", headers=headers)
    # Should not be 401 Unauthorized
    assert resp.status_code != 401

def test_get_current_user_invalid_token(client):
    headers = {"Authorization": "Bearer invalidtoken"}
    resp = client.get("/dashboard/", headers=headers)
    assert resp.status_code == 401
    assert "Could not validate credentials" in resp.text

def test_get_current_user_missing_user(client, make_token):
    # Token for an email not in DB
    token = make_token("missing@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/dashboard/", headers=headers)
    assert resp.status_code == 401
    assert "Could not validate credentials" in resp.text
