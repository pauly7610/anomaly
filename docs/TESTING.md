# Testing Guide

## Backend (FastAPI)
- **Unit Tests:** Use `pytest` for models, routes, and business logic.
- **Integration Tests:** Use `pytest` with `TestClient` for API endpoint flows (upload, analysis, dashboard, export).
- **Fixtures:** Place reusable mock data in `tests/fixtures/`.
- **Run All Tests:**
  ```sh
  cd backend
  pytest
  ```

## Frontend (Next.js)
- **Unit Tests:** Use `jest` and `@testing-library/react` for components and utilities.
- **Integration Tests:** Test upload-to-dashboard flow with mock API responses.
- **Run All Tests:**
  ```sh
  cd frontend
  npm test
  ```

## Best Practices
- Use fixtures for consistent test data.
- Mock external dependencies (DB, APIs).
- Keep tests fast and isolated.

---

## Coverage
- Backend coverage: **96%** as of latest update (see `backend/tests/` for new/expanded tests, including auth, export endpoints, and registration validation).
- Use coverage tools: `pytest --cov=.` for backend, `jest --coverage` for frontend.
- To view detailed backend coverage, run:
  ```sh
  pytest --cov=. --cov-report=html
  # Open htmlcov/index.html in your browser
  ```
