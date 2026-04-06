# AI OSINT Dashboard

**AI-powered Open Source Intelligence dashboard** that aggregates public discussions from **Reddit**, **Hacker News**, **Lobsters**, and **DEV.to** in one place—with search, sentiment analysis, trending feeds, and exportable analytics.

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Multi-source search** — Query all four platforms at once with filters, pagination, and unified post cards
- **Date ranges** — Preset time windows or custom `date_from` / `date_to`
- **Sentiment & keywords** — TextBlob polarity, subjectivity, labels, and frequency-weighted keywords
- **Trending** — Hot posts merged across sources, sorted by engagement
- **Analysis dashboard** — KPIs, sentiment/source charts (Chart.js), timelines, channel breakdown, cohort tables, keyword cloud
- **Exports** — CSV and styled PDF reports (client-side jsPDF + AutoTable)
- **Post detail** — Deep dive per post; Reddit includes comment-level sentiment
- **Responsive UI** — Vanilla JS; works on desktop, tablet, and mobile
- **Keyboard shortcut** — Press `/` to focus search

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, **FastAPI**, **Uvicorn** |
| HTTP | **httpx** (async) |
| NLP | **TextBlob** |
| Frontend | **Vanilla JavaScript** (ES modules), HTML, CSS |
| Charts | **Chart.js** |
| PDF | jsPDF + AutoTable (browser) |

## Prerequisites

- **Python 3.8+**
- `pip`
- Network access (calls public APIs; no API keys required)

## Quick Start

### Option A — one command

From the **AI OSINT Dashboard** project directory:

```bash
chmod +x run.sh   # first time only
./run.sh
```

This creates a `venv/` if missing, installs dependencies, and starts the app with Uvicorn on **http://localhost:8000**. If TextBlob needs NLTK data on first use, run `python -m textblob.download_corpora` once inside the activated `venv`.

### Option B — manual setup

```bash
cd "/path/to/AI OSINT Dashboard"

python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements.txt
python -m textblob.download_corpora

python -m uvicorn app:app --host 0.0.0.0 --port 8000
# or: python app.py
```

Open **http://localhost:8000** in your browser.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | GET | Multi-source search (`q`, `sources`, filters, pagination) |
| `/api/subreddit/{name}` | GET | Browse a subreddit |
| `/api/trending` | GET | Aggregated trending posts across sources |
| `/api/insights` | GET | Full analytics for a topic (`q` required) |
| `/api/analyze` | GET | Single Reddit post + comments analysis (`url`) |

Interactive OpenAPI docs: **http://localhost:8000/docs** (FastAPI default).

Details and parameters: [DOCUMENTATION.md](DOCUMENTATION.md).

## Project Structure

```
AI OSINT Dashboard/
├── app.py              # FastAPI app: routes, adapters, NLP, cache
├── requirements.txt    # Python dependencies
├── run.sh              # Optional: venv + install + uvicorn
├── README.md
├── DOCUMENTATION.md    # Deep dive: APIs, UI, analysis, deployment
└── static/
    ├── index.html
    ├── style.css
    └── app.js
```

## Configuration

**No environment variables or `.env` files are required.** The app uses public endpoints only and runs out of the box after install. Tunables (cache TTL, user agent, stop words) live as constants in `app.py`; see [DOCUMENTATION.md](DOCUMENTATION.md#10-configuration).

## License

MIT
