# DataSteward — Autonomous Data Pipeline Health Agent

DataSteward monitors data pipeline health in real-time, detects anomalies
(row count drops, null spikes, schema drift, duplicates), performs root cause
analysis via Claude, and auto-heals by triggering Airflow DAG reruns.

## Features

- SQL-based table profiling (row counts, null rates, numeric stats)
- Anomaly detection (Prophet + Isolation Forest)
- Distribution drift detection (KS-test)
- Fuzzy duplicate finding (MinHash LSH)
- Pipeline freshness prediction
- Root cause analysis via Claude
- Auto-healing: Airflow DAG reruns, record quarantine

## Setup

```bash
make install
cp .env.example .env
make test
make dev
```
