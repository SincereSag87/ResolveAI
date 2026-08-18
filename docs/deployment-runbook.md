# Hosted Postgres Migration Runbook

Use this runbook when deploying ResolveAI to Vercel or any other hosted environment.

## 1. Provision Postgres

Create a hosted PostgreSQL database with Neon, Supabase, AWS Aurora Postgres, or a Vercel Marketplace Postgres integration.

Collect the SQLAlchemy-compatible connection string:

```text
postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
```

## 2. Set Environment Variables

In Vercel Project Settings, add these variables for Production and Preview:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
CORS_ORIGINS=["https://your-vercel-domain.vercel.app"]
```

For local production-style checks, set the same variables in your shell before running migrations.

## 3. Run Alembic Migrations

From a machine that can reach the hosted database:

```powershell
cd C:\Projects\ResolveAI\backend
.\.venv\Scripts\Activate.ps1
$env:DATABASE_URL="postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE"
alembic upgrade head
```

Confirm the current migration head:

```powershell
alembic current
alembic heads
```

Both should show the latest revision.

## 4. Verify Tables

Connect to the hosted database with your provider console or `psql`, then verify:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected application tables:

```text
alembic_version
conversations
knowledge_articles
messages
tickets
```

## 5. Deploy

Deploy from GitHub through Vercel or with the Vercel CLI after authentication is fixed:

```powershell
vercel deploy --prod
```

Do not use `docker-compose.yml` in Vercel. It is only for local PostgreSQL development.
