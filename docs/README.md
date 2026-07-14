# Telegram Task Management Platform

Production-oriented monorepo foundation for a Telegram Mini App task management platform.

Phase 2 implements the authenticated user boundary for Telegram Mini App `initData`, user
persistence, and webhook-based bot entrypoint. Payments, groups, tasks, comments,
notifications, and storage business flows are intentionally reserved for later phases.

## Stack

- Backend: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 async, asyncpg, Alembic
- Database: PostgreSQL
- Cache and future jobs: Redis, ARQ dependency installed for later phases
- Bot: aiogram 3 webhook handler
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Infrastructure: Docker, Docker Compose, Nginx config foundation

## Prerequisites

- Python 3.12+
- Node.js 22+
- npm
- Docker and Docker Compose

## Environment

Create a local environment file:

```bash
cp .env.example .env
```

Required production secrets and URLs:

- `TELEGRAM_BOT_TOKEN`: bot token from BotFather
- `TELEGRAM_BOT_USERNAME`: bot username
- `TELEGRAM_MINI_APP_URL`: public HTTPS URL opened by the `/start` Web App button
- `TELEGRAM_WEBHOOK_SECRET`: secret expected in `X-Telegram-Bot-Api-Secret-Token`
- `TELEGRAM_INIT_DATA_MAX_AGE_SECONDS`: maximum accepted Telegram `initData` age

Development-only auth can be enabled with `DEV_AUTH_ENABLED=true` only when
`APP_ENV=development`. Keep it disabled in production.

Do not commit `.env`.

## Docker Development

Build and start services:

```bash
docker compose up --build
```

Backend:

```bash
curl http://localhost:8000/api/v1/health
```

Frontend:

```bash
http://localhost:5173
```

## Backend Local Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Run checks:

```bash
ruff check .
mypy app tests
pytest -v
alembic heads
alembic history
```

## Frontend Local Setup

```bash
cd frontend
npm install
npm run dev
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Telegram Mini App Auth

The frontend sends Telegram Mini App `initData` in the HTTP authorization header:

```text
Authorization: tma <raw initData>
```

The backend validates the official Telegram Web App HMAC derivation:

```text
secret_key = HMAC_SHA256("WebAppData", TELEGRAM_BOT_TOKEN)
hash = HMAC_SHA256(secret_key, data_check_string)
```

Valid `initData` creates or updates the local `users` row and returns the current user from:

```text
GET /api/v1/auth/me
```

Invalid, expired, malformed, missing, or tampered `initData` is rejected with `401`.

## Development Auth

For local development only:

```text
Authorization: dev <DEV_AUTH_TOKEN>
```

This path is accepted only when `APP_ENV=development`, `DEV_AUTH_ENABLED=true`, and the
configured token and development Telegram user fields are present.

## Bot Execution Model

The application is webhook-based:

```text
POST /api/v1/telegram/webhook
```

Webhook requests must include:

```text
X-Telegram-Bot-Api-Secret-Token: <TELEGRAM_WEBHOOK_SECRET>
```

The FastAPI app does not start polling on import, and Telegram network work is not performed
at module import time. The bot and dispatcher are created only while handling a validated
webhook request. Development polling is not currently implemented; if added later, it must be
started by an explicit manual command, not by importing FastAPI modules.

The `/start` bot handler registers or updates the Telegram user and replies with a Web App
keyboard button whose URL is exactly `TELEGRAM_MINI_APP_URL`.

## Migrations

Alembic reads `DATABASE_URL` from the environment.

Create a revision:

```bash
cd backend
alembic revision --autogenerate -m "describe change"
```

Upgrade:

```bash
alembic upgrade head
```

Downgrade one revision:

```bash
alembic downgrade -1
```

The initial migration creates the `users` table used by Telegram auth and bot registration.

## Health Endpoint

```text
GET /api/v1/health
```

The endpoint reports application, PostgreSQL, and Redis health. If PostgreSQL or Redis is
unavailable, the response status becomes `degraded` and the failing dependency is shown.
