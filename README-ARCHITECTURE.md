# Architecture

## Overview
The system is a URL shortener service with a Node.js API, PostgreSQL for persistence, Redis for caching and queues, and Nginx for load balancing. The API is designed to run as multiple instances that share the same database and Redis. A Docker Compose stack runs the API instances, workers, Redis, Nginx, and the frontend.

## Components
- API servers (Node.js, Express)
  - Handles authentication, link creation, redirects, and analytics
  - Horizontal scaling through multiple instances (app1, app2, app3)
- PostgreSQL
  - Stores users, refresh tokens, short links, click events, and ID ranges
- Redis
  - Caches short link lookups
  - Hosts BullMQ queues for click logging and link expiration
- Workers
  - Click worker: increments counters and stores click events asynchronously
  - Expiry worker: deactivates expired links and clears cache
  - Expiry scheduler: enqueues expiration jobs on a fixed interval
- Nginx
  - Load balances API traffic to API instances
  - Proxies frontend and API routes in a unified entrypoint
  - Runs as a container and exposes port 8080 on the host
- Docker Compose
  - Orchestrates all containers (nginx, frontend, app1, app2, app3, redis, click-worker, expiry-worker)

## Runtime Flow
1. API server boots and verifies the database connection.
2. Authentication endpoints issue JWT access and refresh tokens.
3. Link creation allocates a numeric ID from the id_ranges table, encodes to Base62, stores the link, and caches it in Redis.
4. Redirects first check Redis cache and fall back to the database. Clicks are sent to the click queue for asynchronous processing.
5. The expiry scheduler enqueues an expiration job periodically. The expiry worker deactivates expired links and clears cache entries.

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
- Nginx listens on host port 8080 and proxies API and frontend routes.
- API instances (app1, app2, app3) listen on container port 3000.
- Redis runs as a container for cache and queues.
- Workers run as separate containers and connect to Redis and PostgreSQL.
