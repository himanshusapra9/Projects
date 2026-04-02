"""Unit tests for HTTP fetchers; httpx.AsyncClient is mocked."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from fetchers.academic import fetch_openalex, fetch_semantic_scholar
from fetchers.github import fetch_github_repos
from fetchers.news import fetch_news
from fetchers.social import fetch_hackernews, fetch_reddit
from fetchers.video import fetch_youtube
from fetchers.web import fetch_brave_search


def _make_async_client_mock(get_coro) -> MagicMock:
    mock_client = MagicMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=None)
    mock_client.get = AsyncMock(side_effect=get_coro)
    mock_client.post = AsyncMock()
    return mock_client


@pytest.mark.asyncio
async def test_fetch_openalex_returns_two_works_with_required_fields() -> None:
    work1 = {
        "title": "Paper One",
        "abstract_inverted_index": {"Hello": [0], "world": [1]},
        "authorships": [{"author": {"display_name": "Alice"}}],
        "publication_date": "2024-01-01",
        "id": "https://openalex.org/W1",
        "doi": "10.1000/one",
        "cited_by_count": 10,
    }
    work2 = {
        "title": "Paper Two",
        "abstract_inverted_index": {},
        "authorships": [{"author": {"display_name": "Bob"}}],
        "publication_date": "2023-06-15",
        "id": "https://openalex.org/W2",
        "doi": "",
        "cited_by_count": 0,
    }
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"results": [work1, work2]}
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with patch("fetchers.academic.httpx.AsyncClient", return_value=mock_client):
        results = await fetch_openalex("quantum")

    assert len(results) == 2
    for item in results:
        assert item["source_type"] == "academic"
        assert item["source_name"] == "OpenAlex"
        assert "title" in item
        assert "abstract" in item
        assert "authors" in item
        assert "date" in item
        assert "url" in item
    assert results[0]["title"] == "Paper One"
    assert "Hello world" in results[0]["abstract"] or results[0]["abstract"]


@pytest.mark.asyncio
async def test_fetch_semantic_scholar_returns_parsed_papers() -> None:
    paper1 = {
        "title": "SS Paper A",
        "abstract": "Abstract A",
        "year": 2023,
        "authors": [{"name": "Zed"}],
        "paperId": "abc123",
        "externalIds": {"DOI": "10.1/a"},
        "citationCount": 5,
        "tldr": None,
    }
    paper2 = {
        "title": "SS Paper B",
        "abstract": "",
        "year": 2022,
        "authors": [],
        "paperId": "def456",
        "externalIds": {},
        "citationCount": 0,
        "tldr": {"text": "TLDR summary"},
    }
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"data": [paper1, paper2]}
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with patch("fetchers.academic.httpx.AsyncClient", return_value=mock_client):
        results = await fetch_semantic_scholar("neural nets")

    assert len(results) == 2
    for item in results:
        assert item["source_type"] == "academic"
        assert item["source_name"] == "Semantic Scholar"
        assert "title" in item
        assert "abstract" in item
        assert "authors" in item
        assert "date" in item
        assert "url" in item


@pytest.mark.asyncio
async def test_fetch_brave_search_returns_web_items() -> None:
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "web": {
            "results": [
                {
                    "title": "Result 1",
                    "description": "Snippet one",
                    "url": "https://example.com/1",
                    "age": "1 day ago",
                },
            ]
        }
    }
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with patch("fetchers.web.httpx.AsyncClient", return_value=mock_client):
        results = await fetch_brave_search("query", api_key="k")

    assert len(results) == 1
    r = results[0]
    assert r["source_type"] == "web"
    assert r["title"] == "Result 1"
    assert r["text"] == "Snippet one"
    assert r["url"] == "https://example.com/1"


@pytest.mark.asyncio
async def test_fetch_reddit_returns_social_items() -> None:
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "data": {
            "children": [
                {
                    "data": {
                        "title": "Post title",
                        "selftext": "Body text",
                        "permalink": "/r/test/comments/1/x/",
                        "score": 42,
                        "num_comments": 3,
                    }
                }
            ]
        }
    }
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with patch("fetchers.social.httpx.AsyncClient", return_value=mock_client):
        results = await fetch_reddit("topic")

    assert len(results) == 1
    assert results[0]["source_type"] == "social"
    assert results[0]["title"] == "Post title"
    assert results[0]["text"] == "Body text"
    assert "reddit.com" in results[0]["url"]


@pytest.mark.asyncio
async def test_fetch_hackernews_returns_social_items() -> None:
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "hits": [
            {
                "title": "HN Story",
                "url": "https://example.com/story",
                "created_at": "2024-01-01",
                "points": 100,
                "num_comments": 20,
                "objectID": "99",
            }
        ]
    }
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with patch("fetchers.social.httpx.AsyncClient", return_value=mock_client):
        results = await fetch_hackernews("startup")

    assert len(results) == 1
    assert results[0]["source_type"] == "social"
    assert results[0]["title"] == "HN Story"


@pytest.mark.asyncio
async def test_fetch_news_returns_news_items() -> None:
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "articles": [
            {
                "title": "Headline",
                "description": "Lead",
                "content": None,
                "url": "https://news.example/a",
                "publishedAt": "2024-01-01T00:00:00Z",
                "source": {"name": "Example News"},
                "author": "Reporter",
            }
        ]
    }
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with patch("fetchers.news.httpx.AsyncClient", return_value=mock_client):
        results = await fetch_news("politics", api_key="key")

    assert len(results) == 1
    assert results[0]["source_type"] == "news"
    assert results[0]["title"] == "Headline"


@pytest.mark.asyncio
async def test_fetch_github_repos_returns_github_items() -> None:
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "items": [
            {
                "full_name": "org/repo",
                "description": "A project",
                "html_url": "https://github.com/org/repo",
                "updated_at": "2024-01-01T00:00:00Z",
                "stargazers_count": 1000,
                "forks_count": 50,
            }
        ]
    }
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with patch("fetchers.github.httpx.AsyncClient", return_value=mock_client):
        results = await fetch_github_repos("machine learning", token="")

    assert len(results) == 1
    assert results[0]["source_type"] == "github"
    assert results[0]["title"] == "org/repo"


@pytest.mark.asyncio
async def test_fetch_youtube_returns_video_items() -> None:
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "items": [
            {
                "id": {"videoId": "dQw4w9WgXcQ"},
                "snippet": {
                    "title": "Video Title",
                    "description": "Desc",
                    "channelTitle": "Ch",
                    "publishedAt": "2024-01-01T00:00:00Z",
                },
            }
        ]
    }
    mock_resp.raise_for_status = MagicMock()

    async def get_side_effect(*_a, **_kw):
        return mock_resp

    mock_client = _make_async_client_mock(get_side_effect)

    with (
        patch("fetchers.video.httpx.AsyncClient", return_value=mock_client),
        patch("fetchers.video.asyncio.to_thread", new_callable=AsyncMock) as mock_thread,
    ):
        mock_thread.return_value = ""
        results = await fetch_youtube("tutorial", api_key="ytkey")

    mock_thread.assert_called()
    assert len(results) == 1
    assert results[0]["source_type"] == "video"
    assert results[0]["source_name"] == "YouTube"
    assert results[0]["title"] == "Video Title"
