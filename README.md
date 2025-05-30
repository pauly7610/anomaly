# Anomaly Detection Web App

A modern web application for uploading, analyzing, and visualizing synthetic financial transaction data with anomaly detection and advanced analytics.

## Features
- Upload CSV or PDF transaction data
- Advanced dashboard: volume over time, anomaly rate, top customers, type distribution, largest/recent anomalies
- Interactive charts (Recharts)
- Filter by date range
- Export filtered data as CSV or PDF
- Secure authentication (JWT)
- Responsive, user-friendly UI
- **92%+ backend code coverage with robust API and auth tests**

## Tech Stack
- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Recharts
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL
- **Other:** reportlab (PDF), JWT auth

## Quickstart
1. Clone the repo
2. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for backend/frontend setup

## Testing & Coverage
- Backend: `pytest --cov=.` (see [`docs/TESTING.md`](docs/TESTING.md))
- Coverage: 92%+ (see `backend/tests/` for new and expanded tests)
- Frontend: `npm test` (Jest/RTL)

## Documentation
- [Product Requirements (PRD)](docs/PRD.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Guide](docs/TESTING.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [User Guide](docs/USER_GUIDE.md)

## Contributing
- PRs welcome! See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) (coming soon)

---
