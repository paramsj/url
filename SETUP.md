# Setup

## Requirements
- Docker and Docker Compose
- PostgreSQL database (external to Docker Compose)
- For local non-Docker runs only: Node.js 20+

## Environment Variables
Create a .env file in the project root. Docker Compose reads this file for the API and worker containers.

Required:
- DATABASE_URL
- ACCESS_TOKEN_SECRET
- REFRESH_TOKEN_SECRET

Recommended:
- PORT (default 3000, container port for API instances)
- SERVER_ID (default app1, overrides per service in Docker Compose)
- REDIS_URL (default redis://redis:6379 in Docker Compose)
- ACCESS_TOKEN_EXPIRY (default 15m)
- REFRESH_TOKEN_EXPIRY (default 7d)
- CORS_ORIGIN (default http://localhost:3000)

Example:
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
REDIS_URL="redis://redis:6379"
ACCESS_TOKEN_SECRET="replace-me"
REFRESH_TOKEN_SECRET="replace-me"
PORT=3000
SERVER_ID=app1

## Install
1. Install dependencies (for local development only):
   npm install

## Database
1. Ensure DATABASE_URL is set.
2. Generate migrations:
   npx drizzle-kit generate
3. Apply migrations:
   npx drizzle-kit push

## Run with Docker Compose
1. Build and start all services:
   docker compose up --build
2. Access the system through Nginx:
   http://localhost:8080

Docker Compose services:
- nginx (port 8080 on host)
- frontend
- app1, app2, app3 (API instances)
- redis
- click-worker
- expiry-worker

## Run the API (single instance, local)
1. Start the API:
   npm run start:api

## Run multiple API instances (local)
1. Start three instances:
   npm run dev:apps

## Run workers (local)
1. Click worker:
   npm run start:click-worker
2. Expiry scheduler and worker:
   npm run start:expiry-worker

## Health Check
- With Docker Compose: GET http://localhost:8080/api/v1/status/health
- Local direct instance: GET http://localhost:3001/api/v1/status/health

## Notes
- Docker Compose expects a frontend app under ./frontend.
- Nginx uses ./nginx.conf; update upstreams if service names or ports change.
- Redis must be running before starting workers (handled by Compose).
- For local development without Docker, run PostgreSQL and Redis locally.
