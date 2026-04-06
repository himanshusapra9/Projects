#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

err() {
  echo "error: $*" >&2
  exit 1
}

command -v python3 >/dev/null || err "python3 is required"
command -v node >/dev/null || err "Node.js is required"
command -v npm >/dev/null || err "npm is required"

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [ ! -d .venv ]; then
  python3 -m venv .venv
  echo "Created Python virtual environment at .venv"
fi

# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cd frontend
npm install

echo "Setup finished. Activate the venv with: source .venv/bin/activate"
