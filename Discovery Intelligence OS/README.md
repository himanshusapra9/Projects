# Discovery Intelligence OS

**Discovery Intelligence OS** is a zero-dependency, browser-based recommendation engine. It runs multiple ML-style models in the client—collaborative filtering, content-based approaches, Wide & Deep, and more—with no install beyond a static file server.

## Features

- **Multiple recommendation algorithms** — Compare collaborative filtering, content-based, Wide & Deep, and other models in one place.
- **Real-time model comparison** — Switch models and see how rankings change immediately.
- **Interactive UI** — Single-page experience for exploring data and recommendations.
- **Zero backend** — Everything runs in the browser; no API or database required.

## Tech Stack

- **React 18** (CDN)
- **Tailwind CSS** (CDN)
- **Babel standalone** — In-browser JSX compilation

## Prerequisites

- Any modern web browser
- **Python 3** (for a local HTTP server), or any static file server

The app must be served over **HTTP** (or HTTPS)—opening `index.html` directly via `file://` will not work reliably (CORS, module loading).

## Quick Start

**Option A — one command** (serves on port **8080**):

```bash
./run.sh
```

**Option B — Python**:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## Project Structure

| Path | Role |
|------|------|
| `index.html` | Entry page; loads React, Tailwind, Babel, and bootstraps the app |
| `ShapedModelExplorer.jsx` | Main application (JSX), fetched and compiled in the browser |
| `sample_items.csv`, `sample_users.csv`, `sample_events.csv` | Sample data for demos and uploads |
| `run.sh` | Convenience script to start a local server on port 8080 |

## How It Works

The browser loads React and Babel from CDNs. It then **fetches** `ShapedModelExplorer.jsx` over HTTP and **compiles** JSX to JavaScript with Babel in the page—no build step or bundler. Tailwind classes are applied via the CDN stylesheet. That’s it: a static SPA with no Node toolchain required.
