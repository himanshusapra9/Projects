#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

require_node() {
  local need=18
  local major
  if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is not installed. Install Node.js ${need}+ from https://nodejs.org/"
    exit 1
  fi
  major="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
  if [ "$major" -lt "$need" ]; then
    echo "Error: Node.js ${need}+ required. Found: $(node -v)"
    exit 1
  fi
  echo "Node.js $(node -v) — OK"
}

require_node

echo "Installing dependencies..."
npm install

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example (edit values as needed)."
elif [ ! -f .env ]; then
  echo "Note: No .env.example found; create .env manually if required."
fi

cat <<'EOF'

Setup complete.

Run the monorepo in development (API + web + packages):
  npm run dev

Or from this directory with Turborepo:
  npx turbo dev

Typical URLs:
  Web app: http://localhost:3000
  API:     http://localhost:3001 (see PORT in .env)

EOF
