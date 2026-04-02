# AutoMLab — Autonomous Overnight ML Experimentation Agent

AutoMLab is an autonomous ML experimentation agent that runs 50-200 experiments overnight,
guided by a plain English `program.md` file. Researchers "program" in Markdown;
AutoMLab programs in Python.

## Features

- **Markdown-driven research**: Write your goals, constraints, and hypotheses in `program.md`
- **Bayesian adaptive proposals**: Uses Gaussian Process optimization to guide experiment selection
- **Git-based experiment tracking**: Every experiment runs on its own branch with full diffs
- **Safety monitoring**: Validates all code changes for forbidden patterns and file constraints
- **Morning reports**: Generates narrative research reports with experiment logs
- **Dashboard**: Real-time monitoring of running experiments

## Setup

```bash
# Install dependencies
make install

# Configure API keys
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Run tests
make test

# Start an overnight run
make run

# Launch dashboard
make dashboard
```

## Architecture

1. **ProgramInterpreter** — Parses `program.md` into a structured `ResearchPlan`
2. **ExperimentProposer** — Uses Claude + Bayesian optimization to propose experiments
3. **SafetyMonitor** — Validates diffs for forbidden patterns and file constraints
4. **SandboxExecutor** — Runs experiments in isolated git branches with timeouts
5. **MemoryEngine** — Stores results in SQLite for GP fitting and reporting
6. **ReportGenerator** — Creates narrative reports and CSV experiment logs
7. **Orchestrator** — Main loop: plan → propose → run → learn → report

## Configuration

Edit `program.md` to define your research program. See the included starter
program for the expected format.
