from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import transactions, dashboard, auth, export

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(auth.router)
app.include_router(export.router)
