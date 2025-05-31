import pytest

# --- AUTOUSE PATCH FOR ANOMALY DETECTION ---
@pytest.fixture(autouse=True)
def patch_detect_anomalies(monkeypatch):
    import ml
    def mock_detect(df):
        return [False] * len(df)
    monkeypatch.setattr(ml, "detect_anomalies", mock_detect)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base
import database
from models import User, Transaction
import tempfile
import os

@pytest.fixture
def client():
    # Create engine and sessionmaker in the test thread
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    database.engine = engine
    database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    from main import app
    with TestClient(app) as c:
        yield c
    engine.dispose()
