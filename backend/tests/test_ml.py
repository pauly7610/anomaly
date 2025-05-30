import pandas as pd
from ml import detect_anomalies

def test_anomaly_detection_consistency():
    normal_data = pd.DataFrame({"amount": [100, 105, 95]})
    anomaly_data = pd.DataFrame({"amount": [10000]})
    normal_result = detect_anomalies(normal_data)
    anomaly_result = detect_anomalies(anomaly_data)
    assert list(normal_result) == [False, False, True]
    assert list(anomaly_result) == [False]
