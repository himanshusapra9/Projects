# OSINT Dashboard — Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Data Sources](#3-data-sources)
4. [Backend API Reference](#4-backend-api-reference)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Analysis Engine](#6-analysis-engine)
7. [Export Capabilities](#7-export-capabilities)
8. [Responsive Design](#8-responsive-design)
9. [Setup & Deployment](#9-setup--deployment)
10. [Configuration](#10-configuration)
11. [Performance & Caching](#11-performance--caching)
12. [Security Considerations](#12-security-considerations)

---

## 1. Project Overview

**OSINT Dashboard** (Open Source Intelligence Dashboard) is a real-time, multi-source intelligence platform that aggregates, analyzes, and visualizes public data from major open-source communities. It provides decision-makers with actionable insights by combining content from Reddit, Hacker News, Lobsters, and DEV.to into a single, searchable dashboard with sentiment analysis, cohort tracking, and exportable reports.

### Key Capabilities

| Capability | Description |
|---|---|
| **Multi-Source Search** | Query 4 platforms simultaneously with unified results |
| **Sentiment Analysis** | NLP-powered polarity, subjectivity, and label classification |
| **Keyword Extraction** | Automatic topic tagging with frequency-weighted keywords |
| **Cohort Analysis** | Author behavior tracking: repeat rates, influence scores |
| **Engagement Metrics** | Score distributions, comment ratios, engagement totals |
| **Timeline Analysis** | Day-by-day activity and sentiment trends |
| **Report Generation** | CSV and PDF export with executive summaries |
| **Responsive UI** | Works on desktop, tablet, and mobile devices |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ index.html│  │ style.css│  │      app.js       │ │
│  │  (Layout) │  │  (Theme) │  │ (State + Render)  │ │
│  └──────────┘  └──────────┘  └───────────────────┘ │
│                       │                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Chart.js  │  │   jsPDF    │  │  AutoTable   │  │
│  │  (Charts)  │  │   (PDF)    │  │  (PDF Tables)│  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP (fetch)
┌───────────────────────┴─────────────────────────────┐
│                 FastAPI Server (app.py)               │
│                                                       │
│  ┌─────────┐  ┌───────────┐  ┌────────────────────┐ │
│  │  Routes  │  │  Caching  │  │  NLP (TextBlob)    │ │
│  │ /api/*   │  │ In-Memory │  │ Sentiment + Keywords│ │
│  └────┬────┘  └───────────┘  └────────────────────┘ │
│       │                                               │
│  ┌────┴──────────────────────────────────────────┐   │
│  │           Source Adapters (async)              │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │   │
│  │  │ Reddit │ │Hacker  │ │Lobsters│ │ DEV.to │ │   │
│  │  │  API   │ │News API│ │  API   │ │  API   │ │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Python 3.9+ | Server language |
| Framework | FastAPI 0.115 | Async REST API framework |
| HTTP Client | httpx 0.28 | Async HTTP requests to external APIs |
| NLP | TextBlob 0.18 | Sentiment analysis and text processing |
| Frontend | Vanilla JS (ES2020) | No framework dependency, fast loading |
| Charts | Chart.js 4.4 | Interactive data visualizations |
| PDF | jsPDF 2.5 + AutoTable 3.8 | Client-side PDF report generation |
| Styling | Custom CSS (CSS Variables) | Dark theme with responsive breakpoints |

---

## 3. Data Sources

### 3.1 Reddit

- **API**: Public JSON API (append `.json` to any Reddit URL)
- **Auth**: None required for read-only access
- **Endpoints used**:
  - `/search.json` — full-text search
  - `/r/{subreddit}/{sort}.json` — subreddit browsing
  - `/r/{subreddit}/search.json` — scoped search
  - `{permalink}.json` — post detail with comments
- **Rate Limits**: ~60 requests/minute without auth
- **Data fields**: title, selftext, author, score, upvote_ratio, num_comments, permalink, created_utc, link_flair_text, preview images

### 3.2 Hacker News

- **API**: Algolia Search API + Firebase Realtime API
- **Auth**: None required
- **Endpoints used**:
  - `hn.algolia.com/api/v1/search` — relevance search
  - `hn.algolia.com/api/v1/search_by_date` — date-sorted search
  - `hacker-news.firebaseio.com/v0/topstories.json` — front page IDs
  - `hacker-news.firebaseio.com/v0/item/{id}.json` — individual story
- **Supports**: Numeric date filtering via `numericFilters`
- **Data fields**: title, author, points, num_comments, url, created_at_i, story_text

### 3.3 Lobsters

- **API**: Public JSON API
- **Auth**: None required
- **Endpoints used**:
  - `lobste.rs/search.json` — full-text search
  - `lobste.rs/hottest.json` — trending stories
- **Data fields**: title, short_id, score, comment_count, url, created_at, tags, submitter_user, description

### 3.4 DEV.to

- **API**: Public REST API (Forem)
- **Auth**: None required for public articles
- **Endpoints used**:
  - `dev.to/api/articles?tag={query}` — tag-based search
  - `dev.to/api/articles/latest` — latest articles
- **Data fields**: title, description, user.username, public_reactions_count, comments_count, url, published_at, cover_image, tag_list

---

## 4. Backend API Reference

### `GET /api/search`

Unified multi-source search.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | string | **required** | Search query |
| `sources` | string | `reddit,hackernews,lobsters,devto` | Comma-separated source list |
| `subreddit` | string | `all` | Reddit subreddit filter |
| `sort` | string | `relevance` | Sort order: relevance, hot, top, new |
| `time_filter` | string | `week` | Time range: hour, day, week, month, year, all |
| `date_from` | string | null | Custom start date (YYYY-MM-DD) |
| `date_to` | string | null | Custom end date (YYYY-MM-DD) |
| `limit` | int | 25 | Results per source (1–100) |
| `after` | string | null | Reddit pagination cursor |
| `page` | int | 0 | Page offset for HN/Lobsters/DEV.to |

**Response**: `{ posts: [...], after, next_page, count, query, sources }`

### `GET /api/subreddit/{name}`

Browse a specific subreddit.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `sort` | string | `hot` | Sort: hot, new, top, rising |
| `time_filter` | string | `day` | For "top" sort |
| `limit` | int | 25 | Results (1–100) |
| `after` | string | null | Pagination cursor |

### `GET /api/trending`

Aggregate trending posts from all sources.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subreddits` | string | `technology,programming,...` | Comma-separated Reddit subs |
| `limit` | int | 10 | Posts per source (1–25) |
| `include_hn` | bool | true | Include Hacker News |
| `include_lobsters` | bool | true | Include Lobsters |
| `include_devto` | bool | true | Include DEV.to |

### `GET /api/insights`

Heavy analysis endpoint with full cohort, engagement, and keyword analytics.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | string | **required** | Topic to analyze |
| `sources` | string | `reddit,hackernews,lobsters,devto` | Data sources |
| `date_from` | string | null | Start date |
| `date_to` | string | null | End date |
| `subreddit` | string | `all` | Reddit subreddit scope |

**Response includes**:
- `insights.total_posts`, `unique_authors`, `repeat_authors`
- `insights.sentiment_distribution` (positive/neutral/negative counts + percentages)
- `insights.source_distribution` (posts per platform)
- `insights.top_authors` (top 15 by post count with percentages)
- `insights.influencers` (top 10 by total score)
- `insights.avg_score`, `median_score`, `max_score`, `avg_comments`, `total_engagement`
- `insights.top_keywords` (top 20 with frequency)
- `insights.timeline` (day-by-day posts, avg_score, avg_sentiment)
- `insights.channel_distribution` (posts per subreddit/source)
- `insights.score_distribution` (histogram buckets)
- `posts` (full list of analyzed posts)

### `GET /api/analyze`

Deep analysis of a single Reddit post including comments.

| Parameter | Type | Description |
|---|---|---|
| `url` | string | Full Reddit post URL |

---

## 5. Frontend Architecture

### Views

| View | Tab | Description |
|---|---|---|
| **Search** | Default | Multi-source search with filters, grid/list toggle |
| **Trending** | Tab 2 | Aggregated hot posts from all platforms |
| **Analysis** | Tab 3 | Deep analysis dashboard with charts and export |
| **Browse** | Tab 4 | Single subreddit browser |

### State Management

All state is held in a single `state` object within an IIFE closure:
- `searchPosts`, `searchAfter`, `searchPage` — search pagination
- `browsePosts`, `browseAfter` — browse pagination
- `layout` — grid or list view
- `analysisCharts` — Chart.js instances (destroyed on re-run)
- `analysisData` — cached analysis response for export

### Post Card Rendering

Every post from every source is normalized to a common shape and rendered as a card with:
- Source badge (color-coded per platform)
- Subreddit/channel label
- Title + excerpt
- Preview image (if available)
- Score, comments, time ago
- Sentiment badge
- Keyword tags

---

## 6. Analysis Engine

### Sentiment Analysis (TextBlob)

Each post's title + body text is analyzed via TextBlob:

- **Polarity**: Range [-1.0, 1.0] — negative to positive
- **Subjectivity**: Range [0.0, 1.0] — objective to subjective
- **Label**: `positive` (polarity > 0.1), `negative` (< -0.1), `neutral`

### Keyword Extraction

1. Tokenize text into words (4+ characters, alphabetic only)
2. Remove stop words (custom list of 40+ common English words)
3. Count frequency of remaining words
4. Return top 5 by frequency per post, top 20 aggregate

### Cohort Analysis

The `/api/insights` endpoint computes:

- **Author frequency**: How many times each author appears
- **Repeat rate**: % of authors who posted more than once
- **Influencer ranking**: Authors sorted by total score across all posts
- **Per-author metrics**: total_score, total_comments, post_count, avg_score

### Timeline Bucketing

Posts are grouped by UTC date into day buckets with aggregated:
- Post count per day
- Average score per day
- Average sentiment polarity per day

---

## 7. Export Capabilities

### CSV Export

Downloads a structured CSV file with BOM header for Excel compatibility:

1. Report header (query, timestamp)
2. Key Metrics table
3. Sentiment Distribution
4. Source Distribution
5. Top Authors
6. Top Influencers
7. Top Keywords
8. Channel Breakdown
9. Timeline
10. Full post listing (12 columns per post)

### PDF Report

Generates a multi-page A4 PDF using jsPDF + AutoTable with:

1. **Cover header** — purple banner with query and generation timestamp
2. **Executive Summary** — auto-generated paragraph analyzing key findings
3. **Key Metrics** — 10-row table
4. **Sentiment Distribution** — color-coded table
5. **Source Distribution** — platform breakdown
6. **Top Keywords** — frequency table
7. **Top Authors** — cohort table with percentages
8. **Top Influencers** — ranked by total score
9. **Channel Breakdown** — subreddit/source split
10. **Activity Timeline** — day-by-day table
11. **All Posts** — comprehensive post listing
12. **Page footers** — query name, page numbers, timestamp

---

## 8. Responsive Design

The UI adapts to four breakpoints:

| Breakpoint | Target | Key Adaptations |
|---|---|---|
| > 1024px | Desktop | Full 2-column chart layout, wide grid |
| 768–1024px | Tablet landscape | Single-column charts, narrower grid |
| 480–768px | Tablet portrait | Stacked search bar, single-column posts, scrollable nav, horizontal table scroll |
| < 480px | Mobile | 2-column KPI grid, full-width buttons, stacked filters, compact cards |

Additional touch-device optimizations:
- Disabled hover transforms (no jarring animation on tap)
- `-webkit-tap-highlight-color: transparent` on interactive elements
- `-webkit-overflow-scrolling: touch` on scrollable regions
- Horizontally scrollable tables with `overflow-x: auto`

---

## 9. Setup & Deployment

### Prerequisites

- Python 3.9+
- pip
- Internet connection (for external API calls)

### Installation

```bash
git clone https://github.com/himanshusapra9/Projects.git
cd Projects/reddit-dashboard

python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
python -m textblob.download_corpora
```

### Running

```bash
python app.py
# Server starts at http://localhost:8000
```

### Production Deployment

For production, use a process manager and reverse proxy:

```bash
# With gunicorn + uvicorn workers
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 10. Configuration

Key constants in `app.py`:

| Constant | Default | Description |
|---|---|---|
| `CACHE_TTL` | 300 (5 min) | In-memory cache duration in seconds |
| `USER_AGENT` | `OpenSourceDashboard/2.0` | HTTP User-Agent header |
| `STOP_WORDS` | Set of 40+ words | Words excluded from keyword extraction |
| Cache max size | 500 entries | LRU-style eviction when exceeded |

---

## 11. Performance & Caching

- **Async I/O**: All external API calls use `asyncio.gather` for parallel execution
- **In-memory cache**: MD5-keyed, 5-minute TTL, max 500 entries with LRU eviction
- **Client-side rendering**: Chart.js and post cards render in the browser, minimizing server load
- **Lazy loading**: Images use `loading="lazy"` and `onerror` fallbacks
- **CDN assets**: Chart.js, jsPDF, and fonts load from CDNs

---

## 12. Security Considerations

- **No authentication stored**: All APIs used are public, read-only
- **No database**: No persistent data storage; all data is ephemeral
- **HTML escaping**: All user-generated content is escaped via `textContent` assignment before insertion
- **CORS**: FastAPI defaults (same-origin); configure `CORSMiddleware` if deploying frontend separately
- **Rate limiting**: Reddit enforces ~60 req/min; caching mitigates this. HN Algolia has generous limits
- **No secrets**: No API keys, tokens, or credentials required
