# Frontend — Next.js

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the development server:
   ```sh
   npm run dev
   ```

## Features
- Upload CSV of transactions
- View results table (anomalies highlighted)
- Dashboard stats and advanced analytics
- Compliance audit history and regulatory reporting
- Real-time monitoring and anomaly detection
- (Optional) Auth & export

## Structure
- `pages/` — Next.js routes
- `components/` — React components
- `utils/` — Helper functions

## 2025 Compatibility & Upgrades
- Backend and frontend dependencies reviewed and upgraded for 2025
- Next.js 14, React 18, Ant Design 5+ compatibility
- Python 3.14+ readiness
- Test coverage: 91.59% statements, 92.23% lines, 87.33% functions, 85.98% branches (as of June 2025)
- Debug/console output is fully suppressed during tests for clean CI/CD logs
- Modern test hygiene: no stray DOM dumps, no debug remnants
- ADR, PRD, requirements updated
- Troubleshooting: Backend OpenTelemetry stack is pinned for compatibility

## Running Tests & Coverage

To run all tests with coverage:
```sh
npm test -- --coverage
```
- All debug and DOM output is suppressed during test runs for clarity.
- Coverage summary is printed in the terminal. Target is >90% for all metrics.
- If you want to restore debug output, remove the suppression code in `jest.setup.js`.
