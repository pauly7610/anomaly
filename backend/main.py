from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import transactions, dashboard, auth, export
import time
from utils.telemetry import request_latency

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
