# PulseAI

**PulseAI** is a customer signal analysis platform. It ingests feedback from multiple channels (Intercom, Zendesk, and extensible connectors), then applies NLP- and ML-based processing to extract actionable insights: sentiment, topics, pain points, urgency, anomalies, and customer-level signals.

## Features

- **Sentiment analysis** — Positive / negative / neutral classification  
- **Topic classification** — Multi-label assignment to product and support categories  
- **NER / pain point extraction** — Bug reports, feature requests, churn signals, pricing, competitors  
- **Urgency scoring** — Numeric 0–10 urgency from text and behavioral cues  
- **Anomaly detection** — Unusual spikes in sentiment or volume (e.g., isolation-based models)  
- **Churn prediction** — Per-customer churn risk estimates  
- **Customer clustering** — Grouping related signals (e.g., insight cards by topic and strength)  
- **Briefing generation** — Structured summaries from clustered insights  

*Implementation note:* The active pipeline favors fast, deterministic paths (keyword/heuristic models and scikit-learn where wired). Optional Hugging Face–based classifiers exist in the codebase but are not always used by the default pipeline. See module docstrings and tests for details.

## Tech stack

| Area | Technologies |
|------|----------------|
| **Backend** | Python, FastAPI, Uvicorn |
| **ML / NLP** | `transformers`, `sentence-transformers`, `scikit-learn`, `pandas`, `numpy`, `torch` (see `requirements.txt`) |
| **Frontend** | Next.js 14, React 18, Tailwind CSS |

## Prerequisites

- **Python** 3.10 or newer  
- **Node.js** 18 or newer (for the frontend)  
- **npm** (comes with Node)

## Quick start

### Option A — Scripts

From the repository root:

```bash
./setup.sh && ./run.sh
```

`setup.sh` creates a `.venv`, installs Python dependencies from `requirements.txt`, copies `.env.example` → `.env` if needed, and runs `npm install` in `frontend/`.  
`run.sh` starts the FastAPI app on `http://127.0.0.1:8000` and the Next.js dev server for the UI.

### Option B — Manual

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env        # optional; edit as needed

cd frontend && npm install && cd ..

# Terminal 1 — API
export PYTHONPATH="$(pwd)"
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

You can also run backend tests with `make test` after the Python venv is set up and dependencies installed.

## Environment variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Optional; reserved for enhanced or LLM-assisted analysis when integrated. |
| `INTERCOM_ACCESS_TOKEN`, `ZENDESK_API_TOKEN`, `ZENDESK_SUBDOMAIN`, etc. | No | Optional integrations for live connectors (see `.env.example`). |
| `DATABASE_URL`, `REDIS_URL` | No | Optional persistence / queueing (scaffolded in tooling; not required for local API + UI). |

## Project structure

```
pulseai/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── processing/          # Pipeline, insight cards, briefings
│   ├── ml/                  # Sentiment, topics, NER, urgency, anomaly, churn, clustering
│   ├── models/              # Pydantic / domain models
│   ├── ingestion/           # Webhooks and connectors
│   ├── api/                 # API package layout
│   ├── db/, alerts/         # Supporting modules (scaffold / future use)
│   └── Dockerfile
├── frontend/                # Next.js 14 app
├── tests/                   # `unit/` and `integration/`
├── setup.sh
├── run.sh
├── Makefile
├── requirements.txt
└── README.md
```

## Testing

Tests use **pytest**. From the repo root (with the virtual environment activated and dependencies installed):

```bash
make test
# or
cd backend && python -m pytest ../tests/ -v
```

The suite currently contains **29** tests covering sentiment, topics, urgency, anomaly detection, insight cards, webhooks, and end-to-end pipeline flows.

## API

The REST API is served by FastAPI. Interactive documentation (Swagger UI) is available at:

**`/docs`** — e.g. `http://127.0.0.1:8000/docs` when the backend is running.

Core routes include `GET /health`, `POST /api/v1/webhooks/{platform}`, `GET /api/v1/insights`, and `GET /api/v1/briefing/{date_str}` (some routes return placeholder data until fully wired to the processing pipeline).
