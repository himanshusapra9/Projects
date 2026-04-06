#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is not available (needed for http.server)." >&2
  exit 1
fi

echo "Open http://localhost:8080 in your browser"
exec python3 -m http.server 8080
