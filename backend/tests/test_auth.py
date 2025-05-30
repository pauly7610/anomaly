import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta
from jose import jwt
from main import app
from database import Base
from routes.auth_utils import get_current_user
from routes.auth import get_db
from models import User
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

# Ensure SECRET_KEY is loaded and set for JWT
load_dotenv()
os.environ["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecret")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base
from dotenv import load_dotenv
import os

# Ensure SECRET_KEY matches app
load_dotenv()
os.environ["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecret")
from dotenv import load_dotenv
import os

# Ensure SECRET_KEY matches app
load_dotenv()
os.environ["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecret")

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
    yield TestClient(app)
    app.dependency_overrides.clear()
    engine.dispose()

def create_user_in_db(email, password, db):
    hashed_pw = get_password_hash(password)
    user = User(email=email, hashed_password=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Tests

def test_register_success(client):
    response = client.post("/auth/register", json={"email": "test1@example.com", "password": "mypassword"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test1@example.com"
    assert "hashed_password" not in data
    # Optionally, check login endpoint to verify registration
    login_resp = client.post("/auth/login", json={"email": "test1@example.com", "password": "mypassword"})
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data

def test_register_duplicate_email(client):
    # Register once
    resp1 = client.post("/auth/register", json={"email": "dup@example.com", "password": "pass"})
    assert resp1.status_code == 200
    # Register again with same email
    response = client.post("/auth/register", json={"email": "dup@example.com", "password": "newpass"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client):
    # Register the user first via the API
    reg_resp = client.post("/auth/register", json={"email": "login@example.com", "password": "secret"})
    assert reg_resp.status_code == 200
    # Now login with correct credentials
    response = client.post("/auth/login", json={"email": "login@example.com", "password": "secret"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client):
    # Register the user first
    reg_resp = client.post("/auth/register", json={"email": "badpass@example.com", "password": "correct"})
    assert reg_resp.status_code == 200
    # Attempt login with wrong password
    response = client.post("/auth/login", json={"email": "badpass@example.com", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_login_nonexistent_user(client):
    response = client.post("/auth/login", json={"email": "nope@example.com", "password": "nopass"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_token_expiry():
    from routes.auth import create_access_token, SECRET_KEY, ALGORITHM
    token = create_access_token({"sub": "test@example.com"}, expires_delta=timedelta(seconds=-1))
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
    assert decoded["sub"] == "test@example.com"
    assert "exp" in decoded
    assert datetime.utcfromtimestamp(decoded["exp"]) < datetime.utcnow()

def test_response_does_not_return_hashed_password(client):
    response = client.post("/auth/register", json={"email": "safe@example.com", "password": "pass"})
    data = response.json()
    assert "hashed_password" not in data

def test_create_and_decode_token():
    from routes.auth import create_access_token, SECRET_KEY, ALGORITHM
    token = create_access_token({"sub": "user@example.com"})
    from jose import jwt
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == "user@example.com"
    assert "exp" in decoded

@pytest.fixture(autouse=True)
def cleanup_env():
    yield
    os.environ.pop("SECRET_KEY", None)
    os.environ.pop("ALGORITHM", None)
    os.environ.pop("ACCESS_TOKEN_EXPIRE_MINUTES", None)
