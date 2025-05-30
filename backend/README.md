# Backend — FastAPI

## Setup

1. Create a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Set up PostgreSQL and configure the database URL in `.env` (to be created).
4. Run the app:
   ```sh
   uvicorn main:app --reload
   ```

## Features
- CSV and PDF upload endpoints
- Isolation Forest anomaly detection
- Transaction storage (PostgreSQL)
- Stats & export endpoints
- Secure JWT authentication
- Export as CSV or PDF
- **92%+ backend code coverage with robust API and auth tests**

## Structure
- `main.py` — FastAPI entry point
- `models.py` — SQLAlchemy models
- `schemas.py` — Pydantic schemas
- `database.py` — DB connection
- `ml.py` — Anomaly detection logic
- `routes/` — API routes
