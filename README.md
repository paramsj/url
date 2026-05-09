<div align="center">
  <h1 align="center">🚀 Enterprise URL Shortener</h1>
  <p align="center">
    <strong>A highly scalable, containerized, and environment-agnostic URL shortener with real-time analytics.</strong>
  </p>
</div>

---

## 📖 Overview

This project is a production-ready, highly-available URL Shortener built with a modern, decoupled architecture. It features a horizontally scaled Node.js backend load-balanced by **Nginx**, asynchronous telemetry processing using **BullMQ** and **Redis**, and a sleek, dynamic **Next.js** frontend.

The entire infrastructure is containerized using **Docker**, making it completely environment-agnostic. Whether you are running it on your local machine or deploying it to an AWS EC2 instance, the application dynamically resolves its own routing without relying on brittle, hardcoded base URLs.

## ✨ Features

- **🔗 Core Shortening:** Generate clean, reliable short URLs with optional custom aliases.
- **⏱️ Link Expiration:** Set exact expiration dates and times for links. A dedicated background worker automatically cleans up expired links.
- **📊 Real-time Analytics:** Track link clicks, referrer sources, IP addresses, and user-agents. Telemetry is processed asynchronously via Redis queues so it never slows down the user redirection.
- **⚖️ High Availability:** The API is horizontally scaled across multiple instances (`app1`, `app2`, `app3`) load-balanced via Nginx using a `least_conn` algorithm.
- **🛡️ Secure Authentication:** JWT-based user authentication and secure API endpoints.
- **🎨 Premium UI:** A futuristic, responsive dashboard built with Next.js, TailwindCSS, and Framer Motion.
- **🐳 Environment Agnostic:** Nginx handles internal routing (`/api` to backend, `/` to frontend), eliminating the need for complex CORS setups or `.env` base URL configurations.

---

## 🏗️ System Architecture

```text
                 +-------------------+
                 |                   |
                 |   User Browser    |
                 |                   |
                 +--------+----------+
                          |
               (HTTP/80 or HTTP/8080)
                          |
                          v
                 +-------------------+
                 |                   |
                 | NGINX Load Balancer|
                 | (Reverse Proxy)   |
                 +--------+----------+
                          |
      +-------------------+-------------------+
      |                   |                   |
 (Requests to /)  (Requests to /api)  (Requests to /:shortCode)
      |                   |                   |
      v                   v                   v
+------------+    +---------------+   +---------------+
|            |    |               |   |               |
|  Frontend  |    |  API Server   |   |  API Server   |
| (Next.js)  |    |  (Node.js)    |   |  (Node.js)    |
|            |    |   Instance 1  |   |   Instance 2  |
+------------+    +-------+-------+   +-------+-------+
                          |                   |
                          +---------+---------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
  +-------------------+   +-------------------+   +-------------------+
  |                   |   |                   |   |                   |
  |    PostgreSQL     |   |   Redis (Cache    |   |  BullMQ Workers   |
  |  (Primary DB)     |   |   & Queue)        |   | (Click & Expiry)  |
  +-------------------+   +-------------------+   +-------------------+
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine or server:
- **Docker** & **Docker Compose**
- **Node.js** (v20+) - *Only required if running locally without Docker*
- A **PostgreSQL** database (e.g., Supabase, Neon, or local Postgres)

---

## ⚙️ Environment Variables

The project requires a `.env` file in the **root directory**. 

Because of the reverse-proxy architecture, the frontend requires **zero** environment variables for deployment! All routing is handled dynamically via Nginx headers.

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# Redis Configuration (Must match docker-compose service name)
REDIS_URL="redis://redis:6379"

# Security
JWT_SECRET="your-super-secret-jwt-key"

# Application (Optional - defaults are fine for Docker)
PORT=3000
```

---

## 🚀 Getting Started (Docker - Recommended)

The easiest and most robust way to run the application is via Docker. This will spin up the Nginx load balancer, the Next.js frontend, 3 API server instances, the Redis cache, and both background workers.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. **Configure your environment:**
   Create your `.env` file in the root directory as shown above.

3. **Build and start the infrastructure:**
   ```bash
   docker compose up -d --build
   ```

4. **Access the application:**
   - **Local Development:** Open your browser and navigate to `http://localhost:8080` (Nginx handles the port forwarding to avoid local port conflicts).
   - **Production (EC2):** If deploying to a server, edit `docker-compose.yml` to map Nginx to port 80 (`"80:80"` instead of `"8080:80"`), and access via your server's IP or Domain.

5. **Stopping the application:**
   ```bash
   docker compose down
   ```

---

## 🛠️ Local Development (Without Docker)

If you wish to develop without Docker, you will need to run the services individually.

**1. Start your local Redis server:**
Ensure Redis is running on `localhost:6379`. Update your `.env` file to `REDIS_URL="redis://localhost:6379"`.

**2. Start the Backend API:**
```bash
npm install
npm run dev:apps  # Starts 3 load-balanced nodemon instances
```

**3. Start the Background Workers:**
In a new terminal:
```bash
npm run start:expiry-worker
```
In another terminal:
```bash
npm run start:click-worker
```

**4. Start the Frontend:**
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

*Note: Without Nginx running, you will need to manually configure CORS and API Base URLs in the frontend during local non-docker development.*

---

## 📂 Project Structure

```text
.
├── controllers/          # API route logic
├── db/                   # Drizzle ORM schemas and connections
├── frontend/             # Next.js Application
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   └── lib/              # API Client and utilities
├── queues/               # BullMQ queue initializations
├── routes/               # Express API routes
├── schedulers/           # Cron-job initializations
├── workers/              # Background job processors (Clicks & Expirations)
├── .dockerignore         # Exclusions to keep images slim
├── docker-compose.yml    # Infrastructure orchestration
├── Dockerfile            # Backend image definition
└── nginx.conf            # Load balancer & reverse proxy rules
```

---

## 🔍 How the Workers Function

To maintain high performance on the API layer, heavy operations are offloaded to background workers:

1. **Click Worker:** When a user visits a short link, the API instantly redirects them. Simultaneously, it fires an event to the `click-queue`. The click worker picks this up and safely writes the telemetry (IP, User-Agent, Date) to the PostgreSQL database in the background.
2. **Expiry Worker:** A scheduler runs a cron job every 5 minutes. The expiry worker checks the database for any links that have passed their `expiresAt` date, invalidates their Redis cache, and sets them to `inactive`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📄 License

This project is licensed under the MIT License.
