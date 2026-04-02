# PulseAI — Customer Signal Intelligence Agent

> Ingests customer feedback from Intercom, Zendesk & more — classifies sentiment, detects pain points, scores urgency, clusters insights, and flags anomalies with Isolation Forest.

PulseAI processes customer feedback from multiple platforms, classifies signals by
topic and urgency, clusters related feedback into Insight Cards, detects anomalies
in sentiment metrics, and generates daily product briefings.

## What's Implemented

### Ingestion Layer

| Connector | Status | Method |
|-----------|--------|--------|
| Intercom webhooks | **Real** parser | Extracts feedback from Intercom conversation payloads |
| Zendesk webhooks | **Real** parser | Extracts feedback from Zendesk ticket payloads |
| Slack, Reddit, Twitter, App Store, Google Play | **Scaffolded** (connector dirs exist, no implementation) | — |

### ML Pipeline (keyword/heuristic — production HF models available but not wired in)

| Module | What it does | Algorithm |
|--------|-------------|-----------|
| **Sentiment analysis** | Classifies text as positive/negative/neutral | **Active path**: keyword matching (`analyze_sentiment_mock`). **Available but unused**: cardiffnlp/twitter-roberta-base-sentiment-latest (HuggingFace transformers) |
| **Topic classification** | Assigns feedback to 14 topic categories | **Active path**: keyword matching against topic→keyword map (`classify_topics_mock`). **Available but unused**: facebook/bart-large-mnli zero-shot classification |
| **Pain point NER** | Detects bug reports, feature requests, churn signals, pricing complaints, competitor mentions | Rule-based keyword pattern matching (5 categories, 8+ keywords each) |
| **Urgency scoring** | Scores feedback urgency 0-10 | Weighted linear model on 5 features (sentiment, caps ratio, exclamation count, churn keywords, text length) — fixed weights, not trained |
| **Anomaly detection** | Detects spikes in negative sentiment or volume | sklearn IsolationForest (contamination=0.05) — real, tested |
| **Churn prediction** | Estimates churn probability per customer | Logistic function with hand-set weights (not a trained LightGBM model) |
| **Insight Card clustering** | Groups feedback by topic into actionable cards | Topic-based grouping with signal strength scoring (not BERTopic — simple dict aggregation) |

### Processing Pipeline

- `pipeline.py` — Runs each `FeedbackItem` through sentiment → topics → pain points → urgency scoring
- `insight_card_builder.py` — Groups processed feedback by topic, computes aggregate stats, generates InsightCards sorted by signal strength
- `briefing_generator.py` — Generates a structured daily briefing from InsightCards (template-based, not Claude)

### API (FastAPI — stub endpoints)

- `POST /api/v1/webhooks/{platform}` — Accepts webhook payloads (returns acknowledgment, no processing)
- `GET /api/v1/insights` — Returns empty list (not connected to pipeline)
- `GET /api/v1/briefing/{date}` — Returns placeholder text
- `GET /health` — Health check

### Frontend (Next.js 14 placeholder)

- Dashboard landing with Insight Cards, Daily Briefing, and Roadmap Priority panels

### What's Available But Not Wired In

- **HuggingFace sentiment** (cardiffnlp/twitter-roberta-base-sentiment-latest) — real pipeline in `sentiment.py`, not used by `pipeline.py`
- **HuggingFace zero-shot topics** (facebook/bart-large-mnli) — real pipeline in `topic_classifier.py`, not used by `pipeline.py`
- **Claude daily briefing** — mentioned in spec, not implemented (uses template generator)
- **BERTopic clustering** — listed in requirements, not used in code
- **Celery workers, PostgreSQL** — in requirements/docker-compose, no backend usage

### Tests (29 passing)

- Sentiment mock: positive/negative/neutral classification
- Topic classification: billing, performance, security, mobile detection
- Urgency scoring: high urgency (negative + churn), low urgency (neutral), bounds clamping
- Anomaly detection: Isolation Forest on normal vs 3σ spike data
- Insight Card builder: clustering, min cluster size filtering, signal strength scaling
- Webhook parsing: Intercom + Zendesk payload extraction
- Full pipeline: 50 mock feedback items → processed → cards generated → briefing non-empty

## Setup

```bash
cd pulseai
python -m venv .venv && source .venv/bin/activate
make install
cp .env.example .env
make test
```
