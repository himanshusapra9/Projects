# CATALOG INTELLIGENCE OS (CIOS)

**AI-native commerce product data enrichment, classification, quality scoring, and activation platform**

CIOS helps teams turn raw catalog data into structured, trustworthy, and deployable product intelligence—across taxonomy, attributes, quality, and downstream systems.

## Features

- **Taxonomy Intelligence** — Map, normalize, and maintain product categories across channels and standards.
- **Attribute Extraction** — Pull structured attributes from unstructured product text and specs.
- **Data Quality Scoring** — Measure completeness, consistency, and confidence at product and field level.
- **Entity Resolution** — Link duplicate or variant listings to a single canonical product record.
- **Evidence-First AI** — Surface citations and provenance so teams can trust and audit model outputs.
- **Downstream Activation** — Push enriched data to feeds, PIMs, search, and storefronts.

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Backend** | Python 3.12, FastAPI, PostgreSQL 16 + pgvector, SQLAlchemy 2.0, Celery + Redis, Anthropic Claude |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, Zustand |

## Quick start

1. **Clone and configure**

   ```bash
   cd "CATALOG INTELLIGENCE OS"
   cp .env.example .env
   ```

   Edit `.env` with your secrets (see [Environment variables](#environment-variables)).

2. **Run with Docker Compose**

   ```bash
   docker compose up -d --build
   ```

   This starts PostgreSQL (with pgvector), Redis, the FastAPI backend, Celery worker, and Celery Beat.

3. **API**

   - Docs: [http://localhost:8000/docs](http://localhost:8000/docs) (OpenAPI / Swagger)
   - Health: [http://localhost:8000/health](http://localhost:8000/health) (when implemented)

4. **Stop**

   ```bash
   docker compose down
   ```

   To remove volumes (database data):

   ```bash
   docker compose down -v
   ```

## Project structure

```
CATALOG INTELLIGENCE OS/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Pydantic settings
│   │   ├── database.py          # SQLAlchemy async engine
│   │   ├── models/              # SQLAlchemy 2.0 models
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── services/            # ML + AI services
│   │   │   ├── taxonomy_classifier.py
│   │   │   ├── attribute_extractor.py
│   │   │   ├── quality_scorer.py
│   │   │   ├── entity_resolver.py
│   │   │   ├── enrichment_pipeline.py
│   │   │   └── activation.py
│   │   ├── api/                 # FastAPI route handlers
│   │   ├── workers/             # Celery task definitions
│   │   └── utils/               # Seed data, normalization
│   └── tests/
└── frontend/
    ├── app/
    │   ├── page.tsx             # Landing page
    │   ├── (app)/               # Authenticated app routes
    │   │   ├── dashboard/
    │   │   ├── review/
    │   │   ├── products/
    │   │   ├── taxonomy/
    │   │   ├── suppliers/
    │   │   ├── analytics/
    │   │   └── settings/
    │   └── (marketing)/
    ├── components/
    │   ├── landing/             # 9 marketing page sections
    │   ├── layout/              # Sidebar, TopNav, AppShell
    │   ├── dashboard/           # Dashboard widgets
    │   ├── review/              # Review queue components
    │   ├── products/            # Product detail components
    │   ├── shared/              # ConfidenceBar, QualityRing, etc.
    │   └── ui/                  # shadcn-style base components
    ├── hooks/                   # TanStack Query hooks
    └── lib/                     # API client, types, utilities
```

## API endpoints

Interactive docs at `/docs` (Swagger UI) and `/redoc`.

| Area | Endpoints |
|------|-----------|
| Health | `GET /health` |
| Ingest | `POST /api/v1/ingest/upload`, `POST /api/v1/ingest/single`, `GET /api/v1/ingest/status/{job_id}` |
| Products | `GET /api/v1/products`, `GET /api/v1/products/{id}`, `GET /api/v1/products/{id}/audit` |
| Review | `GET /api/v1/review/tasks`, `POST .../accept`, `POST .../reject`, `POST .../edit`, `POST .../bulk_accept` |
| Analytics | `GET /api/v1/analytics/catalog_health`, `.../attribute_coverage`, `.../review_queue_stats`, `.../supplier_quality` |
| Taxonomy | `GET /api/v1/taxonomy`, `GET /api/v1/taxonomy/{id}` |
| Export | `GET /api/v1/export/{product_id}?format=google_shopping\|meta_catalog\|amazon_sp\|generic_json\|csv` |

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Async SQLAlchemy URL (e.g. `postgresql+asyncpg://...`) |
| `DATABASE_URL_SYNC` | Sync URL for tools that need non-async drivers |
| `REDIS_URL` | Celery broker / cache |
| `ANTHROPIC_API_KEY` | Claude API access |
| `SECRET_KEY` | Application signing (use a long random value) |
| `ENVIRONMENT` | e.g. `development`, `staging`, `production` |
| `CORS_ORIGINS` | Allowed browser origins for the API |
| `NEXT_PUBLIC_API_URL` | Public API base URL for the Next.js frontend |

## License

MIT
