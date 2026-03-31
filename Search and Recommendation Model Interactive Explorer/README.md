# Shaped Model Explorer

An interactive educational tool that teaches how recommendation and search models work using auction/marketplace-style data. Built as a single self-contained React + Tailwind app.

## Quick Start

Serve the files with any static HTTP server:

```bash
cd "Search and Recommendation Model Interactive Explorer"
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser (1000px+ viewport recommended).

## Features

### 8 Recommendation Models
- **ALS** — Matrix factorization via latent user-item factors
- **EASE** — Item-item similarity autoencoder
- **Two-Tower** — Dual encoder neural retrieval
- **SASRec** — Self-attentive sequential recommendation
- **Item2Vec** — Co-occurrence based item embeddings
- **LightGBM** — Gradient boosted tree scoring
- **Rising Popularity** — Trending engagement momentum
- **Wide & Deep** — Memorization + generalization network

### Model Combination Engine
Fuse 2+ models using:
- Score Averaging
- Reciprocal Rank Fusion (RRF)
- Weighted Blend (with interactive sliders)
- Cascade (configurable top-N)

### CSV Upload + Schema Auto-Detection
Upload custom items, users, and interaction CSVs. The app automatically:
- Maps column names via aliases (e.g. `auction_title` → `title`, `page_views` → `views`)
- Derives tags from text when missing
- Synthesizes users when no user CSV is provided
- Builds histories from interaction events
- Adjusts model behavior based on available features

### Data Diagnostics
Transparent reporting of:
- Detected and mapped schema fields
- Missing fields and fallback logic
- Model operating modes (full, partial, degraded)
- Normalization ranges and data statistics

## Architecture

Single `.jsx` file containing:
- Sample auction dataset (20 items, 4 users)
- CSV parser with intelligent schema inference
- 8 model scoring engines with pure JS logic
- 4 fusion strategies
- SVG/div-based visualizations (heatmaps, scatter plots, attention bars, architecture diagrams)
- Explanation generation layer

## Tech Stack

- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel standalone (for JSX transformation)
- Google Fonts: Syne + JetBrains Mono
- Zero external dependencies / No backend required
