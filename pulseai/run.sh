#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

source .venv/bin/activate
export PYTHONPATH="$ROOT"

echo "Starting PulseAI..."
echo "  Backend  → http://127.0.0.1:8000"
echo "  Frontend → http://localhost:3000"
echo "  API Docs → http://127.0.0.1:8000/docs"
echo ""

# Start backend
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
