import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_anomalies(df: pd.DataFrame) -> pd.Series:
    # Only use numeric columns for anomaly detection
    features = df[["amount"]]
    model = IsolationForest(contamination=0.05, random_state=42)
    preds = model.fit_predict(features)
    # -1 indicates anomaly
    return preds == -1
