from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routes import transactions, dashboard, auth, export, alert_correlation, sla_metrics, ml_extended_api
import time
import asyncio
from utils.telemetry import request_latency

# Enterprise modules
from enterprise import automation_engine, integration_hub, compliance_engine, streaming_processor
import ml

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    latency = (time.time() - start_time) * 1000  # ms
    request_latency.record(latency, {
        "method": request.method,
        "route": request.url.path
    })
    return response

app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(auth.router)
app.include_router(export.router)
app.include_router(alert_correlation.router)
app.include_router(sla_metrics.router)
app.include_router(ml_extended_api.router)

# --- WebSocket endpoint for real-time updates ---
from typing import List
from fastapi import APIRouter

ws_router = APIRouter()
active_connections: List[WebSocket] = []

import random

@ws_router.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            event_type = random.choices(
                ["heartbeat", "anomaly_detected", "compliance_report_generated"],
                weights=[0.5, 0.3, 0.2]
            )[0]
            if event_type == "heartbeat":
                event = {
                    "type": "heartbeat",
                    "message": "System alive",
                    "timestamp": time.time()
                }
            elif event_type == "anomaly_detected":
                event = {
                    "type": "anomaly_detected",
                    "message": f"Anomaly detected in transaction {random.randint(1000,9999)}",
                    "severity": random.choice(["low", "medium", "high"]),
                    "timestamp": time.time()
                }
            else:  # compliance_report_generated
                event = {
                    "type": "compliance_report_generated",
                    "message": f"Compliance report generated: REP-{random.randint(10000,99999)}",
                    "status": "generated",
                    "timestamp": time.time()
                }
            await websocket.send_json(event)
            await asyncio.sleep(random.uniform(3, 5))
    except WebSocketDisconnect:
        active_connections.remove(websocket)

app.include_router(ws_router)

# --- Enterprise Routers ---
app.include_router(automation_engine.router)
app.include_router(integration_hub.router)
app.include_router(compliance_engine.router)
app.include_router(streaming_processor.router)

# --- REST endpoint: business metrics ---
@app.get("/metrics/business")
def business_metrics():
    # Use a local DummyTx class to simulate transactions for demo metrics
    class DummyTx:
        def __init__(self, is_anomaly=False, amount=0, type_="wire"):
            self.is_anomaly = is_anomaly
            self.amount = amount
            self.type = type_
    txs = [DummyTx(is_anomaly=True, amount=12000), DummyTx(is_anomaly=False, amount=8000), DummyTx(is_anomaly=True, amount=15000)]
    return {
        "financial_anomaly_severity_score": ml.financial_anomaly_severity_score(txs),
        "trading_volume_deviation_percentage": ml.trading_volume_deviation_percentage(txs),
        "compliance_risk_score": ml.compliance_risk_score([]),
    }

# --- REST endpoint: integration status ---
@app.get("/integration/status")
def integration_status():
    # Example: return mock integration status for banking/trading/risk systems
    return {
        "core_banking": "connected",
        "trading_platform": "connected",
        "risk_management": "degraded",
        "regulatory_reporting": "connected"
    }
