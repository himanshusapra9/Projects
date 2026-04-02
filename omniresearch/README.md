# OmniResearch

Universal multi-source research API: aggregates academic, web, social, news, video, and code sources behind a FastAPI service and background workers.

## Prerequisites

- Python 3.11+ recommended
- Docker and Docker Compose (for `make dev`)
- Node.js (for the optional frontend under `frontend/`)

## Setup

1. Clone the repository and enter the project root:

   ```bash
   cd omniresearch
   ```

2. Create a virtual environment and install dependencies:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   make install
   ```

3. Copy the environment template and fill in API keys as needed:

   ```bash
   cp .env.example .env
   ```

## Environment variables

Configure `.env` using `.env.example` as a template. Common variables:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | LLM / agent calls |
| `BRAVE_SEARCH_API_KEY` | Web search |
| `TAVILY_API_KEY` | Alternative web search |
| `YOUTUBE_DATA_API_KEY` | YouTube metadata |
| `NEWS_API_KEY` | NewsAPI articles |
| `GITHUB_TOKEN` | Higher GitHub API rate limits (optional) |
| `REDIS_URL` | Celery broker / task state (default in Docker: `redis://redis:6379/0`) |
| `CHROMADB_URL` | Vector store URL (default in Docker: `http://chromadb:8000`) |

Integration tests that call external services are skipped when the relevant keys are missing.

## Run with Docker Compose

From the project root:

```bash
make dev
```

This builds and starts the API, Celery worker, Redis, ChromaDB, and the frontend. The API is exposed on port `8000`.

## Tests

Run the full suite (pytest discovers `tests/` with `backend/` on the path via `tests/conftest.py`):

```bash
make test
```

Unit tests only:

```bash
make test-unit
```

Integration tests:

```bash
make test-integration
```

The Makefile runs pytest from `backend/` so imports resolve to the `backend` package layout.

## Linting and formatting

```bash
make lint
make format
```

Requires `ruff`, `black`, and `isort` installed in the environment used for backend development.
