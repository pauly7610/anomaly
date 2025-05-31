import pytest
from tests.conftest import client

def test_client_fixture(client):
    # Just ensure the client fixture works
    response = client.get("/docs")
    assert response.status_code in (200, 404)  # Accept either if docs route is disabled
