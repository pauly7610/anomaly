import pytest
from utils.sla import SLATracker

def test_sla_tracker_record_and_stats():
    tracker = SLATracker(window_size=5, sla_ms=100)
    # Add latencies, some above SLA
    tracker.record(50)
    tracker.record(150)
    tracker.record(80)
    tracker.record(120)
    tracker.record(90)
    stats = tracker.stats()
    assert stats['count'] == 5
    assert stats['sla_breaches'] == 2
    assert stats['max_latency_ms'] == 150
    assert stats['min_latency_ms'] == 50
    assert stats['average_latency_ms'] > 0
    assert stats['sla_ms'] == 100


def test_sla_tracker_window_size():
    tracker = SLATracker(window_size=3, sla_ms=100)
    for latency in [10, 20, 30, 40]:
        tracker.record(latency)
    stats = tracker.stats()
    assert stats['count'] == 3
    assert stats['min_latency_ms'] == 20
    assert stats['max_latency_ms'] == 40
