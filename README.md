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
  README.md
  .gitignore
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
