# AutoMLab

**AutoMLab** is an autonomous ML experimentation platform with AI-driven experiment proposal, sandboxed Git-based execution, safety monitoring, and comprehensive reporting.

## Features

- **AI experiment proposer** — Uses Anthropic Claude to parse research goals and propose experiment batches with code diffs.
- **Bayesian optimization context** — Gaussian process regression (scikit-learn) on experiment history to inform proposals with trend and uncertainty estimates.
- **Sandboxed Git-based execution** — Experiments run on isolated branches via GitPython; training runs as a subprocess with metrics parsed for keep/discard decisions.
- **Safety monitoring** — Static analysis blocks dangerous patterns (e.g. `eval`, `exec`, unsafe subprocess use) and enforces file/budget constraints.
- **Memory engine** — Persists experiment results in SQLite for learning and dashboards.
- **Report generation** — Narrative reports and CSV logs via Claude and pandas.

## Tech Stack

| Layer | Technologies |
|--------|----------------|
| **Backend** | Python, FastAPI, Anthropic SDK, scikit-learn, sentence-transformers, GitPython |
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Ops** | Docker Compose |

Other notable dependencies include PyTorch (training harness), pandas, and uvicorn.

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **Docker** (optional) — required if you use `./setup.sh` (the script checks for the `docker` command) or Docker Compose; for a fully manual setup you can omit Docker if you install dependencies yourself.

## Quick Start

### Option A — Scripts

```bash
cd automllab
./setup.sh && ./run.sh
```

`setup.sh` creates a virtual environment, installs Python and frontend dependencies, and copies `.env.example` to `.env` if missing. `run.sh` starts the FastAPI dashboard on port **8000** and the Next.js dev server on port **3000**.

### Option B — Manual

```bash
cd automllab
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cd frontend && npm install && cd ..
cp .env.example .env        # set ANTHROPIC_API_KEY and other values
```

Then in one terminal:

```bash
source .venv/bin/activate
uvicorn dashboard.api.main:app --reload --host 0.0.0.0 --port 8000
```

And in another:

```bash
cd frontend && npx next dev --port 3000
```

### Autonomous experiment loop

To run the overnight-style orchestrator (propose → validate → execute → report), from the project root with the venv activated:

```bash
python -m core.orchestrator .
```

This is also available as `make run`. Generated reports are written under `.automllab/` (e.g. `.automllab/report.md`).

## Environment Variables

Configure a `.env` file (see `.env.example`). The primary variable for Claude-powered features is:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | API key for Anthropic Claude (program parsing, proposals, reports) |

Optional:

| Variable | Description |
|----------|-------------|
| `PROGRAM_MD_PATH` | Path to the research program markdown (default: `program.md`) |
| `BASE_DIR` | Base directory for runs (default: `.`) |

## Project Structure

```
automllab/
├── core/           # Orchestrator, proposer, interpreter, safety, sandbox executor, memory
├── models/         # Pydantic models (research plan, experiments, reports)
├── dashboard/      # FastAPI app and API routes
├── training/       # Training scripts and toy harness (e.g. nanochat)
├── frontend/       # Next.js 14 dashboard UI
├── tests/          # pytest suite
└── backend/        # Thin entry re-exporting the dashboard API (`dashboard.api.main`)
```

## Testing

```bash
source .venv/bin/activate
pytest tests/
```

There are **30** tests covering program interpretation, proposal validation, safety rules, budget enforcement, GP fitting, memory persistence, and reporting.

## Docker

From the repository root:

```bash
docker compose up
```

This builds and runs the **dashboard** (FastAPI on port 8000) and **frontend** (Next.js on port 3000) services. Use `docker compose up --build` after dependency or Dockerfile changes. Ensure `.env` exists (e.g. copy from `.env.example`).

---

For more detail on the pipeline components, API endpoints, and safety rules, see the implementation in `core/`, `dashboard/`, and `tests/`.
