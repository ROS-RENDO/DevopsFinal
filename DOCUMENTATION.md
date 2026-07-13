# DevSecOps Final — Operations & Deployment Guide

> Complete reference for scripts, Docker Compose orchestration, blue-green deployment, replica management, and scaling.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Architecture Overview](#architecture-overview)
- [Docker Compose Orchestration](#docker-compose-orchestration)
  - [Services Breakdown](#services-breakdown)
  - [Replica Configuration](#replica-configuration)
  - [Resource Limits](#resource-limits)
  - [Blue-Green Deployment Strategy](#blue-green-deployment-strategy)
  - [Profiles](#profiles)
- [Scaling Up & Down](#scaling-up--down)
  - [Manual Scaling](#manual-scaling)
  - [Scaling Guidelines](#scaling-guidelines)
- [Scripts Reference](#scripts-reference)
  - [deploy.sh — Blue-Green Deployment](#deploysh--blue-green-deployment)
  - [start-demo.sh — Production Demo Deploy](#start-demosh--production-demo-deploy)
  - [db-backup.sh — Database Backup](#db-backupsh--database-backup)
  - [db-restore.sh — Database Restore](#db-restoresh--database-restore)
  - [run-all-security-tests.sh — Security Test Suite](#run-all-security-testssh--security-test-suite)
  - [test-rate-limit.sh — Rate Limit Verification](#test-rate-limitsh--rate-limit-verification)
  - [test-brute-force-protection.sh — Brute Force Protection](#test-brute-force-protectionsh--brute-force-protection)
  - [test-secure-cookie.sh — Secure Cookie Verification](#test-secure-cookiesh--secure-cookie-verification)
  - [test-injection-prevention.sh — Injection Prevention](#test-injection-preventionsh--injection-prevention)
  - [test-xss-prevention.sh — XSS Prevention](#test-xss-preventionsh--xss-prevention)
- [Logging & Monitoring Pipeline](#logging--monitoring-pipeline)
  - [Architecture: Winston → Loki → Grafana](#architecture-winston--loki--grafana)
  - [Winston Logger (Backend)](#winston-logger-backend)
  - [Custom Log Levels](#custom-log-levels)
  - [Secret Sanitization](#secret-sanitization)
  - [Security Event Logging](#security-event-logging)
  - [Loki (Log Aggregation)](#loki-log-aggregation)
  - [Grafana (Visualization)](#grafana-visualization)
  - [Querying Logs in Grafana (LogQL)](#querying-logs-in-grafana-logql)
- [Quick Reference Commands](#quick-reference-commands)

---

## Prerequisites

| Tool            | Version  | Purpose                        |
|-----------------|----------|--------------------------------|
| Docker          | 20.10+   | Container runtime              |
| Docker Compose  | v2+      | Multi-container orchestration  |
| curl            | any      | Running security test scripts  |
| Bash            | 4.0+     | Running shell scripts          |
| Git             | any      | Version control                |

---

## Environment Setup

1. Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

2. Key environment variables:

| Variable                   | Description                          | Example                          |
|----------------------------|--------------------------------------|----------------------------------|
| `MYSQL_ROOT_PASSWORD`      | MySQL root password                  | `rootpassword`                   |
| `MYSQL_DATABASE`           | Database name                        | `servd`                          |
| `MYSQL_USER`               | Database user                        | `servd`                          |
| `MYSQL_PASSWORD`           | Database user password               | `servdpass`                      |
| `MYSQL_PORT`               | Host port for MySQL                  | `3306`                           |
| `BACKEND_PORT`             | Host port for backend                | `3000`                           |
| `FRONTEND_PORT`            | Host port for frontend               | `5173`                           |
| `FRONTEND_URL`             | Public frontend URL                  | `http://localhost:5173`          |
| `GHCR_REPO`               | GitHub Container Registry repo path  | `ros-rendo/devopsfinal`          |
| `JWT_SECRET`               | JWT signing secret                   | (long random string)             |
| `JWT_REFRESH_SECRET`       | JWT refresh token secret             | (long random string)             |
| `AUTH_TOKEN_ENCRYPTION_KEY`| Encryption key for auth tokens       | (32-byte key)                    |
| `SMTP_HOST`                | SMTP mail server host                | `smtp.gmail.com`                 |
| `SMTP_PORT`                | SMTP mail server port                | `587`                            |
| `SMTP_USER`                | SMTP email address                   | `your-email@gmail.com`           |
| `SMTP_PASS`                | SMTP app password                    | (app-specific password)          |

---

## Architecture Overview

```
                        ┌──────────────┐
                        │   Client     │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │    Nginx     │  :80 (→ HTTPS redirect)
                        │  (Reverse   │  :443 (SSL termination)
                        │   Proxy)    │
                        └──────┬───────┘
                               │
               ┌───────────────┼───────────────┐
               │ /api/*        │               │ /*
               ▼               │               ▼
     ┌─────────────────┐       │     ┌─────────────────┐
     │  backend-blue   │       │     │    frontend      │
     │  (2 replicas)   │       │     │   React SPA      │
     │  Port 3000      │       │     │   Port 80        │
     └───────┬─────────┘       │     └─────────────────┘
             │                 │
             │          ┌──────▼──────────┐
             │          │  backend-green  │
             │          │  (3 replicas)   │  ← standby (via profile)
             │          │  Port 3000      │
             │          └───────┬─────────┘
             │                  │
             └────────┬─────────┘
                      ▼
              ┌───────────────┐
              │   MySQL 8.0   │
              │   (db)        │
              │   Port 3306   │
              └───────────────┘

     ┌────────────────────────────────────┐
     │         Monitoring Stack           │
     │  Loki (:3100)  +  Grafana (:3001) │
     └────────────────────────────────────┘
```

**Traffic flow**: Client → Nginx (SSL) → routes `/api/*` to the **active** backend color → MySQL. All other requests → Frontend SPA. Nginx uses a variable (`$active_backend`) that the deploy scripts swap between `backend-blue` and `backend-green`.

---

## Docker Compose Orchestration

Two compose files exist:

| File                       | Purpose                                               |
|----------------------------|-------------------------------------------------------|
| `docker-compose.yml`       | **Development** — builds from local source code       |
| `docker-compose.prod.yml`  | **Production** — pulls pre-built images from GHCR     |

### Services Breakdown

| Service          | Image / Build          | Ports (Host:Container) | Replicas | Role                                |
|------------------|------------------------|------------------------|----------|-------------------------------------|
| `db`             | `mysql:8.0`            | `${MYSQL_PORT}:3306`   | 1        | Primary database                    |
| `backend-blue`   | `./backend` (build)    | `3000-3005:3000`       | **2**    | Active backend (default)            |
| `backend-green`  | `./backend` (build)    | exposed internally     | **3**    | Standby backend (profile: `green`)  |
| `frontend`       | `./frontend` (build)   | `${FRONTEND_PORT}:80`  | 1        | React SPA                           |
| `nginx`          | `./nginx` (build)      | `80:80`, `443:443`     | 1        | Reverse proxy + SSL termination     |
| `loki`           | `grafana/loki:3.0.0`   | `3100:3100`            | 1        | Log aggregation                     |
| `grafana`        | `grafana/grafana:latest`| `3001:3000`           | 1        | Dashboards & visualization          |

### Replica Configuration

Replicas are defined under the `deploy` key in each service:

```yaml
# backend-blue — the ACTIVE environment (default)
deploy:
  replicas: 2          # 2 instances for load balancing
  resources:
    limits:
      cpus: "1.0"
      memory: 512M
    reservations:
      cpus: "0.25"
      memory: 128M

# backend-green — the STANDBY environment
deploy:
  replicas: 3          # 3 instances (can handle higher load on swap)
  resources:
    limits:
      cpus: "1.0"
      memory: 512M
    reservations:
      cpus: "0.25"
      memory: 128M
```

**How replicas work**: Docker Compose creates N containers for the same service. Nginx resolves the service DNS name (`backend-blue`) to all running containers and round-robins traffic across them automatically via Docker's internal DNS.

### Resource Limits

| Service        | CPU Limit | Memory Limit | CPU Reserved | Memory Reserved |
|----------------|-----------|--------------|--------------|-----------------|
| `db`           | 1.0 core  | 1 GB         | 0.5 core     | 256 MB          |
| `backend-blue` | 1.0 core  | 512 MB       | 0.25 core    | 128 MB          |
| `backend-green`| 1.0 core  | 512 MB       | 0.25 core    | 128 MB          |

- **`limits`**: Hard ceiling — the container is killed (OOM) or throttled if it exceeds these.
- **`reservations`**: Guaranteed minimum — Docker scheduler ensures these resources are available before starting the container.

### Blue-Green Deployment Strategy

The project uses **blue-green deployment** for zero-downtime releases:

```
 BEFORE deploy.sh                          AFTER deploy.sh
 ─────────────────                         ────────────────
 Nginx → backend-blue (ACTIVE, 2x)        Nginx → backend-green (ACTIVE, 3x)
          backend-green (STOPPED)                   backend-blue (STOPPED)
```

**How it works**:

1. **Nginx variable** (`$active_backend`) in `nginx/nginx.conf` determines which backend receives traffic.
2. **`deploy.sh`** reads the current value, spins up the *inactive* environment, swaps the variable in the config file, reloads Nginx, then stops the old environment.
3. Since the new backend is already running and healthy before the swap, users experience **zero downtime**.

### Profiles

```yaml
backend-green:
  profiles: ["green"]    # Only starts when --profile green is used
```

By default, `docker compose up` **only starts blue**. Green is activated explicitly:

```bash
# Start green alongside blue
docker compose --profile green up -d

# Or just start green with scaling
docker compose --profile green up --scale backend-green=3 -d backend-green
```

---

## Scaling Up & Down

### Manual Scaling

Use `docker compose up --scale` to change the number of replicas at runtime:

```bash
# ───────────────────────────────────────
# SCALE UP: increase backend-blue to 5 replicas
# ───────────────────────────────────────
docker compose up --scale backend-blue=5 -d

# ───────────────────────────────────────
# SCALE DOWN: reduce backend-blue to 1 replica
# ───────────────────────────────────────
docker compose up --scale backend-blue=1 -d

# ───────────────────────────────────────
# SCALE the green environment (requires profile)
# ───────────────────────────────────────
docker compose --profile green up --scale backend-green=5 -d backend-green

# ───────────────────────────────────────
# CHECK current replicas
# ───────────────────────────────────────
docker compose ps

# ───────────────────────────────────────
# SCALE multiple services at once
# ───────────────────────────────────────
docker compose up --scale backend-blue=4 --scale frontend=2 -d
```

### Scaling Guidelines

| Scenario               | Recommended Replicas | Notes                                            |
|------------------------|----------------------|--------------------------------------------------|
| Development / Testing  | 1                    | Minimal resource usage                           |
| Staging                | 2                    | Test load balancing behavior                     |
| Production (normal)    | 2–3                  | Balance between availability and resources       |
| Production (peak)      | 5+                   | Scale up during traffic spikes                   |
| Database (`db`)        | **Always 1**         | MySQL is stateful — do NOT scale beyond 1        |

> ⚠️ **Important**: Never scale the `db` service. MySQL requires a single writer; scaling it creates data conflicts. Scale only stateless services (`backend-blue`, `backend-green`, `frontend`).

### Production Scaling (docker-compose.prod.yml)

```bash
# Scale using the production compose file
docker compose -f docker-compose.prod.yml up --scale backend-blue=4 -d

# Scale green environment in production
docker compose -f docker-compose.prod.yml --profile green up --scale backend-green=5 -d backend-green
```

---

## Scripts Reference

All scripts are located in the `scripts/` directory. Make them executable before use:

```bash
chmod +x scripts/*.sh
```

---

### `deploy.sh` — Blue-Green Deployment

**Purpose**: Perform a zero-downtime blue-green deployment swap on the local dev compose stack.

**Usage**:
```bash
./scripts/deploy.sh
```

**Logic Flow**:

```
START
  │
  ├── 1. Read nginx.conf to determine which backend is ACTIVE
  │      └── Grep for: set $active_backend "backend-blue";
  │          ├── Found → ACTIVE = blue,  INACTIVE = green
  │          └── Not found → ACTIVE = green, INACTIVE = blue
  │
  ├── 2. Start the INACTIVE environment with 3 replicas
  │      └── docker compose --profile $INACTIVE up --scale backend-${INACTIVE}=3 -d
  │
  ├── 3. Wait 15 seconds for containers to become healthy
  │
  ├── 4. Swap the $active_backend variable in nginx.conf
  │      └── sed -i replace "backend-blue" ↔ "backend-green"
  │
  ├── 5. Reload Nginx configuration (no restart needed)
  │      └── docker compose exec nginx nginx -s reload
  │
  ├── 6. Stop the OLD (previously active) environment
  │      └── docker compose stop backend-${ACTIVE}
  │
  └── DONE — Traffic now flows to the new environment
```

**What it does NOT do**: It does not rebuild images. If you need to deploy new code, rebuild first:
```bash
docker compose build backend-blue backend-green
./scripts/deploy.sh
```

---

### `start-demo.sh` — Production Demo Deploy

**Purpose**: Pull pre-built images from GHCR and perform a blue-green deployment using `docker-compose.prod.yml`. Intended for demo or staging environments.

**Usage**:
```bash
# Uses default GHCR repo: ros-rendo/devopsfinal
./scripts/start-demo.sh

# Override GHCR repo
GHCR_REPO=your-org/your-repo ./scripts/start-demo.sh
```

**Logic Flow**:

```
START
  │
  ├── 1. cd to project root (relative to script location)
  │
  ├── 2. Set GHCR_REPO (default: ros-rendo/devopsfinal)
  │
  ├── 3. Pull latest images from GHCR
  │      └── docker compose -f docker-compose.prod.yml pull
  │
  ├── 4. Detect ACTIVE/INACTIVE environment (same as deploy.sh)
  │
  ├── 5. Start INACTIVE backend with 3 replicas
  │
  ├── 6. Wait 15 seconds for health
  │
  ├── 7. Swap $active_backend in nginx.conf
  │
  ├── 8. Start nginx, loki, grafana (if not running)
  │
  ├── 9. Copy updated nginx.conf into the running container
  │      └── docker compose cp nginx/nginx.conf nginx:/etc/nginx/conf.d/default.conf
  │
  ├── 10. Reload Nginx inside the container
  │
  ├── 11. Stop the OLD backend
  │
  └── DONE
```

**Key difference from `deploy.sh`**: This script uses `docker-compose.prod.yml` (pre-built GHCR images) and additionally copies the nginx config into the container (since the prod nginx image bakes in its config at build time).

---

### `db-backup.sh` — Database Backup

**Purpose**: Create a timestamped SQL dump of all databases from the running MySQL container.

**Usage**:
```bash
./scripts/db-backup.sh
```

**Logic Flow**:

```
START
  │
  ├── 1. Create backups/ directory if it doesn't exist
  │
  ├── 2. Generate timestamp filename: backups/devsec_db_2026-07-12_231100.sql
  │
  ├── 3. Execute mysqldump inside the db container
  │      └── docker compose exec db mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --all-databases
  │
  ├── 4. Redirect output to the local backup file
  │
  └── DONE — Backup saved to backups/devsec_db_<timestamp>.sql
```

**Output**: A `.sql` file in the `backups/` directory.

---

### `db-backup-cron` — Automated Backup (Cron Container)

**Purpose**: A dedicated sidecar container that automatically backs up the database on a schedule using `crond`. Runs alongside the `db` service with no manual intervention required.

**Architecture**:
- Built from `scripts/Dockerfile.backup` (Alpine + mysql-client)
- Connects to MySQL via Docker network (host: `db`, port: `3306`)
- Cron schedule defined in `scripts/backup-crontab`
- Backup script: `scripts/db-backup-cron.sh`

**Default Schedule**: Daily at 2:00 AM (`0 2 * * *`)

**Features**:
- **Gzip compression** — Backups are saved as `.sql.gz` files
- **Retention cleanup** — Automatically deletes backups older than 7 days (configurable)
- **Timestamped logging** — All output logged to `/var/log/backup.log`
- **Failure detection** — Exits with error if backup file is empty

**Environment Variables** (set in docker-compose):
| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_HOST` | `db` | MySQL hostname |
| `MYSQL_USER` | `root` | MySQL user for backup |
| `MYSQL_ROOT_PASSWORD` | from `.env` | MySQL password |
| `MYSQL_DATABASE` | from `.env` | Database to back up |
| `BACKUP_RETENTION_DAYS` | `7` | Days to keep old backups |

**Logic Flow**:

```
CONTAINER START
  │
  ├── crond starts in foreground
  │
  └── At scheduled time (default: 2 AM daily):
        │
        ├── 1. Create /backups/ directory if needed
        │
        ├── 2. Run mysqldump → pipe through gzip
        │      └── Output: /backups/devsec_db_<timestamp>.sql.gz
        │
        ├── 3. Verify backup file is non-empty
        │      └── If empty → log error and exit
        │
        ├── 4. Delete backups older than BACKUP_RETENTION_DAYS
        │
        └── DONE — Log summary of current backups
```

**Common Operations**:
```bash
# View backup logs
docker compose exec db-backup-cron cat /var/log/backup.log

# Manually trigger a backup now
docker compose exec db-backup-cron /scripts/db-backup-cron.sh

# Check cron schedule
docker compose exec db-backup-cron crontab -l

# List current backups
ls -lh backups/
```

**Changing the Schedule**:
Edit `scripts/backup-crontab` and rebuild the container:
```bash
# Example: Change to every 6 hours
# Edit scripts/backup-crontab: 0 */6 * * * /scripts/db-backup-cron.sh >> /var/log/backup.log 2>&1
docker compose up -d --build db-backup-cron
```

---

### `db-restore.sh` — Database Restore

**Purpose**: Interactively restore a database from a previously created backup file.

**Usage**:
```bash
./scripts/db-restore.sh
```

**Logic Flow**:

```
START
  │
  ├── 1. List all .sql files in backups/ directory (numbered)
  │      └── If no files found → exit with error
  │
  ├── 2. Prompt user to select a backup
  │      ├── By number (e.g., "1")
  │      └── Or by filename (e.g., "devsec_db_2026-07-12_231100.sql")
  │
  ├── 3. Validate the selected file exists
  │
  ├── 4. Pipe the SQL file into the MySQL client inside the db container
  │      └── cat backup.sql | docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD"
  │
  └── DONE — Database restored
```

**Flags**:
- `-T` flag on `docker compose exec` disables pseudo-TTY allocation, which is required for piping input from a file.

---

### `run-all-security-tests.sh` — Security Test Suite

**Purpose**: Run all 5 security verification tests in sequence and report results.

**Usage**:
```bash
# Default: tests against http://localhost:3000
./scripts/run-all-security-tests.sh

# Custom backend URL
BASE_URL=http://localhost:3000 ./scripts/run-all-security-tests.sh
```

**Logic Flow**:

```
START
  │
  ├── 1. Check backend connectivity (GET /)
  │      └── If not reachable → exit with error
  │
  ├── 2. [1/5] Rate Limit Test        → test-rate-limit.sh
  ├── 3. [2/5] Secure Cookie Test     → test-secure-cookie.sh
  ├── 4. [3/5] Injection Prevention   → test-injection-prevention.sh
  ├── 5. [4/5] Brute Force Protection → test-brute-force-protection.sh
  ├── 6. [5/5] XSS Prevention         → test-xss-prevention.sh
  │
  └── DONE — Summary printed
```

**Prerequisites**: Backend must be running and `curl` must be installed.

---

### `test-rate-limit.sh` — Rate Limit Verification

**Purpose**: Verify that `express-rate-limit` blocks login requests after exceeding 5 attempts in a 15-minute window.

**Usage**:
```bash
BASE_URL=http://localhost:3000 ./scripts/test-rate-limit.sh
```

**Logic**:

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1–5  | Send `POST /api/auth/login` with dummy credentials | HTTP `401` (invalid creds — allowed through) |
| 6–7  | Send more requests beyond the limit | HTTP `429` (Too Many Requests — blocked) |

**Pass criteria**: Requests 1–5 return any status except `429`. Requests 6+ return `429`.

---

### `test-brute-force-protection.sh` — Brute Force Protection

**Purpose**: Verify that repeated login attempts against the same account with different passwords are blocked after 5 attempts.

**Usage**:
```bash
BASE_URL=http://localhost:3000 ./scripts/test-brute-force-protection.sh
```

**Logic**:

- Sends 10 login attempts to `POST /api/auth/login` using the same email but cycling through 10 common weak passwords (`password`, `123456`, `admin`, etc.).
- Expects HTTP `429` (rate-limited) after the 5th attempt.
- Records at which attempt the rate limiter first activated.

**Key difference from rate-limit test**: This script targets a single account with *different* passwords each time, simulating a real brute-force attack.

---

### `test-secure-cookie.sh` — Secure Cookie Verification

**Purpose**: Verify that the `refreshToken` cookie set during login has all required security attributes.

**Usage**:
```bash
BASE_URL=http://localhost:3000 ./scripts/test-secure-cookie.sh
```

**Logic**:

1. Registers a test user (`testuser@example.com`) to ensure it exists.
2. Sends a `POST /api/auth/login` and captures the `Set-Cookie` response header.
3. Checks for the presence of each security attribute:

| Attribute          | Why it matters                                        |
|--------------------|-------------------------------------------------------|
| `HttpOnly`         | Prevents JavaScript from accessing the cookie (XSS)  |
| `Secure`           | Cookie only sent over HTTPS                           |
| `SameSite=Strict`  | Prevents CSRF attacks                                 |
| `Path=/`           | Cookie available for all routes                       |
| `refreshtoken=`    | Correct cookie name                                   |
| `Max-Age`/`Expires`| Cookie has an expiration (not session-only)           |

---

### `test-injection-prevention.sh` — Injection Prevention

**Purpose**: Verify that Zod validation and Prisma ORM reject common injection payloads.

**Usage**:
```bash
BASE_URL=http://localhost:3000 ./scripts/test-injection-prevention.sh
```

**Tests performed (13 total)**:

| Category             | Payloads Tested                                                          |
|----------------------|--------------------------------------------------------------------------|
| SQL Injection        | `' OR 1=1 --`, `' UNION SELECT * FROM users --`, `' OR '1'='1`          |
| NoSQL Injection      | `{"$gt":""}`, `{"$ne":""}`                                               |
| Command Injection    | `; ls -la /etc/passwd`, backtick execution                               |
| Input Validation     | No `@` in email, empty email, empty password, missing fields             |
| Role Manipulation    | Adding `"role":"superadmin"` or `"role":"root"` to registration payload  |

**Pass criteria**: Every payload returns HTTP `400` (validation error). A `200`/`201` means the payload was accepted (fail). A `500` means an unhandled server error (fail).

---

### `test-xss-prevention.sh` — XSS Prevention

**Purpose**: Verify that XSS payloads are rejected by input validation and that security headers prevent script execution.

**Usage**:
```bash
BASE_URL=http://localhost:3000 ./scripts/test-xss-prevention.sh
```

**Three-part test**:

**Part 1 — Payload Rejection** (6 payloads):

| Payload                            | Target Field |
|------------------------------------|--------------|
| `<script>alert(1)</script>`        | email        |
| `<img onerror=alert(1)>`           | email        |
| `<script>alert(document.cookie)</script>` | name  |
| `<svg onload=alert(1)>`            | name         |
| `<img src=x onerror=alert(1)>`     | name         |
| `javascript:alert(1)`              | name         |

**Part 2 — Security Headers** (5 checks):

| Header                     | Expected Value                    |
|----------------------------|-----------------------------------|
| `Content-Type`             | `application/json`                |
| `X-Content-Type-Options`   | `nosniff`                         |
| `X-Frame-Options`          | present                           |
| `Content-Security-Policy`  | present                           |
| CSP `script-src`           | `'self'`                          |

**Part 3 — API Response Content-Type**: Verifies API responses return `application/json` (so browsers won't interpret payloads as HTML).

---

## Logging & Monitoring Pipeline

The project uses a **Winston → Loki → Grafana** pipeline for centralized, queryable logging across all backend replicas.

### Architecture: Winston → Loki → Grafana

```
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND CONTAINERS                         │
│                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ backend-blue:1  │  │ backend-blue:2  │  │ backend-green:N │     │
│  │                 │  │                 │  │                 │     │
│  │  Winston Logger │  │  Winston Logger │  │  Winston Logger │     │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │     │
│  │  │ Console   │  │  │  │ Console   │  │  │  │ Console   │  │     │
│  │  │ Transport │  │  │  │ Transport │  │  │  │ Transport │  │     │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │     │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │     │
│  │  │   Loki    │──┼──┼──│   Loki    │──┼──┼──│   Loki    │  │     │
│  │  │ Transport │  │  │  │ Transport │  │  │  │ Transport │  │     │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │     │
│  └─────────────────┘  └─────────────────┘  └────────┬────────┘     │
└─────────────────────────────────────────────────────┼──────────────┘
                                                      │
                                                      ▼
                                            ┌─────────────────┐
                                            │      Loki       │
                                            │  :3100 (HTTP)   │
                                            │  Log Aggregator │
                                            │  TSDB storage   │
                                            └────────┬────────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │    Grafana      │
                                            │  :3001 (Web UI) │
                                            │  Dashboards     │
                                            │  LogQL queries  │
                                            └─────────────────┘
```

**Data flow**: Every backend container runs a Winston logger instance with two transports. The **Console transport** outputs to `docker compose logs`. The **Loki transport** (`winston-loki`) pushes structured JSON logs over HTTP to the Loki container at `http://loki:3100`. Grafana connects to Loki as a pre-configured datasource and provides a web UI for querying and visualizing logs.

---

### Winston Logger (Backend)

**File**: `backend/src/utils/logger.ts`

The logger is the single, centralized logging module for the entire backend. All application code imports from this file.

#### Two Transports

| Transport        | Destination             | Format               | Purpose                          |
|------------------|-------------------------|----------------------|----------------------------------|
| Console          | `stdout` (docker logs)  | Dev: colored text    | Local debugging, `docker compose logs` |
|                  |                         | Prod: JSON           |                                  |
| Loki (winston-loki) | `http://loki:3100`  | Always JSON          | Centralized log aggregation      |

#### Console Output Formats

**Development** (`NODE_ENV !== 'production'`):
```
2026-07-12 23:15:00 +07:00 ✅ info [auth.login_success]: Security event
    {"userId": 1, "email": "user@example.com", "ip": "172.19.0.1"}
```

**Production** (`NODE_ENV === 'production'`):
```json
{"level":"info","message":"Security event","event":"auth.login_success","userId":1,"timestamp":"2026-07-12 23:15:00 +07:00"}
```

#### Loki Transport Configuration

```typescript
new LokiTransport({
  host: 'http://loki:3100',    // Docker internal DNS
  labels: { app: 'backend' },  // Label for all logs from this app
  json: true,                  // Send structured JSON
  replaceTimestamp: true,       // Use Loki server timestamp
  format: prodFormat,           // Always JSON for Loki
  onConnectionError: (err) => console.error('[Loki Connection Error]', err),
})
```

The `labels: { app: 'backend' }` tag allows Grafana to filter all backend logs with `{app="backend"}`.

---

### Custom Log Levels

Winston is configured with 5 custom severity levels (lower number = higher severity):

| Level      | Priority | Icon | Color   | Use case                                         |
|------------|----------|------|---------|--------------------------------------------------|
| `critical` | 0        | 🔥   | Magenta | System-breaking failures, data loss               |
| `error`    | 1        | 🔴   | Red     | Failed operations, invalid passwords, exceptions  |
| `warning`  | 2        | ⚠️   | Yellow  | Suspicious activity, missing tokens, rate limits  |
| `info`     | 3        | ✅   | Green   | Successful operations, HTTP requests, login events|
| `debug`    | 4        | 🔍   | Blue    | Verbose diagnostic data (dev only)                |

The log level can be set via the `LOG_LEVEL` environment variable (defaults to `debug`):

```bash
# Only show warnings and above
LOG_LEVEL=warning docker compose up
```

---

### Secret Sanitization

The logger includes an automatic **secret sanitizer** that redacts sensitive values from log output before they reach Console or Loki. This prevents credentials from leaking into log storage.

**Redacted keys** (case-insensitive, partial match):

| Key Pattern       | Example fields caught                     |
|-------------------|-------------------------------------------|
| `password`        | `password`, `userPassword`, `oldPassword` |
| `token`           | `token`, `refreshToken`, `accessToken`    |
| `authorization`   | `authorization`, `Authorization`          |
| `cookie`          | `cookie`, `setCookie`                     |
| `secret`          | `secret`, `jwtSecret`                     |
| `key`             | `key`, `apiKey`, `encryptionKey`          |
| `apikey`          | `apikey`, `apiKey`                        |

**Example**:
```typescript
log.info('User login', { email: 'user@test.com', password: 'secret123' });
// Output: { email: 'user@test.com', password: '[REDACTED]' }
```

Additionally, any string value longer than **200 characters** is automatically truncated to prevent log bloat.

---

### Security Event Logging

Security-relevant actions are logged via the `logSecurityEvent()` function, which adds a structured `event` field for easy filtering in Grafana.

```typescript
logSecurityEvent('auth.login_success', { userId: 1, email, ip: req.ip });
// → { level: 'info', message: 'Security event', event: 'auth.login_success', userId: 1, ... }

logSecurityEvent('auth.login_failed', { email, reason: 'invalid_password' }, 'error');
// → { level: 'error', message: 'Security event', event: 'auth.login_failed', ... }
```

#### Complete Security Event Catalog

**Authentication Events** (`auth.controller.ts`):

| Event Name                | Level     | Trigger                                         |
|---------------------------|-----------|--------------------------------------------------|
| `auth.register_success`   | `info`    | New user registered successfully                 |
| `auth.register_conflict`  | `warning` | Registration with an already-existing email      |
| `auth.register_error`     | `error`   | Unexpected error during registration             |
| `auth.login_success`      | `info`    | User logged in successfully                      |
| `auth.login_failed`       | `warning` | Wrong credentials (user not found)               |
| `auth.login_failed`       | `error`   | Wrong credentials (invalid password)             |
| `auth.login_error`        | `error`   | Unexpected error during login                    |
| `auth.mfa_sent_on_login`  | `info`    | MFA code sent to user during login               |
| `auth.logout`             | `info`    | User logged out                                  |
| `auth.refresh_rejected`   | `warning` | Refresh token rejected (invalid or user missing) |
| `auth.refresh_error`      | `error`   | Unexpected error during token refresh            |

**MFA Events** (`mfa.controller.ts`):

| Event Name                      | Level     | Trigger                                    |
|---------------------------------|-----------|--------------------------------------------|
| `auth.mfa_code_sent`            | `info`    | MFA verification code emailed              |
| `auth.mfa_request_user_not_found`| `warning`| MFA requested for non-existent user        |
| `auth.mfa_request_error`        | `error`   | Error sending MFA code                     |
| `auth.mfa_verify_success`       | `info`    | MFA code verified successfully             |
| `auth.mfa_verify_invalid`       | `warning` | MFA verify with invalid email              |
| `auth.mfa_verify_expired`       | `warning` | MFA code has expired                       |
| `auth.mfa_verify_wrong_code`    | `warning` | Wrong MFA code entered                     |
| `auth.mfa_verify_error`         | `error`   | Unexpected error during MFA verification   |
| `auth.mfa_enabled`              | `info`    | User enabled MFA                           |
| `auth.mfa_enable_error`         | `error`   | Error enabling MFA                         |
| `auth.mfa_disabled`             | `info`    | User disabled MFA                          |
| `auth.mfa_disable_error`        | `error`   | Error disabling MFA                        |

**Auth Middleware Events** (`auth.middleware.ts`):

| Event Name                  | Level     | Trigger                                      |
|-----------------------------|-----------|----------------------------------------------|
| `auth.missing_token`        | `warning` | Request without authorization token          |
| `auth.missing_secret`       | `error`   | JWT_SECRET env variable not configured       |
| `auth.invalid_token`        | `warning` | Token failed verification (expired/tampered) |
| `auth.unauthorized_no_user` | `warning` | Token valid but user not found in DB         |
| `auth.forbidden`            | `warning` | User lacks required role for the endpoint    |

**HTTP Request Logging** (`server.ts`):

| Log Call   | Level   | Trigger                          | Metadata                          |
|------------|---------|----------------------------------|-----------------------------------|
| `log.info` | `info`  | Every incoming HTTP request      | `ip`, `method`, `url`, `userAgent`|
| `log.error`| `error` | Unhandled exception in middleware| `error`, `stack`, `ip`, `url`     |
| `log.info` | `info`  | Server startup                   | Port number                       |

---

### Loki (Log Aggregation)

**Config file**: `monitoring/loki-config.yml`

Loki receives, indexes, and stores all logs pushed from Winston's Loki transport.

| Setting                | Value          | Explanation                                      |
|------------------------|----------------|--------------------------------------------------|
| `auth_enabled`         | `false`        | No authentication (internal Docker network only) |
| `http_listen_port`     | `3100`         | HTTP API for log ingestion and queries           |
| `store`                | `tsdb`         | Time-Series DB for index storage                 |
| `object_store`         | `filesystem`   | Stores log chunks on disk (`/tmp/loki/chunks`)   |
| `schema`               | `v13`          | Latest Loki schema version                       |
| `index.period`         | `24h`          | New index table created every 24 hours           |
| `replication_factor`   | `1`            | Single-node mode (no replication)                |

**Docker Compose config**:
```yaml
loki:
  image: grafana/loki:3.0.0
  ports:
    - "3100:3100"             # Exposed for debugging, but used internally
  volumes:
    - ./monitoring/loki-config.yml:/etc/loki/local-config.yaml
  command: -config.file=/etc/loki/local-config.yaml
```

**Loki API endpoints** (for debugging):
```bash
# Check Loki is running
curl http://localhost:3100/ready

# Query logs via API (raw LogQL)
curl -G 'http://localhost:3100/loki/api/v1/query_range' \
  --data-urlencode 'query={app="backend"}' \
  --data-urlencode 'limit=10'
```

---

### Grafana (Visualization)

| Detail              | Value                              |
|---------------------|------------------------------------|
| **URL**             | `http://localhost:3001`            |
| **Default User**    | `admin`                            |
| **Default Password**| `admin`                            |
| **Datasource**      | Loki (pre-configured, auto-provisioned) |

**Auto-provisioned datasource** (`monitoring/grafana/datasources/datasources.yml`):
```yaml
apiVersion: 1
datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100      # Internal Docker DNS
    isDefault: true
    jsonData:
      maxLines: 1000
```

This file is volume-mounted into Grafana's provisioning directory, so the Loki datasource appears **automatically** on first boot — no manual setup required.

#### Getting Started with Grafana

1. Start the stack: `docker compose up -d`
2. Open `http://localhost:3001` in your browser
3. Login with `admin` / `admin`
4. Navigate to **Explore** (compass icon in sidebar)
5. Select the **Loki** datasource (should be pre-selected)
6. Enter a LogQL query (see examples below)

---

### Querying Logs in Grafana (LogQL)

LogQL is Loki's query language (similar to PromQL). Use these in Grafana's **Explore** page.

#### Basic Queries

```logql
# All backend logs
{app="backend"}

# Filter by log level
{app="backend"} |= "error"
{app="backend"} |= "warning"

# Only security events
{app="backend"} |= "Security event"
```

#### Security-Specific Queries

```logql
# All failed login attempts
{app="backend"} |= "auth.login_failed"

# All successful logins
{app="backend"} |= "auth.login_success"

# Brute force indicators (multiple failures from same event)
{app="backend"} |= "auth.login_failed" |= "invalid_password"

# Unauthorized access attempts
{app="backend"} |= "auth.missing_token"
{app="backend"} |= "auth.invalid_token"
{app="backend"} |= "auth.forbidden"

# MFA activity
{app="backend"} |= "auth.mfa_"

# Failed MFA verifications (potential attack)
{app="backend"} |= "auth.mfa_verify_wrong_code"
```

#### JSON Parsing Queries

Since logs are stored as JSON, you can parse and filter by specific fields:

```logql
# Parse JSON and filter by event field
{app="backend"} | json | event = "auth.login_failed"

# Filter by IP address
{app="backend"} | json | ip = "172.19.0.1"

# Filter by specific user
{app="backend"} | json | email = "user@example.com"

# Show only error and critical levels
{app="backend"} | json | level =~ "error|critical"

# Count login failures per minute (metrics from logs)
count_over_time({app="backend"} |= "auth.login_failed" [1m])

# Rate of errors per 5 minutes
rate({app="backend"} |= "error" [5m])
```

#### Useful Dashboard Panels

| Panel Title                    | Query                                                                 | Visualization |
|--------------------------------|-----------------------------------------------------------------------|---------------|
| Login Failures Over Time       | `count_over_time({app="backend"} \|= "auth.login_failed" [5m])`       | Time series   |
| Error Rate                     | `rate({app="backend"} \| json \| level = "error" [5m])`               | Time series   |
| Recent Security Events         | `{app="backend"} \|= "Security event"`                                | Logs panel    |
| MFA Verification Failures      | `count_over_time({app="backend"} \|= "mfa_verify_wrong_code" [15m])` | Stat / Gauge  |
| Forbidden Access Attempts      | `{app="backend"} \|= "auth.forbidden"`                                | Logs panel    |
| HTTP Requests Per Minute       | `count_over_time({app="backend"} \|= "Incoming HTTP Request" [1m])`   | Time series   |

---

## Quick Reference Commands

```bash
# ──────────────────────────────────────────────────
#  DEVELOPMENT
# ──────────────────────────────────────────────────

# Start all services (build from source)
docker compose up -d --build

# Start with green profile too
docker compose --profile green up -d --build

# View running containers and replica counts
docker compose ps

# View logs (follow mode)
docker compose logs -f backend-blue

# Stop everything
docker compose down

# Stop everything and remove volumes (⚠️ deletes database)
docker compose down -v

# ──────────────────────────────────────────────────
#  PRODUCTION
# ──────────────────────────────────────────────────

# Pull and start production stack
GHCR_REPO=ros-rendo/devopsfinal docker compose -f docker-compose.prod.yml up -d

# Deploy with blue-green swap
./scripts/start-demo.sh

# ──────────────────────────────────────────────────
#  SCALING
# ──────────────────────────────────────────────────

# Scale backend-blue to 4 replicas
docker compose up --scale backend-blue=4 -d

# Scale down to 1 replica
docker compose up --scale backend-blue=1 -d

# Scale green (requires profile)
docker compose --profile green up --scale backend-green=5 -d backend-green

# ──────────────────────────────────────────────────
#  DATABASE
# ──────────────────────────────────────────────────

# Backup
./scripts/db-backup.sh

# Restore (interactive)
./scripts/db-restore.sh

# ──────────────────────────────────────────────────
#  SECURITY TESTING
# ──────────────────────────────────────────────────

# Run all security tests
./scripts/run-all-security-tests.sh

# Run individual tests
./scripts/test-rate-limit.sh
./scripts/test-brute-force-protection.sh
./scripts/test-secure-cookie.sh
./scripts/test-injection-prevention.sh
./scripts/test-xss-prevention.sh

# Against a custom URL
BASE_URL=http://your-server:3000 ./scripts/run-all-security-tests.sh

# ──────────────────────────────────────────────────
#  BLUE-GREEN DEPLOYMENT
# ──────────────────────────────────────────────────

# Deploy (swap active environment)
./scripts/deploy.sh

# Check which environment is active
grep 'active_backend' nginx/nginx.conf
```
