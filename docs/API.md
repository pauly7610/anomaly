# API Documentation

## Authentication
- `POST /auth/login` — Login, returns JWT
- `POST /auth/register` — Register new user

## Dashboard
- `GET /dashboard/` — Get dashboard stats
  - Query params: `start_date`, `end_date` (optional)

## Upload
- `POST /upload/` — Upload transaction data (CSV/PDF)

## Export
- `GET /export/csv` — Download filtered transactions as CSV
- `GET /export/pdf` — Download filtered transactions as PDF

## Data Model
- Transaction: `{ id, amount, type, customer_id, timestamp, is_anomaly }`

## Auth
- All endpoints except `/auth/*` and `/upload/` require JWT in `Authorization` header.

---

For detailed request/response schemas, see backend source or OpenAPI docs at `/docs` (FastAPI auto-generated).
