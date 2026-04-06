# CodeGuardian

**CodeGuardian** is an AI-powered security scanning tool that analyzes code for vulnerabilities, exposed secrets, and other security issues. It integrates with GitHub pull requests via webhooks so teams can catch problems before merge.

## Features

- **Static analysis** — OWASP-aligned rules (SQL injection, XSS, path traversal, weak crypto, unsafe patterns) with CWE mapping and severity scoring  
- **Secret detection** — Hardcoded credentials, API keys, tokens, and private key patterns with redacted evidence  
- **Dependency scanning** — Known-vulnerable packages via the OSV API (CVSS-to-severity mapping)  
- **Business logic analysis** — Deeper review using Anthropic (Claude) for auth, IDOR, and related issues  
- **GitHub PR integration** — Webhook-driven scans on PR open, sync, and reopen events  
- **Security scoring** — Aggregated findings, deduplication, and repo-oriented security score models  

## Tech Stack

| Layer | Technologies |
|--------|----------------|
| **Backend** | Python, FastAPI, Anthropic SDK |
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Tests** | pytest |

## Prerequisites

- **Python** 3.10 or newer  
- **Node.js** 18 or newer (for the frontend)  
- **npm** (installed with Node.js)  

## Quick Start

### Option A — Scripts

From the project root:

```bash
./setup.sh && ./run.sh
```

- `setup.sh` creates a virtual environment, installs Python and frontend dependencies, and copies `.env.example` to `.env` if needed.  
- `run.sh` starts the API at `http://127.0.0.1:8000` and the Next.js dev server at `http://127.0.0.1:3000`.

### Option B — Manual setup

```bash
cd codeguardian
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cd frontend && npm install && cd ..
cp .env.example .env               # edit .env with your keys
python -m pytest tests/            # optional: verify install
```

Run the backend:

```bash
export PYTHONPATH="$(pwd)"
source .venv/bin/activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

In another terminal, run the frontend:

```bash
cd frontend && npm run dev
```

## Environment Variables

Configure a `.env` file in the project root (see `.env.example`). Typical variables:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API access for business-logic / AI analysis |
| `GITHUB_APP_ID` | GitHub App identifier |
| `GITHUB_APP_PRIVATE_KEY` | PEM for GitHub App authentication |
| `GITHUB_WEBHOOK_SECRET` | Secret to verify incoming GitHub webhooks |
| `DATABASE_URL` | Connection string (reserved for future persistence) |

## Project Structure

```
codeguardian/
├── backend/
│   ├── main.py              # FastAPI application entry
│   ├── analysis/            # Static rules, secrets, dependency scanner, aggregator, business logic
│   ├── github_app/          # Webhook handler, PR comments, status checks
│   └── models/              # Pydantic models (findings, scan results, security score)
├── frontend/                # Next.js 14 UI
└── tests/                   # pytest unit and integration tests
```

## Testing

Run the full suite with pytest (30 tests):

```bash
source .venv/bin/activate
python -m pytest tests/ -v
```

Or use Make:

```bash
make test
```

## API

- **Interactive docs (Swagger UI):** `GET /docs` — OpenAPI schema and try-it-out UI  
- **Health:** `GET /health`  
- **GitHub webhook (PR scan):** `POST /api/v1/webhooks/github` — accepts GitHub PR webhook payloads; runs analysis on the diff and returns structured findings  

Additional routes under `/api/v1/` may return stubs or placeholders; see `backend/main.py` for the current contract.
