import pytest
from fastapi.testclient import TestClient
from main import app
import io
import pandas as pd

import pytest
from fastapi.testclient import TestClient
from main import app
from routes.auth_utils import get_current_user

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test@user.com"}
    yield
    app.dependency_overrides = {}

@pytest.fixture(autouse=True)
def fit_ml_models():
    # Fit both RandomForestClassifier and IsolationForest with dummy data so all ML endpoints work
    from ml_extended import ensemble
    import numpy as np
    X = np.array([[100], [200], [300]])
    y = np.array([0, 1, 0])
    ensemble.rf.fit(X, y)
    ensemble.isolation.fit(X)

@pytest.fixture
def client():
    return TestClient(app)

def make_csv_bytes():
    df = pd.DataFrame({"amount": [100, 200, 300], "is_anomaly": [0, 1, 0]})
    return io.BytesIO(df.to_csv(index=False).encode("utf-8"))

def test_ensemble_predict(client):
    files = {"file": ("test.csv", make_csv_bytes(), "text/csv")}
    response = client.post("/dashboard/ml_extended/ensemble_predict", files=files)
    assert response.status_code == 200
    assert "predictions" in response.json()

def test_drift_detect(client):
    files = {"file": ("test.csv", make_csv_bytes(), "text/csv")}
    response = client.post("/dashboard/ml_extended/drift_detect", files=files)
    assert response.status_code == 200
    assert "drift_detected" in response.json()

def test_shap_explain(client):
    files = {"file": ("test.csv", make_csv_bytes(), "text/csv")}
    response = client.post("/dashboard/ml_extended/shap_explain", files=files)
    assert response.status_code == 200
    assert "shap_values" in response.json()

def test_auto_retrain(client):
    files = {"file": ("test.csv", make_csv_bytes(), "text/csv")}
    response = client.post("/dashboard/ml_extended/auto_retrain", files=files)
    assert response.status_code == 200
    assert response.json().get("status") == "retrained"
