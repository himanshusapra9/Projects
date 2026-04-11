# DataSteward

**Catch bad data before your CEO does.**

DataSteward is a self-hosted data quality monitoring platform for teams that need schema drift alerts, row-count anomaly detection, freshness SLA tracking, duplicate detection, and AI root cause analysis — without paying $50K/yr for enterprise tools.

Built for analytics engineers and data engineers at 10–200 person companies who have Airflow/dbt and a warehouse but no budget for Monte Carlo.

---

## What it does

| Capability | How |
|---|---|
| **Anomaly Detection** | Row-count baselines (mean ± 2.5σ) + Isolation Forest |
| **Schema Drift Alerts** | Instant notification when columns change type or disappear |
| **Distribution Drift** | Kolmogorov–Smirnov statistical tests (scipy) between baseline and current |
| **Duplicate Detection** | MinHash LSH (datasketch) surfaces near-duplicate records automatically |
| **Freshness SLA Tracking** | Define expected update windows; get alerted when breached |
| **Incident Management** | Every anomaly logged with severity, context, timeline, remediation |
| **AI Root Cause Analysis** | Claude-powered plain-English hypotheses — what broke, why, what to check first |

---

## Demo mode — zero config

DataSteward ships with **demo mode** enabled by default. No database or API keys needed:

```bash
git clone https://github.com/himanshusapra9/Projects
cd Projects/datasteward
./setup.sh
./run.sh
# open http://localhost:3000
```

Demo mode pre-loads **3 tables** (orders, users, events) with **30 days** of row-count history, **3 injected anomalies**, and **2 open incidents** with pre-written root cause analysis. The full UI works immediately.

---

## Screenshots

| Landing Page | Tables Dashboard | Incident RCA |
|---|---|---|
| Clean white landing page with 7 sections | Stat cards + searchable table list with health pills | Slide-in panel with streamed AI root cause |

---

## Tech stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.10+, **FastAPI** 0.115, **scikit-learn**, **scipy**, **pandas**, **datasketch**, **Anthropic** SDK |
| **Frontend** | **Next.js 14**, **React 18**, **Tailwind CSS**, **Recharts** |
| **Ops** | **Docker Compose**, **PostgreSQL** 16 |

---

## Quick start

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- Docker is optional (only needed for `docker compose up`)

### Setup

```bash
./setup.sh    # creates venv, installs deps, copies .env
./run.sh      # starts backend (8000) + frontend (3000)
```

Then open **http://localhost:3000**.

### Manual setup

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm install && cd ..
cp .env.example .env
./run.sh
```

---

## Environment variables

Copy `.env.example` → `.env`. Key variables:

| Variable | Purpose | Default |
|---|---|---|
| `DEMO_MODE` | Load synthetic sample data (no DB needed) | `true` |
| `ANTHROPIC_API_KEY` | Enable Claude-powered root cause analysis | *(disabled)* |
| `DATABASE_URL` | PostgreSQL connection (optional; in-memory if unset) | `postgresql://...` |
| `APP_ENV` | Environment identifier | `development` |

Set `DEMO_MODE=false` to disable sample data and use real database connections.

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check with version, tables, incidents, Claude status |
| `GET` | `/api/v1/tables` | List all registered tables |
| `POST` | `/api/v1/tables/register` | Register a new table for monitoring |
| `GET` | `/api/v1/tables/{id}` | Full table detail (columns, drift, anomalies, duplicates) |
| `POST` | `/api/v1/tables/{id}/profile` | Trigger immediate profiling |
| `GET` | `/api/v1/tables/{id}/history` | Last 30 profiling results |
| `GET` | `/api/v1/incidents` | List incidents (filter by status, severity) |
| `PATCH` | `/api/v1/incidents/{id}` | Update incident status/notes |
| `GET` | `/api/v1/rca/stream` | SSE stream of AI root cause analysis |

Interactive API docs at **http://localhost:8000/docs** (Swagger UI).

---

## Frontend pages

| Route | Page |
|---|---|
| `/` | Landing page — 7 sections: hero, problem, how it works, features, pricing, quick start, footer |
| `/tables` | Monitoring dashboard — stat cards, searchable table list, register modal, empty state onboarding |
| `/tables/[id]` | Table detail — 6 tabs: Overview (chart), Column Stats, Drift, Anomalies, Duplicates, Incidents |
| `/incidents` | Incident list — filter by status/severity, slide-in RCA panel with Mark Resolved / Escalate / Snooze |
| `/root-cause` | Freeform AI analysis — paste an error or describe an anomaly, get streamed analysis |
| `/freshness` | Freshness SLA tracking across all tables |
| `/duplicates` | Duplicate detection index |

---

## Project structure

```
datasteward/
├── backend/
│   ├── main.py              # FastAPI app — all endpoints
│   ├── config.py             # Environment config helpers
│   ├── demo/
│   │   └── seed_data.py      # Deterministic demo data generator
│   ├── ml/                   # Anomaly, drift, duplicates, freshness, root cause
│   ├── monitoring/           # Profiling, baseline manager
│   ├── models/               # Pydantic models (incidents, profiles, quality)
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Landing page (7 sections)
│   │   ├── layout.tsx         # Root layout with Inter font
│   │   ├── tables/            # Tables list + [id] detail page
│   │   ├── incidents/         # Incident list + RCA panel
│   │   ├── root-cause/        # Freeform AI analysis
│   │   ├── freshness/         # Freshness tracking
│   │   └── duplicates/        # Duplicate detection
│   ├── components/
│   │   ├── AppNav.tsx         # Top navigation bar
│   │   ├── StatCard.tsx       # Metric card component
│   │   ├── SeverityBadge.tsx  # Colored severity pill
│   │   ├── RowCountChart.tsx  # Recharts line chart with baseline band
│   │   └── IncidentCard.tsx   # Incident summary card
│   └── Dockerfile
├── tests/                     # 25 pytest cases (unit + integration)
├── docker-compose.yml
├── setup.sh / run.sh
├── requirements.txt
└── .env.example
```

---

## Testing

```bash
make test
# or: python -m pytest tests/ -v --tb=short
```

**25 pytest cases** covering anomaly detection, drift detection, duplicate finding, freshness prediction, profiling, and incident creation flows. All tests run without a database or API keys.

---

## Docker

```bash
docker compose up --build
```

Services: **postgres** (5432), **api** (8000), **frontend** (3000).

---

## Pricing model

DataSteward is **free and self-hosted**. AI root cause analysis requires your own Anthropic API key (bring-your-own-key model). All ML detectors, incident management, and the full UI work without any API key.
