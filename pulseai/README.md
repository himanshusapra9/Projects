# PulseAI

**PulseAI** is a real-time customer intelligence platform. It ingests feedback from multiple channels (Intercom, Zendesk, and extensible connectors), applies Groq LLM inference and ML-based processing to extract actionable insights — sentiment, topics, pain points, urgency, anomalies, churn risk, cohort intelligence — and streams results live to a modern dashboard.

## Features

- **Groq LLM Analysis** — Sentiment, topic classification, and pain point extraction powered by Llama 3.3 70B through Groq's ultra-fast inference, with automatic fallback to Llama 3 8B on rate limits
- **Real-Time Streaming** — Server-Sent Events and WebSocket connections deliver live signal analysis the instant feedback arrives
- **Customer Cohort Intelligence** — Upload transaction data for automatic RFM segmentation, cohort retention analysis, and 7-day arrival forecasting
- **Churn Prediction** — Composite risk scoring blends LLM reasoning with heuristic urgency models to identify at-risk customers
- **Anomaly Detection** — Isolation Forest models flag unusual spikes in feedback volume, sentiment shifts, and urgency
- **Multi-Channel Ingestion** — Webhook connectors for Intercom, Zendesk, and custom platforms normalize feedback into a unified pipeline
- **Graceful Degradation** — If Groq is unavailable, the pipeline falls back to fast heuristic/sklearn models with zero downtime

## Tech Stack

| Area | Technologies |
|------|-------------|
| **Backend** | Python, FastAPI, Uvicorn |
| **LLM** | Groq, Llama 3.3 70B Versatile, Llama 3 8B (fallback) |
| **ML / NLP** | scikit-learn, numpy, pandas, transformers, sentence-transformers, torch |
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Streaming** | Server-Sent Events, WebSocket |

## Prerequisites

- **Python** 3.10 or newer
- **Node.js** 18 or newer
- **npm** (comes with Node)
- **Groq API Key** (optional — get one free at [console.groq.com](https://console.groq.com))

## Quick Start

### Option A — Scripts

```bash
git clone https://github.com/himanshusapra9/Projects.git
cd Projects/pulseai
./setup.sh
# Add your Groq API key to .env (optional — falls back to heuristics without it)
./run.sh
```

### Option B — Manual

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env   # add GROQ_API_KEY if you have one

cd frontend && npm install && cd ..

# Terminal 1 — API
export PYTHONPATH="$(pwd)"
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Once running:
- **Frontend** → http://localhost:3000
- **Backend API** → http://127.0.0.1:8000
- **Swagger Docs** → http://127.0.0.1:8000/docs

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No | Groq API key for LLM-powered analysis. Without it, heuristic fallback is used. |
| `GROQ_MAX_RPM` | No | Max requests/min to Groq (default: 25, safe for free tier). |
| `GROQ_PRIMARY_MODEL` | No | Primary Groq model (default: `llama-3.3-70b-versatile`). |
| `GROQ_FALLBACK_MODEL` | No | Fallback model on rate limit (default: `llama3-8b-8192`). |
| `SSE_HEARTBEAT_INTERVAL` | No | SSE heartbeat interval in seconds (default: 15). |
| `WS_PING_INTERVAL` | No | WebSocket ping interval in seconds (default: 30). |
| `MAX_CUSTOMERS_PER_GROQ_BATCH` | No | Max customers sent to Groq per analysis request (default: 10). |
| `INTERCOM_ACCESS_TOKEN`, `ZENDESK_API_TOKEN`, etc. | No | Optional integrations for live connectors. |
| `DATABASE_URL`, `REDIS_URL` | No | Optional persistence/queueing (scaffolded, not required locally). |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check with Groq availability status |
| `POST` | `/api/v1/webhooks/{platform}` | Ingest feedback from Intercom, Zendesk, or custom sources |
| `POST` | `/api/v1/analyze` | Analyze a text signal in real-time |
| `GET` | `/api/v1/insights` | Recent processed signals |
| `GET` | `/api/v1/briefing/{date_str}` | Daily briefing |
| `POST` | `/api/v1/customers/analyze` | Cohort + RFM + forecast + behavioral analysis |
| `GET` | `/api/v1/customers/forecast` | 7-day arrival prediction |
| `GET` | `/api/v1/stream/signals` | SSE — live signal stream |
| `GET` | `/api/v1/stream/metrics` | SSE — aggregated metrics (every 10s) |
| `WS` | `/ws/dashboard` | WebSocket — live dashboard feed |

## Project Structure

```
pulseai/
├── backend/
│   ├── main.py                # FastAPI app — all endpoints, SSE, WebSocket
│   ├── config.py              # Pydantic Settings (Groq, streaming, cohort config)
│   ├── processing/
│   │   ├── pipeline.py        # Sync + async analysis pipelines
│   │   ├── event_bus.py       # In-memory pub/sub for real-time streaming
│   │   ├── insight_card_builder.py
│   │   └── briefing_generator.py
│   ├── ml/
│   │   ├── groq_client.py     # Singleton Groq client (rate limiting, caching, fallback)
│   │   ├── groq_analyzer.py   # LLM-powered sentiment, topics, pain points, behavior
│   │   ├── customer_predictor.py  # Arrival forecast, RFM scoring, cohort analysis
│   │   ├── anomaly_detector.py    # Isolation Forest anomaly detection
│   │   ├── sentiment.py       # Heuristic + HuggingFace sentiment
│   │   ├── topic_classifier.py
│   │   ├── urgency_scorer.py
│   │   ├── pain_point_ner.py
│   │   ├── churn_predictor.py
│   │   └── clustering.py
│   ├── models/
│   │   ├── customer.py        # Customer, Transaction, RFM, Cohort models
│   │   ├── feedback.py
│   │   ├── insight_card.py
│   │   └── briefing.py
│   ├── ingestion/             # Webhook parsers (Intercom, Zendesk)
│   ├── api/                   # API package layout
│   └── db/, alerts/           # Scaffolded for future use
├── frontend/
│   └── app/
│       ├── page.tsx           # Landing page
│       ├── dashboard/page.tsx # Live dashboard with SSE feed
│       ├── cohorts/page.tsx   # CSV upload, RFM segments, cohort table, forecast
│       ├── layout.tsx         # Root layout with nav
│       └── globals.css        # Tailwind + glass morphism utilities
├── tests/                     # 29 tests — unit/ and integration/
├── setup.sh
├── run.sh
├── Makefile
├── requirements.txt
└── README.md
```

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — platform overview, features, architecture, tech stack, quick start, API reference |
| `/dashboard` | Live dashboard — real-time metrics, sentiment gauge, live signal feed via SSE |
| `/cohorts` | Cohort intelligence — CSV upload, RFM segment breakdown, cohort retention table, 7-day forecast chart, at-risk customer list |

## Testing

```bash
make test
# or
cd backend && python -m pytest ../tests/ -v
```

29 tests covering sentiment, topics, urgency, anomaly detection, insight cards, webhooks, and end-to-end pipeline flows.

## Architecture

```
Feedback → Webhooks/API → Pipeline ─┬─ Groq LLM (sentiment, topics, pain points)
                                     ├─ Heuristic scorers (urgency, anomaly)
                                     └─ Event Bus → SSE/WebSocket → Dashboard

CSV Upload → Customer Predictor ─┬─ RFM Segmentation
                                  ├─ Cohort Retention Analysis
                                  ├─ Arrival Forecasting (numpy)
                                  └─ Behavioral Insights (Groq LLM)
```

The pipeline runs Groq LLM analysis and heuristic scorers in parallel via `asyncio.gather()`. If Groq is unavailable (no API key or rate-limited), results fall back to the heuristic path seamlessly.

## Rate Limit Strategy

Groq free tier allows ~30 requests/minute. PulseAI stays within budget:
- Sliding-window rate limiter: 25 req/min per model
- On 429: automatic fallback from 70B to 8B model
- TTL cache (500 entries, 5-min TTL) absorbs repeated queries
- Customer analysis batches are capped at 10 Groq calls per request
