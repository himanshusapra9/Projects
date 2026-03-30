# OSINT Dashboard — Open Source Intelligence

A real-time, multi-source intelligence platform that aggregates, analyzes, and visualizes public data from Reddit, Hacker News, Lobsters, and DEV.to. Built with Python FastAPI and vanilla JavaScript.

![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Multi-Source Search** — Query Reddit, Hacker News, Lobsters, and DEV.to simultaneously
- **Custom Date Ranges** — Use preset time filters or pick exact dates
- **Sentiment Analysis** — NLP-powered polarity, subjectivity, and sentiment classification via TextBlob
- **Keyword Extraction** — Automatic topic tagging with frequency-weighted keywords
- **Trending View** — Aggregates hot posts from all four platforms, sorted by score
- **Data Analysis Dashboard** — Deep-dive insights including:
  - KPI cards (total posts, unique authors, repeat authors, engagement metrics)
  - Sentiment distribution (doughnut chart)
  - Source distribution (bar chart)
  - Activity timeline with sentiment overlay (line chart)
  - Channel/subreddit breakdown (bar chart)
  - Top keywords cloud
  - Cohort analysis tables (top authors, influencers)
- **Export Reports** — Download analysis as CSV or styled PDF with executive summary
- **Post Detail Modal** — Full analysis per post; Reddit posts include comment-level sentiment
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcut** — Press `/` to jump to search from anywhere

## Data Sources

| Source | API | Auth Required | Rate Limit |
|--------|-----|:---:|---|
| Reddit | Public JSON API (`reddit.com/*.json`) | No | ~60 req/min |
| Hacker News | Algolia Search + Firebase API | No | Generous |
| Lobsters | Public JSON API (`lobste.rs/*.json`) | No | Moderate |
| DEV.to | Public REST API (`dev.to/api`) | No | Generous |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/himanshusapra9/Projects.git
cd Projects/reddit-dashboard

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
python -m textblob.download_corpora

# Run the server
python app.py
```

Open **http://localhost:8000** in your browser.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.9+, FastAPI | Async REST API server |
| HTTP Client | httpx | Parallel async API calls |
| NLP | TextBlob | Sentiment analysis & keyword extraction |
| Frontend | Vanilla JS (ES2020) | UI rendering & state management |
| Charts | Chart.js 4.4 | Interactive data visualizations |
| PDF Export | jsPDF + AutoTable | Client-side PDF report generation |
| Styling | CSS Variables + Flexbox/Grid | Dark theme, responsive layout |

## Project Structure

```
reddit-dashboard/
├── app.py                  # FastAPI backend (routes, data fetching, NLP, caching)
├── requirements.txt        # Python dependencies
├── README.md               # This file
├── DOCUMENTATION.md        # Full technical documentation
└── static/
    ├── index.html          # Main HTML layout
    ├── style.css           # Dark theme + responsive styles
    └── app.js              # Frontend logic (state, rendering, charts, export)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | GET | Multi-source search with filters |
| `/api/subreddit/{name}` | GET | Browse a specific subreddit |
| `/api/trending` | GET | Aggregate trending posts |
| `/api/insights` | GET | Full analysis with cohort, engagement, and keyword metrics |
| `/api/analyze` | GET | Deep analysis of a single Reddit post with comments |

For full API documentation, see [DOCUMENTATION.md](DOCUMENTATION.md).

## Architecture

```
Browser (Vanilla JS + Chart.js + jsPDF)
    │
    │ HTTP fetch
    ▼
FastAPI Server (async)
    │
    ├── In-Memory Cache (5-min TTL)
    ├── TextBlob NLP Engine
    │
    └── Parallel API Clients ──► Reddit / HN / Lobsters / DEV.to
```

## License

MIT
