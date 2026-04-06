#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> Return Prevention + Fit Confidence Engine — setup"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed. Install Node.js 18 or newer from https://nodejs.org/"
  exit 1
fi

NODE_MAJOR="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js 18+ is required (found: $(node --version))"
  exit 1
fi

echo "Node.js $(node --version) — OK"
echo

echo "==> npm install"
npm install

if [ ! -f .env ] && [ -f .env.example ]; then
  echo
  echo "==> Creating .env from .env.example"
  cp .env.example .env
  echo "    Edit .env and set secrets / API keys as needed."
fi

echo
echo "-------------------------------------------------------------------"
echo "Development"
echo "  • From repo root: npm run dev   (Turborepo — API + web apps)"
echo "  • API: http://localhost:3001  (global prefix /api/v1, docs at /docs)"
echo "  • Web: http://localhost:3000"
echo "  • Copy apps/api/.env.example → apps/api/.env for the Nest server."
echo "  • Set NEXT_PUBLIC_API_KEY to match API_KEYS_JSON in apps/api/.env,"
echo "    or use SKIP_API_KEY=true in development on the API."
echo "-------------------------------------------------------------------"
