# ══════════════════════════════════════════════════════════════
# Cost Tracker — Makefile
# ══════════════════════════════════════════════════════════════

.PHONY: help dev dev-db dev-backend dev-frontend stop prod prod-down logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────────────────────

dev-db: ## Start PostgreSQL (Docker)
	docker compose up -d postgres
	@echo "Waiting for PostgreSQL..."
	@until docker compose exec postgres pg_isready -U $${POSTGRES_USER:-costtracker} > /dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL ready on localhost:5432"

dev-backend: ## Start backend (Spring Boot, local profile)
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local

dev-frontend: ## Start frontend (Vite dev server)
	cd frontend && npm run dev

dev: dev-db ## Start all (postgres + backend + frontend)
	@echo "Starting backend and frontend..."
	@cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local & \
	cd frontend && npm run dev & \
	wait

stop: ## Stop Docker services
	docker compose down

# ── Production ───────────────────────────────────────────────

prod: ## Build and start production stack
	docker compose -f docker-compose.prod.yml up --build -d

prod-down: ## Stop production stack
	docker compose -f docker-compose.prod.yml down

logs: ## Tail production logs
	docker compose -f docker-compose.prod.yml logs -f

# ── Utilities ────────────────────────────────────────────────

clean: ## Remove build artifacts
	cd backend && ./mvnw clean
	cd frontend && rm -rf dist node_modules/.cache

build-backend: ## Build backend jar
	cd backend && ./mvnw package -DskipTests -B

build-frontend: ## Build frontend static files
	cd frontend && npm ci && npm run build

check: ## Run backend compile + frontend typecheck
	cd backend && ./mvnw compile -q
	cd frontend && npx tsc --noEmit
	@echo "All checks passed."
