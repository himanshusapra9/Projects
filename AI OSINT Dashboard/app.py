from __future__ import annotations

import asyncio
import hashlib
import math
import re
import time
from collections import Counter
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from textblob import TextBlob

app = FastAPI(title="Open Source Intelligence Dashboard")

USER_AGENT = "OpenSourceDashboard/2.0 (educational project)"
CACHE_TTL = 300

_cache: Dict[str, Tuple[float, object]] = {}


# ---------------------------------------------------------------------------
# Cache helpers
# ---------------------------------------------------------------------------
def _cache_key(prefix: str, **kwargs) -> str:
    raw = f"{prefix}:" + "&".join(f"{k}={v}" for k, v in sorted(kwargs.items()))
    return hashlib.md5(raw.encode()).hexdigest()


def _get_cached(key: str):
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
        del _cache[key]
    return None


def _set_cached(key: str, data):
    _cache[key] = (time.time(), data)
    if len(_cache) > 500:
        oldest = min(_cache, key=lambda k: _cache[k][0])
        del _cache[oldest]


# ---------------------------------------------------------------------------
# Shared HTTP client
# ---------------------------------------------------------------------------
async def _http_get(url: str, params: Optional[dict] = None, headers: Optional[dict] = None) -> dict:
    hdrs = {"User-Agent": USER_AGENT}
    if headers:
        hdrs.update(headers)
    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        resp = await client.get(url, headers=hdrs, params=params)
        if resp.status_code == 429:
            raise HTTPException(429, "Rate limit reached. Try again shortly.")
        if resp.status_code != 200:
            raise HTTPException(502, f"Upstream returned {resp.status_code}")
        return resp.json()


# ---------------------------------------------------------------------------
# NLP analysis
# ---------------------------------------------------------------------------
STOP_WORDS = {
    "this", "that", "with", "from", "just", "have", "been", "were", "what",
    "when", "where", "which", "will", "would", "could", "should", "their",
    "there", "they", "them", "then", "than", "these", "those", "about",
    "some", "into", "more", "other", "very", "your", "also", "most",
    "here", "does", "like", "know", "think", "want", "going", "really",
    "people", "because", "make", "made", "much", "still", "even",
    "being", "only", "over", "such", "after", "back", "good", "http",
    "https", "www", "comment", "post", "link", "deleted", "removed",
}


def analyze_text(text: str) -> dict:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    if polarity > 0.1:
        label = "positive"
    elif polarity < -0.1:
        label = "negative"
    else:
        label = "neutral"

    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    freq: Dict[str, int] = {}
    for w in words:
        if w not in STOP_WORDS:
            freq[w] = freq.get(w, 0) + 1
    keywords = sorted(freq, key=lambda k: freq[k], reverse=True)[:5]

    return {
        "polarity": round(polarity, 3),
        "subjectivity": round(subjectivity, 3),
        "label": label,
        "keywords": keywords,
    }


# ---------------------------------------------------------------------------
# Normalised post shape (all sources map to this)
# ---------------------------------------------------------------------------
def _norm(
    source: str,
    id: str,
    title: str,
    body: str,
    author: str,
    score: int,
    num_comments: int,
    permalink: str,
    url: str,
    created_utc: float,
    subreddit: str = "",
    thumbnail: Optional[str] = None,
    preview_url: Optional[str] = None,
    link_flair_text: Optional[str] = None,
    upvote_ratio: float = 0,
    tags: Optional[List[str]] = None,
) -> dict:
    combined = f"{title} {body}".strip()
    analysis = analyze_text(combined)
    created_dt = datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat()
    return {
        "source": source,
        "id": id,
        "title": title,
        "selftext": body[:500],
        "author": author,
        "subreddit": subreddit,
        "score": score,
        "upvote_ratio": upvote_ratio,
        "num_comments": num_comments,
        "permalink": permalink,
        "url": url,
        "thumbnail": thumbnail,
        "preview_url": preview_url,
        "created_utc": created_utc,
        "created_iso": created_dt,
        "link_flair_text": link_flair_text,
        "tags": tags or [],
        "analysis": analysis,
    }


# ===================================================================
# SOURCE: Reddit
# ===================================================================
REDDIT_BASE = "https://www.reddit.com"


def _parse_reddit_post(raw: dict) -> dict:
    d = raw.get("data", raw)
    thumbnail = d.get("thumbnail", "")
    if thumbnail in ("self", "default", "nsfw", "spoiler", "image", ""):
        thumbnail = None
    preview_url = None
    try:
        preview_url = d["preview"]["images"][0]["source"]["url"].replace("&amp;", "&")
    except (KeyError, IndexError, TypeError):
        pass

    return _norm(
        source="reddit",
        id=d.get("id", ""),
        title=d.get("title", ""),
        body=d.get("selftext", ""),
        author=d.get("author", "[deleted]"),
        score=d.get("score", 0),
        num_comments=d.get("num_comments", 0),
        permalink=f"https://reddit.com{d.get('permalink', '')}",
        url=d.get("url", ""),
        created_utc=d.get("created_utc", 0),
        subreddit=d.get("subreddit", ""),
        thumbnail=thumbnail,
        preview_url=preview_url,
        link_flair_text=d.get("link_flair_text"),
        upvote_ratio=d.get("upvote_ratio", 0),
    )


async def reddit_search(q: str, subreddit: str = "all", sort: str = "relevance",
                         time_filter: str = "week", limit: int = 25, after: Optional[str] = None):
    sub = subreddit.strip().strip("/r/").strip("/")
    path = f"/r/{sub}/search.json" if sub and sub != "all" else "/search.json"
    params = {"q": q, "sort": sort, "t": time_filter, "limit": limit,
              "restrict_sr": "on" if sub and sub != "all" else "off",
              "type": "link", "raw_json": 1}
    if after:
        params["after"] = after
    data = await _http_get(f"{REDDIT_BASE}{path}", params)
    children = data.get("data", {}).get("children", [])
    posts = [_parse_reddit_post(c) for c in children]
    return posts, data.get("data", {}).get("after")


async def reddit_subreddit(name: str, sort: str = "hot", time_filter: str = "day",
                            limit: int = 25, after: Optional[str] = None):
    params = {"limit": limit, "raw_json": 1}
    if sort == "top":
        params["t"] = time_filter
    if after:
        params["after"] = after
    data = await _http_get(f"{REDDIT_BASE}/r/{name}/{sort}.json", params)
    children = data.get("data", {}).get("children", [])
    posts = [_parse_reddit_post(c) for c in children]
    return posts, data.get("data", {}).get("after")


# ===================================================================
# SOURCE: Hacker News (Algolia API)
# ===================================================================
HN_SEARCH = "https://hn.algolia.com/api/v1"
HN_ITEM = "https://hacker-news.firebaseio.com/v0"


async def hn_search(q: str, sort: str = "relevance", limit: int = 25,
                     date_from: Optional[int] = None, date_to: Optional[int] = None, page: int = 0):
    endpoint = "search" if sort == "relevance" else "search_by_date"
    params = {"query": q, "tags": "story", "hitsPerPage": limit, "page": page}
    if date_from:
        params["numericFilters"] = f"created_at_i>{date_from}"
        if date_to:
            params["numericFilters"] = f"created_at_i>{date_from},created_at_i<{date_to}"
    data = await _http_get(f"{HN_SEARCH}/{endpoint}", params)
    posts = []
    for hit in data.get("hits", []):
        posts.append(_norm(
            source="hackernews",
            id=hit.get("objectID", ""),
            title=hit.get("title", ""),
            body=hit.get("story_text") or "",
            author=hit.get("author", ""),
            score=hit.get("points", 0),
            num_comments=hit.get("num_comments", 0),
            permalink=f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
            url=hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
            created_utc=hit.get("created_at_i", 0),
            tags=hit.get("_tags", []),
        ))
    return posts, page + 1 if len(data.get("hits", [])) == limit else None


async def hn_front_page(limit: int = 30):
    ids = await _http_get(f"{HN_ITEM}/topstories.json")
    ids = ids[:limit]

    async def fetch_item(item_id: int):
        try:
            item = await _http_get(f"{HN_ITEM}/item/{item_id}.json")
            if not item or item.get("type") != "story":
                return None
            return _norm(
                source="hackernews",
                id=str(item.get("id", "")),
                title=item.get("title", ""),
                body=item.get("text") or "",
                author=item.get("by", ""),
                score=item.get("score", 0),
                num_comments=item.get("descendants", 0),
                permalink=f"https://news.ycombinator.com/item?id={item.get('id', '')}",
                url=item.get("url") or f"https://news.ycombinator.com/item?id={item.get('id', '')}",
                created_utc=item.get("time", 0),
            )
        except Exception:
            return None

    results = await asyncio.gather(*[fetch_item(i) for i in ids])
    return [r for r in results if r]


# ===================================================================
# SOURCE: Lobste.rs
# ===================================================================
LOBSTERS_BASE = "https://lobste.rs"


async def lobsters_search(q: str, limit: int = 25, page: int = 1):
    params = {"q": q, "what": "stories", "order": "relevance", "page": page}
    data = await _http_get(f"{LOBSTERS_BASE}/search.json", params)
    posts = []
    for item in (data if isinstance(data, list) else data.get("results", []))[:limit]:
        created = 0
        try:
            dt = datetime.fromisoformat(item.get("created_at", "").replace("Z", "+00:00"))
            created = dt.timestamp()
        except Exception:
            pass
        posts.append(_norm(
            source="lobsters",
            id=item.get("short_id", ""),
            title=item.get("title", ""),
            body=item.get("description") or "",
            author=item.get("submitter_user", {}).get("username", "") if isinstance(item.get("submitter_user"), dict) else str(item.get("submitter_user", "")),
            score=item.get("score", 0),
            num_comments=item.get("comment_count", 0),
            permalink=item.get("comments_url") or f"{LOBSTERS_BASE}/s/{item.get('short_id', '')}",
            url=item.get("url") or item.get("comments_url", ""),
            created_utc=created,
            tags=item.get("tags", []),
        ))
    return posts


async def lobsters_hot(limit: int = 25, page: int = 1):
    data = await _http_get(f"{LOBSTERS_BASE}/hottest.json", {"page": page})
    items = data if isinstance(data, list) else []
    posts = []
    for item in items[:limit]:
        created = 0
        try:
            dt = datetime.fromisoformat(item.get("created_at", "").replace("Z", "+00:00"))
            created = dt.timestamp()
        except Exception:
            pass
        posts.append(_norm(
            source="lobsters",
            id=item.get("short_id", ""),
            title=item.get("title", ""),
            body=item.get("description") or "",
            author=item.get("submitter_user", {}).get("username", "") if isinstance(item.get("submitter_user"), dict) else str(item.get("submitter_user", "")),
            score=item.get("score", 0),
            num_comments=item.get("comment_count", 0),
            permalink=item.get("comments_url") or f"{LOBSTERS_BASE}/s/{item.get('short_id', '')}",
            url=item.get("url") or item.get("comments_url", ""),
            created_utc=created,
            tags=item.get("tags", []),
        ))
    return posts


# ===================================================================
# SOURCE: DEV.to
# ===================================================================
DEVTO_BASE = "https://dev.to/api"


async def devto_search(q: str, limit: int = 25, page: int = 1):
    params = {"per_page": limit, "page": page}
    if q:
        data = await _http_get(f"{DEVTO_BASE}/articles", {**params, "tag": q})
        if not data:
            data = await _http_get(f"{DEVTO_BASE}/articles/latest", params)
    else:
        data = await _http_get(f"{DEVTO_BASE}/articles/latest", params)

    posts = []
    for item in (data if isinstance(data, list) else []):
        created = 0
        try:
            dt = datetime.fromisoformat(item.get("published_at", "").replace("Z", "+00:00"))
            created = dt.timestamp()
        except Exception:
            pass
        posts.append(_norm(
            source="devto",
            id=str(item.get("id", "")),
            title=item.get("title", ""),
            body=item.get("description") or "",
            author=item.get("user", {}).get("username", ""),
            score=item.get("public_reactions_count", 0),
            num_comments=item.get("comments_count", 0),
            permalink=item.get("url", ""),
            url=item.get("url", ""),
            created_utc=created,
            thumbnail=item.get("cover_image") or item.get("social_image"),
            preview_url=item.get("cover_image") or item.get("social_image"),
            tags=item.get("tag_list", []),
        ))
    return posts


# ===================================================================
# API ROUTES
# ===================================================================

@app.get("/api/search")
async def api_search(
    q: str = Query(..., min_length=1),
    sources: str = Query("reddit,hackernews,lobsters,devto"),
    subreddit: str = Query("all"),
    sort: str = Query("relevance"),
    time_filter: str = Query("week"),
    date_from: Optional[str] = Query(None, description="ISO date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="ISO date YYYY-MM-DD"),
    limit: int = Query(25, ge=1, le=100),
    after: Optional[str] = Query(None),
    page: int = Query(0, ge=0),
):
    src_list = [s.strip() for s in sources.split(",") if s.strip()]
    ts_from = ts_to = None
    if date_from:
        try:
            ts_from = int(datetime.fromisoformat(date_from).replace(tzinfo=timezone.utc).timestamp())
        except Exception:
            pass
    if date_to:
        try:
            ts_to = int(datetime.fromisoformat(date_to).replace(tzinfo=timezone.utc).timestamp())
        except Exception:
            pass

    ck = _cache_key("search", q=q, s=sources, sub=subreddit, sort=sort,
                     t=time_filter, df=date_from, dt=date_to, l=limit, a=after or "", p=page)
    cached = _get_cached(ck)
    if cached is not None:
        return cached

    tasks = []
    next_cursors = {}

    if "reddit" in src_list:
        async def do_reddit():
            posts, nxt = await reddit_search(q, subreddit, sort, time_filter, limit, after)
            next_cursors["reddit"] = nxt
            return posts
        tasks.append(do_reddit())

    if "hackernews" in src_list:
        async def do_hn():
            posts, nxt = await hn_search(q, sort=sort, limit=limit, date_from=ts_from, date_to=ts_to, page=page)
            next_cursors["hackernews"] = nxt
            return posts
        tasks.append(do_hn())

    if "lobsters" in src_list:
        async def do_lobsters():
            return await lobsters_search(q, limit=limit, page=max(1, page + 1))
        tasks.append(do_lobsters())

    if "devto" in src_list:
        async def do_devto():
            return await devto_search(q, limit=limit, page=max(1, page + 1))
        tasks.append(do_devto())

    results = await asyncio.gather(*tasks, return_exceptions=True)
    all_posts = []
    for r in results:
        if isinstance(r, list):
            all_posts.extend(r)

    if ts_from:
        all_posts = [p for p in all_posts if p["created_utc"] >= ts_from]
    if ts_to:
        all_posts = [p for p in all_posts if p["created_utc"] <= ts_to]

    all_posts.sort(key=lambda p: p["score"], reverse=True)

    result = {
        "posts": all_posts,
        "after": next_cursors.get("reddit"),
        "next_page": page + 1,
        "count": len(all_posts),
        "query": q,
        "sources": src_list,
    }
    _set_cached(ck, result)
    return result


@app.get("/api/subreddit/{name}")
async def api_subreddit(
    name: str,
    sort: str = Query("hot"),
    time_filter: str = Query("day"),
    limit: int = Query(25, ge=1, le=100),
    after: Optional[str] = Query(None),
):
    ck = _cache_key("sub", name=name, sort=sort, t=time_filter, limit=limit, after=after or "")
    cached = _get_cached(ck)
    if cached is not None:
        return cached

    posts, nxt = await reddit_subreddit(name, sort, time_filter, limit, after)
    result = {"posts": posts, "after": nxt, "count": len(posts), "subreddit": name}
    _set_cached(ck, result)
    return result


@app.get("/api/trending")
async def api_trending(
    subreddits: str = Query("technology,programming,python,worldnews,science"),
    limit: int = Query(10, ge=1, le=25),
    include_hn: bool = Query(True),
    include_lobsters: bool = Query(True),
    include_devto: bool = Query(True),
):
    ck = _cache_key("trending", subs=subreddits, l=limit, hn=include_hn, lo=include_lobsters, dv=include_devto)
    cached = _get_cached(ck)
    if cached is not None:
        return cached

    subs = [s.strip() for s in subreddits.split(",") if s.strip()][:10]
    tasks = []

    for sub in subs:
        async def fetch_sub(s=sub):
            try:
                posts, _ = await reddit_subreddit(s, "hot", "day", limit)
                return posts
            except Exception:
                return []
        tasks.append(fetch_sub())

    if include_hn:
        async def fetch_hn():
            try:
                return await hn_front_page(limit * 2)
            except Exception:
                return []
        tasks.append(fetch_hn())

    if include_lobsters:
        async def fetch_lob():
            try:
                return await lobsters_hot(limit * 2)
            except Exception:
                return []
        tasks.append(fetch_lob())

    if include_devto:
        async def fetch_dev():
            try:
                return await devto_search("", limit=limit * 2)
            except Exception:
                return []
        tasks.append(fetch_dev())

    results = await asyncio.gather(*tasks, return_exceptions=True)
    all_posts = []
    for r in results:
        if isinstance(r, list):
            all_posts.extend(r)

    all_posts.sort(key=lambda p: p["score"], reverse=True)

    source_names = ["reddit"] + (["hackernews"] if include_hn else []) + \
                   (["lobsters"] if include_lobsters else []) + (["devto"] if include_devto else [])

    result = {"posts": all_posts, "subreddits": subs, "sources": source_names, "count": len(all_posts)}
    _set_cached(ck, result)
    return result


@app.get("/api/analyze")
async def api_analyze_post(url: str = Query(...)):
    if "reddit.com" in url:
        clean = url.replace("https://reddit.com", "").replace("https://www.reddit.com", "")
        if not clean.endswith(".json"):
            clean = clean.rstrip("/") + ".json"
        data = await _http_get(f"{REDDIT_BASE}{clean}", {"raw_json": 1})
        if not isinstance(data, list) or len(data) < 2:
            raise HTTPException(400, "Could not parse post data")
        post = _parse_reddit_post(data[0]["data"]["children"][0])
        comments_raw = data[1]["data"]["children"]
        comments = []
        for c in comments_raw[:20]:
            if c.get("kind") != "t1":
                continue
            body = c["data"].get("body", "")
            ca = analyze_text(body)
            comments.append({"author": c["data"].get("author", "[deleted]"),
                             "body": body[:300], "score": c["data"].get("score", 0), "analysis": ca})
        sentiments = [c["analysis"]["polarity"] for c in comments]
        avg_sentiment = round(sum(sentiments) / len(sentiments), 3) if sentiments else 0
        return {"post": post, "comments": comments, "comment_count": len(comments),
                "avg_comment_sentiment": avg_sentiment}

    return {"post": None, "comments": [], "comment_count": 0, "avg_comment_sentiment": 0}


@app.get("/api/insights")
async def api_insights(
    q: str = Query(..., min_length=1),
    sources: str = Query("reddit,hackernews,lobsters,devto"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    subreddit: str = Query("all"),
):
    """Heavy analysis endpoint: fetch data from all sources and compute cohort / author / engagement insights."""
    ck = _cache_key("insights", q=q, s=sources, df=date_from, dt=date_to, sub=subreddit)
    cached = _get_cached(ck)
    if cached is not None:
        return cached

    search_result = await api_search(q=q, sources=sources, subreddit=subreddit, sort="relevance",
                                      time_filter="all", date_from=date_from, date_to=date_to, limit=100, page=0)
    posts = search_result["posts"]

    if not posts:
        return {"error": "No data found", "posts": [], "insights": {}}

    # --- Sentiment distribution ---
    sentiments = Counter(p["analysis"]["label"] for p in posts)
    total = len(posts)
    sentiment_dist = {
        "positive": sentiments.get("positive", 0),
        "negative": sentiments.get("negative", 0),
        "neutral": sentiments.get("neutral", 0),
        "positive_pct": round(sentiments.get("positive", 0) / total * 100, 1),
        "negative_pct": round(sentiments.get("negative", 0) / total * 100, 1),
        "neutral_pct": round(sentiments.get("neutral", 0) / total * 100, 1),
    }
    avg_polarity = round(sum(p["analysis"]["polarity"] for p in posts) / total, 3)
    avg_subjectivity = round(sum(p["analysis"]["subjectivity"] for p in posts) / total, 3)

    # --- Source distribution ---
    source_counts = Counter(p["source"] for p in posts)
    source_dist = {src: cnt for src, cnt in source_counts.most_common()}

    # --- Author / Cohort analysis ---
    authors = Counter(p["author"] for p in posts)
    unique_authors = len(authors)
    top_authors = [{"author": a, "posts": c, "pct": round(c / total * 100, 1)} for a, c in authors.most_common(15)]
    repeat_authors = sum(1 for c in authors.values() if c > 1)

    author_scores = {}
    for p in posts:
        a = p["author"]
        if a not in author_scores:
            author_scores[a] = {"total_score": 0, "total_comments": 0, "posts": 0}
        author_scores[a]["total_score"] += p["score"]
        author_scores[a]["total_comments"] += p["num_comments"]
        author_scores[a]["posts"] += 1
    top_influencers = sorted(author_scores.items(), key=lambda x: x[1]["total_score"], reverse=True)[:10]
    influencers = [{"author": a, "total_score": d["total_score"],
                    "total_comments": d["total_comments"], "posts": d["posts"],
                    "avg_score": round(d["total_score"] / d["posts"])} for a, d in top_influencers]

    # --- Engagement metrics ---
    scores = [p["score"] for p in posts]
    comments_list = [p["num_comments"] for p in posts]
    avg_score = round(sum(scores) / total)
    median_score = sorted(scores)[total // 2]
    max_score = max(scores)
    avg_comments = round(sum(comments_list) / total)
    total_engagement = sum(scores) + sum(comments_list)

    # --- Keyword / Topic analysis ---
    all_keywords = []
    for p in posts:
        all_keywords.extend(p["analysis"]["keywords"])
    keyword_freq = Counter(all_keywords)
    top_keywords = [{"keyword": k, "count": c} for k, c in keyword_freq.most_common(20)]

    # --- Time cohort (posts per day) ---
    day_buckets: Dict[str, dict] = {}
    for p in posts:
        day = datetime.fromtimestamp(p["created_utc"], tz=timezone.utc).strftime("%Y-%m-%d")
        if day not in day_buckets:
            day_buckets[day] = {"date": day, "count": 0, "total_score": 0, "sentiments": []}
        day_buckets[day]["count"] += 1
        day_buckets[day]["total_score"] += p["score"]
        day_buckets[day]["sentiments"].append(p["analysis"]["polarity"])

    timeline = []
    for day in sorted(day_buckets.keys()):
        b = day_buckets[day]
        s = b["sentiments"]
        timeline.append({
            "date": day,
            "posts": b["count"],
            "avg_score": round(b["total_score"] / b["count"]),
            "avg_sentiment": round(sum(s) / len(s), 3),
        })

    # --- Subreddit / channel breakdown ---
    sub_counts = Counter()
    for p in posts:
        label = p["subreddit"] if p["source"] == "reddit" and p["subreddit"] else p["source"]
        sub_counts[label] += 1
    channel_dist = [{"channel": ch, "count": c, "pct": round(c / total * 100, 1)}
                     for ch, c in sub_counts.most_common(15)]

    # --- Score distribution histogram ---
    if max_score > 0:
        bucket_size = max(1, max_score // 10)
        score_hist: Dict[str, int] = {}
        for s in scores:
            bucket_label = f"{(s // bucket_size) * bucket_size}-{((s // bucket_size) + 1) * bucket_size}"
            score_hist[bucket_label] = score_hist.get(bucket_label, 0) + 1
        score_distribution = [{"range": k, "count": v} for k, v in score_hist.items()]
    else:
        score_distribution = []

    insights = {
        "total_posts": total,
        "unique_authors": unique_authors,
        "repeat_authors": repeat_authors,
        "avg_polarity": avg_polarity,
        "avg_subjectivity": avg_subjectivity,
        "sentiment_distribution": sentiment_dist,
        "source_distribution": source_dist,
        "top_authors": top_authors,
        "influencers": influencers,
        "avg_score": avg_score,
        "median_score": median_score,
        "max_score": max_score,
        "avg_comments": avg_comments,
        "total_engagement": total_engagement,
        "top_keywords": top_keywords,
        "timeline": timeline,
        "channel_distribution": channel_dist,
        "score_distribution": score_distribution,
    }

    result = {"query": q, "posts": posts, "insights": insights}
    _set_cached(ck, result)
    return result


app.mount("/", StaticFiles(directory="static", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
