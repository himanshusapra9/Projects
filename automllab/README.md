# AutoMLab — Autonomous Overnight ML Experimentation Agent

> Write goals in Markdown, wake up to results — autonomous experiment loop using Claude proposals, Bayesian GP optimization, git-branch sandboxing, and safety-validated code diffs.

AutoMLab is an autonomous ML experimentation agent that proposes, executes, and evaluates
experiments overnight, guided by a plain English `program.md` file. It uses Claude for
experiment proposal generation, Gaussian Process regression for trend modeling, and
sentence-transformers to prevent duplicate experiments.

## What's Implemented

### Core Pipeline (fully wired end-to-end)

| Component | What it does | Key tech |
|-----------|-------------|----------|
| **ProgramInterpreter** | Parses `program.md` into structured `ResearchPlan` via Claude | Anthropic SDK (claude-sonnet-4-6) |
| **ExperimentProposer** | Generates experiment batches with code diffs, filtered for novelty | Anthropic SDK + BAAI/bge-large-en-v1.5 (cosine dedup) + sklearn GP (trend context) |
| **SafetyMonitor** | Validates diffs against 9 forbidden patterns (eval, exec, os.system, etc.) + file constraints + budget enforcement | Regex-based static analysis |
| **SandboxExecutor** | Creates git branch, applies patch, runs training subprocess, parses metrics, keeps/discards based on val_loss improvement | GitPython + asyncio subprocess |
| **MemoryEngine** | Persists all experiment results for GP fitting and reporting | SQLite |
| **ReportGenerator** | Generates narrative report via Claude + CSV experiment log | Anthropic SDK + pandas |
| **Orchestrator** | Main async loop: propose → validate → execute → learn → report | Ties all components together |

### ML & Algorithms

- **Gaussian Process Regression** (sklearn, Matern kernel) — fits on experiment history after 10+ results; provides uncertainty context to the proposer prompt (not a full Bayesian optimization over hyperparameter space)
- **Sentence-Transformers** (BAAI/bge-large-en-v1.5) — encodes experiment descriptions to filter near-duplicate proposals (cosine threshold 0.90)
- **Claude claude-sonnet-4-6** — program parsing, experiment proposal generation, morning report narrative

### Training Harness

- `training/nanochat/train.py` — **Toy training script** that simulates loss curves with random decay (used for testing the orchestration loop; not real GPU training)
- `training/nanochat/model.py` — Real PyTorch GPT-style transformer (6 layers, 6 heads, 384 d_model) — standalone, not used by `train.py`
- `training/nanochat/data.py` — Real character-level dataset — standalone
- `training/nanochat/evaluate.py` — Real validation loss computation — standalone

### Dashboard API (FastAPI)

- `GET /health` — Health check
- `GET /api/v1/experiments` — List all experiments from SQLite
- `GET /api/v1/experiments/best` — Get best-performing experiment
- `GET /api/v1/report` — Read generated report markdown

### Safety Features

The SafetyMonitor blocks experiments containing:
- Shell injection (`os.system`, `subprocess` with `shell=True`)
- Code execution (`eval`, `exec`, `__import__`)
- System file access, destructive operations (`rm -rf`, `DROP TABLE`, `shutil.rmtree`)
- Modifications to forbidden files defined in `program.md`
- Budget overruns (95% threshold of max total hours)

### What's Not Yet Implemented

- GPU memory enforcement (static estimate only, no runtime check)
- Docker container isolation (runs on host filesystem via git branches)
- `allowed_files` enforcement (only `forbidden_files` is checked)
- Real training integration (current `train.py` is a simulation)

### Tests (30 passing)

- Program interpreter parsing (mocked Claude)
- Experiment proposal validation (mocked Claude + encoder)
- All 9 forbidden patterns detected by safety monitor
- Budget enforcement at 95% threshold
- GP fitting with 12+ mock results
- Memory engine stores/retrieves from SQLite
- Report generation (without LLM) + CSV export

## Setup

```bash
cd automllab
python -m venv .venv && source .venv/bin/activate
make install
cp .env.example .env   # Set ANTHROPIC_API_KEY
make test
make run               # Start overnight experiment loop
make dashboard         # Launch FastAPI dashboard on :8000
```

## How It Works

1. Write your research goals in `program.md` (see included starter)
2. Run `make run` — the orchestrator parses the program, proposes experiments, and runs them
3. Each experiment: create git branch → apply diff → run training → parse metrics → keep/discard
4. After budget exhaustion or success, a morning report is generated at `.automllab/report.md`
