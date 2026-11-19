# Architecture

## Overview
The system is a production-grade URL shortener service with a modular architecture split into a Next.js **frontend** and a distributed Express **backend**. PostgreSQL provides persistent storage, Redis handles caching and queues, and Nginx acts as the single reverse proxy and load balancer.

The application is fully containerized with Docker Compose orchestrating the API instances, background workers, Redis, Nginx, and the Next.js frontend.

## Project Layout
- `/backend`: Express API, Drizzle ORM migrations/schemas, BullMQ queues/workers, and ID range seeder.
- `/frontend`: Next.js App Router dashboard and client UI.
- `/nginx.conf` & `docker-compose.yml`: Top-level orchestration and reverse proxy configuration.

## Components
- API servers (Node.js, Express)
  - Located in `/backend`
  - Handles authentication, link creation, redirects, and analytics
  - Horizontal scaling through multiple stateless instances (`app1`, `app2`, `app3`)
- PostgreSQL
  - Stores users, refresh tokens, short links, click events, and ID ranges
- Redis
  - Caches short link lookups with TTL
  - Hosts BullMQ queues for asynchronous click logging and link expiration
- Workers
  - Click worker: increments counters and stores click events asynchronously
  - Expiry worker: deactivates expired links and clears Redis cache
  - Expiry scheduler: enqueues expiration jobs on a fixed 5-minute interval
- Nginx
  - Load balances API traffic to backend instances using `least_conn`
  - Routes frontend pages, static chunks, and short link redirects
  - Runs as a container and exposes port 80 on the host
- Docker Compose
  - Orchestrates all containers (`nginx`, `frontend`, `app1`, `app2`, `app3`, `redis`, `click-worker`, `expiry-worker`)

## Runtime Flow
1. **Bootstrap:** API instances boot and verify the database connection.
2. **Authentication:** Endpoints issue JWT access (15m) and refresh (7d) tokens with HTTP-only cookies.
3. **Link Creation:** Each API instance fetches its next ID from its dedicated range in `id_ranges`, encodes it into Base62, stores metadata in PostgreSQL, and caches the link in Redis (1h TTL).
4. **Redirection:** When `/:shortCode` is requested, the server checks Redis first (sub-millisecond redirect). On cache miss, it reads PostgreSQL and repopulates the cache.
5. **Asynchronous Analytics:** The redirect handler publishes a job to BullMQ and responds immediately. The Click Worker records IP, User-Agent, and Referrer in the background.
6. **Automatic Cleanup:** The expiry scheduler enqueues a job every 5 minutes. The Expiry Worker deactivates expired links and clears their cache keys.

## Key Endpoints
- /api/v1/auth
  - POST /register
  - POST /login
  - GET /me
  - POST /refresh
  - POST /logout
- /api/v1/links
  - POST /
  - GET /
  - GET /:id/stats
- /api/v1/status/health
  - GET /health
- /:shortCode
  - Redirect to the original URL

## Environment Dependencies
- Docker and Docker Compose
- PostgreSQL (external to the compose stack)
- For local non-Docker runs only: Node.js 20+

## Scaling Notes
- All API instances share the same database and Redis.
- The id_ranges table assigns ranges per server instance.
- Redis caching reduces database reads for hot links.
- Click and expiry processing is offloaded to workers.

## Docker Compose Topology
- Nginx listens on host port 80 and proxies API and frontend routes.
- API instances (app1, app2, app3) listen on container port 3000.
- Redis runs as a container for cache and queues.
- Workers run as separate containers and connect to Redis and PostgreSQL.
