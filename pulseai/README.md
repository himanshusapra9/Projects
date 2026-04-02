# PulseAI — Customer Signal Intelligence Agent

PulseAI processes customer feedback from 10+ platforms, classifies signals using ML,
clusters insights, detects anomalies, and generates daily product briefings.

## Features

- Multi-platform ingestion (Intercom, Zendesk, Slack, Reddit, App Store, etc.)
- Sentiment analysis (RoBERTa), zero-shot topic classification (BART-MNLI)
- Pain point NER with rule-based pattern matching
- Urgency scoring with feature-weighted model
- Insight Card clustering (BERTopic)
- Anomaly detection on sentiment time series (Isolation Forest)
- Daily AI briefings via Claude

## Setup

```bash
make install
cp .env.example .env
# Edit .env with API keys
make test
make dev
```
