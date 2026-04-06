# Catalog Intelligence OS (CIOS)

**Catalog Intelligence OS** is an AI-powered product catalog management platform. It ingests raw supplier feeds, enriches products with structured attributes and taxonomy using **Anthropic** models, runs quality scoring and human review workflows, and exposes analytics so teams can trust the data they ship to channels.

## Features

- **Product ingestion** — Upload CSV/JSON feeds or submit single products; queue processing with job status tracking.
- **AI attribute extraction** — Structured attributes and signals from unstructured product text via Anthropic Claude (taxonomy classification, extraction pipeline, quality scoring).
- **Taxonomy management** — Hierarchical categories, paths, per-node attribute schemas, and product counts.
- **Quality review workflow** — Review tasks with accept, reject, edit, and bulk actions; audit trails on canonical products.
- **Analytics dashboard** — Catalog health, attribute coverage, review queue stats, and supplier quality (API-backed; surfaced in the Next.js app).

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Backend** | Python, **FastAPI**, **SQLAlchemy 2** (async), **Celery**, **Redis**, **PostgreSQL** + **pgvector**, Alembic, Pydantic |
| **Frontend** | **Next.js 14**, **React** 18, **TanStack Query**, **Tailwind CSS**, **Recharts**, TypeScript, Radix UI primitives (shadcn-style components) |
| **AI** | Anthropic API (`anthropic` Python SDK) |

Runtime versions: **Python 3.10+**, **Node.js 18+**. Database image: PostgreSQL 16 with pgvector (see `docker-compose.yml`).

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Docker** and **Docker Compose** (`docker compose` or `docker-compose`)

## Quick start

### Option A — one command

From the project root:

```bash
./setup.sh
```

This script checks Python and Node versions, ensures Docker Compose is available, copies `.env` from `.env.example` if missing, installs frontend and backend dependencies, starts Compose, waits for PostgreSQL, and runs `alembic upgrade head`.

When it finishes, start the web UI (the API is already running in Docker):

```bash
cd frontend && npm run dev
```

- API: [http://localhost:8000](http://localhost:8000) — OpenAPI at [http://localhost:8000/docs](http://localhost:8000/docs)
- Frontend: [http://localhost:3000](http://localhost:3000)

### Option B — manual

1. **Configure environment**

   ```bash
   cd "CATALOG INTELLIGENCE OS"
   cp .env.example .env
   ```

   Edit `.env` and set secrets (see [Environment variables](#environment-variables)). **You need a valid `ANTHROPIC_API_KEY` for AI enrichment.**

2. **Install dependencies**

   ```bash
   cd frontend && npm install && cd ..
   python3 -m pip install -r backend/requirements.txt
   ```

3. **Start infrastructure and services**

   ```bash
   docker compose up -d --build
   ```

   This starts PostgreSQL (pgvector), Redis, the FastAPI app, a Celery worker, and Celery Beat.

4. **Run migrations** (with `PYTHONPATH` pointing at the backend package and `.env` loaded):

   ```bash
   export PYTHONPATH="$(pwd)/backend"
   set -a && source .env && set +a
   (cd backend && alembic upgrade head)
   ```

5. **Run the frontend**

   ```bash
   cd frontend && npm run dev
   ```

6. **Stop**

   ```bash
   docker compose down
   ```

   To remove database volumes:

   ```bash
   docker compose down -v
   ```

## Environment variables

Copy **`.env.example`** to **`.env`** and adjust values for your environment.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Async SQLAlchemy URL (e.g. `postgresql+asyncpg://...`) |
| `DATABASE_URL_SYNC` | Sync URL for Alembic and tools that need a non-async driver |
| `REDIS_URL` | Celery broker / cache |
| **`ANTHROPIC_API_KEY`** | **Required for AI extraction and enrichment** (Claude API) |
| `SECRET_KEY` | Application signing (use a long random value) |
| `ENVIRONMENT` | e.g. `development`, `staging`, `production` |
| `CORS_ORIGINS` | Comma-separated allowed browser origins for the API |
| `NEXT_PUBLIC_API_URL` | Public API base URL for the Next.js frontend (e.g. `http://localhost:8000`) |

## Project structure

```
CATALOG INTELLIGENCE OS/
├── docker-compose.yml
├── setup.sh
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   ├── app/
│   │   ├── main.py              # FastAPI app, /health, CORS
│   │   ├── config.py
│   │   ├── database.py          # Async SQLAlchemy engine/session
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/            # taxonomy_classifier, attribute_extractor,
│   │   │                        # quality_scorer, entity_resolver,
│   │   │                        # enrichment_pipeline, activation
│   │   ├── api/                 # Routers mounted under /api/v1
│   │   ├── workers/             # Celery tasks
│   │   └── utils/
│   └── tests/
└── frontend/
    ├── app/
    │   ├── page.tsx             # Landing
    │   ├── (app)/               # App routes: dashboard, ingest, products,
    │   │                        # review, taxonomy, suppliers, analytics, settings
    │   └── (marketing)/
    ├── components/              # UI, layout, feature widgets
    ├── hooks/                   # TanStack Query hooks
    └── lib/                     # API client, types
```

## API endpoints

Interactive API docs: **`/docs`** (Swagger UI) and **`/redoc`**.

| Area | Method | Path |
|------|--------|------|
| Health | `GET` | `/health` |
| Ingest | `POST` | `/api/v1/ingest/upload` |
| | `POST` | `/api/v1/ingest/single` |
| | `GET` | `/api/v1/ingest/status/{job_id}` |
| Products | `GET` | `/api/v1/products` |
| | `GET` | `/api/v1/products/{product_id}` |
| | `GET` | `/api/v1/products/{product_id}/audit` |
| Review | `GET` | `/api/v1/review/tasks` |
| | `POST` | `/api/v1/review/tasks/{task_id}/accept` |
| | `POST` | `/api/v1/review/tasks/{task_id}/reject` |
| | `POST` | `/api/v1/review/tasks/{task_id}/edit` |
| | `POST` | `/api/v1/review/tasks/bulk_accept` |
| Analytics | `GET` | `/api/v1/analytics/catalog_health` |
| | `GET` | `/api/v1/analytics/attribute_coverage` |
| | `GET` | `/api/v1/analytics/review_queue_stats` |
| | `GET` | `/api/v1/analytics/supplier_quality` |
| Taxonomy | `GET` | `/api/v1/taxonomy` |
| | `GET` | `/api/v1/taxonomy/{node_id}` |
| Export | `GET` | `/api/v1/export/{product_id}?format=...` |

**Export `format` query parameter:** `google_shopping`, `meta_catalog`, `amazon_sp`, `generic_json` (default), or `csv`.

Example health check:

```bash
curl -s http://localhost:8000/health
# {"status":"ok","version":"1.0.0"}
```

## Docker

Bring the stack up (build images, start containers in the background):

```bash
docker compose up -d --build
```

Services: **postgres** (pgvector), **redis**, **backend** (uvicorn), **celery_worker**, **celery_beat**. Logs: `docker compose logs -f`, or stop with `docker compose down` as above.

## License

MIT
