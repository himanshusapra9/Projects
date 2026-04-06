# Intent-to-Product Discovery Copilot

**Intent-to-Product Discovery Copilot** is AI-powered natural language product search that understands user intent and delivers personalized recommendations—turning vague shopping questions into ranked picks with explanations, alternatives, and confidence signals.

---

## Features

- **Natural language search** — Ask in plain English; the system parses intent and retrieves relevant products.
- **Intent understanding** — LLM-backed parsing, clarification flows, and guardrails (see `packages/ai`).
- **Product ranking with AI reranking** — Scoring, reranking, and confidence in `packages/ranking` and the API pipeline.
- **Behavior tracking** — Impressions, clicks, and related signals via `/api/v1/behavior` and `apps/api` services.
- **Session memory** — Sessions and memory endpoints for continuity across turns (`/api/v1/sessions`, `/api/v1/memory`).

The **web** app also exposes **live product search** via Next.js (`GET /api/search`) with scraping and fallback catalog behavior. The **Express** API hosts the full orchestration surface (`/api/v1/*`).

---

## Tech Stack

| Area | Stack |
|------|--------|
| **Monorepo** | [Turborepo](https://turbo.build/) + **npm workspaces** (`apps/*`, `packages/*`) |
| **Web** | **Next.js 15**, **React 19**, **Tailwind CSS** |
| **API** | **Express**, **TypeScript** (`apps/api`) |
| **Packages** | **AI** orchestration (`packages/ai`), **ranking** (`packages/ranking`), **shared types** (`packages/types`), plus `config`, `evals`, `shared`, `ui` |

---

## Prerequisites

- **Node.js 18+** (`setup.sh` checks for Node 18+; root `package.json` `engines` recommend **Node ≥ 20**)
- **npm** (workspace uses npm; see `packageManager` in root `package.json`)

Optional for the full backend: PostgreSQL, Redis, Elasticsearch, and an LLM key—see [Environment variables](#environment-variables).

---

## Quick Start

**Option A — scripted setup**

```bash
./setup.sh
```

This verifies Node, runs `npm install`, and copies `.env.example` → `.env` if `.env` is missing.

**Option B — manual**

```bash
npm install
npm run dev
```

Typical URLs:

- **Web:** http://localhost:3000  
- **API:** http://localhost:3001 (default `PORT` in `.env`; see `.env.example`)

---

## Environment Variables

Copy and edit from the template:

```bash
cp .env.example .env
```

See **[`.env.example`](.env.example)** for all variables. For LLM features, set at least:

| Variable | Purpose |
|----------|---------|
| `LLM_API_KEY` | API key for the configured LLM provider (e.g. OpenAI-compatible) |

Other entries cover database, Redis, search, feature flags, and CORS (`ALLOWED_ORIGINS`).

---

## Project Structure

```
discovery-copilot/
├── apps/
│   ├── web/                 # Next.js 15 frontend + e.g. GET /api/search
│   └── api/                 # Express API (TypeScript)
├── packages/
│   ├── ai/                  # LLM orchestration, prompts, intent
│   ├── ranking/             # Scoring, reranking, confidence
│   ├── types/               # Shared TypeScript types
│   ├── config/              # Shared configuration
│   ├── evals/               # Evaluations / seed data
│   ├── shared/              # Logger, utilities
│   └── ui/                  # Design tokens / UI helpers
├── docs/                    # Architecture and docs
├── setup.sh
├── turbo.json
├── package.json             # Workspaces + root scripts
└── .env.example
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run all apps/packages in dev mode (Turborepo) |
| `npm run build` | Build all packages and apps |
| `npm run typecheck` | TypeScript check across the monorepo |
| `npm run lint` | Lint all packages |
| `npm run test` | Run tests (where configured) |

---

## API

### Express API (`apps/api`, default port `3001`)

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Liveness: `{ status, version, timestamp }` |
| `/api/v1/sessions` | **Session routes** — e.g. `POST /` (start session), `GET /:sessionId` |
| `/api/v1/query` | **Search / query routes** — e.g. `POST /` (submit query), `POST /clarification` |

Additional namespaces under `/api/v1/`: `decide`, `feedback`, `memory`, `tenants`, `admin`, `filters`, `behavior`, `reddit`.

### Next.js web (`apps/web`)

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=...` | Live product search (Bing + fallback); returns ranked products and reasons |

---

## Documentation

For deeper architecture (pipelines, retrieval, full stack), see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## License

MIT
