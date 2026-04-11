#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo ""
echo "┌─────────────────────────────┐"
echo "│     DataSteward Setup       │"
echo "└─────────────────────────────┘"
echo ""

# Python
if ! command -v python3 &>/dev/null; then
  echo "✗ python3 not found. Install Python 3.10+"; exit 1
fi
echo "✓ python3 $(python3 --version 2>&1)"

# Node
if ! command -v node &>/dev/null; then
  echo "✗ node not found. Install Node.js 18+"; exit 1
fi
echo "✓ node $(node --version)"

# Virtualenv
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  echo "✓ Created .venv"
fi
source .venv/bin/activate
pip install -U pip -q
pip install -r requirements.txt -q
echo "✓ Python dependencies installed"

# .env
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✓ Created .env (DEMO_MODE=true by default)"
fi

# Frontend
cd frontend && npm install --silent && cd ..
echo "✓ Frontend dependencies installed"

echo ""
echo "┌─────────────────────────────────────────┐"
echo "│  Setup complete!                         │"
echo "│                                          │"
echo "│  Run: ./run.sh                           │"
echo "│  Then open: http://localhost:3000        │"
echo "│                                          │"
echo "│  Demo mode is ON — no database needed.  │"
echo "│  Add ANTHROPIC_API_KEY for AI analysis. │"
echo "└─────────────────────────────────────────┘"
echo ""
