<div align="center">

# URL Shortener

**A production-ready, horizontally scalable URL shortener with asynchronous analytics, distributed API instances, and a containerized deployment architecture.**

</div>

---

# Overview

This project is a production-grade URL Shortener designed around scalability, reliability, and clean system design principles.

The application consists of a **Next.js frontend**, **three Express API instances** behind an **Nginx reverse proxy/load balancer**, **PostgreSQL** for persistent storage, **Redis** for caching and distributed queues, and **BullMQ workers** for asynchronous background processing.

The infrastructure is fully containerized with Docker, allowing identical deployments across local development, staging, and production environments.

Instead of relying on frontend environment variables for routing, **Nginx acts as the single entry point**, forwarding frontend, API, and redirect requests internally. This makes the deployment environment-agnostic while significantly simplifying configuration.

---

# Features

- Production-ready URL shortening
- Custom aliases for shortened URLs
- Link expiration with automatic cleanup
- JWT-based authentication
- Click analytics (IP, User-Agent, Referrer, Timestamp)
- Redis-backed caching
- BullMQ background workers
- Horizontally scalable API layer
- Nginx reverse proxy and load balancing
- Dockerized deployment
- Responsive Next.js dashboard
- Environment-agnostic architecture

---

# Architecture

```text
                              Client Browser
                                    │
                                    │ HTTP (Port 80)
                                    ▼
                        +-------------------------+
                        |         NGINX           |
                        | Reverse Proxy & Gateway |
                        +------------+------------+
                                     │
             ┌───────────────────────┴───────────────────────┐
             │                                               │
             ▼                                               ▼
    +-----------------+                             +-----------------+
    |    Frontend     |                             |  Backend (API)  |
    | Next.js App (:) |                             |   least_conn    |
    +-----------------+                             +--------+--------+
                                                             │
                             ┌───────────────────────────────┼───────────────────────────────┐
                             │                               │                               │
                             ▼                               ▼                               ▼
                      API Server 1                    API Server 2                    API Server 3
                     Express (app1)                  Express (app2)                  Express (app3)
                             │                               │                               │
                             └───────────────┬───────────────┴───────────────┬───────────────┘
                                             │                               │
                                             ▼                               ▼
                                        PostgreSQL                         Redis
                                     (Supabase / DB)                  Cache + BullMQ
                                             │                               │
                                             │                               │
                                             ▼                               ▼
                                       Click Worker                    Expiry Worker
```

---

# Request Flow

## URL Creation

1. Client sends a request to create a shortened URL (`POST /api/v1/links`).
2. Nginx forwards the request to one of the backend API instances.
3. The selected API instance fetches its next allocated numeric ID from the `id_ranges` table (e.g., `app1` allocates from `1,000,000`–`10,000,000`).
4. The numeric ID is encoded into a Base62 short code.
5. URL metadata is stored in PostgreSQL.
6. The active link is cached in Redis with a 1-hour TTL.
7. The generated short URL (e.g., `http://localhost/4c94`) is returned to the client.

Because each backend server instance owns a non-overlapping segment in `id_ranges`, ID generation is contention-free and horizontally scalable without centralized locks.

---

## URL Redirection

1. User opens a shortened URL.
2. Nginx forwards the request to an API instance.
3. API checks Redis for the destination URL.
4. On a cache miss, PostgreSQL is queried and Redis is updated.
5. Redirect response is immediately returned.
6. Analytics information is pushed into a BullMQ queue.
7. Click worker processes analytics asynchronously.

This ensures the redirect latency is not affected by database writes.

---

## Link Expiration

1. Scheduler periodically scans for expired links.
2. Expired links are marked inactive.
3. Associated Redis cache entries are invalidated.
4. Future redirect requests receive an appropriate response.

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js, React, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Cache | Redis |
| Queue | BullMQ |
| Reverse Proxy | Nginx |
| Authentication | JWT |
| Deployment | Docker, Docker Compose |

---

# Project Structure

```text
.
├── backend/
│   ├── controllers/      # Route request handlers
│   ├── db/               # PostgreSQL connection, Drizzle schema & seed script
│   ├── drizzle/          # SQL database migration files
│   ├── middlewares/      # Authentication & authorization guards
│   ├── queues/           # BullMQ queue definitions
│   ├── routes/           # Express router endpoints
│   ├── schedulers/       # Cron/interval job schedulers
│   ├── utils/            # Base62 encoder, token generators, error helpers
│   ├── workers/          # BullMQ background workers (click, expiry)
│   ├── app.js            # Express application setup
│   ├── index.js          # Server bootstrap
│   ├── Dockerfile        # Backend container image build
│   └── package.json
├── frontend/
│   ├── app/              # Next.js App Router (dashboard, login, register)
│   ├── components/       # UI components & topology visualization
│   ├── lib/              # API client & utilities
│   ├── public/           # Static images & icons
│   ├── Dockerfile        # Frontend container image build
│   └── package.json
├── nginx.conf            # Reverse proxy & load balancing rules
├── docker-compose.yml    # Multi-container orchestration stack
├── .env.example          # Root environment template
├── README.md
├── README-ARCHITECTURE.md
└── SETUP.md
```

---

# Environment Variables

Create a `.env` file in the project root (see [`.env.example`](file://.env.example) for defaults):

```env
# Required
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
ACCESS_TOKEN_SECRET=your-strong-access-token-secret
REFRESH_TOKEN_SECRET=your-strong-refresh-token-secret

# Optional / Defaulted
NODE_ENV=development
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000,http://localhost
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
PORT=3000
SERVER_ID=app1
```

No frontend API URL configuration is required when deployed through Nginx.

---

# Running with Docker

Clone the repository

```bash
git clone https://github.com/yourusername/url-shortener.git

cd url-shortener
```

Create the environment file

```bash
cp .env.example .env
# Fill in your DATABASE_URL and JWT secrets in .env
```

Apply database migrations and seed ID ranges

```bash
docker compose run --rm app1 npm run db:push
docker compose run --rm app1 npm run db:seed
```

Build and start all services

```bash
docker compose up --build -d
```

Application

```
http://localhost
```

Stop

```bash
docker compose down
```

---

# Local Development

Start Redis

```bash
redis-server
```

Run backend

```bash
cd backend

npm install

npm run db:push

npm run db:seed

npm run dev:apps
```

Run click worker

```bash
cd backend

npm run start:click-worker
```

Run expiry worker

```bash
cd backend

npm run start:expiry-worker
```

Run frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Background Workers

## Click Worker

The redirect endpoint never writes analytics directly.

Instead, it publishes a job into BullMQ.

The Click Worker consumes these jobs independently and stores:

- IP Address
- User Agent
- Referrer
- Timestamp

This keeps redirect latency consistently low.

---

## Expiry Worker

Runs periodically to:

- Find expired links
- Mark them inactive
- Remove cached Redis entries
- Prevent future redirects

---

# Scalability Considerations

The application has been designed with horizontal scaling in mind.

### Stateless API Servers

Each backend instance is completely stateless.

Any instance can serve any request since all persistent state resides in PostgreSQL and Redis.

---

### Horizontal API Scaling

Adding another backend server only requires registering it with Nginx.

No application logic changes are required.

---

### Shared URL Generation

All API instances generate URLs against the same PostgreSQL state.

This guarantees uniqueness regardless of which backend handles the request.

---

### Redis Caching

Frequently requested URLs are served directly from Redis, significantly reducing database load.

---

### Asynchronous Processing

Analytics are processed independently from redirect requests using BullMQ workers.

Redirect performance remains nearly constant even during traffic spikes.

---

# Possible Future Improvements

Several production-grade improvements could further increase scalability and reliability.

## Distributed ID Generation

Instead of consulting PostgreSQL for each new short code, a distributed ID generator such as:

- Snowflake IDs
- Segment allocation
- Hi-Lo algorithm

could eliminate contention during URL creation.

---

## Read Replicas

Introduce PostgreSQL read replicas to separate read traffic from writes.

This would significantly improve throughput for analytics-heavy workloads.

---

## Redis Cluster

Replace a single Redis instance with Redis Cluster or Sentinel to improve fault tolerance and availability.

---

## Rate Limiting

Implement Redis-backed distributed rate limiting to prevent abuse and denial-of-service attacks.

---

## Monitoring

Integrate:

- Prometheus
- Grafana
- Loki

to collect metrics, logs, and application health.

---

## Distributed Tracing

Use OpenTelemetry to trace requests across:

- Nginx
- Express
- Redis
- PostgreSQL
- BullMQ Workers

This greatly simplifies production debugging.

---

## CDN Integration

Serve static frontend assets through a CDN to reduce latency globally.

---

## Multi-Region Deployment

Deploy API instances across multiple regions while keeping URL generation consistent using distributed ID allocation.

---

## Message Broker

For very high throughput systems, BullMQ can later be replaced by Kafka or RabbitMQ for improved durability and throughput.

---

## Cache Warming

Popular URLs can be proactively cached to reduce cold-start latency.

---

## URL Abuse Detection

Automatically detect:

- phishing
- malware
- spam domains

before allowing URL creation.

---

## Advanced Analytics

Add dashboards showing:

- Geographic traffic distribution
- Browser statistics
- Device breakdown
- Operating systems
- Time-series click trends
- Top-performing links

---

## CI/CD

Automate deployments using GitHub Actions with:

- automated testing
- Docker image builds
- vulnerability scanning
- zero-downtime deployments

---

# License

This project is licensed under the MIT License.
