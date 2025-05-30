import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_openapi_schema():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "paths" in response.json()

def test_docs_ui():
    response = client.get("/docs")
    assert response.status_code == 200
