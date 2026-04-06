# DataSteward

**Intelligent data pipeline health monitoring** with ML-powered anomaly detection, drift detection, duplicate finding, freshness prediction, incident modeling, and root cause analysis (Anthropic Claude).

DataSteward profiles tables, learns baselines, flags row-count and multivariate anomalies, detects distribution shift, surfaces near-duplicate records, predicts pipeline freshness, and can generate remediation-oriented root cause hypotheses. Core detection uses **Isolation Forest**, **sigma-based baselines (Z-score style)**, **Kolmogorov–Smirnov drift tests**, and **MinHash LSH**; optional **Claude** integration powers narrative root cause analysis.

---

## Features

| Area | Capabilities |
|------|----------------|
| **Anomaly detection** | Row-count baselines (mean ± 2.5σ), multivariate **Isolation Forest** (`scikit-learn`) |
| **Drift detection** | Two-sample **KS tests** (`scipy.stats.ks_2samp`) between baseline and current distributions |
| **Duplicate finding** | **MinHash LSH** (`datasketch`) for near-duplicate strings |
| **Freshness prediction** | Rolling statistics over completion history; late-run detection |
| **Incident management** | Pydantic `Incident` model (severity, remediation, lifecycle); integration tests for incident creation from signals |
| **Root cause analysis** | **Anthropic Claude** via SDK; rule-based fallback for tests/offline use |

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Backend** | Python, **FastAPI**, **scikit-learn**, **scipy**, **pandas**, **datasketch**, **Anthropic** SDK |
| **Frontend** | **Next.js 14**, **React**, **Tailwind CSS** |
| **Ops** | **Docker Compose**, **PostgreSQL** 16 |

---

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **Docker** & Docker Compose plugin — optional for pure local dev, **required** for `./setup.sh` (that script brings up Postgres + API + UI in containers)

---

## Quick start

### Option A — `./setup.sh` (and optional `./run.sh`)

1. **`./setup.sh`** — Checks `python3`, `npm`, and `docker compose`; creates `.venv`, installs `requirements.txt` and frontend deps; copies `.env.example` → `.env` if missing; runs **`docker compose up --build -d`** (Postgres, API on port **8000**, frontend on **3000**).

2. **`./run.sh`** *(optional)* — Runs **uvicorn** and **Next.js dev** on `127.0.0.1:8000` and `127.0.0.1:3000` using the local venv. **Stop Docker Compose first** (`docker compose down`) so those ports are free; use this when you want hot-reload without running the app in containers.

### Option B — Manual

```bash
cd datasteward
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -U pip && pip install -r requirements.txt
cd frontend && npm install && cd ..
cp .env.example .env
# edit .env — at least ANTHROPIC_API_KEY if using Claude RCA
make test
```

Run locally (after `export PYTHONPATH="$(pwd)"` from repo root):

```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
# separate terminal: cd frontend && npm run dev
```

Or use **`./run.sh`** from the repo root (expects `.venv` and runs backend + frontend together).

---

## Environment variables

Copy **`.env.example`** to **`.env`** and set as needed:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude root cause analysis (`backend/ml/root_cause_analyzer.py`) |
| `DATABASE_URL` | PostgreSQL connection (e.g. Compose default in `.env.example`) |
| `SNOWFLAKE_*`, `BIGQUERY_*`, `REDSHIFT_*` | Reserved for future SQL connectors |
| `AIRFLOW_*`, `DBT_CLOUD_API_KEY`, `SLACK_BOT_TOKEN`, `PAGERDUTY_API_KEY` | Reserved for orchestration / alerting integrations |

---

## Project structure

```
datasteward/
├── backend/
│   ├── ml/              # Anomaly, drift, duplicates, freshness, root cause
│   ├── monitoring/      # Profiling, baseline manager
│   ├── models/          # Pydantic models (incidents, profiles, quality)
│   ├── api/             # Route modules
│   ├── main.py          # FastAPI app
│   └── Dockerfile
├── frontend/            # Next.js 14 app
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── setup.sh
├── run.sh
├── Makefile
├── requirements.txt
└── .env.example
```

---

## Testing

```bash
make test
# or: python -m pytest tests/ -v --tb=short
```

The suite is **25** pytest cases covering anomaly, drift, duplicate, freshness, profiler, and incident flows (`tests/unit/`, `tests/integration/`).

---

## Docker

From the repo root (after `.env` exists):

```bash
docker compose up --build
```

Detached (as `setup.sh` does): `docker compose up --build -d`

Services: **postgres** (5432), **api** (8000), **frontend** (3000).

---

## Implementation notes

- **HTTP API** (`backend/main.py`): health + placeholder list/score/profile endpoints; core value is in **library-style** ML/monitoring code and tests.
- **Facebook Prophet** appears in older docs but is **not** used; row-count behavior uses statistical baselines, not Prophet.
- **Connectors / Slack / PagerDuty / Airflow**: scaffolding only where present; not fully implemented.

Run `make test` to verify behavior after changes.
