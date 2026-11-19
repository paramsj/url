# Setup

## Requirements
- Docker and Docker Compose
- PostgreSQL database (external to Docker Compose)
- For local non-Docker runs only: Node.js 20+

## Environment Variables
Create a `.env` file in the project root (copied from `.env.example`). Docker Compose and the backend read this file.

Required:
- `DATABASE_URL`: PostgreSQL connection string (Supabase, Neon, or local PostgreSQL)
- `ACCESS_TOKEN_SECRET`: Strong secret for access tokens
- `REFRESH_TOKEN_SECRET`: Strong secret for refresh tokens

Optional / Defaulted:
- `NODE_ENV` (default `development`, set `production` for HTTPS secure cookies)
- `REDIS_URL` (default `redis://localhost:6379` for local dev; Docker Compose automatically overrides to `redis://redis:6379`)
- `CORS_ORIGIN` (default `http://localhost:3000,http://localhost`)
- `ACCESS_TOKEN_EXPIRY` (default `15m`)
- `REFRESH_TOKEN_EXPIRY` (default `7d`)
- `PORT` (default `3000`, container port for single instance)
- `SERVER_ID` (default `app1`, overridden per service in Docker Compose)

Example (`.env`):
```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
ACCESS_TOKEN_SECRET=your-strong-access-token-secret
REFRESH_TOKEN_SECRET=your-strong-refresh-token-secret
NODE_ENV=development
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000,http://localhost
```

## Project Structure
- `/backend`: Express API, BullMQ workers, Drizzle ORM, and database scripts.
- `/frontend`: Next.js web application.
- `/nginx.conf` & `docker-compose.yml`: Multi-container orchestration and reverse proxy.

## Install
1. Backend dependencies:
   cd backend && npm install
2. Frontend dependencies:
   cd frontend && npm install

## Database
1. Ensure `DATABASE_URL` is configured in your `.env`.
2. Generate migrations (if schema modified):
   cd backend && npm run db:generate
3. Push migrations to database:
   cd backend && npm run db:push
4. Seed initial ID ranges for servers (`app1`, `app2`, `app3`):
   cd backend && npm run db:seed

## Run with Docker Compose
1. Ensure `.env` is created:
   cp .env.example .env
2. Apply database migrations & seed ID ranges (one-off):
   docker compose run --rm app1 npm run db:push
   docker compose run --rm app1 npm run db:seed
3. Build and start all services:
   docker compose up -d --build
4. Access the system through Nginx:
   http://localhost

Docker Compose services:
- nginx (port 80 on host)
- frontend
- app1, app2, app3 (API instances)
- redis
- click-worker
- expiry-worker

## Run the API (single instance, local - from /backend)
1. Start the API:
   npm run start:api

## Run multiple API instances (local - from /backend)
1. Start three instances:
   npm run dev:apps

## Run workers (local - from /backend)
1. Click worker:
   npm run start:click-worker
2. Expiry scheduler and worker:
   npm run start:expiry-worker

## Health Check
- With Docker Compose: GET http://localhost/api/v1/status/health
- Local direct instance: GET http://localhost:3001/api/v1/status/health

## Notes
- Docker Compose expects a frontend app under ./frontend.
- Nginx uses ./nginx.conf; update upstreams if service names or ports change.
- Redis must be running before starting workers (handled by Compose).
- For local development without Docker, run PostgreSQL and Redis locally.
