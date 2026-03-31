# ListingPilot AI

**AI-native seller listing copilot** — turn messy inputs into channel-ready listings with confidence-aware review and one-click publish.

## Core promise

Drop anything in (photos, PDFs, spreadsheets, URLs, voice). **AI extracts** structured product data, surfaces **uncertainty** for human review, then **one click** publishes to Amazon, eBay, Walmart, Shopify, Etsy, and more.

## Tech stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Monorepo     | Turborepo, npm workspaces           |
| Frontend     | Next.js 15                          |
| Backend      | NestJS                              |
| Database     | PostgreSQL 16                       |
| Cache        | Redis 7                             |
| Object store | S3-compatible (MinIO locally)       |
| Email (dev)  | MailHog                             |
| AI           | Anthropic Claude                    |

## Architecture

ListingPilot is a **Turborepo monorepo**: `apps/web` (Next.js UI), `apps/api` (NestJS API), and shared packages (`@listingpilot/shared-types`, `@listingpilot/channel-schemas`) for types and marketplace constraints. Infrastructure services run via Docker Compose for local development.

## Quick start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose

### Steps

1. Clone the repository and enter the project root.

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start infrastructure (PostgreSQL, Redis, MinIO, MailHog):

   ```bash
   docker compose up -d
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Run database migrations and generate the Prisma client (when `apps/api` is configured):

   ```bash
   make db
   ```

6. Seed the database (optional):

   ```bash
   make seed
   ```

7. Start the dev servers:

   ```bash
   make dev
   ```

   Or use Turborepo directly: `npm run dev`.

## Project structure

```
listingpilot/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared-types/     # Cross-app TypeScript types
│   └── channel-schemas/  # Marketplace limits & listing shapes
├── docs/             # Product & API documentation
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
└── package.json
```

## Key features

- **Multimodal ingestion** — images, documents, URLs, structured feeds.
- **Canonical product model** — attributes, variants, evidence, and confidence.
- **Review queue** — focus on low-confidence or conflicting fields.
- **Channel packages** — validation, quality scoring, and publish per marketplace.
- **Post-publish monitoring** — remediation suggestions when listings drift or get suppressed.

## API documentation

See [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) for request/response shapes and endpoints. Database and deployment details live in [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Development commands

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Run all apps in dev mode (Turbo)         |
| `npm run build`| Production build                         |
| `npm run lint` | Lint across workspaces                 |
| `npm run test` | Run tests                               |
| `npm run clean`| Turbo clean                             |
| `make dev`     | Docker infra + API & web dev servers   |
| `make db`      | Prisma migrate + generate (API workspace)|
| `make down`    | Stop Docker Compose                     |
| `make clean`   | Tear down volumes and build artifacts   |

## Testing

Run API unit tests with `make test` or `npm run test --workspace=apps/api`. End-to-end tests: `make test-e2e`. Add workspace-specific test scripts as apps mature.

## License

MIT
