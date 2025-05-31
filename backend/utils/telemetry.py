from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import ConsoleMetricExporter, PeriodicExportingMetricReader

metric_reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(metric_readers=[metric_reader])
metrics.set_meter_provider(provider)

meter = metrics.get_meter("anomaly.detection")
request_latency = meter.create_histogram(
    "http.server.duration",
    unit="ms",
    description="Duration of HTTP requests"
)
anomaly_counter = meter.create_counter(
    "anomaly.detection.count",
    unit="1",
    description="Total detected anomalies"
)
