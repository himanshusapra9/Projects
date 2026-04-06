#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

die() {
  echo "Error: $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' is required but not installed."
}

echo "==> Checking prerequisites"

require_cmd python3
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' \
  || die "Python 3.10 or newer is required (found $(python3 --version 2>&1))."

require_cmd node
node_major="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
if [ "$node_major" -lt 18 ]; then
  die "Node.js 18 or newer is required (found $(node --version))."
fi

require_cmd docker
docker compose version >/dev/null 2>&1 || docker-compose version >/dev/null 2>&1 \
  || die "Docker Compose is required (docker compose or docker-compose)."

COMPOSE=(docker compose)
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
fi

if [ ! -f "$PROJECT_ROOT/.env" ]; then
  if [ -f "$PROJECT_ROOT/.env.example" ]; then
    echo "==> Creating .env from .env.example"
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
  else
    die ".env is missing and .env.example was not found."
  fi
fi

echo "==> Installing frontend dependencies (npm install)"
(cd "$PROJECT_ROOT/frontend" && npm install)

echo "==> Installing backend dependencies (pip)"
python3 -m pip install -r "$PROJECT_ROOT/backend/requirements.txt"

echo "==> Starting Docker Compose"
"${COMPOSE[@]}" -f "$PROJECT_ROOT/docker-compose.yml" up -d --build

echo "==> Waiting for PostgreSQL to be ready"
for _ in $(seq 1 60); do
  if "${COMPOSE[@]}" -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres \
    pg_isready -U cios_user -d cios >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
if ! "${COMPOSE[@]}" -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres \
  pg_isready -U cios_user -d cios >/dev/null 2>&1; then
  die "PostgreSQL did not become ready in time."
fi

echo "==> Running database migrations"
set -a
# shellcheck disable=SC1091
source "$PROJECT_ROOT/.env"
set +a
export PYTHONPATH="$PROJECT_ROOT/backend"
(cd "$PROJECT_ROOT/backend" && alembic upgrade head)

echo "==> Done. Backend: http://localhost:8000  Frontend: cd frontend && npm run dev"
