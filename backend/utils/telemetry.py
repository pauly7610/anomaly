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

# --- Custom Business Metrics ---
financial_anomaly_severity_score_metric = meter.create_histogram(
    "financial_anomaly_severity_score",
    unit="1",
    description="Severity score for financial anomalies (0-1)"
)

trading_volume_deviation_percentage_metric = meter.create_histogram(
    "trading_volume_deviation_percentage",
    unit="%",
    description="Deviation of trading volume from baseline (percentage)"
)

compliance_risk_score_metric = meter.create_histogram(
    "compliance_risk_score",
    unit="1",
    description="Compliance risk score (0-100)"
)

def record_financial_anomaly_severity_score(score: float, attrs: dict = None):
    financial_anomaly_severity_score_metric.record(score, attributes=attrs or {})

def record_trading_volume_deviation_percentage(percentage: float, attrs: dict = None):
    trading_volume_deviation_percentage_metric.record(percentage, attributes=attrs or {})

def record_compliance_risk_score(score: float, attrs: dict = None):
    compliance_risk_score_metric.record(score, attributes=attrs or {})
