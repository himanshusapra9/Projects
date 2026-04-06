#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

die() { echo "ERROR: $*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

need_cmd python3
need_cmd node
need_cmd npm
need_cmd docker

python3 -c "import sys; assert sys.version_info >= (3, 10), 'Python 3.10+ required'" \
  || die "Python 3.10+ required"

node -e "const [maj,min]=process.versions.node.split('.').map(Number); if (maj<18) process.exit(1)" \
  || die "Node.js 18+ required"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
# shellcheck source=/dev/null
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cd frontend
npm install
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit .env to set ANTHROPIC_API_KEY and other values."
fi

echo "Setup complete. Activate the venv with: source .venv/bin/activate"
echo "Then run: ./run.sh"
