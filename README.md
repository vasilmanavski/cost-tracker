# Cost Tracker

Personal expense tracking app with receipt OCR, Google and email/password auth, and per-user data ownership.

## Quick Start (Local Development)

### Prerequisites

- Java 21+
- Node.js 18+
- Docker (for PostgreSQL, or use a local install)

### Option A: Docker PostgreSQL (recommended)

```bash
# 1. Start PostgreSQL
make dev-db

# 2. Start backend (new terminal)
make dev-backend

# 3. Start frontend (new terminal)
make dev-frontend
```

### Option B: Local PostgreSQL

If you already have PostgreSQL running locally:

```bash
psql -c 'CREATE DATABASE "cost-tracker-db";'
```

```bash
# Backend (uses application-local.yml)
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Frontend (new terminal)
cd frontend
npm install && npm run dev
```

Open http://localhost:5173

---

## Production Deployment

### Prerequisites

- A Linux server with Docker and Docker Compose
- A domain name (optional but recommended)

### Steps

```bash
# 1. Clone the repo
git clone <repo-url> && cd cost-tracker

# 2. Create production env file
cp .env.example .env
```

Edit `.env` with real values:

```env
POSTGRES_DB=cost_tracker
POSTGRES_USER=costtracker
POSTGRES_PASSWORD=<strong-password>

JWT_SECRET=<run: openssl rand -base64 48>

# Optional
GOOGLE_CLIENT_ID=<your-google-client-id>
OPENAI_API_KEY=<your-openai-key>
```

```bash
# 3. Build and start
make prod

# Or without make:
docker compose -f docker-compose.prod.yml up --build -d
```

The app is now running:
- **Frontend + API proxy**: port 80
- **Backend**: internal (port 8080, not exposed)
- **PostgreSQL**: internal (port 5432, not exposed)

### HTTPS

Put a reverse proxy (Caddy, nginx, or Cloudflare Tunnel) in front of port 80. Example with Caddy:

```
yourdomain.com {
    reverse_proxy localhost:80
}
```

### Management

```bash
make logs          # Tail logs
make prod-down     # Stop everything
make prod          # Rebuild and restart
```

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│  PostgreSQL  │
│  (nginx:80)  │/api │ (Spring:8080)│    │   (:5432)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Frontend**: React SPA served by nginx. Proxies `/api/*` and `/uploads/*` to the backend container.
- **Backend**: Spring Boot REST API. Stateless JWT auth. Connects to PostgreSQL.
- **PostgreSQL**: Single database, separate volumes for dev and prod.

---

## Environment Configuration

### All variables

| Variable | Required | Where | Description |
|---|---|---|---|
| `POSTGRES_DB` | Yes | Docker | Database name |
| `POSTGRES_USER` | Yes | Docker | Database user |
| `POSTGRES_PASSWORD` | Yes | Docker | Database password |
| `DB_URL` | Prod only | Backend | JDBC URL (auto-set in compose) |
| `DB_USERNAME` | Prod only | Backend | Same as `POSTGRES_USER` |
| `DB_PASSWORD` | Prod only | Backend | Same as `POSTGRES_PASSWORD` |
| `JWT_SECRET` | Yes | Backend | JWT signing key (min 32 chars) |
| `GOOGLE_CLIENT_ID` | No | Both | Google OAuth client ID |
| `OPENAI_API_KEY` | No | Backend | Enables real receipt OCR |
| `VITE_GOOGLE_CLIENT_ID` | No | Frontend build | Auto-set from `GOOGLE_CLIENT_ID` |
| `APP_PORT` | No | Docker | Host port for frontend (default: 80) |

### Spring profiles

| Profile | Used by | Database | Config file |
|---|---|---|---|
| `local` | Host dev (no Docker) | Local PostgreSQL on localhost | `application-local.yml` |
| `dev` | Docker dev | Compose PostgreSQL container | `application-dev.yml` |
| `prod` | Production | Compose PostgreSQL container | `application-prod.yml` |

### Frontend env vars

Frontend uses Vite env vars (`VITE_*`), baked in at build time:

| Variable | Default | Description |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | (empty) | Google OAuth client ID. Omit to hide Google button. |
| `VITE_API_URL` | `/api` | API base URL. Default works with nginx proxy. |

For local dev, create `frontend/.env.local` (gitignored):

```
VITE_GOOGLE_CLIENT_ID=your-client-id
```

---

## Authentication

| Method | Flow |
|---|---|
| **Email/password** | Register → verify email → login |
| **Google** | Click "Continue with Google" → auto-login/register |

### Account linking

One user per email address. No duplicates.

| Scenario | Behavior |
|---|---|
| Google login, new email | Create user (Google-only, email verified) |
| Google login, existing local user | Link Google to existing account |
| Local login, user has password | Works (even if Google is also linked) |
| Local login, Google-only user | Rejected with helpful message |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register (email/password) |
| POST | `/api/auth/login` | No | Login (email/password) |
| POST | `/api/auth/google` | No | Login/register via Google |
| POST | `/api/auth/verify-email` | No | Verify email token |
| POST | `/api/auth/resend-verification` | No | Resend verification email |
| GET | `/api/categories` | Yes | List categories |
| GET | `/api/expenses` | Yes | List expenses (paginated, filterable) |
| GET | `/api/expenses/{id}` | Yes | Get expense |
| POST | `/api/expenses` | Yes | Create expense |
| PUT | `/api/expenses/{id}` | Yes | Update expense |
| DELETE | `/api/expenses/{id}` | Yes | Delete expense |
| GET | `/api/dashboard/summary` | Yes | Dashboard summary |
| POST | `/api/receipts/extract` | Yes | Upload + OCR receipt |

---

## Database Migrations

Managed by Flyway. Run automatically on backend startup.

| Migration | Description |
|---|---|
| V1 | Create `category` and `expense` tables |
| V2 | Demo seed data |
| V3 | Add `app_user`, `email_verification_token`, link expenses to users |
| V4 | Add `google_linked` column for account linking |

---

## Project Structure

```
cost-tracker/
├── backend/                   Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/costtracker/
│       │   ├── config/        Security, extraction toggle
│       │   ├── controller/    REST endpoints
│       │   ├── dto/           Request/response records
│       │   ├── exception/     Global error handler
│       │   ├── model/         JPA entities
│       │   ├── repository/    Spring Data repos
│       │   ├── security/      JWT, Google token verifier
│       │   └── service/       Business logic, auth, email
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           ├── application-prod.yml
│           └── db/migration/  Flyway SQL (V1–V4)
├── frontend/                  React SPA
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/               HTTP client + API modules
│       ├── components/        UI components
│       ├── hooks/             Auth context + data hooks
│       ├── pages/             Route pages
│       ├── types/             TypeScript interfaces
│       └── utils/             Formatters
├── docker-compose.yml         Dev (PostgreSQL only)
├── docker-compose.prod.yml    Production (all services)
├── .env.example               All env vars documented
├── Makefile                   Dev/prod commands
└── README.md
```

---

## Make Commands

```
make help            Show all commands
make dev-db          Start PostgreSQL (Docker)
make dev-backend     Start backend (Spring Boot)
make dev-frontend    Start frontend (Vite)
make dev             Start everything
make stop            Stop Docker services
make prod            Build + start production
make prod-down       Stop production
make logs            Tail production logs
make clean           Remove build artifacts
make check           Run compile + typecheck
```
