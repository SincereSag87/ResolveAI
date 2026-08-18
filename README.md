# ResolveAI

ResolveAI is an AI-powered IT Help Desk Agent foundation for employee troubleshooting, internal knowledge base search, source-cited support answers, and unresolved issue escalation into support tickets.

This first step creates the full-stack project foundation only. AI integration, authentication, retrieval, vector search, and production deployment will be added incrementally.

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, custom CSS
- Backend: Python, FastAPI, SQLAlchemy, Pydantic, PostgreSQL-ready configuration

## Project Structure

```text
ResolveAI/
  frontend/
  backend/
  docker-compose.yml
  .env.example
  README.md
  .gitignore
```

## Environment

Copy `.env.example` values into the environment files you need for local development.

Backend defaults are PostgreSQL-ready:

```text
postgresql+psycopg://resolveai:resolveai@localhost:5432/resolveai
```

The frontend uses `http://127.0.0.1:8000` during local Vite development and same-origin `/api` in production unless `VITE_API_BASE_URL` is set.

## Vercel Deployment

This repo includes Vercel configuration for the Vite frontend and FastAPI backend:

- `vercel.json` builds `frontend/` and serves `frontend/dist`
- `api/index.py` exposes the FastAPI app as a Vercel Python Function
- Root `requirements.txt` points Vercel to backend Python dependencies
- `.python-version` pins Python 3.12

Required Vercel environment variables:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
CORS_ORIGINS=["https://your-vercel-domain.vercel.app"]
```

Use hosted PostgreSQL for Vercel, such as Neon, Supabase, AWS Aurora Postgres, or a Vercel Marketplace Postgres integration. Run Alembic migrations against that hosted database before using the API.

## Start Local Database

```powershell
cd C:\Projects\ResolveAI
docker compose up -d postgres
```

## Run Migrations

```powershell
cd C:\Projects\ResolveAI\backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
```

## Start Frontend

```powershell
cd C:\Projects\ResolveAI\frontend
npm run dev
```

## Start Backend

```powershell
cd C:\Projects\ResolveAI\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

## Health Check

```text
GET http://localhost:8000/api/health
```

## Ticket API

```text
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/{ticket_id}
PATCH  /api/tickets/{ticket_id}
DELETE /api/tickets/{ticket_id}
```

## Conversation API

```text
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/{conversation_id}
PATCH  /api/conversations/{conversation_id}
DELETE /api/conversations/{conversation_id}
POST   /api/conversations/{conversation_id}/messages
```

## Knowledge Base API

```text
GET    /api/knowledge-articles
GET    /api/knowledge-articles/search?q=...
POST   /api/knowledge-articles
GET    /api/knowledge-articles/{article_id}
PATCH  /api/knowledge-articles/{article_id}
DELETE /api/knowledge-articles/{article_id}
```
