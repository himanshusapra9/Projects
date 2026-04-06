# OmniResearch

**OmniResearch** is a multi-source intelligence research platform that aggregates and synthesizes information from academic papers, the open web, social media, news, GitHub, and video sources. It combines async fetching, ML-backed analysis, and LLM-driven synthesis into a single research workflow.

## Features

- **Multi-source fetching** — Academic (OpenAlex, Semantic Scholar, arXiv, PubMed), web (Brave, Tavily, Wikipedia), Reddit and Hacker News, news APIs, GitHub repositories, YouTube transcripts, podcasts, and more.
- **ML-powered analysis** — Sentence-transformer embeddings, sentiment analysis, heuristic credibility scoring, cross-encoder reranking, and optional modules (NER, summarization, topics) in `backend/ml/`.
- **Celery async processing** — Background tasks with Redis as the broker; worker service defined in Docker Compose.
- **ChromaDB vector store** — Client integration under `backend/db/` for semantic storage and retrieval (see configuration below).
- **Research synthesis** — LangGraph-based agent pipeline (query planning, fetch, process, rerank, synthesis, export) in `backend/agents/`.

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Backend** | Python, FastAPI, Celery, Redis, ChromaDB, sentence-transformers, Anthropic SDK (Claude), LangGraph |
| **Frontend** | Next.js 14, React 18, Tailwind CSS |

## Prerequisites

- **Python** 3.10+ (project uses 3.11+ in practice; see `requirements.txt`)
- **Node.js** 18+
- **Docker** and **Docker Compose** — for Redis, ChromaDB, and optional full-stack containers

## Quick start

### Option A — scripts

From the repository root:

```bash
./setup.sh && ./run.sh
```

`setup.sh` installs Python and frontend dependencies, ensures a `.env` file exists, and runs **`docker compose up --build -d`** (Redis, ChromaDB, API, Celery worker, and frontend per `docker-compose.yml`). `run.sh` starts **local** FastAPI and Next.js dev servers on ports 8000 and 3000 with `PYTHONPATH=.` from `backend/`. Those ports are the same ones the Compose `api` and `frontend` services use, so **do not run both at once**: either use the containerized stack after `setup.sh`, or stop the `api` and `frontend` containers (and free 8000/3000) before `./run.sh`.

### Option B — manual

1. Install dependencies: `pip install -r requirements.txt` and `(cd frontend && npm install)`.
2. Copy `.env.example` to `.env` and set variables (see below).
3. Start infrastructure: `docker compose up -d redis chromadb` (or the full stack from `docker-compose.yml`).
4. **Run the backend from the `backend/` directory** with `PYTHONPATH` set so package imports resolve:

   ```bash
   cd backend
   export PYTHONPATH=.
   python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. In another terminal: `(cd frontend && npm run dev)`.

You can also use `make install`, `make test`, and `make dev` from the repo root where applicable.

## Environment variables

Core variables (see `.env.example` for the full list, including optional search and media APIs):

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude for query planning and report synthesis |
| `REDDIT_CLIENT_ID` | Reddit API (with `REDDIT_CLIENT_SECRET`) |
| `REDDIT_CLIENT_SECRET` | Reddit API |
| `CHROMADB_URL` | ChromaDB HTTP endpoint (e.g. `http://chromadb:8000` in Compose) |
| `REDIS_URL` | Redis for Celery and task state (e.g. `redis://redis:6379/0`) |

Additional keys in `.env.example` cover Brave/Tavily, YouTube, NewsAPI, Listen Notes, GitHub, Hugging Face, etc.

## Project structure

```
omniresearch/
├── backend/
│   ├── main.py              # FastAPI application entry
│   ├── agents/              # LangGraph pipeline: planner, fetch orchestration, synthesis, export
│   ├── fetchers/            # Per-source async fetch modules
│   ├── ml/                  # Embeddings, reranking, credibility, sentiment, etc.
│   ├── db/                  # Redis and ChromaDB clients
│   ├── api/                 # HTTP routes and middleware
│   └── tasks/               # Celery app and tasks
├── frontend/                # Next.js 14 app
├── tests/                   # unit/ and integration/
├── docker-compose.yml
├── setup.sh
└── run.sh
```

## Testing

Tests use **pytest** (25+ tests across unit and integration modules). From the repo root:

```bash
make test
```

Or equivalently: `cd backend && python -m pytest ../tests/ -v` (with `PYTHONPATH=.` as in the Makefile).

## Docker

Build and run the stack (API, Celery worker, Redis, ChromaDB, frontend):

```bash
docker compose up --build
```

Or start only backing services: `docker compose up -d redis chromadb`.

## Important note

**Run the backend from inside the `backend/` directory** and set **`PYTHONPATH=.`** (as in `run.sh` and `make test`) so imports like `main`, `agents`, and `fetchers` resolve correctly. Celery commands should also use `backend/` as the working directory with the same `PYTHONPATH`.

---

*Implementation note:* The agent pipeline (fetchers, ML, LangGraph) is implemented as library code under `backend/`. Some API routes still use stub or partial wiring for Celery and exports; for programmatic use of the full graph, see `backend/agents/graph.py` and `build_research_graph()`.
