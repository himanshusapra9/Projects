#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "Checking prerequisites..."
command -v python3 >/dev/null 2>&1 || {
  echo "error: python3 is required"
  exit 1
}
command -v node >/dev/null 2>&1 || {
  echo "error: node is required"
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "error: npm is required"
  exit 1
}
command -v docker >/dev/null 2>&1 || {
  echo "error: docker is required"
  exit 1
}

echo "Installing Python dependencies..."
python3 -m pip install -r requirements.txt

echo "Installing frontend dependencies..."
(cd "$ROOT/frontend" && npm install)

if [[ ! -f "$ROOT/.env" && -f "$ROOT/.env.example" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "Created .env from .env.example — add your API keys as needed."
fi

echo "Starting stack with Docker Compose (detached)..."
docker compose -f "$ROOT/docker-compose.yml" up --build -d
echo "Done. Use 'docker compose logs -f' to follow services, or ./run.sh for local dev without API containers."
echo "Local API only (from repo): cd backend && PYTHONPATH=. python3 -m uvicorn main:app --host 0.0.0.0 --port 8000"
