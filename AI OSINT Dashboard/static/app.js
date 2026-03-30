(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const SOURCE_LABELS = { reddit: "Reddit", hackernews: "Hacker News", lobsters: "Lobsters", devto: "DEV.to" };
  const SOURCE_COLORS = { reddit: "#ff4500", hackernews: "#ff6600", lobsters: "#c44", devto: "#3b49df" };

  const state = {
    searchAfter: null,
    searchPage: 0,
    searchPosts: [],
    browseAfter: null,
    browsePosts: [],
    layout: "grid",
    analysisCharts: [],
    analysisData: null,
  };

  // ===== Navigation =====
  $$(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".nav-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      $$(".view").forEach((v) => v.classList.remove("active"));
      $(`#view-${tab.dataset.view}`).classList.add("active");
      if (tab.dataset.view === "trending" && !$("#trendingResults").children.length) loadTrending();
      if (tab.dataset.view === "browse" && !$("#browseResults").children.length) loadBrowse();
    });
  });

  // ===== Layout toggle =====
  $$(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".view-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.layout = btn.dataset.layout;
      $("#searchResults").classList.toggle("list-layout", state.layout === "list");
    });
  });

  // ===== Custom date toggle =====
  $("#searchTime").addEventListener("change", () => {
    const isCustom = $("#searchTime").value === "custom";
    $("#customDateGroup").style.display = isCustom ? "" : "none";
    $("#customDateGroup2").style.display = isCustom ? "" : "none";
  });

  // ===== Loading =====
  function setLoading(on) {
    $("#loadingOverlay").classList.toggle("active", on);
    $("#statusDot").classList.toggle("loading", on);
  }
  function setError() {
    $("#statusDot").classList.add("error");
    setTimeout(() => $("#statusDot").classList.remove("error"), 3000);
  }

  // ===== API =====
  async function api(path, params = {}) {
    const url = new URL(path, location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") url.searchParams.set(k, v);
    });
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API ${res.status}`);
      return await res.json();
    } catch (err) {
      setError();
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ===== Render helpers =====
  function timeAgo(utc) {
    const diff = Date.now() / 1000 - utc;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(utc * 1000).toLocaleDateString();
  }
  function sentimentClass(l) { return `sentiment-${l}`; }
  function sentimentIcon(l) { return l === "positive" ? "&#9650;" : l === "negative" ? "&#9660;" : "&#9679;"; }
  function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }

  function getSelectedSources(cssClass) {
    return $$(`.${cssClass}:checked`).map((cb) => cb.value).join(",");
  }

  function sourceBadge(source) {
    return `<span class="post-source-badge badge-${source}">${SOURCE_LABELS[source] || source}</span>`;
  }

  function renderPostCard(post) {
    const card = document.createElement("div");
    card.className = "post-card";
    card.dataset.source = post.source;
    card.addEventListener("click", () => openPostDetail(post));

    const imgHtml = (post.preview_url || post.thumbnail)
      ? `<img class="post-preview" src="${escapeHtml(post.preview_url || post.thumbnail)}" alt="" loading="lazy" onerror="this.style.display='none'">` : "";
    const flairHtml = post.link_flair_text ? `<span class="post-flair">${escapeHtml(post.link_flair_text)}</span>` : "";
    const channelLabel = post.source === "reddit" && post.subreddit ? `r/${escapeHtml(post.subreddit)}` : "";
    const tagsHtml = (post.tags || []).slice(0, 3).map((t) => `<span class="post-flair">${escapeHtml(t)}</span>`).join("");
    const keywordsHtml = post.analysis.keywords.map((k) => `<span class="keyword-tag">${escapeHtml(k)}</span>`).join("");

    card.innerHTML = `
      <div class="post-subreddit">${sourceBadge(post.source)} ${channelLabel} ${flairHtml} ${tagsHtml}</div>
      ${imgHtml}
      <div class="post-title">${escapeHtml(post.title)}</div>
      ${post.selftext ? `<div class="post-excerpt">${escapeHtml(post.selftext)}</div>` : ""}
      <div class="post-meta">
        <span class="post-meta-item post-score">&#9650; ${post.score.toLocaleString()}</span>
        <span class="post-meta-item">&#128172; ${post.num_comments}</span>
        <span class="post-meta-item">${timeAgo(post.created_utc)}</span>
        <span class="post-sentiment ${sentimentClass(post.analysis.label)}">${sentimentIcon(post.analysis.label)} ${post.analysis.label}</span>
      </div>
      ${keywordsHtml ? `<div class="post-keywords">${keywordsHtml}</div>` : ""}`;
    return card;
  }

  function renderEmpty(container, msg) {
    container.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <h3>${msg}</h3><p>Try adjusting your search or filters</p></div>`;
  }

  function applyClientFilters(posts) {
    const minScore = parseInt($("#searchMinScore").value) || 0;
    const sentiment = $("#searchSentiment").value;
    return posts.filter((p) => {
      if (p.score < minScore) return false;
      if (sentiment !== "any" && p.analysis.label !== sentiment) return false;
      return true;
    });
  }

  // ===== SEARCH =====
  async function performSearch(append) {
    const q = $("#searchQuery").value.trim();
    if (!q) return;
    const isCustom = $("#searchTime").value === "custom";
    const params = {
      q, sources: getSelectedSources("source-cb"),
      subreddit: $("#searchSubreddit").value.trim() || "all",
      sort: $("#searchSort").value,
      time_filter: isCustom ? "all" : $("#searchTime").value, limit: 25,
    };
    if (isCustom) { params.date_from = $("#searchDateFrom").value || ""; params.date_to = $("#searchDateTo").value || ""; }
    if (append && state.searchAfter) params.after = state.searchAfter;
    if (append) params.page = state.searchPage;

    const data = await api("/api/search", params);
    if (!data) return;
    if (!append) state.searchPosts = [];
    state.searchPosts.push(...data.posts);
    state.searchAfter = data.after;
    state.searchPage = data.next_page || 0;

    const filtered = applyClientFilters(state.searchPosts);
    $("#searchResultsHeader").style.display = "flex";
    $("#searchResultCount").textContent = `${filtered.length} posts`;
    const srcLabel = (data.sources || []).map((s) => SOURCE_LABELS[s] || s).join(", ");
    $("#searchResultQuery").textContent = `for "${q}" across ${srcLabel}`;

    const container = $("#searchResults");
    if (!append) container.innerHTML = "";
    if (!filtered.length && !append) { renderEmpty(container, "No posts found"); $("#searchLoadMore").style.display = "none"; return; }
    const toRender = append ? applyClientFilters(data.posts) : filtered;
    toRender.forEach((p) => container.appendChild(renderPostCard(p)));
    container.classList.toggle("list-layout", state.layout === "list");
    $("#searchLoadMore").style.display = (data.after || data.next_page) ? "block" : "none";
  }

  $("#searchForm").addEventListener("submit", (e) => { e.preventDefault(); state.searchAfter = null; state.searchPage = 0; performSearch(false); });
  $("#searchLoadMoreBtn").addEventListener("click", () => performSearch(true));

  ["searchMinScore", "searchSentiment"].forEach((id) => {
    $(`#${id}`).addEventListener("change", () => {
      if (!state.searchPosts.length) return;
      const filtered = applyClientFilters(state.searchPosts);
      const c = $("#searchResults"); c.innerHTML = "";
      if (!filtered.length) renderEmpty(c, "No posts match filters");
      else filtered.forEach((p) => c.appendChild(renderPostCard(p)));
      c.classList.toggle("list-layout", state.layout === "list");
      $("#searchResultCount").textContent = `${filtered.length} posts`;
    });
  });

  // ===== TRENDING =====
  async function loadTrending() {
    const subs = $("#trendingSubs").value.trim();
    const data = await api("/api/trending", {
      subreddits: subs, limit: 10,
      include_hn: $("#trendHN").checked, include_lobsters: $("#trendLobsters").checked, include_devto: $("#trendDevto").checked,
    });
    if (!data) return;
    const container = $("#trendingResults"); container.innerHTML = "";
    if (!data.posts.length) { renderEmpty(container, "No trending posts"); return; }

    const bySource = {};
    data.posts.forEach((p) => { bySource[p.source] = (bySource[p.source] || 0) + 1; });
    const posCount = data.posts.filter((p) => p.analysis.label === "positive").length;
    const negCount = data.posts.filter((p) => p.analysis.label === "negative").length;
    const neuCount = data.posts.filter((p) => p.analysis.label === "neutral").length;
    const avgScore = Math.round(data.posts.reduce((s, p) => s + p.score, 0) / data.posts.length);

    let statsHtml = `
      <div class="stat-card"><div class="stat-value">${data.count}</div><div class="stat-label">Total Posts</div></div>
      <div class="stat-card"><div class="stat-value">${avgScore.toLocaleString()}</div><div class="stat-label">Avg Score</div></div>`;
    for (const [src, cnt] of Object.entries(bySource)) {
      statsHtml += `<div class="stat-card"><div class="stat-value" style="color:${SOURCE_COLORS[src] || 'var(--accent)'}">${cnt}</div><div class="stat-label">${SOURCE_LABELS[src] || src}</div></div>`;
    }
    statsHtml += `
      <div class="stat-card"><div class="stat-value" style="color:var(--positive)">${posCount}</div><div class="stat-label">Positive</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--neutral)">${neuCount}</div><div class="stat-label">Neutral</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--negative)">${negCount}</div><div class="stat-label">Negative</div></div>`;
    $("#trendingStats").innerHTML = statsHtml;
    data.posts.forEach((p) => container.appendChild(renderPostCard(p)));
  }
  $("#trendingRefresh").addEventListener("click", loadTrending);

  // ===== BROWSE =====
  async function loadBrowse(append) {
    const sub = $("#browseSubreddit").value.trim() || "technology";
    const params = { sort: $("#browseSort").value, limit: 25 };
    if (append && state.browseAfter) params.after = state.browseAfter;
    const data = await api(`/api/subreddit/${encodeURIComponent(sub)}`, params);
    if (!data) return;
    if (!append) state.browsePosts = [];
    state.browsePosts.push(...data.posts);
    state.browseAfter = data.after;
    const c = $("#browseResults");
    if (!append) c.innerHTML = "";
    if (!data.posts.length && !append) { renderEmpty(c, `No posts in r/${sub}`); $("#browseLoadMore").style.display = "none"; return; }
    data.posts.forEach((p) => c.appendChild(renderPostCard(p)));
    $("#browseLoadMore").style.display = data.after ? "block" : "none";
  }
  $("#browseForm").addEventListener("submit", (e) => { e.preventDefault(); state.browseAfter = null; loadBrowse(false); });
  $("#browseLoadMoreBtn").addEventListener("click", () => loadBrowse(true));

  // =========================================================================
  // ANALYSIS
  // =========================================================================
  async function runAnalysis() {
    const q = $("#analysisQuery").value.trim();
    if (!q) return;

    const params = {
      q, sources: getSelectedSources("analysis-source-cb"),
      date_from: $("#analysisDateFrom").value || "",
      date_to: $("#analysisDateTo").value || "",
    };

    const data = await api("/api/insights", params);
    if (!data || data.error) { renderEmpty($("#analysisResults"), data?.error || "No data found"); return; }

    state.analysisData = data;
    const ins = data.insights;
    state.analysisCharts.forEach((c) => c.destroy());
    state.analysisCharts = [];

    const container = $("#analysisResults");
    container.innerHTML = `
      <!-- Export toolbar -->
      <div class="export-toolbar">
        <span class="toolbar-label">Export Report:</span>
        <button class="btn-export btn-csv" id="exportCsv">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Download CSV
        </button>
        <button class="btn-export btn-pdf" id="exportPdf">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
          Download PDF Report
        </button>
      </div>

      <!-- KPI cards -->
      <div class="insight-grid">
        <div class="insight-card"><div class="insight-value">${ins.total_posts}</div><div class="insight-label">Total Posts</div></div>
        <div class="insight-card"><div class="insight-value">${ins.unique_authors}</div><div class="insight-label">Unique Authors</div></div>
        <div class="insight-card"><div class="insight-value">${ins.repeat_authors}</div><div class="insight-label">Repeat Authors</div></div>
        <div class="insight-card"><div class="insight-value">${ins.avg_score.toLocaleString()}</div><div class="insight-label">Avg Score</div></div>
        <div class="insight-card"><div class="insight-value">${ins.median_score.toLocaleString()}</div><div class="insight-label">Median Score</div></div>
        <div class="insight-card"><div class="insight-value">${ins.max_score.toLocaleString()}</div><div class="insight-label">Max Score</div></div>
        <div class="insight-card"><div class="insight-value">${ins.avg_comments}</div><div class="insight-label">Avg Comments</div></div>
        <div class="insight-card"><div class="insight-value">${ins.total_engagement.toLocaleString()}</div><div class="insight-label">Total Engagement</div></div>
        <div class="insight-card"><div class="insight-value">${ins.avg_polarity}</div><div class="insight-label">Avg Polarity</div></div>
        <div class="insight-card"><div class="insight-value">${ins.avg_subjectivity}</div><div class="insight-label">Avg Subjectivity</div></div>
      </div>

      <!-- Charts row 1 -->
      <div class="chart-row">
        <div class="chart-box"><h4>Sentiment Distribution</h4><canvas id="chartSentiment"></canvas></div>
        <div class="chart-box"><h4>Source Distribution</h4><canvas id="chartSources"></canvas></div>
      </div>
      <!-- Charts row 2 -->
      <div class="chart-row">
        <div class="chart-box"><h4>Activity Timeline</h4><canvas id="chartTimeline"></canvas></div>
        <div class="chart-box"><h4>Engagement by Channel</h4><canvas id="chartChannels"></canvas></div>
      </div>

      <!-- Keywords -->
      <div class="analysis-section">
        <h3>Top Keywords</h3>
        <div class="keyword-cloud" id="keywordCloud"></div>
      </div>

      <!-- Top Authors -->
      <div class="analysis-section">
        <h3>Top Authors (Cohort)</h3>
        <div class="table-wrap"><table class="insight-table" id="authorsTable">
          <thead><tr><th>Author</th><th>Posts</th><th>% of Total</th></tr></thead><tbody></tbody>
        </table></div>
      </div>

      <!-- Influencers -->
      <div class="analysis-section">
        <h3>Top Influencers by Score</h3>
        <div class="table-wrap"><table class="insight-table" id="influencersTable">
          <thead><tr><th>Author</th><th>Posts</th><th>Total Score</th><th>Total Comments</th><th>Avg Score</th></tr></thead><tbody></tbody>
        </table></div>
      </div>

      <!-- Channel Breakdown -->
      <div class="analysis-section">
        <h3>Channel Breakdown</h3>
        <div class="table-wrap"><table class="insight-table" id="channelTable">
          <thead><tr><th>Channel</th><th>Posts</th><th>%</th></tr></thead><tbody></tbody>
        </table></div>
      </div>

      <!-- All Posts -->
      <div class="analysis-section">
        <div class="analysis-posts-header">
          <h3>All Posts (${data.posts.length})</h3>
          <div class="analysis-posts-toggle">
            <button class="toggle-btn active" id="showPostsBtn">Show Posts</button>
            <button class="toggle-btn" id="hidePostsBtn">Hide Posts</button>
          </div>
        </div>
        <div class="posts-grid" id="analysisPostsGrid"></div>
      </div>
    `;

    // --- Charts ---
    const sd = ins.sentiment_distribution;
    state.analysisCharts.push(new Chart($("#chartSentiment"), {
      type: "doughnut",
      data: { labels: ["Positive", "Neutral", "Negative"], datasets: [{ data: [sd.positive, sd.neutral, sd.negative], backgroundColor: ["#22c55e", "#eab308", "#ef4444"], borderColor: "#12121a", borderWidth: 2 }] },
      options: { responsive: true, plugins: { legend: { position: "bottom", labels: { color: "#8888a0" } } } },
    }));

    const srcLabels = Object.keys(ins.source_distribution);
    const srcValues = Object.values(ins.source_distribution);
    state.analysisCharts.push(new Chart($("#chartSources"), {
      type: "bar",
      data: { labels: srcLabels.map((s) => SOURCE_LABELS[s] || s), datasets: [{ label: "Posts", data: srcValues, backgroundColor: srcLabels.map((s) => SOURCE_COLORS[s] || "#6366f1"), borderRadius: 6 }] },
      options: { responsive: true, indexAxis: "y", scales: { x: { ticks: { color: "#5a5a72" }, grid: { color: "#2a2a3a" } }, y: { ticks: { color: "#8888a0" }, grid: { display: false } } }, plugins: { legend: { display: false } } },
    }));

    if (ins.timeline.length) {
      state.analysisCharts.push(new Chart($("#chartTimeline"), {
        type: "line",
        data: { labels: ins.timeline.map((t) => t.date), datasets: [
          { label: "Posts", data: ins.timeline.map((t) => t.posts), borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)", fill: true, tension: 0.3 },
          { label: "Avg Sentiment", data: ins.timeline.map((t) => t.avg_sentiment), borderColor: "#22c55e", backgroundColor: "transparent", tension: 0.3, yAxisID: "y1" },
        ] },
        options: { responsive: true, scales: { x: { ticks: { color: "#5a5a72", maxTicksLimit: 10 }, grid: { color: "#2a2a3a" } }, y: { ticks: { color: "#8888a0" }, grid: { color: "#2a2a3a" }, title: { display: true, text: "Posts", color: "#5a5a72" } }, y1: { position: "right", ticks: { color: "#22c55e" }, grid: { display: false }, title: { display: true, text: "Sentiment", color: "#22c55e" } } }, plugins: { legend: { labels: { color: "#8888a0" } } } },
      }));
    }

    if (ins.channel_distribution.length) {
      state.analysisCharts.push(new Chart($("#chartChannels"), {
        type: "bar",
        data: { labels: ins.channel_distribution.map((c) => c.channel), datasets: [{ label: "Posts", data: ins.channel_distribution.map((c) => c.count), backgroundColor: ins.channel_distribution.map((c) => SOURCE_COLORS[c.channel] || "#6366f1"), borderRadius: 6 }] },
        options: { responsive: true, scales: { x: { ticks: { color: "#5a5a72" }, grid: { display: false } }, y: { ticks: { color: "#8888a0" }, grid: { color: "#2a2a3a" } } }, plugins: { legend: { display: false } } },
      }));
    }

    // --- Keywords ---
    const kwC = $("#keywordCloud");
    ins.top_keywords.forEach((kw) => { kwC.innerHTML += `<span class="keyword-chip">${escapeHtml(kw.keyword)} <span class="kw-count">${kw.count}</span></span>`; });

    // --- Tables ---
    const aTb = $("#authorsTable tbody");
    ins.top_authors.forEach((a) => { aTb.innerHTML += `<tr><td>${escapeHtml(a.author)}</td><td>${a.posts}</td><td>${a.pct}%</td></tr>`; });
    const iTb = $("#influencersTable tbody");
    ins.influencers.forEach((a) => { iTb.innerHTML += `<tr><td>${escapeHtml(a.author)}</td><td>${a.posts}</td><td>${a.total_score.toLocaleString()}</td><td>${a.total_comments.toLocaleString()}</td><td>${a.avg_score.toLocaleString()}</td></tr>`; });
    const cTb = $("#channelTable tbody");
    ins.channel_distribution.forEach((c) => { cTb.innerHTML += `<tr><td>${escapeHtml(c.channel)}</td><td>${c.count}</td><td>${c.pct}%</td></tr>`; });

    // --- Posts grid ---
    const postsGrid = $("#analysisPostsGrid");
    data.posts.forEach((p) => postsGrid.appendChild(renderPostCard(p)));

    // --- Show/Hide posts toggle ---
    $("#showPostsBtn").addEventListener("click", () => {
      postsGrid.style.display = "";
      $("#showPostsBtn").classList.add("active");
      $("#hidePostsBtn").classList.remove("active");
    });
    $("#hidePostsBtn").addEventListener("click", () => {
      postsGrid.style.display = "none";
      $("#hidePostsBtn").classList.add("active");
      $("#showPostsBtn").classList.remove("active");
    });

    // --- Export buttons ---
    $("#exportCsv").addEventListener("click", () => downloadCsv(data));
    $("#exportPdf").addEventListener("click", () => downloadPdf(data));
  }

  $("#analysisForm").addEventListener("submit", (e) => { e.preventDefault(); runAnalysis(); });

  // =========================================================================
  // CSV EXPORT
  // =========================================================================
  function downloadCsv(data) {
    const ins = data.insights;
    const rows = [];
    const q = data.query;
    const now = new Date().toISOString().slice(0, 19);

    rows.push(["OSINT Dashboard - Analysis Report"]);
    rows.push(["Query", q]);
    rows.push(["Generated", now]);
    rows.push([]);

    rows.push(["=== KEY METRICS ==="]);
    rows.push(["Metric", "Value"]);
    rows.push(["Total Posts", ins.total_posts]);
    rows.push(["Unique Authors", ins.unique_authors]);
    rows.push(["Repeat Authors", ins.repeat_authors]);
    rows.push(["Avg Score", ins.avg_score]);
    rows.push(["Median Score", ins.median_score]);
    rows.push(["Max Score", ins.max_score]);
    rows.push(["Avg Comments", ins.avg_comments]);
    rows.push(["Total Engagement", ins.total_engagement]);
    rows.push(["Avg Polarity", ins.avg_polarity]);
    rows.push(["Avg Subjectivity", ins.avg_subjectivity]);
    rows.push([]);

    rows.push(["=== SENTIMENT DISTRIBUTION ==="]);
    rows.push(["Sentiment", "Count", "Percentage"]);
    rows.push(["Positive", ins.sentiment_distribution.positive, ins.sentiment_distribution.positive_pct + "%"]);
    rows.push(["Neutral", ins.sentiment_distribution.neutral, ins.sentiment_distribution.neutral_pct + "%"]);
    rows.push(["Negative", ins.sentiment_distribution.negative, ins.sentiment_distribution.negative_pct + "%"]);
    rows.push([]);

    rows.push(["=== SOURCE DISTRIBUTION ==="]);
    rows.push(["Source", "Count"]);
    Object.entries(ins.source_distribution).forEach(([s, c]) => rows.push([SOURCE_LABELS[s] || s, c]));
    rows.push([]);

    rows.push(["=== TOP AUTHORS ==="]);
    rows.push(["Author", "Posts", "% of Total"]);
    ins.top_authors.forEach((a) => rows.push([a.author, a.posts, a.pct + "%"]));
    rows.push([]);

    rows.push(["=== TOP INFLUENCERS ==="]);
    rows.push(["Author", "Posts", "Total Score", "Total Comments", "Avg Score"]);
    ins.influencers.forEach((a) => rows.push([a.author, a.posts, a.total_score, a.total_comments, a.avg_score]));
    rows.push([]);

    rows.push(["=== TOP KEYWORDS ==="]);
    rows.push(["Keyword", "Count"]);
    ins.top_keywords.forEach((k) => rows.push([k.keyword, k.count]));
    rows.push([]);

    rows.push(["=== CHANNEL BREAKDOWN ==="]);
    rows.push(["Channel", "Posts", "%"]);
    ins.channel_distribution.forEach((c) => rows.push([c.channel, c.count, c.pct + "%"]));
    rows.push([]);

    rows.push(["=== TIMELINE ==="]);
    rows.push(["Date", "Posts", "Avg Score", "Avg Sentiment"]);
    ins.timeline.forEach((t) => rows.push([t.date, t.posts, t.avg_score, t.avg_sentiment]));
    rows.push([]);

    rows.push(["=== ALL POSTS ==="]);
    rows.push(["Source", "Title", "Author", "Subreddit/Channel", "Score", "Comments", "Sentiment", "Polarity", "Subjectivity", "Keywords", "Date", "URL"]);
    data.posts.forEach((p) => {
      rows.push([
        SOURCE_LABELS[p.source] || p.source,
        p.title.replace(/"/g, '""'),
        p.author,
        p.subreddit || p.source,
        p.score,
        p.num_comments,
        p.analysis.label,
        p.analysis.polarity,
        p.analysis.subjectivity,
        p.analysis.keywords.join("; "),
        p.created_iso,
        p.permalink,
      ]);
    });

    const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `osint-report-${q.replace(/\s+/g, "-")}-${now.slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // =========================================================================
  // PDF REPORT GENERATION
  // =========================================================================
  function downloadPdf(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const ins = data.insights;
    const q = data.query;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const pageW = doc.internal.pageSize.getWidth();
    const marginL = 15;
    const marginR = 15;
    const contentW = pageW - marginL - marginR;
    let y = 15;

    function addPage() { doc.addPage(); y = 15; }
    function checkSpace(needed) { if (y + needed > 275) addPage(); }

    // --- Cover / Header ---
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageW, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("OSINT Intelligence Report", marginL, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Query: "${q}"`, marginL, 26);
    doc.text(`Generated: ${now}`, marginL, 33);
    y = 50;
    doc.setTextColor(30, 30, 40);

    // --- Executive Summary ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", marginL, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const sentDom = ins.sentiment_distribution;
    const dominantSentiment = sentDom.positive >= sentDom.negative && sentDom.positive >= sentDom.neutral ? "Positive"
      : sentDom.negative >= sentDom.positive && sentDom.negative >= sentDom.neutral ? "Negative" : "Neutral";
    const topSrc = Object.entries(ins.source_distribution).sort((a, b) => b[1] - a[1])[0];
    const topSrcName = topSrc ? (SOURCE_LABELS[topSrc[0]] || topSrc[0]) : "N/A";

    const summaryLines = [
      `This report analyzes ${ins.total_posts} posts across ${Object.keys(ins.source_distribution).length} data sources for the topic "${q}".`,
      `The analysis identified ${ins.unique_authors} unique authors, of whom ${ins.repeat_authors} posted more than once (${ins.unique_authors > 0 ? ((ins.repeat_authors / ins.unique_authors) * 100).toFixed(1) : 0}% repeat rate).`,
      `The dominant sentiment is ${dominantSentiment} (${sentDom[dominantSentiment.toLowerCase() + "_pct"]}%), with an average polarity of ${ins.avg_polarity} and subjectivity of ${ins.avg_subjectivity}.`,
      `The primary data source is ${topSrcName} (${topSrc ? topSrc[1] : 0} posts). Total community engagement reached ${ins.total_engagement.toLocaleString()} (score + comments combined).`,
      `The highest-scoring post reached ${ins.max_score.toLocaleString()} points. Average post score is ${ins.avg_score.toLocaleString()} (median: ${ins.median_score.toLocaleString()}).`,
    ];
    summaryLines.forEach((line) => {
      const split = doc.splitTextToSize(line, contentW);
      split.forEach((sl) => { doc.text(sl, marginL, y); y += 4.5; });
      y += 1;
    });
    y += 4;

    // --- Key Metrics Table ---
    checkSpace(50);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Key Metrics", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Metric", "Value"]],
      body: [
        ["Total Posts", String(ins.total_posts)],
        ["Unique Authors", String(ins.unique_authors)],
        ["Repeat Authors", String(ins.repeat_authors)],
        ["Average Score", ins.avg_score.toLocaleString()],
        ["Median Score", ins.median_score.toLocaleString()],
        ["Max Score", ins.max_score.toLocaleString()],
        ["Average Comments", String(ins.avg_comments)],
        ["Total Engagement", ins.total_engagement.toLocaleString()],
        ["Average Polarity", String(ins.avg_polarity)],
        ["Average Subjectivity", String(ins.avg_subjectivity)],
      ],
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- Sentiment Distribution ---
    checkSpace(40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Sentiment Distribution", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Sentiment", "Count", "Percentage"]],
      body: [
        ["Positive", String(sentDom.positive), sentDom.positive_pct + "%"],
        ["Neutral", String(sentDom.neutral), sentDom.neutral_pct + "%"],
        ["Negative", String(sentDom.negative), sentDom.negative_pct + "%"],
      ],
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 0) {
          if (data.cell.raw === "Positive") data.cell.styles.textColor = [34, 197, 94];
          if (data.cell.raw === "Negative") data.cell.styles.textColor = [239, 68, 68];
          if (data.cell.raw === "Neutral") data.cell.styles.textColor = [180, 140, 20];
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- Source Distribution ---
    checkSpace(40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Source Distribution", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Source", "Posts"]],
      body: Object.entries(ins.source_distribution).map(([s, c]) => [SOURCE_LABELS[s] || s, String(c)]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- Top Keywords ---
    checkSpace(40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Top Keywords", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Keyword", "Frequency"]],
      body: ins.top_keywords.map((k) => [k.keyword, String(k.count)]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- Top Authors (Cohort) ---
    checkSpace(50);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Top Authors (Cohort Analysis)", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Author", "Posts", "% of Total"]],
      body: ins.top_authors.map((a) => [a.author, String(a.posts), a.pct + "%"]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- Influencers ---
    checkSpace(50);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Top Influencers by Score", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Author", "Posts", "Total Score", "Comments", "Avg Score"]],
      body: ins.influencers.map((a) => [a.author, String(a.posts), a.total_score.toLocaleString(), a.total_comments.toLocaleString(), a.avg_score.toLocaleString()]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- Channel Breakdown ---
    checkSpace(50);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Channel Breakdown", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Channel", "Posts", "%"]],
      body: ins.channel_distribution.map((c) => [c.channel, String(c.count), c.pct + "%"]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = doc.lastAutoTable.finalY + 10;

    // --- Timeline ---
    if (ins.timeline.length) {
      checkSpace(50);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Activity Timeline", marginL, y);
      y += 3;

      doc.autoTable({
        startY: y,
        margin: { left: marginL, right: marginR },
        head: [["Date", "Posts", "Avg Score", "Avg Sentiment"]],
        body: ins.timeline.map((t) => [t.date, String(t.posts), String(t.avg_score), String(t.avg_sentiment)]),
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // --- All Posts ---
    checkSpace(30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("All Posts", marginL, y);
    y += 3;

    doc.autoTable({
      startY: y,
      margin: { left: marginL, right: marginR },
      head: [["Source", "Title", "Author", "Score", "Comments", "Sentiment", "Date"]],
      body: data.posts.map((p) => [
        SOURCE_LABELS[p.source] || p.source,
        p.title.length > 60 ? p.title.slice(0, 57) + "..." : p.title,
        p.author,
        p.score.toLocaleString(),
        String(p.num_comments),
        p.analysis.label,
        p.created_iso.slice(0, 10),
      ]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 7, fontStyle: "bold" },
      bodyStyles: { fontSize: 6.5 },
      columnStyles: { 1: { cellWidth: 55 } },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });

    // --- Footer on each page ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 160);
      doc.text(`OSINT Dashboard Report — "${q}" — Page ${i} of ${totalPages}`, marginL, 290);
      doc.text(now, pageW - marginR, 290, { align: "right" });
    }

    doc.save(`osint-report-${q.replace(/\s+/g, "-")}-${now.slice(0, 10)}.pdf`);
  }

  // ===== POST DETAIL MODAL =====
  async function openPostDetail(post) {
    const modal = $("#postModal");
    const body = $("#modalBody");
    const sentClass = sentimentClass(post.analysis.label);
    const keywords = post.analysis.keywords.map((k) => `<span class="keyword-tag">${escapeHtml(k)}</span>`).join("");
    const channelLabel = post.source === "reddit" && post.subreddit ? `r/${escapeHtml(post.subreddit)} &middot; ` : "";

    body.innerHTML = `
      <div class="post-subreddit" style="margin-bottom:12px">${sourceBadge(post.source)} ${channelLabel} u/${escapeHtml(post.author)} &middot; ${timeAgo(post.created_utc)}</div>
      <div class="modal-title">${escapeHtml(post.title)}</div>
      ${post.selftext ? `<div class="modal-body-text">${escapeHtml(post.selftext)}</div>` : ""}
      <div class="modal-analysis">
        <h3>Analysis</h3>
        <div class="analysis-grid">
          <div class="analysis-item"><div class="analysis-value post-sentiment ${sentClass}">${sentimentIcon(post.analysis.label)} ${post.analysis.label}</div><div class="analysis-label">Sentiment</div></div>
          <div class="analysis-item"><div class="analysis-value">${post.analysis.polarity}</div><div class="analysis-label">Polarity</div></div>
          <div class="analysis-item"><div class="analysis-value">${post.analysis.subjectivity}</div><div class="analysis-label">Subjectivity</div></div>
          <div class="analysis-item"><div class="analysis-value">${post.score.toLocaleString()}</div><div class="analysis-label">Score</div></div>
          <div class="analysis-item"><div class="analysis-value">${(post.upvote_ratio * 100).toFixed(0)}%</div><div class="analysis-label">Upvote Ratio</div></div>
          <div class="analysis-item"><div class="analysis-value">${post.num_comments}</div><div class="analysis-label">Comments</div></div>
        </div>
        ${keywords ? `<div class="post-keywords" style="margin-top:12px">${keywords}</div>` : ""}
      </div>
      <div class="modal-comments" id="modalComments"><h3>Loading comments...</h3></div>
      <a class="modal-link" href="${escapeHtml(post.permalink)}" target="_blank" rel="noopener">View on ${SOURCE_LABELS[post.source] || post.source} &rarr;</a>`;
    modal.classList.add("active");

    if (post.source === "reddit") {
      try {
        const data = await api("/api/analyze", { url: post.permalink });
        if (data && data.comments) {
          const cc = $("#modalComments");
          if (!data.comments.length) { cc.innerHTML = "<h3>No comments yet</h3>"; return; }
          const avgLabel = data.avg_comment_sentiment > 0.1 ? "positive" : data.avg_comment_sentiment < -0.1 ? "negative" : "neutral";
          cc.innerHTML = `<h3>Top Comments <span class="post-sentiment ${sentimentClass(avgLabel)}" style="margin-left:8px">avg: ${data.avg_comment_sentiment}</span></h3>` +
            data.comments.map((c) => `<div class="comment-card"><div class="comment-header"><span class="comment-author">u/${escapeHtml(c.author)}</span><span class="comment-score">&#9650; ${c.score}</span><span class="post-sentiment ${sentimentClass(c.analysis.label)}">${c.analysis.label}</span></div><div class="comment-body">${escapeHtml(c.body)}</div></div>`).join("");
        }
      } catch { $("#modalComments").innerHTML = "<h3>Could not load comments</h3>"; }
    } else {
      $("#modalComments").innerHTML = "<h3 style='color:var(--text-dim)'>Comment analysis available for Reddit posts</h3>";
    }
  }

  // ===== Modal close =====
  $("#modalClose").addEventListener("click", () => $("#postModal").classList.remove("active"));
  $("#postModal").addEventListener("click", (e) => { if (e.target === $("#postModal")) $("#postModal").classList.remove("active"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#postModal").classList.remove("active"); });

  // ===== Keyboard shortcut =====
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      $$(".nav-tab").forEach((t) => t.classList.remove("active"));
      $$(".nav-tab")[0].classList.add("active");
      $$(".view").forEach((v) => v.classList.remove("active"));
      $("#view-search").classList.add("active");
      $("#searchQuery").focus();
    }
  });
})();
