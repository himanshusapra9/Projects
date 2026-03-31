# Shaped Model Explorer

An interactive educational tool that teaches how recommendation and search models work using auction/marketplace-style data. Built as a single self-contained React + Tailwind app with two modes: a **Learn** tab for understanding concepts, and a **Playground** for hands-on experimentation.

## Quick Start

Serve the files with any static HTTP server:

```bash
cd "Projects/Search and Recommendation Model Interactive Explorer"
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser (1000px+ viewport recommended).

Or from the repository root:

```bash
cd "Search and Recommendation Model Interactive Explorer"
python3 -m http.server 8080
```

## App Structure

### Learn Tab
A guided educational experience covering:

- **The Ranking Pipeline** — Interactive 4-stage funnel (Retrieve → Score → Reorder → Final Results) with clickable stages that filter models. Three toggle overlays show how search, personalization, and multi-index retrieval influence each stage.
- **Core Concepts** — Three cards explaining How Search Works, How Personalization Works, and How Multi-Indexing Works, each with mini diagrams and a shortcut to preconfigure the Playground.
- **9 Models Explained** — Expandable cards for every model, each containing: an analogy, step-by-step logic, a live worked example on the sample data, search usage badge (USES / PARTIAL / IGNORES), output behavior, when-to-use guidance, and a "See it in Playground" button.
- **Combining Models** — Visual cards for four fusion strategies with mini diagrams and "choose this if" hints.
- **Model Recommendation Advisor** — Describe your problem or pick pain-point chips (cold start, weak personalization, poor search relevance, etc.) and get a recommended model stack with primary model, supporting model, fusion strategy, reasoning, watchouts, and data gaps.

### Playground Tab
A 4-step guided wizard:

1. **Who to recommend to** — Pick a user card showing name, history emoji chips, preference tags, and inferred signal summary with tag frequency counts. Toggle between sample data and CSV upload.
2. **Search & intent** — Enter a search query (or pick from chips), adjust an intent slider from "Pure personalization" to "Pure search match" with 5-tier descriptive labels, view a "How each model uses your search" table, and see a live query preview comparing results without vs with the query.
3. **Choose models** — Select from a 3×3 grid of model cards (name, type, stage, description, best-for, tradeoff). Selecting 2+ models reveals fusion strategy cards (Score Averaging, RRF, Weighted Blend, Cascade).
4. **Results dashboard** — Rich analysis including:
   - **Recommendation Confidence** meter based on top-result consensus
   - **Consensus Picks** (items in top 5 of every model) and **Unique Discoveries** (items found by exactly one model)
   - **Model Contribution Map** — Grid of top results vs active models
   - **Your Search Impact** — Side-by-side comparison with and without query
   - **What did combining models do?** — Single-model vs fused comparison
   - **Model Internals & Visualizations** — Per-model SVG/div visualizations
   - **Data Diagnostics** — Schema mapping, missing fields, fallback logic, model operating modes
   - **Result cards** with score bars, multi-reason explanations (interest match, consensus, BM25 match, trending, unique find), and per-model rank badges

## 9 Recommendation & Search Models

| Model | Stage | Type | Description |
|-------|-------|------|-------------|
| **BM25** | Retrieve | Lexical search | TF-IDF-style term matching between query and item text |
| **ALS** | Retrieve | Collaborative filtering | Matrix factorization via latent user-item factors |
| **EASE** | Retrieve | Autoencoder | Item-item similarity weighted by user history |
| **Two-Tower** | Retrieve | Neural retrieval | Dual encoder with cosine similarity scoring |
| **Item2Vec** | Retrieve | Embeddings | Co-occurrence based item embeddings from sessions |
| **SASRec** | Score | Sequential | Self-attention over interaction sequences |
| **LightGBM** | Score | GBT | Gradient boosted trees over numeric + categorical features |
| **Wide & Deep** | Score | Hybrid | Wide linear memorization + deep neural generalization |
| **Rising Popularity** | Reorder | Trending | Engagement momentum scoring |

Every model dynamically adapts its scoring logic based on available data features and the intent slider setting.

## Model Combination Engine

Fuse 2+ models using:
- **Score Averaging** — Normalize scores to [0,1], then average
- **Reciprocal Rank Fusion (RRF)** — Score = Σ 1/(60 + rank), rewards cross-model agreement
- **Weighted Blend** — Custom weight per model with interactive sliders
- **Cascade** — Model 1 retrieves top-N, Model 2 re-ranks only those candidates

## CSV Upload + Schema Auto-Detection

Upload custom items, users, and interaction CSVs. The app automatically:
- Maps column names via aliases (e.g. `auction_title` → `title`, `page_views` → `views`)
- Derives tags from text when missing
- Synthesizes users when no user CSV is provided
- Builds histories from interaction events
- Adjusts model behavior based on available features
- Shows a detected schema panel with mapped, inferred, missing fields and fallback logic

## Architecture

Single `.jsx` file (~2400 lines) containing:
- Sample auction dataset (20 items, 4 users)
- CSV parser with intelligent schema inference
- 9 model scoring engines with pure JS logic
- Intent-weight search blending across all models
- 4 fusion strategies
- SVG/div-based visualizations (heatmaps, scatter plots, attention bars, architecture diagrams)
- Recommendation advisor with pain-point matching
- Results dashboard with confidence, consensus, and contribution analysis
- Explanation generation layer

## Tech Stack

- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel standalone (for in-browser JSX transformation)
- Google Fonts: Inter
- Zero external dependencies / No backend required
