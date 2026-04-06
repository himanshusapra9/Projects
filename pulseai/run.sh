#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

export PYTHONPATH="$ROOT"

UVICORN_CMD=(uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000)
if [ -x "$ROOT/.venv/bin/uvicorn" ]; then
  UVICORN_CMD=("$ROOT/.venv/bin/uvicorn" backend.main:app --reload --host 127.0.0.1 --port 8000)
fi

cleanup() {
  kill "${API_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

"${UVICORN_CMD[@]}" &
API_PID=$!

cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

wait
