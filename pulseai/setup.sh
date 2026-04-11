#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "=== PulseAI Setup ==="

command -v python3 >/dev/null || { echo "error: python3 is required" >&2; exit 1; }
command -v node    >/dev/null || { echo "error: Node.js is required" >&2; exit 1; }
command -v npm     >/dev/null || { echo "error: npm is required"     >&2; exit 1; }

# Python venv
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "✓ Python dependencies installed"

# .env
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✓ Created .env from .env.example — add your GROQ_API_KEY"
else
  echo "✓ .env already exists"
fi

# Validate GROQ_API_KEY
source .env 2>/dev/null || true
if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" = "your_groq_api_key_here" ]; then
  echo ""
  echo "⚠  WARNING: GROQ_API_KEY not set in .env"
  echo "   Get your key at: https://console.groq.com"
  echo "   Add it to .env:  GROQ_API_KEY=gsk_..."
  echo "   (AI analysis will fall back to heuristics without it)"
  echo ""
fi

# Frontend
cd frontend && npm install --silent && cd ..
echo "✓ Frontend dependencies installed"

echo ""
echo "=== Setup complete. Run: ./run.sh ==="
