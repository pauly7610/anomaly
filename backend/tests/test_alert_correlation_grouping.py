from routes.alert_correlation import group_correlated_alerts
from datetime import datetime, timedelta

def make_anomaly(id, customer_id, type_, timestamp, amount):
    class Tx:
        def __init__(self, id, customer_id, type_, timestamp, amount):
            self.id = id
            self.customer_id = customer_id
            self.type = type_
            self.timestamp = timestamp
            self.amount = amount
    return Tx(id, customer_id, type_, timestamp, amount)

def test_group_correlated_alerts_multiple_groups():
    now = datetime.now()
    anomalies = [
        make_anomaly(1, "C1", "fraud", now, 100),
        make_anomaly(2, "C1", "fraud", now + timedelta(minutes=30), 200),
        make_anomaly(3, "C2", "fraud", now, 100),
        make_anomaly(4, "C1", "error", now + timedelta(minutes=90), 300)
    ]
    groups = group_correlated_alerts(anomalies)
    assert len(groups) >= 2
    group_types = set((g["customer_id"], g["type"]) for g in groups)
    assert ("C1", "fraud") in group_types
    assert ("C2", "fraud") in group_types
    assert any(g["type"] == "error" for g in groups)

def test_group_correlated_alerts_time_window():
    now = datetime.now()
    anomalies = [
        make_anomaly(1, "C1", "fraud", now, 100),
        make_anomaly(2, "C1", "fraud", now + timedelta(hours=2), 200)
    ]
    groups = group_correlated_alerts(anomalies)
    assert len(groups) == 2
    assert groups[0]["count"] == 1
    assert groups[1]["count"] == 1
