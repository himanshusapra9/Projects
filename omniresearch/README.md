# OmniResearch — Universal Open-Source Multi-Source Intelligence Agent

OmniResearch aggregates information across academic papers, live web, GitHub repositories,
YouTube transcripts, podcast audio, Reddit, Hacker News, and news outlets into a single
research workflow. It uses Claude for query planning and report synthesis, sentence-transformers
for semantic deduplication, and cross-encoder reranking to surface the most relevant results.

## What's Implemented

### Backend (Python 3.11+ / FastAPI)

**Multi-source async fetchers** — each fetcher is a real, working async module:

| Fetcher | Sources | API/Method |
|---------|---------|------------|
| `academic.py` | OpenAlex, Semantic Scholar, arXiv, PubMed | REST APIs + `arxiv` + `Bio.Entrez` packages |
| `web.py` | Brave Search, Tavily, Wikipedia | REST APIs |
| `video.py` | YouTube | YouTube Data API v3 + `youtube-transcript-api` |
| `audio.py` | Podcasts (ListenNotes) | ListenNotes API + local Whisper transcription |
| `social.py` | Reddit, Hacker News | Reddit JSON search, Algolia HN API |
| `news.py` | NewsAPI | NewsAPI v2 REST |
| `github.py` | GitHub repositories | GitHub REST API |
| `datasets.py` | Kaggle | Kaggle public API (unauthenticated) |
| `huggingface.py` | HuggingFace models | HF Hub API (standalone, not wired into pipeline) |

**ML modules** (local model inference, no external ML APIs):

| Module | Model | Status |
|--------|-------|--------|
| `embeddings.py` | BAAI/bge-large-en-v1.5 (sentence-transformers) | Active — used for deduplication |
| `reranker.py` | cross-encoder/ms-marco-MiniLM-L-6-v2 | Active — used for semantic retrieval |
| `credibility.py` | Heuristic scoring by source type + citations | Active — scores all documents |
| `transcription.py` | openai-whisper (base model, local) | Active — used by audio fetcher |
| `sentiment.py` | cardiffnlp/twitter-roberta-base-sentiment-latest | Implemented, tested, not in agent pipeline |
| `summarizer.py` | facebook/bart-large-cnn | Implemented, not in agent pipeline |
| `ner.py` | dslim/bert-base-NER | Implemented, not in agent pipeline |
| `topic_model.py` | BERTopic + all-MiniLM-L6-v2 | Implemented, not in agent pipeline |

**Agent pipeline** (LangGraph StateGraph — defined but not invoked from API routes):

1. `query_planner.py` — Claude claude-sonnet-4-6 decomposes query into sub-queries with target sources
2. `source_fetcher.py` — Parallel async fetching across sub-queries × source types
3. `content_processor.py` — Credibility scoring + embedding-based deduplication
4. `semantic_retriever.py` — Cross-encoder reranking of top documents
5. `synthesis_agent.py` — Claude claude-sonnet-4-6 streaming synthesis with [Source N] citations
6. `export_generator.py` — CSV (pandas), PDF (reportlab), JSON, Markdown export

**API routes** (FastAPI):

- `POST /research` — Enqueues a Celery task (task body is a status stub; does not yet invoke the agent graph)
- `GET /research/{id}/status` — Reads task status from Redis
- `GET /research/{id}/export/{format}` — Returns sample export data (not yet wired to real results)
- `GET /health` — Health check

**Infrastructure**: Redis (task state), ChromaDB client (implemented but unused), Celery (broker wiring only).

### Frontend (Next.js 14 placeholder)

- Landing page, research interface, results view, and docs page scaffolded
- Component stubs: QueryInput, ProgressPanel, StreamingReport, SentimentGauge, SourceMatrix, ExportPanel, SourceSidebar

### Tests (22 passing)

- Unit tests for fetchers (mocked HTTP), sentiment, embeddings/dedup, credibility scoring, CSV/PDF export
- Integration test stubs for full pipeline and streaming (skipped without API keys)

## Architecture Note

The agent pipeline modules (fetchers, ML, LangGraph graph) are **fully implemented as library code** but the
FastAPI service layer currently uses a stub Celery task. To run the full pipeline programmatically:

```python
from agents.graph import build_research_graph
graph = build_research_graph()
result = graph.invoke({"query": "your research question"})
```

## Stack

- **Backend**: Python, FastAPI, Celery + Redis, LangGraph
- **LLM**: Claude claude-sonnet-4-6 (Anthropic SDK) for planning + synthesis
- **Embeddings**: BAAI/bge-large-en-v1.5 (sentence-transformers)
- **Reranking**: cross-encoder/ms-marco-MiniLM-L-6-v2
- **Transcription**: openai-whisper (local)
- **Vector Store**: ChromaDB (client implemented, not yet integrated)
- **Export**: pandas + reportlab (PDF) + openpyxl (Excel)
- **Frontend**: Next.js 14, Tailwind CSS

## Setup

```bash
cd omniresearch
python -m venv .venv && source .venv/bin/activate
make install
cp .env.example .env   # Fill in API keys
make test
make dev               # Docker Compose: API + Redis + ChromaDB + frontend
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude for query planning + synthesis |
| `BRAVE_SEARCH_API_KEY` | Brave web search |
| `TAVILY_API_KEY` | Tavily web search (alternative) |
| `YOUTUBE_DATA_API_KEY` | YouTube metadata + transcripts |
| `NEWS_API_KEY` | NewsAPI articles |
| `LISTEN_NOTES_API_KEY` | Podcast search + audio |
| `GITHUB_TOKEN` | Higher GitHub API rate limits |
| `REDIS_URL` | Celery broker + task state |
| `CHROMADB_URL` | Vector store (planned) |
