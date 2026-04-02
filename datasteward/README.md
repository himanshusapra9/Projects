# DataSteward — Autonomous Data Pipeline Health Agent

> Monitors data pipeline health — detects row count anomalies (Isolation Forest), distribution drift (KS-test), fuzzy duplicates (MinHash LSH), and generates root cause analysis via Claude.

DataSteward monitors data pipeline health by profiling tables, detecting anomalies
in row counts and metric distributions, finding near-duplicate records, predicting
pipeline freshness, and generating root cause hypotheses. It uses statistical methods
(Isolation Forest, KS-test, MinHash LSH) for detection and Claude for root cause analysis.

## What's Implemented

### ML & Detection Modules

| Module | What it does | Algorithm | Status |
|--------|-------------|-----------|--------|
| **Anomaly detector** | Detects row count drops/spikes against learned baselines; multivariate anomaly detection | Statistical baselines (mean ± 2.5σ) for row counts + sklearn IsolationForest for multivariate metrics | **Real**, tested |
| **Drift detector** | Detects distribution shifts between baseline and current data | scipy `ks_2samp` (Kolmogorov-Smirnov two-sample test) | **Real**, tested |
| **Duplicate finder** | Finds near-duplicate records using fuzzy matching | datasketch MinHash + MinHashLSH (configurable threshold + permutations) | **Real**, tested |
| **Freshness predictor** | Predicts expected pipeline completion time and flags late runs | Rolling mean/std of completion history (threshold: mean + 2σ) | **Real**, tested |
| **Root cause analyzer** | Generates root cause hypotheses with remediation steps | **Real function**: Claude claude-sonnet-4-6 via Anthropic SDK; **Mock function**: rule-based (drop → upstream outage, spike → duplicate ingestion) | Both implemented; mock used in tests |

**Note on Prophet**: The README previously mentioned Facebook Prophet for time-series forecasting. The actual implementation uses **statistical baselines (mean ± 2.5σ)** rather than Prophet. Prophet is listed in requirements but not imported or used.

### Monitoring

| Component | What it does | Status |
|-----------|-------------|--------|
| **Table profiler** | Computes row count, distinct PK count, null counts per column, numeric stats (avg/min/max), last updated timestamp | **Real** — implemented as `profile_table_from_data` (in-memory); SQL-based profiler defined but requires live database |
| **Baseline manager** | Stores and retrieves metric baselines per table | **Real** — JSON file storage under `.datasteward/baselines/` |

### Models (Pydantic)

- `TableProfile` — row count, PK uniqueness, null counts, numeric stats, staleness
- `Incident` — table name, anomaly type, severity (P0-P3), expected/actual values, root cause, remediation steps, auto-heal action, status lifecycle
- `QualityScore` — per-table quality dimensions (completeness, freshness, uniqueness, consistency) with weighted overall score

### API (FastAPI — stub endpoints)

- `GET /api/v1/incidents` — Returns empty list
- `GET /api/v1/tables/{name}/score` — Returns fixed score 100
- `GET /api/v1/tables/{name}/profile` — Returns placeholder
- `GET /health` — Health check

### What's Not Implemented

- **Facebook Prophet** — listed in requirements, not used (statistical baselines instead)
- **SQL-based profiling** against live databases (Snowflake, BigQuery, Redshift, Postgres, DuckDB) — connector dirs exist, no implementation
- **Airflow integration** — auto-heal actions defined in incident model but no Airflow REST API client
- **dbt Cloud integration** — mentioned in spec, not implemented
- **Slack/PagerDuty alerting** — integration dirs exist, no implementation
- **Celery scheduling** — listed in requirements, not used
- **Database persistence** — no SQLAlchemy models; profiles stored as in-memory dicts or JSON files

### Frontend (Next.js 14 placeholder)

- Pipeline health map, incident timeline, quality score trends (static mockup)

### Tests (25 passing)

- Anomaly detector: normal value passes, 70% drop detected, spike detected, unknown table handled, Isolation Forest on normal vs outlier data
- Drift detector: same distribution → no drift (p>0.05), shifted distribution → drift detected (p<0.05), variance change detected, insufficient data handled
- Duplicate finder: exact duplicates found, near-duplicates (1 char different) found, 100 records with 10 near-dupes → at least 5 flagged, unique data → no false positives
- Freshness predictor: prediction with history, insufficient history handled, late detection
- Profiler: 1000 rows → correct counts + null rates + stats, empty table handled
- Incident creation: row count drop → P1 incident + auto-heal via DAG rerun, spike → quarantine action

## Setup

```bash
cd datasteward
python -m venv .venv && source .venv/bin/activate
make install
cp .env.example .env
make test
```
