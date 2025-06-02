from fastapi import APIRouter
from utils.sla import sla_tracker
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

router = APIRouter(prefix="/dashboard/sla_metrics", tags=["sla-metrics"])

@router.get("/")
def get_sla_metrics():
    with tracer.start_as_current_span("get_sla_metrics"):
        return sla_tracker.stats()
