#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "Checking prerequisites..."
command -v python3 >/dev/null 2>&1 || {
  echo "error: python3 is required" >&2
  exit 1
}
command -v node >/dev/null 2>&1 || {
  echo "error: node is required" >&2
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "error: npm is required" >&2
  exit 1
}

if [[ ! -d .venv ]]; then
  echo "Creating Python virtual environment (.venv)..."
  python3 -m venv .venv
fi

echo "Installing Python dependencies..."
# shellcheck source=/dev/null
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "Installing frontend dependencies..."
(cd frontend && npm install)

if [[ ! -f .env && -f .env.example ]]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
fi

echo "Setup complete."
