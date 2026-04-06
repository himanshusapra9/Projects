#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  echo "Run ./setup.sh first (no .venv found)." >&2
  exit 1
fi

# shellcheck source=/dev/null
source .venv/bin/activate

export PYTHONPATH="$ROOT"

if [[ ! -f .env ]] && [[ -f .env.example ]]; then
  cp .env.example .env
fi

cleanup() {
  kill "${BACKEND_PID:-0}" "${FRONTEND_PID:-0}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting backend (uvicorn) on http://127.0.0.1:8000 ..."
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cd frontend
echo "==> Starting frontend (Next.js) on http://127.0.0.1:3000 ..."
npm run dev -- --hostname 127.0.0.1 --port 3000 &
FRONTEND_PID=$!
cd "$ROOT"

wait
