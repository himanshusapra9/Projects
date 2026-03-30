# Intent-to-Product Discovery Copilot

An AI-powered product recommendation engine that turns vague, natural-language shopping queries into decision-quality recommendations with evidence, tradeoffs, and confidence scores.

Instead of giving you a list, it gives you a **decision**: best pick, alternatives, reasons why, and what to watch out for.

---

## What It Does

Type something like `"quiet vacuum for pet hair"` or `"best smartphone under $500"` and the system will:

1. **Scrape live product data** from Bing Shopping in real-time
2. **Rank and score** products by relevance, rating, price value, and brand trust
3. **Pick the best option** and explain why in plain English
4. **Show alternatives** with badges (Best Value, Premium, Low Risk)
5. **Generate smart refinement chips** based on the product category
6. **Let you refine conversationally** — type follow-ups like "under $300" or "better for travel"
7. **Voice search** — speak your query using the built-in microphone button
8. **Buy for me** — an agentic flow that compares prices, checks availability, verifies return policy, and takes you straight to checkout

---

## Key Features

### Live Product Search
Products are scraped from **Bing Shopping** in real-time using Cheerio for HTML parsing. No stale data, no pre-built catalog. Falls back to DummyJSON when scraping yields too few results.

### Plain-English Explanations
Every best pick comes with structured reasons:
- `"Rated 4.8 out of 5 by 480 buyers — one of the highest-rated options"`
- `"On sale — save $75 (was $679)"`
- `"Made by Samsung — a trusted, well-known brand"`
- `"Supports 5G for faster mobile speeds"`
- `"Ranked #1 out of 8 products we found for 'smartphone'"`

### Dynamic Smart Filters
Filters change based on what you search for:
- Searching for **smartphones** → filters for storage, 5G, brand (Apple, Samsung, Google)
- Searching for **headphones** → filters for noise canceling, style (over-ear, in-ear), brand (Sony, Bose)
- Searching for **laptops** → filters for RAM, brand (Lenovo, Dell, Apple)
- Searching for **shoes** → filters for material, brand (Nike, Adidas, Brooks)

### Voice Search
Click the microphone button and speak. Uses the Web Speech API — no external services. Works on Chrome, Edge, Safari.

### Conversational Follow-Up
Below the results, there's a follow-up input where you can type refinements:
- "under $300"
- "something more portable"
- "better for college students"

The system appends your refinement to the original query and re-searches.

### Agentic "Buy for Me" Flow
Click **Buy for me** on any best pick. A shopping agent walks through:
1. Understanding your needs
2. Comparing prices across stores
3. Checking availability & shipping
4. Verifying return policy
5. Redirecting you to complete the purchase

### Decision Rationale Panel
Every search shows a confidence score (High/Moderate/Low), the ranking strategy used, key factors (relevance, return risk, sentiment, price-to-value), and suggestions for improving results.

### Community Feedback
A sidebar module surfaces community sentiment patterns from public sources, clearly labeled and confidence-aware.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **API** | Next.js API Routes (live search), Express (backend services) |
| **Scraping** | Cheerio (HTML parsing), native fetch |
| **Monorepo** | npm workspaces, Turborepo |
| **Language** | TypeScript (strict mode) |
| **AI/LLM** | Provider-agnostic interface (GPT-4o-mini default) |
| **Ranking** | 16-feature weighted scoring, Maximal Marginal Relevance |
| **Retrieval** | Hybrid BM25 + vector search, Reciprocal Rank Fusion |
| **Database** | PostgreSQL 16 (pgvector), Redis, Elasticsearch 8 |
| **Icons** | Lucide React |

---

## Project Structure

```
discovery-copilot/
├── apps/
│   ├── web/                    # Next.js frontend + live search API
│   │   ├── src/app/
│   │   │   ├── api/search/     # Live product search endpoint (Bing + DummyJSON)
│   │   │   ├── search/         # Search results page
│   │   │   └── page.tsx        # Landing page
│   │   └── src/components/
│   │       ├── BestPickCard    # Top recommendation with reasons
│   │       ├── AlternativeCard # Ranked alternatives
│   │       ├── FilterSidebar   # Dynamic category-aware filters
│   │       ├── DecisionRationale # Confidence & strategy panel
│   │       ├── CommunityFeedback # Public sentiment module
│   │       └── SearchSkeleton  # Loading state
│   └── api/                    # Express backend (services layer)
│       ├── src/routes/         # REST endpoints (query, session, memory, filters, etc.)
│       └── src/services/       # Business logic (retrieval, ranking, memory, reddit, etc.)
├── packages/
│   ├── types/                  # Shared TypeScript interfaces
│   ├── ranking/                # Ranking engine (scorer, features, reranker, confidence)
│   ├── ai/                     # LLM orchestration (intent parser, prompts, guardrails)
│   ├── evals/                  # Test cases, seed data, evaluation datasets
│   ├── ui/                     # Design tokens and utilities
│   ├── config/                 # Shared configuration
│   └── shared/                 # Logger, common utilities
├── docs/                       # Architecture docs and visualizations
├── turbo.json                  # Turborepo pipeline config
├── package.json                # Root workspace config
└── .env.example                # Environment variable template
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.x

### Install & Run

```bash
# Clone the repository
git clone https://github.com/himanshusapra9/Projects.git
cd "Projects/Intent-to-Product Discovery Copilot/discovery-copilot"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app starts at **http://localhost:3000**.

No API keys, databases, or external services are required for the core search experience. The live search scrapes Bing Shopping directly and falls back to DummyJSON.

### Optional: Full Backend Stack

For the complete backend with LLM-powered intent parsing, memory, and behavior learning:

```bash
# Copy and configure environment variables
cp .env.example .env

# Required services:
# - PostgreSQL 16 with pgvector extension
# - Redis
# - Elasticsearch 8
# - OpenAI API key (or compatible LLM provider)

# Start all services
npm run dev
```

---

## API Reference

### `GET /api/search?q={query}`

Live product search endpoint. Scrapes Bing Shopping and/or DummyJSON.

**Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (e.g., "wireless headphones") |

**Response:**
```json
{
  "query": "wireless headphones",
  "products": [
    {
      "rank": 1,
      "name": "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
      "brand": "Sony",
      "price": 278,
      "originalPrice": 399,
      "rating": 4.7,
      "reviewCount": 2841,
      "imageUrl": "https://th.bing.com/...",
      "productUrl": "https://www.bing.com/aclick?...",
      "headline": "Available from Best Buy",
      "badge": "Best Pick",
      "reasons": [
        "Rated 4.7 out of 5 by 2,841 buyers — one of the highest-rated options",
        "On sale — save $121 (was $399)",
        "Made by Sony — a trusted, well-known brand",
        "Has noise canceling for distraction-free use",
        "Ranked #1 out of 12 products we found for 'wireless headphones'"
      ]
    }
  ],
  "totalEvaluated": 12,
  "source": "bing_shopping",
  "timestamp": "2026-03-30T..."
}
```

**Badge types:** `Best Pick`, `Best Value`, `Premium`, `Low Risk`

---

## How the Search Works

```
User query
    │
    ▼
┌─────────────────────────┐
│ 1. Scrape Bing Shopping │  Real-time HTML fetch + Cheerio parsing
│    (primary source)     │  Extracts: name, price, image, rating, seller
└───────────┬─────────────┘
            │ < 3 results?
            ▼
┌─────────────────────────┐
│ 2. DummyJSON fallback   │  REST API with relevance filtering
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 3. Deduplicate          │  Normalized names, prefix matching, image dedup
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 4. Score & Sort         │  Query relevance score + rating
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 5. Generate Reasons     │  Rating, price, brand, features, rank
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 6. Assign Badges        │  Best Pick → Best Value → Premium → Low Risk
└───────────┬─────────────┘
            │
            ▼
        JSON response
```

---

## Design Decisions

**Why scrape Bing Shopping?** Google Shopping blocks most scrapers with JavaScript rendering walls. Bing returns server-rendered HTML that Cheerio can parse reliably.

**Why DummyJSON as fallback?** It's a free, rate-limit-friendly product API that ensures the app always returns something useful, even when Bing is temporarily unavailable.

**Why plain-English reasons instead of scores?** Users don't care that a product scored 8.7/10 on an internal metric. They care that it's "rated 4.8 stars by 480 buyers" and "on sale for $75 off." Every reason maps directly to something the user can verify.

**Why no chatbot UI?** Chat interfaces create friction — they force turn-taking. This system gives you the answer immediately with refinement options alongside it. The conversational follow-up input is available but optional.

**Why CSS animations instead of Framer Motion?** Framer Motion caused hydration issues with Next.js 15 / React 19, leaving elements invisible at `opacity: 0`. Simple CSS keyframes (`fade-up`, `fade-in`) are more reliable and lighter.

---

## Architecture (Full Stack)

The full production architecture supports:

- **13-stage AI reasoning pipeline** for intent parsing, retrieval, ranking, and explanation
- **Behavior learning** — tracks impressions, clicks, saves, dismissals, purchases, returns
- **Memory system** — remembers preferences, dislikes, budget tendencies across sessions
- **Relational reasoning** — identifies substitutes, upgrades, complements, tradeoff paths
- **Reddit enrichment** — supplemental community sentiment (clearly labeled, confidence-aware)
- **Multi-tenant** — each merchant gets isolated config, memory, and analytics
- **Hybrid retrieval** — BM25 lexical + vector semantic search with Reciprocal Rank Fusion

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full technical specification.

---

## Business Models

| Mode | Description |
|---|---|
| **API / SDK** | Embed recommendations into any store. Full control over UI. |
| **Hosted Search** | Drop-in search page with merchant branding. Deploy in a day. |

Works with Shopify, BigCommerce, custom stores, and any product catalog (JSON feed, CSV, or native integration).

---

## Scripts

```bash
npm run dev         # Start all services (Turborepo)
npm run build       # Build all packages and apps
npm run lint        # Lint all packages
npm run test        # Run all test suites
npm run typecheck   # TypeScript type checking
```

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Description | Required for live search? |
|---|---|---|
| `LLM_API_KEY` | OpenAI (or compatible) API key | No |
| `DB_HOST` | PostgreSQL connection | No |
| `REDIS_HOST` | Redis connection | No |
| `SEARCH_HOST` | Elasticsearch URL | No |

The live search feature (Bing Shopping scraping) works with **zero configuration** — no API keys or databases needed.

---

## License

MIT
