#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: Python 3 is required but was not found in PATH." >&2
  exit 1
fi

if [ ! -d "venv" ]; then
  echo "Creating virtual environment in venv/..."
  python3 -m venv venv
fi

# shellcheck source=/dev/null
source venv/bin/activate

pip install -q -r requirements.txt

exec python -m uvicorn app:app --host 0.0.0.0 --port 8000
