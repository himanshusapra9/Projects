#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> Checking prerequisites..."
for cmd in python3 docker npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
done
if ! docker compose version &>/dev/null; then
  echo "Docker Compose plugin is required (docker compose)." >&2
  exit 1
fi

echo "==> Creating Python virtualenv and installing dependencies..."
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
# shellcheck source=/dev/null
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt

echo "==> Installing frontend dependencies..."
cd frontend
npm install
cd "$ROOT"

if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    echo "==> Copying .env.example -> .env"
    cp .env.example .env
  else
    echo "Warning: no .env.example found; create .env manually if needed." >&2
  fi
fi

echo "==> Starting Docker Compose (postgres, api, frontend)..."
docker compose up --build -d

echo "==> Done. Services: API http://localhost:8000, frontend http://localhost:3000"
