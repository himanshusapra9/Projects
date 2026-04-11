#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [ ! -d ".venv" ]; then
  echo "Run ./setup.sh first (no .venv found)." >&2
  exit 1
fi

source .venv/bin/activate
source .env 2>/dev/null || true
export PYTHONPATH="$ROOT"

echo ""
echo "Starting DataSteward..."

if [ "${ANTHROPIC_API_KEY:-}" = "" ] || \
   [ "${ANTHROPIC_API_KEY}" = "your_anthropic_api_key_here" ]; then
  echo "  ⚠ AI Root Cause: disabled (no ANTHROPIC_API_KEY)"
  echo "    Get one at: https://console.anthropic.com"
else
  echo "  ✓ AI Root Cause: enabled"
fi

if [ "${DEMO_MODE:-true}" = "true" ]; then
  echo "  ✓ Demo mode: ON (sample data loaded)"
fi

echo ""
echo "  Backend  → http://127.0.0.1:8000"
echo "  Frontend → http://localhost:3000"
echo "  API Docs → http://127.0.0.1:8000/docs"
echo ""

uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
