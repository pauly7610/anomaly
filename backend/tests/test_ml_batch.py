import pytest
import pandas as pd
import ml

# --- check_fraud_rules ---
def test_check_fraud_rules_high_amount():
    df = pd.DataFrame({"timestamp": pd.to_datetime([1, 2]), "amount": [5000, 15000]})
    result = ml.check_fraud_rules(df)
    assert result.loc[1, "is_fraud"] == True
    assert result.loc[1, "fraud_reason"] == "high_amount"

def test_check_fraud_rules_rapid_sequence():
    df = pd.DataFrame({"timestamp": pd.to_datetime([1, 2]), "amount": [100, 200]})
    df["timestamp"] = pd.to_datetime(["2020-01-01 00:00:00", "2020-01-01 00:00:03"])  # <5s apart
    result = ml.check_fraud_rules(df)
    assert result.loc[1, "is_fraud"] == True
    assert result.loc[1, "fraud_reason"] == "rapid_sequence"

def test_detect_anomalies():
    df = pd.DataFrame({"amount": [1, 2, 3, 1000, 2, 3, 4]})
    out = ml.detect_anomalies(df)
    assert len(out) == len(df)

# --- detect_anomalies_with_fraud ---
def test_detect_anomalies_with_fraud():
    df = pd.DataFrame({"timestamp": pd.to_datetime([1, 2]), "amount": [100, 20000]})
    result = ml.detect_anomalies_with_fraud(df)
    assert "is_anomaly" in result.columns
    assert result["is_anomaly"].any()

# --- Business metric scoring functions ---
class DummyTx:
    def __init__(self, is_anomaly=False, amount=0, type_="wire"):
        self.is_anomaly = is_anomaly
        self.amount = amount
        self.type = type_

def test_financial_anomaly_severity_score():
    txs = [DummyTx(is_anomaly=True), DummyTx(is_anomaly=False)]
    score = ml.financial_anomaly_severity_score(txs)
    assert 0.0 <= score <= 1.0

def test_trading_volume_deviation_percentage():
    txs = [DummyTx(amount=50000), DummyTx(amount=55000)]
    pct = ml.trading_volume_deviation_percentage(txs)
    assert isinstance(pct, float)

def test_compliance_risk_score():
    txs = [DummyTx(amount=20000, type_="wire"), DummyTx(amount=5000, type_="ach")]
    score = ml.compliance_risk_score(txs)
    assert 0.0 <= score <= 100.0
