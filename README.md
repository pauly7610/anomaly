# Anomaly Detection Web App

![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen)

A modern web application for uploading, analyzing, and visualizing synthetic financial transaction data with anomaly detection and advanced analytics.

## Features
- Upload CSV or PDF transaction data
- Advanced dashboard: volume over time, anomaly rate, top customers, type distribution, largest/recent anomalies
- Interactive charts (Recharts)
- Filter by date range
- Export filtered data as CSV or PDF
- Secure authentication (JWT)
- Responsive, user-friendly UI
- **96% backend code coverage with robust API and auth tests**
- **Registration now enforces valid email and non-empty password (Pydantic validation)**
- **87.67% frontend code coverage with comprehensive component and integration tests**
- **Reliable test isolation: Anomaly detection is now always mocked in tests, ensuring deterministic and correct results**
- **Bugfix: Anomaly count now reflects the number of actual anomalies, not just row count**
- **Ready for Python 3.14+: Deprecation warnings tracked and future-proofing planned**

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
  - Coverage: 87.67% (see `frontend/src/components/__tests__/` for all major component and integration tests)

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
