"""
Compliance & Audit Engine
- Handles compliance checks, audit trail generation, and regulatory reporting.
- Provides mock compliance status and report generation.

TODO: Implement compliance logic and reporting.
"""

from fastapi import APIRouter
from datetime import datetime
import threading
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

router = APIRouter(prefix="/enterprise/compliance", tags=["enterprise-compliance"])

# In-memory compliance report history
_compliance_history = []
_history_lock = threading.Lock()

def _add_report(report):
    with _history_lock:
        _compliance_history.append(report)
        # Keep only last 25 (oldest at index 0)
        if len(_compliance_history) > 25:
            del _compliance_history[:-25]

def _now():
    return datetime.now().isoformat()

@router.get("/status")
def compliance_status():
    with tracer.start_as_current_span("compliance_status"):
        """
        Return mock compliance engine status.
        """
        last = _compliance_history[-1]["timestamp"] if _compliance_history else None
        return {
            "compliance_engine": "operational",
            "last_audit": last or "2025-05-30T11:00:00-04:00",
            "pending_reports": 0
        }

from pydantic import BaseModel

class ComplianceReportRequest(BaseModel):
    report_type: str = "SEC_17a-4"

@router.post("/compliance_check")
def compliance_check(account_id: str = "ACC-001", rule: str = "SEC_17a-4"):
    with tracer.start_as_current_span("compliance_check"):
        """
        Simulate a compliance check for an account.
        """
        passed = rule == "SEC_17a-4" and account_id.startswith("ACC-")
        result = {
            "account_id": account_id,
            "rule": rule,
            "status": "passed" if passed else "failed",
            "timestamp": _now()
        }
        return result

@router.post("/generate_report")
def generate_compliance_report(body: ComplianceReportRequest):
    with tracer.start_as_current_span("generate_compliance_report"):
        """
        Simulate generation of a compliance/audit report.
        """
        report = {
            "report_id": f"REP-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "type": body.report_type,
            "status": "generated",
            "timestamp": _now(),
            "download_url": "/mock/download/report/REP-latest.pdf"
        }
        _add_report(report)
        return report
        _add_report(report)
        return report

@router.get("/history")
def compliance_history():
    with tracer.start_as_current_span("compliance_history"):
        """
        Return history of generated compliance reports.
        """
        with _history_lock:
            return list(_compliance_history)

