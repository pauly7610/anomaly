import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime
import mlflow

def check_fraud_rules(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["is_fraud"] = False
    df["fraud_reason"] = ""
    if "timestamp" in df.columns:
        df = df.sort_values("timestamp")
        time_deltas = df["timestamp"].diff().dt.total_seconds()
        df.loc[time_deltas < 5, ["is_fraud", "fraud_reason"]] = [True, "rapid_sequence"]
    if "amount" in df.columns:
        df.loc[df["amount"] > 10000, ["is_fraud", "fraud_reason"]] = [True, "high_amount"]
    return df

def detect_anomalies(df: pd.DataFrame) -> pd.Series:
    features = df[["amount"]]
    model = IsolationForest(contamination=0.05, random_state=42)
    preds = model.fit_predict(features)
    # -1 indicates anomaly
    return preds == -1

# For future use: DataFrame with fraud columns and anomaly
import mlflow

def detect_anomalies_with_fraud(df: pd.DataFrame) -> pd.DataFrame:
    df = check_fraud_rules(df)
    features = df[["amount"]]
    with mlflow.start_run():
        model = IsolationForest(contamination=0.05, random_state=42)
        model.fit(features)
        mlflow.log_param("contamination", 0.05)
        mlflow.log_metric("train_samples", len(features))
        mlflow.sklearn.log_model(model, "model")
        preds = model.predict(features)
    df["is_anomaly"] = (preds == -1) | df["is_fraud"]
    return df
