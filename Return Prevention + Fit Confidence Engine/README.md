# Return Prevention + Fit Confidence Engine

**Return Prevention + Fit Confidence Engine** is an AI-powered system that predicts return likelihood and provides fit confidence scores so shoppers can choose variants with clearer expectations—helping merchants reduce preventable e-commerce returns.

## Features

- **Return risk prediction** — Score how likely a purchase is to result in a preventable return given product, variant, and shopper context.
- **Fit confidence assessment** — Quantified confidence that a selected size or variant matches the shopper’s intent.
- **Product recommendations** — Ranked suggestions and alternatives when the primary choice is uncertain or higher risk.
- **Size guidance** — Size and variant recommendations informed by catalog structure and fit signals.
- **Review analysis** — Signals derived from review text to complement structured product data.

## Tech stack

| Area | Technologies |
|------|----------------|
| **Monorepo** | [Turborepo](https://turbo.build/) with **npm workspaces** |
| **Web** | [Next.js 14](https://nextjs.org/), [React 18](https://react.dev/) |
| **API** | [NestJS 10](https://nestjs.com/), TypeScript |
| **Shared packages** | `scoring`, `reviews`, `retrieval`, `memory`, `ai`, `types` (plus workspace utilities such as `config`, `ui`, `shared`, `evals`) |

## Prerequisites

- **Node.js 18+** (LTS recommended)

## Quick start

**Option A — scripted setup**

```bash
./setup.sh
```

The script runs `npm install`, copies `.env` from `.env.example` when missing, and prints local URLs for the API and web app.

**Option B — manual**

```bash
npm install && npx turbo build && npm run dev
```

- **Web:** [http://localhost:3000](http://localhost:3000)  
- **API:** [http://localhost:3001](http://localhost:3001) (global route prefix `/api/v1`)

For the NestJS server, copy `apps/api/.env.example` to `apps/api/.env` and adjust values as needed.

## Environment variables

- **Root template:** [.env.example](.env.example) — database URLs, LLM keys, `NEXT_PUBLIC_*` client settings, and other shared configuration. Copy to `.env` at the repository root.
- **API server:** [apps/api/.env.example](apps/api/.env.example) — `PORT`, `DATABASE_URL`, `REDIS_URL`, `API_KEYS_JSON`, CORS, and related server settings. Copy to `apps/api/.env`.

**Development:** To call the API without sending `x-api-key`, set `SKIP_API_KEY=true` in `apps/api/.env` (see [apps/api/src/middleware/tenant.middleware.ts](apps/api/src/middleware/tenant.middleware.ts)). Alternatively, align `NEXT_PUBLIC_API_KEY` with a key defined in `API_KEYS_JSON`, as noted in `setup.sh`.

## Project structure

```text
apps/
  web/          # Next.js storefront / dashboard
  api/          # NestJS HTTP API (prefix /api/v1)
packages/
  scoring/      # Fit and return-risk scoring logic
  reviews/      # Review-derived signals
  retrieval/    # Retrieval helpers
  memory/       # Preference / session memory
  ai/           # LLM and AI utilities
  types/        # Shared TypeScript types
  …             # config, ui, shared, evals, etc.
```

## API

| Resource | Method | Path |
|----------|--------|------|
| Recommendations | `POST` | `/api/v1/recommend` |
| Fit confidence | `POST` | `/api/v1/fit-confidence` |

**OpenAPI / Swagger UI:** [http://localhost:3001/docs](http://localhost:3001/docs) (served at `/docs`, outside the `/api/v1` prefix)

Additional routes (e.g. return risk, size recommendation, alternatives, memory, behavior) are listed in the Swagger document and under `apps/api/src/routes/`.

---

Send API requests with the `x-api-key` header unless `SKIP_API_KEY=true` is enabled in development.
