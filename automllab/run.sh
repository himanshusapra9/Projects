#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ -f .venv/bin/activate ]]; then
  # shellcheck source=/dev/null
  source .venv/bin/activate
fi

uvicorn dashboard.api.main:app --reload --host 0.0.0.0 --port 8000 &
BACK_PID=$!

(cd "$ROOT/frontend" && npx next dev --port 3000) &
FRONT_PID=$!

cleanup() {
  kill "$BACK_PID" 2>/dev/null || true
  kill "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait
