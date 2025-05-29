# Deployment Guide

## Prerequisites
- Node.js (v18+)
- Python 3.10+
- PostgreSQL

## Backend
1. Install dependencies:
   ```sh
   cd backend
   pip install -r requirements.txt
   ```
2. Set environment variables in `.env` (see `.env.example`).
3. Run database migrations (if any).
4. Start the FastAPI server:
   ```sh
   uvicorn main:app --reload
   ```

## Frontend
1. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2. Start the Next.js app:
   ```sh
   npm run dev
   ```

## Production
- Use a process manager (e.g., Gunicorn, PM2) and a production-ready server (e.g., Nginx).
- Set up HTTPS and secure environment variables.

## Environment Variables
- See `.env.example` for required variables.

## Notes
- Ensure backend and frontend ports do not conflict.
- Update CORS settings for production domains.
