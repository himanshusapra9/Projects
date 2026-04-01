# Discovery Intelligence OS

A full single-page React application that teaches users how recommendation and search models work, lets them run and combine models on auction data, and frames the entire experience around solving real e-commerce discovery problems.

Built as a self-contained React + Tailwind app with three tabs: **Learn** for understanding concepts, **Discover** for dataset analysis and model recommendations, and **Wizard** for hands-on experimentation.

## Quick Start

Serve the files with any static HTTP server:

```bash
cd "Discovery Intelligence OS"
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser (1000px+ viewport recommended).

## App Structure

### Landing Page

A marketing-style landing page with six sections:

- **Hero** — Headline, Baymard Institute stat, animated broken/fixed pipeline diagram with pulsing dots
- **The Problem** — Three pain-point cards (Catalog, Query, Merchandising) with stats
- **The Solution** — Five-stage pipeline (Catalog Health → Query Understanding → Model Ensemble → Explainable Results → Merch Controls) as connected, expandable boxes
- **Who This Is For** — Three persona cards (Merchandising Manager, Search Engineer, VP of E-commerce)
- **Live Preview Teaser** — Static side-by-side comparison of Rising Popularity vs ALS+SASRec results
- **Footer CTA** — "Enter the tool" call to action

### Learn Tab

A guided educational experience covering:

- **The Ranking Pipeline** — Interactive 4-stage funnel (Retrieve → Score → Reorder → Final Results) with clickable stages that filter models. Toggle overlays show how search and personalization influence each stage.
- **9 Models Explained** — Expandable cards for every model with: analogy, step-by-step logic, live worked example on sample data, search usage badge (USES / PARTIAL / IGNORES), when-to-use guidance, and a "See it in Playground" button.
- **Combining Models** — Visual cards for four fusion strategies with mini diagrams and "choose this if" hints.
- **Model Recommendation Advisor** — Describe your problem or pick pain-point chips and get a recommended model stack.

### Discover Tab

Dataset analysis and model recommendation engine:

- **Data Source Toggle** — Analyze built-in sample data or upload your own CSVs
- **Downloadable Sample CSVs** — Items, Users, and Events CSV templates with format preview
- **Dataset Fingerprint** — SVG radar chart (Text Quality, User History, Interaction Volume, Attributes, Categories, Recency) plus 10 color-coded metrics
- **Discovery Failure Modes** — Six expandable gap cards (Zero-result risk, Cold-start exposure, Popularity bias, Vocabulary mismatch, Serendipity deficit, Recency blindness) with severity, evidence, root cause, and detail
- **Recommended Models** — Ranked model suggestions with fit scores, prerequisite checks, and progress bars
- **Action Plan** — Prioritized checklist (P0/P1/P2) of data improvements with impact estimates
- **Quick-Start Config** — JSON export of recommended stack with "Load into Wizard" button

### Wizard (5-Stage Tool)

A 5-step guided wizard with horizontal stepper navigation:

1. **Catalog Health** — Data quality score (74/100), attribute completeness, title consistency, category coverage, variant grouping. Issues detected section. Attribute extraction preview. Active user selector with signal summaries.
2. **Query & Intent** — Search input with example chips, intent parser (product type, attributes, price signals, use case, ambiguity), intent weight slider (0-100), "How each model uses your query" table, live preview of result shifts.
3. **Model Configuration** — 8 model cards in a grid (ALS, EASE, Two-Tower, SASRec, Item2Vec, LightGBM, Rising Popularity, Wide & Deep). Fusion strategy selector (Score Averaging, RRF, Weighted Blend, Cascade) with conditional UI.
4. **Results + Explainability** — Summary bar, confidence meter, consensus vs unique discoveries, ranked result cards with dynamic plain-English reasons, item detail panel with score breakdown + confidence intervals (±std%), "What if" section, model comparison table, search impact analysis, A/B test simulator (100 synthetic users), session learning indicator.
5. **Merchandising Controls** — Rule builder (boost/bury/pin per item), live rank preview (before/after), rule transparency panel with conflict warnings, preset rule chips.

## 9 Recommendation & Search Models

| Model | Stage | Type | Description |
|-------|-------|------|-------------|
| **BM25** | Retrieve | Lexical search | Robertson BM25 with field-weighted scoring (title/tags/category) |
| **ALS** | Retrieve | Collaborative filtering | Matrix factorization with global, user, and item bias terms |
| **EASE** | Retrieve | Autoencoder | Item-item similarity weighted by user history |
| **Two-Tower** | Retrieve | Neural retrieval | Dual encoder with cosine similarity scoring |
| **Item2Vec** | Retrieve | Embeddings | Co-occurrence based item embeddings from sessions |
| **SASRec** | Score | Sequential | Sinusoidal positional encoding + scaled dot-product attention |
| **LightGBM** | Score | GBT | Min-max normalized features with bid velocity and cross-features |
| **Wide & Deep** | Score | Hybrid | Wide linear memorization + deep neural generalization |
| **Rising Popularity** | Reorder | Trending | Engagement momentum scoring |

Every model dynamically adapts its scoring logic based on available data features and the intent slider setting.

## Model Combination Engine

Fuse 2+ models using:
- **Score Averaging** — Normalize scores to [0,1], then average
- **Reciprocal Rank Fusion (RRF)** — Score = Σ 1/(60 + rank), rewards cross-model agreement
- **Weighted Blend** — Custom weight per model with interactive sliders
- **Cascade** — Model 1 retrieves top-N, Model 2 re-ranks only those candidates

## Advanced Features

### Session Signals
Tracks item clicks during a session and blends recency boosts into model scores. A "Learning from session" indicator appears in the results dashboard.

### Confidence Intervals
Jackknife-style bootstrap (20 runs) produces per-item, per-model stability indicators (stable / uncertain / noisy) with ±std% displayed on score bars.

### A/B Test Simulator
Compare your current model stack (Control) against an alternative (Treatment) using 100 synthetic users generated from seed profiles with a deterministic PRNG. Reports CTR, Precision@5, and Recall@10.

### Dataset Profiler (Discover Tab)
Analyzes any dataset to compute: attribute density, interaction sparsity, cold-start ratio, popularity concentration, text richness, tag coverage, and more. Produces a radar chart fingerprint and recommends specific models based on data characteristics.

## CSV Upload + Schema Auto-Detection

Upload custom items, users, and interaction CSVs. The app automatically:
- Maps column names via aliases (e.g. `auction_title` → `title`, `page_views` → `views`)
- Derives tags from text when missing
- Synthesizes users when no user CSV is provided
- Builds histories from interaction events
- Adjusts model behavior based on available features
- Shows a detected schema panel with mapped, inferred, missing fields and fallback logic

Sample CSVs are provided for download in the Discover tab.

## Architecture

Single `.jsx` file (~2600 lines) containing:
- Landing page with animated pipeline diagrams
- Sample auction dataset (20 items, 4 users)
- CSV parser with intelligent schema inference
- 9 model scoring engines with pure JS logic (BM25 with Robertson IDF, ALS with bias terms, SASRec with positional encoding, LightGBM with derived features)
- Intent-weight search blending across all models
- 4 fusion strategies
- Session signal tracking and blending
- Jackknife confidence intervals
- A/B test simulator with synthetic users
- Dataset profiler with radar chart and gap analysis
- SVG/div-based visualizations (heatmaps, scatter plots, attention bars, radar charts)
- Recommendation advisor with pain-point matching
- Results dashboard with confidence, consensus, and contribution analysis
- Merchandising rule engine with transparency panel
- Explanation generation layer

## Tech Stack

- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel standalone (for in-browser JSX transformation)
- Google Fonts: Inter
- Zero external dependencies / No backend required
