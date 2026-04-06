#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

if [[ ! -f "$ROOT/.env" && -f "$ROOT/.env.example" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "Created .env from .env.example — add your API keys as needed."
fi

cleanup() {
  if [[ -n "${BACK_PID:-}" ]]; then
    kill "$BACK_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting FastAPI backend on http://127.0.0.1:8000 ..."
(
  cd "$ROOT/backend"
  export PYTHONPATH=.
  exec python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
) &
BACK_PID=$!

echo "Starting Next.js frontend on http://127.0.0.1:3000 ..."
cd "$ROOT/frontend"
npm run dev -- --port 3000
