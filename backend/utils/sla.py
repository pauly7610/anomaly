import threading
import time
from collections import deque

# Thread-safe in-memory SLA tracker for demo purposes
class SLATracker:
    def __init__(self, window_size=100, sla_ms=500):
        self.latencies = deque(maxlen=window_size)
        self.sla_ms = sla_ms
        self.lock = threading.Lock()
        self.breaches = 0

    def record(self, latency_ms):
        with self.lock:
            self.latencies.append(latency_ms)
            if latency_ms > self.sla_ms:
                self.breaches += 1

    def stats(self):
        with self.lock:
            count = len(self.latencies)
            avg = sum(self.latencies) / count if count else 0
            max_latency = max(self.latencies) if self.latencies else 0
            min_latency = min(self.latencies) if self.latencies else 0
            breaches = self.breaches
        return {
            'count': count,
            'average_latency_ms': avg,
            'max_latency_ms': max_latency,
            'min_latency_ms': min_latency,
            'sla_ms': self.sla_ms,
            'sla_breaches': breaches
        }

sla_tracker = SLATracker(window_size=200, sla_ms=500)
