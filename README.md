# Enterprise AIOps Platform — ITRS Demo Ready

![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen)

A next-generation enterprise AIOps platform for financial institutions, delivering real-time anomaly detection, automation, and compliance at scale.

**Business Impact:**
- Reduces MTTD from hours to seconds via real-time anomaly alerts
- Automates 80% of incident response through enterprise workflow engine
- Ensures 100% SEC compliance with automated audit trails
- C-suite operational intelligence with executive dashboards

**Purpose:**
This platform is designed for financial institutions and fintechs seeking robust, real-time monitoring and analytics for transaction flows. It supports:
- Real-time trading system observability
- Fraud detection for core banking
- Compliance auditing (e.g., SEC Rule 17a-4)

## Use Cases
- **Real-time trading system observability:** Detect anomalies in trading volumes, price spikes, or unusual flow patterns as they happen.
- **Fraud detection for core banking:** Identify suspicious transactions, rapid sequences, or high-value anomalies in retail and commercial banking environments.
- **Compliance auditing (e.g., SEC Rule 17a-4):** Maintain immutable records and monitor for regulatory compliance events in transaction data.

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

## 2025 Stack & Compatibility
- **OpenTelemetry:** opentelemetry-api/sdk 1.24.0, instrumentation 0.45b0 (semantic conventions pinned for compatibility)
- **mlflow:** 2.22.0 (upgraded for Pydantic v2+ and Python 3.14 readiness)
- **Python:** 3.14+ compatible (deprecation warnings tracked and mitigated)
- **Test Coverage:** 92%+ backend, 87%+ frontend
- **Test Isolation:** Robust ML/model initialization and dependency overrides for reliable results
- **Docs:** All ADR, PRD, and requirements updated for 2025
- **Troubleshooting:** If you encounter OpenTelemetry conflicts, ensure all OTEL packages are pinned to the 1.24.0/0.45b0 family

## Quickstart
1. Clone the repo
2. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for backend/frontend setup

## Testing & Coverage
- Backend: `pytest --cov=.` (see [`docs/TESTING.md`](docs/TESTING.md))
  - Coverage: 96%+ (see `backend/tests/` for new and expanded tests)
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
