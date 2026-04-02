from __future__ import annotations

import asyncio
from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


async def fetch_openalex(
    query: str, year_range: str = "2020-2026", max_results: int = 50
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://api.openalex.org/works",
                params={
                    "search": query,
                    "filter": f"publication_year:{year_range}",
                    "per-page": min(max_results, 50),
                    "select": (
                        "id,title,abstract_inverted_index,authorships,"
                        "publication_date,doi,cited_by_count,concepts,locations"
                    ),
                },
                headers={
                    "User-Agent": "OmniResearch/1.0 (mailto:contact@omniresearch.io)",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return [_parse_openalex_work(w) for w in data.get("results", [])]
        except Exception:
            return []


def _parse_openalex_work(work: dict[str, Any]) -> dict[str, Any]:
    abstract_index = work.get("abstract_inverted_index") or {}
    abstract = _reconstruct_abstract(abstract_index)
    authorships = work.get("authorships", [])
    authors = [a.get("author", {}).get("display_name", "") for a in authorships]
    return {
        "title": work.get("title", ""),
        "abstract": abstract,
        "authors": authors,
        "date": work.get("publication_date", ""),
        "url": work.get("id", ""),
        "doi": work.get("doi", ""),
        "source_type": "academic",
        "source_name": "OpenAlex",
        "citation_count": work.get("cited_by_count", 0),
        "data_type": "journal_article",
        "geographic_region": "Global",
    }


def _reconstruct_abstract(inverted_index: dict[str, Any]) -> str:
    if not inverted_index:
        return ""
    word_positions: list[tuple[int, str]] = []
    for word, positions in inverted_index.items():
        for pos in positions:
            word_positions.append((pos, word))
    word_positions.sort(key=lambda x: x[0])
    return " ".join(w for _, w in word_positions)


async def fetch_semantic_scholar(
    query: str, max_results: int = 50
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://api.semanticscholar.org/graph/v1/paper/search",
                params={
                    "query": query,
                    "limit": min(max_results, 50),
                    "fields": (
                        "title,abstract,year,authors,externalIds,citationCount,"
                        "influentialCitationCount,isOpenAccess,openAccessPdf,"
                        "fieldsOfStudy,tldr"
                    ),
                },
            )
            resp.raise_for_status()
            return [_parse_ss_paper(p) for p in resp.json().get("data", [])]
        except Exception:
            return []


def _parse_ss_paper(paper: dict[str, Any]) -> dict[str, Any]:
    authors = [a.get("name", "") for a in paper.get("authors", [])]
    external_ids = paper.get("externalIds", {}) or {}
    doi = external_ids.get("DOI", "")
    tldr = paper.get("tldr")
    abstract = paper.get("abstract", "") or ""
    if tldr and isinstance(tldr, dict):
        abstract = abstract or str(tldr.get("text", ""))
    return {
        "title": paper.get("title", ""),
        "abstract": abstract,
        "authors": authors,
        "date": str(paper.get("year", "")),
        "url": f"https://www.semanticscholar.org/paper/{paper.get('paperId', '')}",
        "doi": doi,
        "source_type": "academic",
        "source_name": "Semantic Scholar",
        "citation_count": paper.get("citationCount", 0),
        "data_type": "journal_article",
        "geographic_region": "Global",
    }


def _fetch_arxiv_sync(query: str, max_results: int) -> list[dict[str, Any]]:
    import arxiv

    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance,
    )
    results: list[dict[str, Any]] = []
    for paper in client.results(search):
        results.append(
            {
                "title": paper.title,
                "abstract": paper.summary,
                "authors": [a.name for a in paper.authors],
                "date": paper.published.isoformat() if paper.published else "",
                "url": paper.entry_id,
                "doi": paper.doi or "",
                "source_type": "academic",
                "source_name": "arXiv",
                "citation_count": 0,
                "data_type": "preprint",
                "geographic_region": "Global",
            }
        )
    return results


async def fetch_arxiv(query: str, max_results: int = 30) -> list[dict[str, Any]]:
    try:
        return await asyncio.to_thread(_fetch_arxiv_sync, query, max_results)
    except Exception:
        return []


def _fetch_pubmed_sync(query: str, max_results: int) -> list[dict[str, Any]]:
    from Bio import Entrez

    Entrez.email = "contact@omniresearch.io"
    handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results)
    record = Entrez.read(handle)
    handle.close()
    ids = record.get("IdList", [])
    if not ids:
        return []
    handle = Entrez.efetch(
        db="pubmed", id=",".join(ids), rettype="xml", retmode="xml"
    )
    records = Entrez.read(handle)
    handle.close()
    articles = records.get("PubmedArticle", [])
    if isinstance(articles, dict):
        articles = [articles]
    return [_parse_pubmed_record(r) for r in articles]


async def fetch_pubmed(query: str, max_results: int = 30) -> list[dict[str, Any]]:
    try:
        return await asyncio.to_thread(_fetch_pubmed_sync, query, max_results)
    except Exception:
        return []


def _parse_pubmed_record(record: dict[str, Any]) -> dict[str, Any]:
    medline = record.get("MedlineCitation", {})
    article = medline.get("Article", {})
    title = str(article.get("ArticleTitle", ""))
    abstract_data = article.get("Abstract", {})
    abstract_texts = abstract_data.get("AbstractText", [])
    if isinstance(abstract_texts, str):
        abstract = abstract_texts
    else:
        abstract = " ".join(str(t) for t in abstract_texts)
    authors_list = article.get("AuthorList", [])
    authors: list[str] = []
    for auth in authors_list:
        last = auth.get("LastName", "")
        first = auth.get("ForeName", "")
        if last:
            authors.append(f"{first} {last}".strip())
    pmid = str(medline.get("PMID", ""))
    return {
        "title": title,
        "abstract": abstract,
        "authors": authors,
        "date": "",
        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        "doi": "",
        "source_type": "academic",
        "source_name": "PubMed",
        "citation_count": 0,
        "data_type": "journal_article",
        "geographic_region": "Global",
    }
