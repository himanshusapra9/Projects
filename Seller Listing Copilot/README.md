# ListingPilot AI

**AI-native seller listing copilot** — turn messy inputs into channel-ready listings with confidence-aware review and one-click publish.

## Core Promise

Drop anything in (photos, PDFs, spreadsheets, URLs, voice). **AI extracts** structured product data, surfaces **uncertainty** for human review, then **one click** publishes to Amazon, eBay, Walmart, Shopify, Etsy, and more.

## Tech Stack

| Layer        | Technology                                 |
| ------------ | ------------------------------------------ |
| Monorepo     | Turborepo, npm workspaces                  |
| Frontend     | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Backend      | NestJS 10, TypeScript                      |
| Database     | PostgreSQL 16 (Prisma ORM)                 |
| Cache/Queue  | Redis 7 (BullMQ for job processing)        |
| Object Store | S3-compatible (MinIO locally, AWS S3 prod) |
| Email (dev)  | MailHog                                    |
| AI           | Anthropic Claude                           |

## Architecture

ListingPilot is a **Turborepo monorepo**:

- **`apps/web`** — Next.js 15 frontend (App Router, Tailwind CSS, shadcn/ui components)
- **`apps/api`** — NestJS backend (REST API with Swagger docs, JWT auth, BullMQ workers)
- **`packages/shared-types`** — Cross-app TypeScript types (API responses, product models, confidence types)
- **`packages/channel-schemas`** — Marketplace constraints and listing shapes (Amazon, eBay, Walmart, Shopify, Etsy)

Infrastructure services (PostgreSQL, Redis, MinIO, MailHog) run via Docker Compose for local development.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a detailed system diagram and module breakdown.

## Quick Start

### Prerequisites

- **Node.js 20+** and **npm 10+**
- **Docker** and **Docker Compose**

### Setup

```bash
# 1. Clone and enter the project
git clone https://github.com/himanshusapra9/Projects.git
cd "Projects/Seller Listing Copilot"

# 2. Copy environment variables
cp .env.example .env
cp .env.example apps/api/.env

# 3. Start infrastructure (PostgreSQL, Redis, MinIO, MailHog)
docker compose up -d

# 4. Install dependencies
npm install

# 5. Run database migrations and generate the Prisma client
make db

# 6. Seed the database (optional — creates demo users and products)
make seed

# 7. Start dev servers (builds shared packages, then starts API + web)
make dev
```

### Access Points

| Service       | URL                         |
| ------------- | --------------------------- |
| Web UI        | http://localhost:3000        |
| API           | http://localhost:4000/api/v1 |
| Swagger Docs  | http://localhost:4000/docs   |
| MinIO Console | http://localhost:9001        |
| MailHog UI    | http://localhost:8025        |

### Environment Variables

Key variables to configure in `.env` (see `.env.example` for the full list):

| Variable               | Description                        | Default               |
| ---------------------- | ---------------------------------- | --------------------- |
| `DATABASE_URL`         | PostgreSQL connection string       | `postgresql://postgres:password@localhost:5432/listingpilot` |
| `REDIS_HOST`           | Redis hostname                     | `127.0.0.1`           |
| `JWT_ACCESS_SECRET`    | Access token signing secret        | (set a strong value)  |
| `JWT_REFRESH_SECRET`   | Refresh token signing secret       | (set a strong value)  |
| `ANTHROPIC_API_KEY`    | Anthropic Claude API key           | (required for AI)     |
| `S3_ENDPOINT`          | MinIO/S3 endpoint                  | `http://localhost:9000` |
| `S3_ACCESS_KEY_ID`     | S3/MinIO access key                | `minioadmin`          |
| `S3_SECRET_ACCESS_KEY` | S3/MinIO secret key                | `minioadmin`          |

## Project Structure

```
listingpilot/
├── apps/
│   ├── web/                  # Next.js 15 frontend
│   │   ├── app/              #   App Router pages (auth, dashboard, products, etc.)
│   │   ├── components/       #   UI components (shadcn/ui, layout, feature components)
│   │   ├── hooks/            #   React Query hooks for API integration
│   │   ├── lib/              #   API client, auth utilities
│   │   └── styles/           #   Global CSS with Tailwind
│   └── api/                  # NestJS backend
│       ├── src/              #   Source code (modules, services, controllers)
│       │   ├── ai/           #     Claude AI integration, extraction pipeline
│       │   ├── auth/         #     JWT authentication, guards, decorators
│       │   ├── ingestion/    #     File upload and processing (CSV, PDF, images, URLs)
│       │   ├── products/     #     Canonical product model, confidence scoring
│       │   ├── listing-packages/  #  Channel-specific listing generation and validation
│       │   ├── publish/      #     Channel connectors (Amazon, eBay, Shopify, etc.)
│       │   ├── monitoring/   #     Post-publish health monitoring and remediation
│       │   ├── review/       #     Confidence-gated review queue
│       │   └── ...           #     analytics, audit, evidence, organizations, storage, queue
│       ├── prisma/           #   Database schema and migrations
│       └── test/             #   Unit and integration tests
├── packages/
│   ├── shared-types/         # Cross-app TypeScript types
│   └── channel-schemas/      # Marketplace limits and listing shapes
├── docs/                     # Product and API documentation
│   ├── API_CONTRACT.md       #   REST API endpoints and response shapes
│   ├── ARCHITECTURE.md       #   System design and module breakdown
│   ├── DATABASE_SCHEMA.md    #   Database entity reference
│   ├── DEPLOYMENT.md         #   Hosting and CI/CD guide
│   ├── PRODUCT_VISION.md     #   Product strategy and ICP
│   ├── ROADMAP.md            #   V1/V2/V3 feature timeline
│   └── UX_FLOWS.md           #   Screen-by-screen UX specification
├── docker-compose.yml        # Local dev infrastructure
├── docker-compose.prod.yml   # Production overlay
├── Makefile                  # Development shortcuts
├── turbo.json                # Turborepo pipeline configuration
└── package.json              # Root workspace configuration
```

## Key Features

- **Multimodal Ingestion** — Upload images, PDFs, spreadsheets, or URLs. AI extracts structured product data with evidence citations.
- **Canonical Product Model** — Single source of truth with attributes, variants, evidence records, and per-field confidence scores.
- **Confidence-Aware Review** — Review queue surfaces only low-confidence or conflicting fields. High-confidence fields auto-advance.
- **Channel Packages** — Generate channel-specific listings (Amazon, eBay, Walmart, Shopify, Etsy) with validation and quality scoring.
- **Publish & Monitor** — One-click publish to marketplaces with post-publish health monitoring and remediation suggestions.

## Development Commands

| Command         | Description                                        |
| --------------- | -------------------------------------------------- |
| `make dev`      | Start Docker infra + build packages + run API & web |
| `make db`       | Run Prisma migrations and generate client          |
| `make seed`     | Seed the database with demo data                   |
| `make test`     | Run API unit tests                                 |
| `make test-e2e` | Run API end-to-end tests                           |
| `make down`     | Stop Docker Compose                                |
| `make clean`    | Tear down volumes and build artifacts              |
| `npm run dev`   | Run all apps in dev mode via Turborepo             |
| `npm run build` | Production build (all workspaces)                  |
| `npm run lint`  | Lint across workspaces                             |
| `npm run test`  | Run tests across workspaces                        |

## Testing

```bash
# Run API unit tests
make test
# or
npm run test --workspace=apps/api

# Run API end-to-end tests
make test-e2e
```

Unit tests cover the confidence scoring engine, validation engine, and remediation engine. Integration tests cover the ingestion pipeline and package generation.

## Documentation

| Document | Description |
| -------- | ----------- |
| [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) | REST API endpoints, request/response shapes, auth, pagination |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System diagram, tech stack, module breakdown, data flows |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Database entity reference (aspirational + Prisma schema) |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Docker, Vercel, AWS/GCP hosting, CI/CD pipeline |
| [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) | Product strategy, ICP, use cases, success metrics |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | V1 (MVP) / V2 (Multi-channel) / V3 (Bulk & Analytics) timeline |
| [`docs/UX_FLOWS.md`](docs/UX_FLOWS.md) | 13-screen UX specification with component hierarchy |

## License

MIT
