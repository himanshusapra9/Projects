const { useState, useMemo, useCallback, useEffect } = React;

/* ═══════════════════════════ STYLES ═══════════════════════════ */
const StyleTag = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }
    .font-body { font-family: 'Inter', system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes growBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    .fade-up { animation: fadeUp 0.4s ease-out both; }
    .grow-bar { animation: growBar 0.5s ease-out both; transform-origin: left; }
    input[type=range] { -webkit-appearance: none; background: #e2e8f0; height: 4px; border-radius: 2px; outline: none; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
    .tip-wrap { position: relative; display: inline-flex; }
    .tip-wrap:hover .tip-pop { display: block; }
    .tip-pop { display: none; position: absolute; z-index: 60; background: #1e293b; color: #f1f5f9; font-size: 10px; line-height: 1.4; padding: 5px 9px; border-radius: 6px; white-space: nowrap; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); pointer-events: none; font-family: 'Inter', sans-serif; font-weight: 400; }
    .tip-pop::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:4px solid transparent; border-top-color:#1e293b; }
    .step-transition { transition: opacity 0.35s ease, transform 0.35s ease; }
  ` }} />
);

/* ═══════════════════════════ SAMPLE DATA ═══════════════════════════ */
const SAMPLE_ITEMS = [
  { id: 1, title: "Vintage Rolex Submariner", category: "Watches", price: 12000, bids: 47, views: 890, tags: ["luxury","vintage","swiss"], image: "⌚" },
  { id: 2, title: "Abstract Oil Painting 1960s", category: "Art", price: 3400, bids: 12, views: 230, tags: ["art","vintage","painting"], image: "🎨" },
  { id: 3, title: "Gibson Les Paul 1959", category: "Music", price: 45000, bids: 89, views: 2100, tags: ["guitar","vintage","music"], image: "🎸" },
  { id: 4, title: "Diamond Engagement Ring", category: "Jewelry", price: 8500, bids: 34, views: 670, tags: ["luxury","jewelry","diamond"], image: "💍" },
  { id: 5, title: "Rare Baseball Card Babe Ruth", category: "Sports", price: 22000, bids: 61, views: 1450, tags: ["sports","collectible","rare"], image: "⚾" },
  { id: 6, title: "Louis Vuitton Trunk 1920s", category: "Fashion", price: 6700, bids: 28, views: 540, tags: ["luxury","vintage","fashion"], image: "👜" },
  { id: 7, title: "First Edition Hemingway", category: "Books", price: 4100, bids: 19, views: 310, tags: ["rare","books","collectible"], image: "📚" },
  { id: 8, title: "Porsche 911 1973", category: "Cars", price: 85000, bids: 102, views: 3800, tags: ["vintage","cars","luxury"], image: "🏎️" },
  { id: 9, title: "Cartier Brooch Art Deco", category: "Jewelry", price: 5200, bids: 22, views: 410, tags: ["luxury","jewelry","art deco"], image: "✨" },
  { id: 10, title: "NASA Apollo Mission Patch", category: "Space", price: 1800, bids: 55, views: 920, tags: ["space","collectible","rare"], image: "🚀" },
  { id: 11, title: "Tiffany Lamp 1905", category: "Art", price: 9300, bids: 38, views: 760, tags: ["art","vintage","luxury"], image: "🪔" },
  { id: 12, title: "Omega Speedmaster 1969", category: "Watches", price: 15000, bids: 71, views: 1620, tags: ["luxury","vintage","space"], image: "⌚" },
  { id: 13, title: "Stradivarius Violin Bow", category: "Music", price: 31000, bids: 44, views: 1100, tags: ["music","rare","collectible"], image: "🎻" },
  { id: 14, title: "Mickey Mantle Rookie Card", category: "Sports", price: 18000, bids: 77, views: 2300, tags: ["sports","collectible","rare"], image: "🃏" },
  { id: 15, title: "Chanel No. 5 Vintage Bottle", category: "Fashion", price: 950, bids: 41, views: 580, tags: ["fashion","vintage","collectible"], image: "🌸" },
  { id: 16, title: "WWII German Enigma Machine", category: "History", price: 27000, bids: 33, views: 890, tags: ["history","rare","collectible"], image: "🔐" },
  { id: 17, title: "Banksy Signed Print", category: "Art", price: 7600, bids: 58, views: 1740, tags: ["art","modern","rare"], image: "🖼️" },
  { id: 18, title: "Faberge Egg Replica", category: "Art", price: 4400, bids: 16, views: 290, tags: ["art","luxury","collectible"], image: "🥚" },
  { id: 19, title: "Meteorite Fragment Mars", category: "Space", price: 11000, bids: 29, views: 640, tags: ["space","rare","science"], image: "🌑" },
  { id: 20, title: "Zippo Vietnam War Lighter", category: "History", price: 2200, bids: 63, views: 1050, tags: ["history","vintage","collectible"], image: "🔥" },
];

const SAMPLE_USERS = [
  { id: "U1", name: "Alex Chen", history: [1,4,9,12], preferences: ["luxury","watches"] },
  { id: "U2", name: "Maria Santos", history: [2,7,11,17], preferences: ["art","vintage"] },
  { id: "U3", name: "James Wright", history: [3,13,5,14], preferences: ["music","sports"] },
  { id: "U4", name: "Priya Patel", history: [8,19,10,16], preferences: ["cars","space","history"] },
];

/* ═══════════════════════════ MODEL DEFINITIONS ═══════════════════════════ */
const MODELS = [
  {
    key: "bm25", name: "BM25", full: "Lexical Search Ranking", color: "#14b8a6",
    category: "Lexical Search", stage: "Retrieve",
    typeBadge: "Search", complexity: 1, bestFor: "Exact search",
    summary: "Ranks items by lexical term matching between your query and item text using TF-IDF-style weighting.",
    analogy: "Like ctrl+F on steroids — it counts how many of your search words appear in each listing, giving extra credit for rare words that appear in fewer listings.",
    mathOneLiner: "score = Σ TF(term, doc) × IDF(term) for each query term",
    searchUsage: "USES",
    searchExplanation: "Directly ranks items by lexical match between your query and item text.",
    outputBehavior: "Surfaces exact keyword matches. Great for specific queries but misses semantic similarity.",
    tradeoff: "Fast and interpretable, but not personalized",
    how: [
      "Tokenize your search query into individual terms",
      "For each term, count how many listings contain it (document frequency)",
      "Score each listing: TF (term count in listing) × IDF (rarity across catalog)",
      "Sum scores across all query terms for the final relevance score"
    ],
    strengths: ["No user history needed", "Fast and transparent", "Exact match precision"],
    weaknesses: ["No personalization", "Misses synonyms", "Empty query = no signal"],
    inputsUsed: ["Search query terms", "Item title, tags, category"],
    vizType: "features",
    liveExample: [
      { label: "Query: \"vintage watch\"", text: "Tokenized → [\"vintage\", \"watch\"]", mono: "IDF: \"vintage\" in 8/20 → 0.92, \"watch\" in 2/20 → 2.30" },
      { label: "Score Vintage Rolex Submariner", text: "Title has \"Vintage\" → TF×IDF = 0.92", mono: "Category Watches ≈ watch → +0.30. Total = 1.22" },
      { label: "Compare top items", text: "", mono: "Rolex: 1.22, Speedmaster: 1.22, Gibson: 0.92 (vintage only) → Watches win", winner: true },
    ],
    whyMatters: "BM25 is the engine behind Elasticsearch and most product search — it's the baseline every search system starts from.",
    whenToUse: { bestWhen: "Users type specific search queries", watchOut: "Pure browsing with no search intent", combineWith: "ALS" },
  },
  {
    key: "als", name: "ALS", full: "Alternating Least Squares", color: "#3b82f6",
    category: "Collaborative Filtering", stage: "Retrieve",
    typeBadge: "Embed", complexity: 2, bestFor: "Personalization",
    summary: "Decomposes the user-item interaction matrix into latent factor vectors, then scores items by dot-product similarity.",
    analogy: "Like a matchmaker who notices you and your friend both love jazz and Italian food — they figure out your hidden taste DNA and match you with things similar friends loved.",
    mathOneLiner: "score = user_vector · item_vector (dot product of latent factors)",
    searchUsage: "PARTIAL",
    searchExplanation: "Query terms add a small boost to matching items, but the core ranking comes from collaborative patterns.",
    outputBehavior: "Surfaces items similar to what users with overlapping tastes enjoyed.",
    tradeoff: "Strong personalization, but needs interaction data",
    how: [
      "Build a user-item interaction matrix from browsing/purchase history",
      "Factorize into two low-rank matrices: user factors and item factors",
      "For each user, compute dot-product with every item vector",
      "Rank unseen items by predicted affinity score"
    ],
    strengths: ["Works with implicit feedback", "Scales to large catalogs", "Captures latent taste patterns"],
    weaknesses: ["Cold-start for new users/items", "No content awareness", "Needs sufficient interaction data"],
    inputsUsed: ["User-item interaction history"],
    vizType: "heatmap",
    liveExample: [
      { label: "Build the matrix", text: "Alex has interacted with:", mono: "⌚ Rolex, 💍 Ring, ✨ Brooch, ⌚ Speedmaster" },
      { label: "Find hidden patterns (latent factors)", text: "Alex's taste vector ≈", mono: "[luxury: 0.9, vintage: 0.7, jewelry: 0.8]" },
      { label: "Score unseen items by dot product", text: "🎸 Guitar scores 0.2 (no luxury/jewelry match).", mono: "👜 LV Trunk scores 0.71 (luxury + vintage match) → LV Trunk wins", winner: true },
    ],
    whyMatters: "ALS discovers hidden patterns you never explicitly told the system about — it figures out your taste from behavior alone.",
    whenToUse: { bestWhen: "Lots of user-item interaction data", watchOut: "New users with no history (cold start)", combineWith: "LightGBM" },
  },
  {
    key: "ease", name: "EASE", full: "Embarrassingly Shallow Autoencoders", color: "#8b5cf6",
    category: "Collaborative Filtering", stage: "Retrieve",
    typeBadge: "Embed", complexity: 1, bestFor: "Personalization",
    summary: "Computes a dense item-item similarity matrix and scores candidates by weighted similarity to a user's history.",
    analogy: "Like a librarian who says \"people who liked this book also loved that one\" — it finds which items are twins based on shared features.",
    mathOneLiner: "score = Σ similarity(history_item, candidate) for all history items",
    searchUsage: "PARTIAL",
    searchExplanation: "Query match adds a tiebreaker boost, but ranking is driven by item-item similarity to your history.",
    outputBehavior: "Surfaces items most similar to your past interactions via shared tags and categories.",
    tradeoff: "Simple and effective, but O(n²) memory for large catalogs",
    how: [
      "Compute pairwise cosine similarity between all item feature vectors",
      "For a given user, look up their history items",
      "Score each candidate by summing similarity to all history items",
      "Filter already-seen items and rank by total similarity"
    ],
    strengths: ["Simple closed-form solution", "No hyperparameter tuning", "Strong baseline performance"],
    weaknesses: ["O(n²) item-item matrix", "Doesn't capture sequence", "Memory-heavy for huge catalogs"],
    inputsUsed: ["Item features (tags, category)", "User history"],
    vizType: "heatmap",
    liveExample: [
      { label: "Build item-item similarity", text: "Rolex ↔ Speedmaster = 0.82", mono: "(both: luxury, vintage, watches)" },
      { label: "Alex liked Rolex → boost all items similar to it", text: "Look up every item's similarity to Rolex, Ring, Brooch, Speedmaster" },
      { label: "Score = sum of similarities", text: "Omega Speedmaster:", mono: "0.82 × 1 + 0.3 × 0 = 0.82 → top result", winner: true },
    ],
    whyMatters: "EASE is the simplest strong baseline — it often beats complex neural models with zero tuning.",
    whenToUse: { bestWhen: "Items have rich tags/metadata", watchOut: "Catalog has millions of items (memory)", combineWith: "SASRec" },
  },
  {
    key: "twotower", name: "Two-Tower", full: "Dual Encoder Retrieval", color: "#f59e0b",
    category: "Neural Retrieval", stage: "Retrieve",
    typeBadge: "Embed", complexity: 3, bestFor: "Retrieval",
    summary: "Encodes users and items into separate embedding towers, then retrieves by cosine similarity between the two vectors.",
    analogy: "Like two translators — one converts your tastes into a universal language, the other converts each item. If they sound similar, it's a match.",
    mathOneLiner: "score = cosine(user_embedding, item_embedding)",
    searchUsage: "USES",
    searchExplanation: "Query terms influence the user tower embedding, shifting retrieval toward matching items.",
    outputBehavior: "Retrieves items whose embeddings are closest to the user's taste + query embedding.",
    tradeoff: "Fast retrieval at scale, but limited cross-feature interaction",
    how: [
      "User tower: aggregate features from history + preferences into an embedding",
      "Item tower: encode item features (category, tags, price) into an embedding",
      "Compute cosine similarity between user embedding and each item embedding",
      "Return top-K most similar items as candidates"
    ],
    strengths: ["Fast inference via ANN search", "Decoupled training", "Handles rich features"],
    weaknesses: ["Limited cross-feature interaction", "Requires negative sampling", "Embedding drift over time"],
    inputsUsed: ["User preferences + history", "Item category, tags"],
    vizType: "towers",
    liveExample: [
      { label: "USER TOWER — encode Alex", text: "", mono: "[0.9, 0.7, 0.0, 0.8, 0.0 …] (luxury, vintage, music, jewelry, sports)" },
      { label: "ITEM TOWER — encode 🎸 Guitar", text: "", mono: "[0.0, 0.9, 1.0, 0.0, 0.0 …] → cosine similarity = 0.18 → low" },
      { label: "Encode 👜 LV Trunk", text: "", mono: "[0.9, 0.9, 0.0, 0.0, …] → cosine similarity = 0.89 → HIGH → recommended", winner: true },
    ],
    whyMatters: "Two-Tower is the backbone of retrieval at YouTube, Google, and Amazon — it can search billions of items in milliseconds.",
    whenToUse: { bestWhen: "Huge catalog, need fast retrieval", watchOut: "Limited cross-feature interactions", combineWith: "Wide & Deep" },
  },
  {
    key: "item2vec", name: "Item2Vec", full: "Item Embedding Model", color: "#ef4444",
    category: "Embedding", stage: "Retrieve",
    typeBadge: "Embed", complexity: 2, bestFor: "Cold start",
    summary: "Learns item embeddings from co-occurrence patterns in user sessions, similar to Word2Vec for words.",
    analogy: "Like learning that \"bread\" and \"butter\" go together by reading millions of grocery lists — items that appear in the same carts are neighbors.",
    mathOneLiner: "score = 1 / (1 + distance(last_item_embedding, candidate_embedding))",
    searchUsage: "PARTIAL",
    searchExplanation: "Query match provides a secondary signal; the primary ranking is from co-occurrence proximity.",
    outputBehavior: "Finds items that frequently co-occur with your recently viewed items across sessions.",
    tradeoff: "Discovers hidden relationships, but needs many sessions",
    how: [
      "Treat each user's history as a 'sentence' of item IDs",
      "Train skip-gram style: predict context items from target item",
      "Result: items that co-occur across users land near each other in vector space",
      "Score candidates by distance to the user's most recent item"
    ],
    strengths: ["Captures implicit relationships", "Compact embeddings", "No explicit features needed"],
    weaknesses: ["Ignores item metadata", "Needs many sessions", "No user modeling"],
    inputsUsed: ["User session co-occurrence"],
    vizType: "scatter",
    liveExample: [
      { label: "Sessions in dataset", text: "User 1: [Rolex, Brooch, Ring] — jewelry/luxury session", mono: "User 2: [Speedmaster, Apollo Patch] — space/collectible session" },
      { label: "Items in same sessions → similar vectors", text: "Rolex and Brooch are close; Speedmaster and Apollo Patch are close" },
      { label: "Alex's last item = ⌚ Speedmaster → find neighbors", text: "", mono: "🚀 Apollo Patch (0.74), 🌑 Meteorite (0.68) → recommended", winner: true },
    ],
    whyMatters: "Item2Vec finds surprising connections — items you'd never link by tags but users consistently browse together.",
    whenToUse: { bestWhen: "Many user sessions, want to find hidden item relationships", watchOut: "Small catalogs or few sessions", combineWith: "LightGBM" },
  },
  {
    key: "sasrec", name: "SASRec", full: "Self-Attentive Sequential Rec.", color: "#10b981",
    category: "Sequential", stage: "Score",
    typeBadge: "Score", complexity: 3, bestFor: "Personalization",
    summary: "Applies self-attention over a user's interaction sequence to capture both long-range and recent intent signals.",
    analogy: "Like a detective reading your browsing history as a story — recent chapters matter more, but early clues still count.",
    mathOneLiner: "attended_repr = Σ attention_weight_i × item_embedding_i",
    searchUsage: "PARTIAL",
    searchExplanation: "Query adds a boost after sequential scoring — search nudges but doesn't override the sequence signal.",
    outputBehavior: "Surfaces items that naturally follow your recent interaction trajectory.",
    tradeoff: "Captures session intent, but needs ordered history",
    how: [
      "Take the ordered sequence of user interactions",
      "Apply self-attention with causal masking (each position attends to past only)",
      "Weight recent items more heavily via positional + recency decay",
      "Score candidates by similarity to the attended sequence representation"
    ],
    strengths: ["Captures sequential patterns", "Attention is interpretable", "Adapts to session context"],
    weaknesses: ["Needs ordered interaction data", "Expensive at long sequences", "Cold-start on short histories"],
    inputsUsed: ["Ordered interaction sequence", "Item features"],
    vizType: "attention",
    liveExample: [
      { label: "Alex's history in order", text: "", mono: "💍 Ring → ✨ Brooch → ⌚ Rolex → ⌚ Speedmaster (most recent)" },
      { label: "Compute attention weights", text: "", mono: "Ring = 5%, Brooch = 10%, Rolex = 30%, Speedmaster = 55%" },
      { label: "\"What comes next after luxury watches?\"", text: "Model predicts similar luxury timepieces.", mono: "🪔 Tiffany Lamp scores 0.61 (luxury + vintage, matches trajectory)", winner: true },
    ],
    whyMatters: "SASRec understands intent drift — it knows your taste is evolving and weights your recent actions most.",
    whenToUse: { bestWhen: "Users have ordered interaction sequences", watchOut: "Very short histories (< 3 items)", combineWith: "ALS" },
  },
  {
    key: "lightgbm", name: "LightGBM", full: "Gradient Boosted Trees", color: "#f97316",
    category: "Feature-Based", stage: "Score",
    typeBadge: "Score", complexity: 2, bestFor: "Hybrid",
    summary: "Gradient-boosted decision trees that combine numeric and categorical features to predict relevance scores.",
    analogy: "Like a panel of judges each scoring one aspect (price, popularity, taste match) — the final score is a weighted vote.",
    mathOneLiner: "score = Σ weight_i × feature_i (learned feature importance)",
    searchUsage: "USES",
    searchExplanation: "Query match is an explicit feature in the decision tree, directly affecting the relevance score.",
    outputBehavior: "Ranks items by a weighted combination of numeric features, category match, tag overlap, and query relevance.",
    tradeoff: "Interpretable features, but requires feature engineering",
    how: [
      "Engineer features: price, bids, views, category match, tag overlap, query match",
      "Normalize numeric features to comparable ranges",
      "Combine via weighted feature importance (learned from gradient boosting)",
      "Output a single relevance score per item"
    ],
    strengths: ["Handles mixed feature types", "Interpretable feature importance", "Robust to missing data"],
    weaknesses: ["Feature engineering required", "Less personalization", "Can't learn embeddings"],
    inputsUsed: ["Price, bids, views", "Category match", "Tag overlap", "Query terms"],
    vizType: "features",
    liveExample: [
      { label: "Features for 🏎️ Porsche 911", text: "", mono: "tag_overlap = 0.40, bids = 1.00, views = 1.00, price_match = 0.61" },
      { label: "Decision tree logic", text: "", mono: "IF bids > 80 AND views > 2000 → score × 1.4 boost" },
      { label: "Final weighted score", text: "", mono: "0.40×0.3 + 1.0×0.25 + 1.0×0.2 + 0.61×0.25 = 0.72 → #1", winner: true },
    ],
    whyMatters: "LightGBM lets you see exactly why an item ranked high — it's the most interpretable model here.",
    whenToUse: { bestWhen: "Rich numeric features (price, bids, views)", watchOut: "Pure personalization without features", combineWith: "ALS" },
  },
  {
    key: "rising", name: "Rising Popularity", full: "Trending Momentum", color: "#ec4899",
    category: "Popularity", stage: "Re-rank",
    typeBadge: "Rule", complexity: 1, bestFor: "Trending",
    summary: "Scores items by engagement momentum — how fast their metrics are growing relative to the catalog.",
    analogy: "Like a trending chart on social media — it doesn't care who you are, it shows what's hot right now for everyone.",
    mathOneLiner: "score = (bids × 0.5 + views × 0.1) × momentum_boost",
    searchUsage: "IGNORES",
    searchExplanation: "This model ranks purely by engagement momentum — your search query has no effect.",
    outputBehavior: "Shows the same trending items regardless of who's looking or what they searched.",
    tradeoff: "Great for cold start, but ignores personal taste and search",
    how: [
      "Normalize engagement signals (bids, views, clicks) across the catalog",
      "Compute a momentum score from weighted engagement features",
      "Apply recency bias to favor recently-listed items",
      "Rank by momentum — hot items surface to the top"
    ],
    strengths: ["No personalization needed", "Surfaces trending items", "Simple and fast"],
    weaknesses: ["Popularity bias", "Not personalized", "Can create filter bubbles"],
    inputsUsed: ["Bids, views, engagement metrics"],
    vizType: "trend",
    liveExample: [
      { label: "Formula: score = (bids × 0.5 + views × 0.1) × momentum", text: "Apply to every item regardless of user" },
      { label: "Rank all items", text: "", mono: "🏎️ Porsche: 547 → #1  ⌚ Speedmaster: 257 → #2  📚 Hemingway: 41 → #8" },
      { label: "Same results for ALL users", text: "No personalization — Alex, Maria, James, and Priya all see the same ranking.", mono: "Porsche wins because 102 bids + 3800 views = pure momentum", winner: true },
    ],
    whyMatters: "Rising Popularity is the safety net — it surfaces items that are objectively hot, regardless of taste.",
    whenToUse: { bestWhen: "New users, homepage, or cold-start scenarios", watchOut: "Will ignore niche/personal interests", combineWith: "ALS or SASRec" },
  },
  {
    key: "widedeep", name: "Wide & Deep", full: "Wide & Deep Network", color: "#06b6d4",
    category: "Hybrid", stage: "Score",
    typeBadge: "Score", complexity: 3, bestFor: "Hybrid",
    summary: "Combines a wide linear model (memorization of feature crosses) with a deep neural network (generalization).",
    analogy: "Like having both a spreadsheet expert (wide: exact rule matches) and a creative thinker (deep: finding hidden patterns) on your team.",
    mathOneLiner: "score = α × wide_score + β × deep_score",
    searchUsage: "USES",
    searchExplanation: "Query match enters the wide branch as a categorical feature and slightly influences the deep branch.",
    outputBehavior: "Combines memorized category/tag patterns with generalized numeric feature scoring.",
    tradeoff: "Best of both worlds, but more complex to tune",
    how: [
      "Wide branch: categorical crosses — does user's category preference match this item?",
      "Deep branch: feed normalized numeric features through a multi-layer perceptron",
      "Combine both branches: final score = 0.5 × wide + 0.5 × deep",
      "The wide path memorizes specific patterns; the deep path generalizes"
    ],
    strengths: ["Best of both worlds", "Handles sparse + dense features", "Production-proven at Google"],
    weaknesses: ["More complex to train", "Wide features need engineering", "Can overfit on wide side"],
    inputsUsed: ["Category, tags (wide)", "Price, bids, views (deep)"],
    vizType: "widedeep",
    liveExample: [
      { label: "WIDE (memorization)", text: "", mono: "\"luxury\" tag match → +0.6, \"vintage\" tag match → +0.4 → wide = 1.0" },
      { label: "DEEP (generalization)", text: "Input:", mono: "[price=0.14, bids=0.46, views=0.23] → hidden layer → deep = 0.58" },
      { label: "Final combined score", text: "", mono: "1.0 × 0.4 + 0.58 × 0.6 = 0.75 → strong recommendation", winner: true },
    ],
    whyMatters: "Wide & Deep is Google's recommendation backbone — it memorizes your exact patterns AND generalizes to new items.",
    whenToUse: { bestWhen: "Mix of categorical + numeric features", watchOut: "Simple catalogs where Wide alone suffices", combineWith: "Rising Popularity" },
  },
];

/* ═══════════════════════════ CONSTANTS ═══════════════════════════ */
const STAGES = [
  { key: "Retrieve", label: "Retrieve", desc: "Cast a wide net — pull candidates from the full catalog", color: "#3b82f6", search: "BM25 + Two-Tower enter here", personal: "ALS, EASE, Item2Vec use history here" },
  { key: "Score", label: "Score", desc: "Assign a relevance score to each candidate using model signals", color: "#f59e0b", search: "LightGBM, Wide&Deep use query features", personal: "SASRec applies sequence attention" },
  { key: "Re-rank", label: "Reorder", desc: "Reorder results using business rules, diversity, or trending signals", color: "#ec4899", search: "Query results blended here", personal: "Fusion combines model outputs" },
  { key: "Final", label: "Final Results", desc: "The ranked list the user actually sees", color: "#10b981", search: "", personal: "" },
];

const FUSIONS = [
  { key: "avg", name: "Score Averaging", desc: "Normalize each model's scores to [0,1], then average them.", chooseIf: "You want a simple, balanced blend with no tuning." },
  { key: "rrf", name: "Reciprocal Rank Fusion", desc: "Score = Σ 1/(60 + rank). Rewards items ranked highly by multiple models.", chooseIf: "You want consensus — items multiple models agree on rise to the top." },
  { key: "weighted", name: "Weighted Blend", desc: "Set custom weight per model. Scores are normalized then blended.", chooseIf: "You know which model you trust more and want to control the balance." },
  { key: "cascade", name: "Cascade", desc: "Model 1 retrieves top-N, Model 2 re-ranks only those candidates.", chooseIf: "You have a fast retriever and a slow but precise scorer." },
];

const INTENT_LABELS = [
  { max: 20, label: "Pure personalization", desc: "Ignoring your search. Showing what {user} would like anyway." },
  { max: 40, label: "Personalization leads", desc: "Your search nudges results. Personal taste dominates." },
  { max: 60, label: "Balanced", desc: "Search and personal taste have equal weight." },
  { max: 80, label: "Search leads", desc: "Your search leads. Personal taste is a tiebreaker." },
  { max: 100, label: "Pure search match", desc: "Ignoring personal taste. Matching your query exactly." },
];

const QUERY_CHIPS = ["vintage items", "rare collectibles", "high-value lots", "recently trending", "similar to watches", "gift under $5000", "space memorabilia"];

const PAIN_POINTS = [
  "cold start", "weak personalization", "poor search relevance", "low diversity",
  "popularity bias", "sparse metadata", "strong text signals", "session intent",
  "explainability", "trending discovery"
];

/* ═══════════════════════════ CSV + SCHEMA ═══════════════════════════ */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  return lines.slice(1).map(line => {
    const vals = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

const ITEM_ALIASES = {
  id: ['id','item_id','listing_id'], title: ['title','item_name','name','auction_title'],
  category: ['category','department','group','vertical'], price: ['price','current_price','start_price','amount'],
  bids: ['bids','bid_count','num_bids'], views: ['views','view_count','page_views','impressions','watch_count'],
  tags: ['tags','keywords','labels'], image: ['image','emoji','thumbnail','icon'], description: ['description','desc','details'],
};
const USER_ALIASES = {
  id: ['id','user_id','buyer_id'], name: ['name','user_name','buyer_name'],
  history: ['history','item_history','clicked_items','watched_items','bought_items'],
  preferences: ['preferences','interests','tags','affinities'],
};
const EVENT_ALIASES = {
  userId: ['user_id','buyer_id'], itemId: ['item_id','listing_id'],
  eventType: ['event','event_type','action'], timestamp: ['timestamp','time','created_at','date'],
  query: ['query','search_term','keyword'],
};

function mapFields(row, aliases) {
  const keys = Object.keys(row), mapped = {}, log = {};
  for (const [c, alts] of Object.entries(aliases)) {
    const f = alts.find(a => keys.includes(a));
    if (f) { mapped[c] = f; log[c] = { source: f, ok: true }; }
    else log[c] = { source: null, ok: false };
  }
  return { mapped, log };
}

function gv(row, fm, key, fb) { if (fb === undefined) fb = ''; const c = fm[key]; return c && row[c] !== undefined ? row[c] : fb; }

const CAT_EMOJI = { watches:'⌚', art:'🎨', music:'🎸', jewelry:'💍', sports:'⚾', fashion:'👜', books:'📚', cars:'🏎️', space:'🚀', history:'🔐', electronics:'💻', toys:'🧸' };
function inferEmoji(cat) { if (!cat) return '📦'; const l = cat.toLowerCase(); for (const [k,v] of Object.entries(CAT_EMOJI)) if (l.includes(k)) return v; return '📦'; }
function tokenize(t) { return t ? t.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w => w.length > 2) : []; }

function processData(rawItems, rawUsers, rawEvents) {
  const diag = { items: {}, users: {}, events: {}, fallbacks: [], modes: {} };
  let items = [], users = [], events = [];
  let ifm = {}, ufm = {}, efm = {}, ilog = {}, ulog = {}, elog = {};

  if (rawItems && rawItems.length) {
    const r = mapFields(rawItems[0], ITEM_ALIASES); ifm = r.mapped; ilog = r.log;
    items = rawItems.map((row, idx) => {
      const id = parseInt(gv(row,ifm,'id',idx+1)) || idx+1;
      const title = gv(row,ifm,'title','Item '+id);
      const category = gv(row,ifm,'category','');
      const price = parseFloat((gv(row,ifm,'price','0')+'').replace(/[^0-9.]/g,'')) || 0;
      const bids = parseInt(gv(row,ifm,'bids','0')) || 0;
      const views = parseInt(gv(row,ifm,'views','0')) || 0;
      let tags = gv(row,ifm,'tags','');
      if (typeof tags === 'string') tags = tags.split(',').map(t=>t.trim()).filter(Boolean);
      if (!tags.length) { tags = [...new Set(tokenize(title + ' ' + gv(row,ifm,'description','')))].slice(0,5); if (!diag.fallbacks.includes('tags_from_text')) diag.fallbacks.push('tags_from_text'); }
      const image = gv(row,ifm,'image','') || inferEmoji(category);
      return { id, title, category: category||'Unknown', price, bids, views, tags, image };
    });
  }

  if (rawUsers && rawUsers.length) {
    const r = mapFields(rawUsers[0], USER_ALIASES); ufm = r.mapped; ulog = r.log;
    users = rawUsers.map((row,idx) => {
      let hist = gv(row,ufm,'history',''); if (typeof hist === 'string') hist = hist.split(',').map(h=>parseInt(h.trim())).filter(Boolean);
      let prefs = gv(row,ufm,'preferences',''); if (typeof prefs === 'string') prefs = prefs.split(',').map(p=>p.trim()).filter(Boolean);
      return { id: String(gv(row,ufm,'id','U'+(idx+1))), name: gv(row,ufm,'name','User '+(idx+1)), history: hist, preferences: prefs };
    });
  }

  if (rawEvents && rawEvents.length) {
    const r = mapFields(rawEvents[0], EVENT_ALIASES); efm = r.mapped; elog = r.log;
    events = rawEvents.map(row => ({ userId: String(gv(row,efm,'userId','')), itemId: parseInt(gv(row,efm,'itemId','0'))||0, eventType: gv(row,efm,'eventType','view'), timestamp: gv(row,efm,'timestamp','') })).filter(e=>e.userId&&e.itemId);
  }

  if (!users.length && items.length) {
    const cats = [...new Set(items.map(i=>i.category))];
    users = cats.slice(0,4).map((cat,idx) => {
      const ci = items.filter(i=>i.category===cat);
      return { id: 'U'+(idx+1), name: 'Synth User '+(idx+1), history: ci.slice(0,4).map(i=>i.id), preferences: [...new Set(ci.flatMap(i=>i.tags))].slice(0,3) };
    });
    if (!users.length) users = [{ id:"U1", name:"Default User", history: items.slice(0,4).map(i=>i.id), preferences: items.slice(0,2).flatMap(i=>i.tags).slice(0,3) }];
    diag.fallbacks.push('synthetic_users');
  }

  if (events.length) {
    const ue = {}; events.forEach(e => { if (!ue[e.userId]) ue[e.userId]=[]; ue[e.userId].push(e); });
    users = users.map(u => { const ev = ue[u.id]; if (ev) { const h = [...new Set(ev.sort((a,b)=>(a.timestamp||'').localeCompare(b.timestamp||'')).map(e=>e.itemId))]; if (h.length) u.history = h; } return u; });
    diag.fallbacks.push('history_from_events');
  }

  const has = f => ifm[f] !== undefined;
  diag.items = { count: items.length, log: ilog, hasPrice: has('price'), hasBids: has('bids'), hasViews: has('views'), hasTags: has('tags'), hasCat: has('category') };
  diag.users = { count: users.length, log: ulog, synthetic: diag.fallbacks.includes('synthetic_users') };
  diag.events = { count: events.length, log: elog };
  MODELS.forEach(m => {
    if (m.key === 'bm25') diag.modes[m.key] = 'full';
    else if (m.key === 'sasrec') diag.modes[m.key] = events.length ? 'full' : users.some(u=>u.history.length>1) ? 'partial' : 'degraded';
    else if (m.key === 'rising') diag.modes[m.key] = (has('bids')||has('views')) ? 'full' : 'degraded';
    else diag.modes[m.key] = 'full';
  });
  return { items, users, events, diag };
}

/* ═══════════════════════════ MATH HELPERS ═══════════════════════════ */
function minMax(arr) { const mn=Math.min(...arr), mx=Math.max(...arr), r=mx-mn||1; return arr.map(v=>(v-mn)/r); }
function cosine(a,b) { let d=0,na=0,nb=0; for(let i=0;i<a.length;i++){d+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];} const dn=Math.sqrt(na)*Math.sqrt(nb); return dn?d/dn:0; }
function dot(a,b) { let s=0; for(let i=0;i<Math.min(a.length,b.length);i++) s+=a[i]*b[i]; return s; }
function buildVocab(items) { const s=new Set(); items.forEach(it=>{it.tags.forEach(t=>s.add(t));s.add(it.category.toLowerCase());}); return [...s]; }
function toVec(item,vocab) { return vocab.map(t=>item.tags.includes(t)?1:item.category.toLowerCase()===t?1.5:0); }

/* ═══════════════════════════ MODEL SCORING ═══════════════════════════ */
function runModel(key, items, user, users, events, diag, query, intentWeight) {
  if (intentWeight === undefined) intentWeight = 40;
  const vocab = buildVocab(items);
  const vecs = {}; items.forEach(it => { vecs[it.id] = toVec(it,vocab); });
  const histItems = user.history.map(id=>items.find(i=>i.id===id)).filter(Boolean);
  const seen = new Set(user.history);

  const qb = (item) => {
    if (!query || key === 'rising' || key === 'bm25') return 0;
    const qTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    let b = 0;
    qTerms.forEach(t => {
      if (item.title.toLowerCase().includes(t)) b += 0.3;
      if (item.tags.some(tag => tag.includes(t))) b += 0.2;
      if (item.category.toLowerCase().includes(t)) b += 0.15;
    });
    return b * (intentWeight / 50);
  };

  let scored = [], viz = {};

  if (key === 'bm25') {
    if (!query) {
      scored = items.map((it, i) => ({...it, score: 0.001 * (1 - i/items.length)}));
      viz = { type:'features', importance:{} };
    } else {
      const qTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
      const N = items.length;
      const df = {};
      qTerms.forEach(t => {
        df[t] = items.filter(it =>
          it.title.toLowerCase().includes(t) ||
          it.tags.some(tag => tag.includes(t)) ||
          it.category.toLowerCase().includes(t)
        ).length;
      });
      scored = items.map(it => {
        const fields = (it.title + ' ' + it.tags.join(' ') + ' ' + it.category).toLowerCase();
        let score = 0;
        qTerms.forEach(t => {
          const tf = (fields.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          const idf = Math.log((N + 1) / (1 + (df[t] || 0)));
          score += tf * idf;
        });
        return {...it, score};
      });
      const imp = {};
      qTerms.forEach(t => { imp[t + ' (TF×IDF)'] = 1 / qTerms.length; });
      viz = { type:'features', importance: imp };
    }
  }
  else if (key === 'als') {
    const uv = vocab.map((_,vi) => { const s=histItems.reduce((a,it)=>a+(vecs[it.id] && vecs[it.id][vi]||0),0); return histItems.length?s/histItems.length:0; });
    scored = items.filter(i=>!seen.has(i.id)).map(it => ({ ...it, score: dot(uv, vecs[it.id]||[]) + qb(it) }));
    const mx = {}; users.forEach(u => { mx[u.id]={}; u.history.forEach(id=>{mx[u.id][id]=1;}); });
    viz = { type:'heatmap', matrix:mx, rows:users.map(u=>u.id), cols:items.slice(0,12).map(i=>i.id) };
  }
  else if (key === 'ease') {
    const sim = {}; items.forEach(a => { sim[a.id]={}; items.forEach(b => { sim[a.id][b.id] = a.id===b.id?1:cosine(vecs[a.id],vecs[b.id]); }); });
    scored = items.filter(i=>!seen.has(i.id)).map(it => ({ ...it, score: histItems.reduce((s,h)=>s+(sim[h.id] && sim[h.id][it.id]||0),0) + qb(it) }));
    viz = { type:'heatmap', matrix:sim, rows:items.slice(0,10).map(i=>i.id), cols:items.slice(0,10).map(i=>i.id) };
  }
  else if (key === 'twotower') {
    const ut = vocab.map((_,vi)=>{ const s=histItems.reduce((a,it)=>a+(vecs[it.id] && vecs[it.id][vi]||0),0); return (histItems.length?s/histItems.length:0)+(user.preferences.includes(vocab[vi])?0.3:0); });
    scored = items.filter(i=>!seen.has(i.id)).map(it => ({ ...it, score: cosine(ut,vecs[it.id]||[]) + qb(it) }));
    const topDims = ut.map((v,i)=>({v,t:vocab[i]})).sort((a,b)=>b.v-a.v).slice(0,8);
    viz = { type:'towers', topDims };
  }
  else if (key === 'sasrec') {
    let seq = events.filter(e=>e.userId===user.id);
    seq = seq.length>1 ? seq.sort((a,b)=>(a.timestamp||'').localeCompare(b.timestamp||'')).map(e=>e.itemId) : [...user.history];
    const seqIt = seq.map(id=>items.find(i=>i.id===id)).filter(Boolean);
    if (!seqIt.length) { scored = items.slice(0,10).map((it,i)=>({...it,score:1-i*0.05})); viz={type:'attention',weights:[],seqItems:[]}; }
    else {
      const w = seqIt.map((_,i)=>Math.pow(0.7,seqIt.length-1-i)); const ws=w.reduce((a,b)=>a+b,0); const nw=w.map(v=>v/ws);
      const av = vocab.map((_,vi)=>seqIt.reduce((s,it,idx)=>s+(vecs[it.id] && vecs[it.id][vi]||0)*nw[idx],0));
      scored = items.filter(i=>!seen.has(i.id)).map(it => ({ ...it, score: cosine(av,vecs[it.id]||[]) + qb(it) }));
      viz = { type:'attention', weights:nw, seqItems:seqIt };
    }
  }
  else if (key === 'item2vec') {
    const cooc = {}; items.forEach(i=>{cooc[i.id]={};}); users.forEach(u=>{for(let i=0;i<u.history.length;i++) for(let j=i+1;j<u.history.length;j++){const a=u.history[i],b=u.history[j];if(cooc[a])cooc[a][b]=(cooc[a][b]||0)+1;if(cooc[b])cooc[b][a]=(cooc[b][a]||0)+1;}});
    const cats=[...new Set(items.map(i=>i.category))];
    const emb={}; items.forEach(it=>{const cv=Object.values(cooc[it.id]||{}); emb[it.id]=[cats.indexOf(it.category)/Math.max(cats.length-1,1), cv.reduce((a,b)=>a+b,0)/10];});
    const last=user.history[user.history.length-1]; const anc=emb[last]||[0.5,0.5];
    scored = items.filter(i=>!seen.has(i.id)).map(it=>{const e=emb[it.id]||[0,0]; return {...it, score:1/(1+Math.sqrt((e[0]-anc[0])**2+(e[1]-anc[1])**2))+qb(it)};});
    viz = { type:'scatter', emb, anc, cats };
  }
  else if (key === 'lightgbm') {
    const hp=diag.items.hasPrice!==false, hb=diag.items.hasBids!==false, hv=diag.items.hasViews!==false;
    const pn=minMax(items.map(i=>i.price)), bn=minMax(items.map(i=>i.bids)), vn=minMax(items.map(i=>i.views));
    let wp=hp?.15:0, wb=hb?.25:0, wv=hv?.2:0, wc=.2, wt=.15, wq=.05;
    const tot=wp+wb+wv+wc+wt+wq; wp/=tot;wb/=tot;wv/=tot;wc/=tot;wt/=tot;wq/=tot;
    const fi={price:wp,bids:wb,views:wv,catMatch:wc,tagOverlap:wt,queryMatch:wq};
    const uCats=new Set(), uTags=new Set(user.preferences); histItems.forEach(it=>{uCats.add(it.category);it.tags.forEach(t=>uTags.add(t));});
    scored = items.filter(i=>!seen.has(i.id)).map(it=>{const oi=items.indexOf(it); const cm=uCats.has(it.category)?1:0; const to=it.tags.filter(t=>uTags.has(t)).length/Math.max(it.tags.length,1); let qm=0; if(query){const q=query.toLowerCase();if(it.title.toLowerCase().includes(q))qm=1;else if(it.tags.some(t=>t.includes(q)))qm=.7;else if(it.category.toLowerCase().includes(q))qm=.5;} return {...it,score:wp*(pn[oi]||0)+wb*(bn[oi]||0)+wv*(vn[oi]||0)+wc*cm+wt*to+wq*qm+qb(it)};});
    viz = { type:'features', importance:fi };
  }
  else if (key === 'rising') {
    const bn=minMax(items.map(i=>i.bids)), vn=minMax(items.map(i=>i.views));
    scored = items.map((it,idx)=>{const m=bn[idx]*.5+vn[idx]*.3+(1-idx/items.length*.3)*.2; const trend=m>.6?'hot':m>.35?'warm':'cool'; return {...it,score:m,trend};});
    viz = { type:'trend' };
  }
  else if (key === 'widedeep') {
    const uCats=new Set(),uTags=new Set(user.preferences); histItems.forEach(it=>{uCats.add(it.category);it.tags.forEach(t=>uTags.add(t));});
    const pn=minMax(items.map(i=>i.price)),bn=minMax(items.map(i=>i.bids)),vn=minMax(items.map(i=>i.views));
    scored = items.filter(i=>!seen.has(i.id)).map(it=>{const oi=items.indexOf(it); const wide=(uCats.has(it.category)?.5:0)+(it.tags.filter(t=>uTags.has(t)).length/Math.max(it.tags.length,1))*.5; const di=[pn[oi]||0,bn[oi]||0,vn[oi]||0]; const deep=Math.min(di[0]*.5+di[1]*.3+di[2]*.2,1); return {...it,score:wide*.5+deep*.5+qb(it),wide,deep};});
    viz = { type:'widedeep' };
  }

  scored.sort((a,b)=>b.score-a.score);
  return { ranked: scored.slice(0,10), viz };
}

/* ═══════════════════════════ FUSION ═══════════════════════════ */
function norm(ranked) { const sc=ranked.map(r=>r.score); const mn=Math.min(...sc),mx=Math.max(...sc),rng=mx-mn||1; return ranked.map(r=>({...r,ns:(r.score-mn)/rng})); }

function fuse(strategy, results, weights, topN) {
  if (strategy === 'avg') {
    const all={}; results.forEach(function(entry){norm(entry.ranked).forEach(function(it){if(!all[it.id])all[it.id]={...it,scores:[]};all[it.id].scores.push(it.ns);});});
    return Object.values(all).map(it=>({...it,score:it.scores.reduce((a,b)=>a+b,0)/it.scores.length})).sort((a,b)=>b.score-a.score).slice(0,10);
  }
  if (strategy === 'rrf') {
    const all={}; results.forEach(function(entry){entry.ranked.forEach(function(it,r){if(!all[it.id])all[it.id]={...it,score:0};all[it.id].score+=1/(60+r);});});
    return Object.values(all).sort((a,b)=>b.score-a.score).slice(0,10);
  }
  if (strategy === 'weighted') {
    const ws=weights.reduce((a,b)=>a+b,0)||1;
    const all={}; results.forEach(function(entry,mi){const w=weights[mi]/ws; norm(entry.ranked).forEach(function(it){if(!all[it.id])all[it.id]={...it,score:0};all[it.id].score+=it.ns*w;});});
    return Object.values(all).sort((a,b)=>b.score-a.score).slice(0,10);
  }
  if (strategy === 'cascade') {
    if (!results.length) return [];
    let cands = results[0].ranked.slice(0,topN);
    for (let i=1;i<results.length;i++){const ns={};results[i].ranked.forEach(function(r){ns[r.id]=r.score;}); cands=cands.map(c=>({...c,score:ns[c.id]||0})).sort((a,b)=>b.score-a.score);}
    return cands.slice(0,10);
  }
  return [];
}

/* ═══════════════════════════ EXPLANATION HELPERS ═══════════════════════════ */
function generateReasons(item, user, items, results, selectedModels, fusedResults, query) {
  const reasons = [];
  const histItems = user.history.map(id => items.find(i => i.id === id)).filter(Boolean);
  const userTags = new Set([...user.preferences, ...histItems.flatMap(i => i.tags)]);
  const tagOverlap = item.tags.filter(t => userTags.has(t));
  if (tagOverlap.length / Math.max(item.tags.length, 1) > 0.3 && tagOverlap.length > 0)
    reasons.push("Matches your " + tagOverlap.slice(0, 2).join(" & ") + " interests");
  if (item.bids > 60) reasons.push("High bid activity (" + item.bids + " bids)");
  if (item.views > 1500) reasons.push("Popular listing (" + item.views.toLocaleString() + " views)");

  const userCats = new Set(histItems.map(i => i.category));
  if (userCats.has(item.category)) {
    const similar = histItems.find(h => h.category === item.category);
    if (similar) reasons.push("Similar to " + similar.title.split(' ').slice(0,3).join(' ') + " you liked");
  }

  if (query && item.title.toLowerCase().includes(query.toLowerCase()))
    reasons.push("Strong keyword match for \"" + query + "\"");

  const modelsWithItemInTop5 = selectedModels.filter(mk => results[mk] && results[mk].ranked.slice(0,5).some(x => x.id === item.id));
  if (modelsWithItemInTop5.length === selectedModels.length && selectedModels.length >= 2)
    reasons.push("Recommended by all " + selectedModels.length + " models");
  else if (modelsWithItemInTop5.length === 1 && selectedModels.length >= 2)
    reasons.push("Unique find by " + (MODELS.find(m => m.key === modelsWithItemInTop5[0]) || {}).name);

  if (item.trend === 'hot') reasons.push("Trending — momentum increasing");

  selectedModels.forEach(mk => {
    const r = results[mk];
    if (r) {
      const maxScore = Math.max(...r.ranked.map(x => x.score), 0.001);
      const found = r.ranked.find(x => x.id === item.id);
      if (found && found.score / maxScore > 0.8)
        reasons.push("Strong " + (MODELS.find(m => m.key === mk) || {}).name + " signal");
    }
  });
  return reasons.slice(0, 4);
}

function whyModelLiked(mk, item, user, items) {
  const histItems = user.history.map(id => items.find(i => i.id === id)).filter(Boolean);
  const userTags = new Set([...user.preferences, ...histItems.flatMap(i => i.tags)]);
  const to = item.tags.filter(t => userTags.has(t));
  switch(mk) {
    case 'bm25': return "Matched query terms in title/tags/category";
    case 'als': return to.length ? "Latent factors align on " + to.slice(0,2).join(", ") + " dimensions" : "Collaborative patterns from similar users";
    case 'ease': { const sim = histItems.find(h => h.tags.some(t => item.tags.includes(t))); return sim ? "High similarity to " + sim.title.split(' ').slice(0,3).join(' ') + " (shared tags)" : "Moderate similarity to history items"; }
    case 'twotower': return to.length ? "Embedding similarity via " + to.slice(0,2).join(", ") + " features" : "User-item tower alignment";
    case 'sasrec': return "Follows " + user.name + "'s recent interaction trajectory";
    case 'item2vec': return "Co-occurs with items from " + user.name + "'s sessions";
    case 'lightgbm': { const parts = []; if (item.bids > 50) parts.push("high bids"); if (item.views > 1000) parts.push("high views"); if (to.length) parts.push("tag match"); return "Strong signals: " + (parts.join(", ") || "numeric features"); }
    case 'rising': return "High engagement momentum (" + item.bids + " bids, " + item.views + " views)";
    case 'widedeep': return to.length ? "Wide: " + to.slice(0,2).join("/") + " match + Deep: numeric features" : "Deep network scored numeric features highly";
    default: return '';
  }
}

function findSimilarItems(item, items, n) {
  return items.filter(i => i.id !== item.id).map(i => {
    const overlap = item.tags.filter(t => i.tags.includes(t)).length;
    return { ...i, sim: overlap + (i.category === item.category ? 1 : 0) };
  }).sort((a, b) => b.sim - a.sim).slice(0, n);
}

/* ═══════════════════════════ COMPUTATION HELPERS ═══════════════════════════ */
function computeConfidence(fusedResults, results, selectedModels) {
  if (!fusedResults || !fusedResults.length || !selectedModels.length) return 0;
  const top3 = fusedResults.slice(0, 3);
  let totalConsensus = 0;
  top3.forEach(function(item) {
    let modelsAgreeing = 0;
    selectedModels.forEach(function(mk) {
      const r = results[mk];
      if (r && r.ranked.slice(0, 5).some(function(x) { return x.id === item.id; })) modelsAgreeing++;
    });
    totalConsensus += modelsAgreeing / selectedModels.length;
  });
  return Math.round((totalConsensus / Math.max(top3.length, 1)) * 100);
}

function computeConsensusAndUnique(results, selectedModels) {
  if (selectedModels.length < 2) return { consensus: [], unique: {} };
  const top5Sets = {};
  selectedModels.forEach(function(mk) {
    top5Sets[mk] = new Set((results[mk] && results[mk].ranked || []).slice(0, 5).map(function(x) { return x.id; }));
  });
  const allIds = new Set();
  Object.values(top5Sets).forEach(function(s) { s.forEach(function(id) { allIds.add(id); }); });
  const consensus = [];
  var unique = {};
  allIds.forEach(function(id) {
    const inModels = selectedModels.filter(function(mk) { return top5Sets[mk] && top5Sets[mk].has(id); });
    if (inModels.length === selectedModels.length) consensus.push(id);
    else if (inModels.length === 1) {
      if (!unique[inModels[0]]) unique[inModels[0]] = [];
      unique[inModels[0]].push(id);
    }
  });
  return { consensus: consensus, unique: unique };
}

function generateAdvisorRec(chips, text, diag) {
  const has = function(s) { return chips.some(function(c) { return c.includes(s); }) || (text || '').toLowerCase().includes(s); };
  var primary, support, fusionKey, reasoning, watchouts, gaps;

  if (has('search') || has('text')) {
    primary = 'bm25'; support = ['lightgbm', 'twotower']; fusionKey = 'cascade';
    reasoning = "BM25 handles exact keyword intent, Two-Tower adds semantic coverage, LightGBM re-ranks with features.";
    watchouts = "BM25 alone won't personalize — add ALS if you need taste-based results.";
  } else if (has('cold') || has('sparse')) {
    primary = 'rising'; support = ['bm25']; fusionKey = 'rrf';
    reasoning = "Rising Popularity works without history. BM25 adds search coverage. Both work for new users.";
    watchouts = "This stack won't personalize. Add collaborative models as you gather interaction data.";
  } else if (has('personal') || has('session')) {
    primary = 'sasrec'; support = ['als', 'ease']; fusionKey = 'rrf';
    reasoning = "SASRec captures sequential intent, ALS provides long-term taste, EASE adds item-similarity coverage.";
    watchouts = "Needs sufficient interaction history. May underperform for new users.";
  } else if (has('diversity') || has('popularity')) {
    primary = 'als'; support = ['item2vec', 'bm25']; fusionKey = 'rrf';
    reasoning = "RRF across diverse retrieval methods maximizes coverage. Item2Vec finds unexpected connections.";
    watchouts = "More models = more compute. Monitor for latency.";
  } else if (has('explain')) {
    primary = 'lightgbm'; support = ['bm25']; fusionKey = 'cascade';
    reasoning = "LightGBM provides interpretable feature importance. BM25 adds transparent text matching.";
    watchouts = "Less personalized than collaborative models.";
  } else if (has('trend')) {
    primary = 'rising'; support = ['lightgbm', 'als']; fusionKey = 'weighted';
    reasoning = "Rising Popularity surfaces trending items. LightGBM adds feature scoring. ALS personalizes.";
    watchouts = "Trending items may not match individual taste.";
  } else {
    primary = 'als'; support = ['lightgbm']; fusionKey = 'rrf';
    reasoning = "ALS provides strong personalization, LightGBM adds feature-based scoring. A solid starting stack.";
    watchouts = "Consider adding BM25 for search, SASRec for session-aware ranking.";
  }

  gaps = '';
  if (diag && diag.items && diag.items.count < 10) gaps = "Very small catalog — collaborative models may underperform.";
  else if (diag && diag.users && diag.users.synthetic) gaps = "No real user data — collaborative models use synthetic users.";

  return { primary: primary, support: support, fusionKey: fusionKey, reasoning: reasoning, watchouts: watchouts, gaps: gaps };
}

/* ═══════════════════════════ UI COMPONENTS ═══════════════════════════ */
const Tip = ({ text, children }) => (
  React.createElement('span', { className: 'tip-wrap' },
    children,
    React.createElement('span', { className: 'tip-pop' }, text)
  )
);

function ScoreHelp({ model, user }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button onClick={e => { e.stopPropagation(); setOpen(!open); }} className="text-gray-400 hover:text-blue-500 text-[10px] ml-1 leading-none">(?)</button>
      {open && (
        <div className="absolute z-50 bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs w-56 bottom-6 left-0" onClick={e => e.stopPropagation()}>
          This score represents how strongly {model} predicts {user} will engage with this item. 100% = strongest possible match.
          <button onClick={() => setOpen(false)} className="block text-blue-500 mt-1.5 text-[10px] font-medium">Got it</button>
        </div>
      )}
    </span>
  );
}

/* ═══════════════════════════ VIZ COMPONENTS ═══════════════════════════ */
const VizHeatmap = ({ viz, color }) => {
  const rows = (viz.rows || []).slice(0,8), cols = (viz.cols || []).slice(0,10);
  const cs = Math.min(24, 220/Math.max(cols.length,1));
  return (
    <svg width={cols.length*cs+36} height={rows.length*cs+16} className="overflow-visible">
      {rows.map((r,ri) => cols.map((c,ci) => {
        const v = (viz.matrix && viz.matrix[r] && viz.matrix[r][c]) || 0;
        return <rect key={ri+'-'+ci} x={36+ci*cs} y={ri*cs} width={cs-1} height={cs-1} fill={color} opacity={Math.min(v,1)*.8+.08} rx={2} />;
      }))}
      {rows.map((r,i) => <text key={i} x={32} y={i*cs+cs/2+3} textAnchor="end" fill="#6b7280" fontSize={8} fontFamily="JetBrains Mono">{r}</text>)}
    </svg>
  );
};
const VizAttention = ({ viz }) => (
  <div className="space-y-1">{(viz.seqItems || []).map((it,i) => (
    <div key={i} className="flex items-center gap-2">
      <span className="text-sm w-5">{it.image}</span>
      <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden"><div className="h-full rounded grow-bar" style={{width:((viz.weights && viz.weights[i])||0)*100+'%',background:'#10b981',animationDelay:i*.08+'s'}} /></div>
      <span className="text-[10px] font-mono text-gray-500 w-10 text-right">{(((viz.weights && viz.weights[i])||0)*100).toFixed(1)}%</span>
    </div>
  ))}</div>
);
const VizFeatures = ({ viz }) => {
  const entries = Object.entries(viz.importance||{}).sort((a,b)=>b[1]-a[1]);
  return <div className="space-y-1">{entries.map(([name,val],i) => (
    <div key={name} className="flex items-center gap-2">
      <span className="text-[11px] font-mono text-gray-500 w-20 truncate">{name}</span>
      <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden"><div className="h-full rounded grow-bar" style={{width:val*100+'%',background:'#f97316',animationDelay:i*.06+'s'}} /></div>
      <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{(val*100).toFixed(0)}%</span>
    </div>
  ))}</div>;
};
const VizScatter = ({ viz, items }) => {
  const w=220,h=140,pad=20;
  const pts=items.slice(0,20).map(it=>{const e=(viz.emb && viz.emb[it.id])||[0,0]; return {x:pad+e[0]*(w-2*pad),y:h-pad-e[1]*(h-2*pad),it:it};});
  const ax=pad+((viz.anc && viz.anc[0])||.5)*(w-2*pad), ay=h-pad-((viz.anc && viz.anc[1])||.5)*(h-2*pad);
  return (
    <svg width={w} height={h}>
      {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#ef4444" opacity={.5} />)}
      <circle cx={ax} cy={ay} r={6} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <circle cx={ax} cy={ay} r={2.5} fill="#3b82f6" />
      <text x={ax+9} y={ay-4} fill="#3b82f6" fontSize={9} fontFamily="JetBrains Mono">anchor</text>
    </svg>
  );
};
const VizTowers = ({ viz }) => {
  const dims = viz.topDims||[];
  return (
    <div>
      <svg width={240} height={70}>
        <rect x={5} y={8} width={100} height={50} rx={6} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={55} y={30} textAnchor="middle" fill="#f59e0b" fontSize={10} fontFamily="JetBrains Mono">User Tower</text>
        <text x={55} y={44} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="JetBrains Mono">preferences</text>
        <rect x={135} y={8} width={100} height={50} rx={6} fill="none" stroke="#f59e0b55" strokeWidth={1.5} />
        <text x={185} y={30} textAnchor="middle" fill="#f59e0b" fontSize={10} fontFamily="JetBrains Mono">Item Tower</text>
        <text x={185} y={44} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="JetBrains Mono">features</text>
        <line x1={105} y1={33} x2={135} y2={33} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4" />
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
        {dims.map((d,i)=><span key={i} className="text-[10px] font-mono text-gray-500">{(d.t||'').slice(0,10)}: <span className="text-amber-600">{d.v.toFixed(2)}</span></span>)}
      </div>
    </div>
  );
};
const VizWideDeep = () => (
  <svg width={240} height={120}>
    <rect x={5} y={5} width={95} height={45} rx={5} fill="none" stroke="#06b6d4" strokeWidth={1.5} />
    <text x={52} y={25} textAnchor="middle" fill="#06b6d4" fontSize={10} fontFamily="JetBrains Mono">Wide</text>
    <text x={52} y={38} textAnchor="middle" fill="#9ca3af" fontSize={8} fontFamily="JetBrains Mono">categorical</text>
    <rect x={140} y={5} width={95} height={45} rx={5} fill="none" stroke="#8b5cf6" strokeWidth={1.5} />
    <text x={187} y={25} textAnchor="middle" fill="#8b5cf6" fontSize={10} fontFamily="JetBrains Mono">Deep</text>
    <text x={187} y={38} textAnchor="middle" fill="#9ca3af" fontSize={8} fontFamily="JetBrains Mono">numeric MLP</text>
    <line x1={52} y1={50} x2={120} y2={85} stroke="#d1d5db" strokeWidth={1} />
    <line x1={187} y1={50} x2={120} y2={85} stroke="#d1d5db" strokeWidth={1} />
    <rect x={80} y={78} width={80} height={30} rx={5} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
    <text x={120} y={97} textAnchor="middle" fill="#3b82f6" fontSize={10} fontFamily="JetBrains Mono">Combined</text>
  </svg>
);
const ModelViz = ({ modelKey, viz, color, items }) => {
  if (!viz) return null;
  if (viz.type==='heatmap') return <VizHeatmap viz={viz} color={color} />;
  if (viz.type==='attention') return <VizAttention viz={viz} />;
  if (viz.type==='features') return <VizFeatures viz={viz} />;
  if (viz.type==='scatter') return <VizScatter viz={viz} items={items} />;
  if (viz.type==='towers') return <VizTowers viz={viz} />;
  if (viz.type==='widedeep') return <VizWideDeep />;
  return null;
};

const FusionMiniDiagram = ({ type }) => {
  if (type === 'avg') return (
    <svg width={40} height={28} className="flex-shrink-0">
      <rect x={2} y={4} width={6} height={18} fill="#3b82f6" rx={1} opacity={.6} />
      <rect x={10} y={8} width={6} height={14} fill="#8b5cf6" rx={1} opacity={.6} />
      <rect x={18} y={6} width={6} height={16} fill="#f59e0b" rx={1} opacity={.6} />
      <text x={27} y={16} fill="#9ca3af" fontSize={8}>&#x2192;</text>
      <rect x={32} y={6} width={6} height={16} fill="#10b981" rx={1} />
    </svg>
  );
  if (type === 'rrf') return (
    <svg width={40} height={28} className="flex-shrink-0">
      <text x={2} y={10} fill="#3b82f6" fontSize={7} fontFamily="JetBrains Mono">#1#3</text>
      <text x={2} y={22} fill="#8b5cf6" fontSize={7} fontFamily="JetBrains Mono">#2#1</text>
      <text x={22} y={16} fill="#9ca3af" fontSize={8}>&#x2192;</text>
      <rect x={29} y={4} width={9} height={20} fill="#10b981" rx={2} opacity={.2} />
      <text x={33} y={17} textAnchor="middle" fill="#10b981" fontSize={7} fontWeight={600}>&#x2713;</text>
    </svg>
  );
  if (type === 'weighted') return (
    <svg width={40} height={28} className="flex-shrink-0">
      <rect x={2} y={4} width={10} height={18} fill="#3b82f6" rx={1} opacity={.7} />
      <rect x={14} y={8} width={6} height={14} fill="#8b5cf6" rx={1} opacity={.4} />
      <rect x={22} y={10} width={4} height={12} fill="#f59e0b" rx={1} opacity={.3} />
      <text x={28} y={16} fill="#9ca3af" fontSize={8}>&#x2192;</text>
      <rect x={33} y={5} width={6} height={17} fill="#10b981" rx={1} />
    </svg>
  );
  return (
    <svg width={40} height={28} className="flex-shrink-0">
      <polygon points="2,2 28,2 22,26 8,26" fill="#3b82f6" opacity={.1} stroke="#3b82f6" strokeWidth={.8} />
      <text x={15} y={10} textAnchor="middle" fill="#3b82f6" fontSize={6}>100</text>
      <text x={15} y={22} textAnchor="middle" fill="#3b82f6" fontSize={6}>&#x2192;5</text>
      <rect x={31} y={8} width={7} height={12} fill="#10b981" rx={2} opacity={.3} />
      <text x={34} y={17} textAnchor="middle" fill="#10b981" fontSize={6} fontWeight={600}>5</text>
    </svg>
  );
};

/* ═══════════════════════════ LEARN TAB COMPONENTS ═══════════════════════════ */
const PipelineDiagram = ({ activeStage, setActiveStage, overlay }) => (
  <div className="relative">
    <div className="flex items-center gap-1 overflow-x-auto py-4">
      {STAGES.map((s, i) => {
        const isActive = activeStage === s.key;
        return (
          <React.Fragment key={s.key}>
            <button onClick={() => setActiveStage(isActive ? null : s.key)}
              className={"flex-shrink-0 rounded-lg border px-4 py-3 text-center min-w-[140px] transition-all cursor-pointer " + (isActive ? "ring-2 ring-offset-1" : "hover:border-gray-400")}
              style={{ borderColor: s.color + (isActive ? 'aa' : '55'), background: s.color + (isActive ? '18' : '08'), ringColor: isActive ? s.color : undefined }}>
              <div className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</div>
              <div className="text-[11px] text-gray-500 mt-1 leading-tight">{s.desc}</div>
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {MODELS.filter(m=>m.stage===s.key).map(m=>(
                  <Tip key={m.key} text={m.full}>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{background:m.color+'22',color:m.color}}>{m.name}</span>
                  </Tip>
                ))}
              </div>
              {overlay === 'search' && s.search && <div className="text-[9px] text-teal-600 mt-2 font-medium bg-teal-50 rounded px-1.5 py-0.5">{s.search}</div>}
              {overlay === 'personal' && s.personal && <div className="text-[9px] text-purple-600 mt-2 font-medium bg-purple-50 rounded px-1.5 py-0.5">{s.personal}</div>}
              {overlay === 'multiindex' && s.key === 'Retrieve' && <div className="text-[9px] text-amber-600 mt-2 font-medium bg-amber-50 rounded px-1.5 py-0.5">4 indexes merge here</div>}
            </button>
            {i < STAGES.length - 1 && <div className="flex-shrink-0 text-gray-300 text-lg">{'\u2192'}</div>}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

const EduConceptCards = ({ onConfigurePlayground }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold">S</div>
        <div className="font-semibold text-gray-900 text-sm">How Search Works</div>
      </div>
      <div className="flex items-center gap-1.5 mb-3 text-[10px] font-mono">
        <span className="px-2 py-1 rounded bg-teal-100 text-teal-700">Query</span>
        <span className="text-gray-400">{'\u2192'}</span>
        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">Index</span>
        <span className="text-gray-400">{'\u2192'}</span>
        <span className="px-2 py-1 rounded bg-green-100 text-green-700">Ranked</span>
      </div>
      <ul className="text-xs text-gray-600 space-y-1 mb-3">
        <li className="flex gap-1.5"><span className="text-teal-500 flex-shrink-0">{'•'}</span>Keyword matching (BM25)</li>
        <li className="flex gap-1.5"><span className="text-teal-500 flex-shrink-0">{'•'}</span>Semantic retrieval (Two-Tower)</li>
        <li className="flex gap-1.5"><span className="text-teal-500 flex-shrink-0">{'•'}</span>Query-time scoring (LightGBM)</li>
      </ul>
      <button onClick={() => onConfigurePlayground({ models: ['bm25','lightgbm'], query: 'vintage watch', step: 3 })}
        className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors">See in Playground {'\u2192'}</button>
    </div>

    <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold">P</div>
        <div className="font-semibold text-gray-900 text-sm">How Personalization Works</div>
      </div>
      <div className="flex items-center gap-1.5 mb-3 text-[10px] font-mono">
        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">History</span>
        <span className="text-gray-400">{'\u2192'}</span>
        <span className="px-2 py-1 rounded bg-amber-100 text-amber-700">Taste</span>
        <span className="text-gray-400">{'\u2192'}</span>
        <span className="px-2 py-1 rounded bg-green-100 text-green-700">Score</span>
      </div>
      <ul className="text-xs text-gray-600 space-y-1 mb-3">
        <li className="flex gap-1.5"><span className="text-purple-500 flex-shrink-0">{'•'}</span>History-based (ALS, EASE)</li>
        <li className="flex gap-1.5"><span className="text-purple-500 flex-shrink-0">{'•'}</span>Sequence-aware (SASRec)</li>
        <li className="flex gap-1.5"><span className="text-purple-500 flex-shrink-0">{'•'}</span>Long-term vs session signals</li>
      </ul>
      <button onClick={() => onConfigurePlayground({ models: ['als','sasrec'], query: '', step: 3 })}
        className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors">See in Playground {'\u2192'}</button>
    </div>

    <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-bold">M</div>
        <div className="font-semibold text-gray-900 text-sm">How Multi-Indexing Works</div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2 text-[10px] font-mono">
        <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">Lexical</span>
        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Collab</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Semantic</span>
        <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">Trending</span>
      </div>
      <div className="text-[10px] font-mono text-gray-400 mb-3 text-center">{'\u2193'} merge & re-rank {'\u2193'}</div>
      <ul className="text-xs text-gray-600 space-y-1 mb-3">
        <li className="flex gap-1.5"><span className="text-amber-500 flex-shrink-0">{'•'}</span>Multiple retrieval sources</li>
        <li className="flex gap-1.5"><span className="text-amber-500 flex-shrink-0">{'•'}</span>Fusion combines them</li>
        <li className="flex gap-1.5"><span className="text-amber-500 flex-shrink-0">{'•'}</span>Improves recall & coverage</li>
      </ul>
      <button onClick={() => onConfigurePlayground({ models: ['bm25','als','twotower'], query: 'rare', step: 3 })}
        className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors">See in Playground {'\u2192'}</button>
    </div>
  </div>
);

const LiveExampleStep = ({ step, index, color }) => (
  <div className={"flex gap-3 items-start " + (step.winner ? "bg-green-50 border border-green-200 -mx-2 px-2 py-2 rounded-lg" : "py-1")}>
    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{background: step.winner ? '#16a34a22' : color+'22', color: step.winner ? '#16a34a' : color}}>
      {index + 1}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-gray-700">{step.label}</div>
      {step.text && <div className="text-[11px] text-gray-500 mt-0.5">{step.text}</div>}
      {step.mono && <div className={"font-mono text-[11px] mt-0.5 " + (step.winner ? "text-green-700 font-medium" : "text-gray-600")}>{step.mono}</div>}
    </div>
  </div>
);

const ModelCard = ({ model, expanded, onToggle, onSeeInPlayground }) => (
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-200 hover:border-gray-300">
    <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold flex-shrink-0" style={{ background: model.color+'22', color: model.color }}>
        {model.name.slice(0,2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{model.name}</span>
          <span className="text-[10px] font-mono text-gray-400">{model.full}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{model.summary}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Tip text={model.stage + " stage"}>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{background:model.color+'22',color:model.color}}>{model.stage}</span>
        </Tip>
        <span className={"text-[9px] font-mono px-1.5 py-0.5 rounded " + (model.searchUsage === 'USES' ? "bg-green-50 text-green-600" : model.searchUsage === 'PARTIAL' ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400")}>{model.searchUsage}</span>
        <span className="text-gray-400 text-sm">{expanded ? '\u25BE' : '\u25B8'}</span>
      </div>
    </button>
    {expanded && (
      <div className="px-4 pb-4 border-t border-gray-100 pt-3 fade-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">What it does</div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">{model.analogy}</p>
            <div className="font-mono text-[10px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-3">{model.mathOneLiner}</div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Step-by-step</div>
            <ol className="space-y-1.5">
              {model.how.map((step,i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700 leading-relaxed">
                  <span className="font-mono text-[10px] mt-0.5 flex-shrink-0" style={{color:model.color}}>{i+1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Live example <span className="text-gray-300 normal-case">(auction data)</span></div>
            <div className="space-y-2 mb-3">
              {model.liveExample.map((step, i) => (
                <LiveExampleStep key={i} step={step} index={i} color={model.color} />
              ))}
            </div>
            <div className="text-[11px] text-gray-500 italic bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <span className="font-medium text-gray-600 not-italic">Why this matters:</span> {model.whyMatters}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">How it uses search</div>
            <div className="flex items-center gap-2 mb-1">
              <span className={"text-[9px] font-mono px-1.5 py-0.5 rounded " + (model.searchUsage === 'USES' ? "bg-green-50 text-green-600" : model.searchUsage === 'PARTIAL' ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400")}>{model.searchUsage}</span>
            </div>
            <div className="text-xs text-gray-500">{model.searchExplanation}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Output behavior</div>
            <div className="text-xs text-gray-500">{model.outputBehavior}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[10px] font-mono text-green-600/70 uppercase tracking-wider mb-2">Strengths</div>
            {model.strengths.map((s,i) => <div key={i} className="text-xs text-gray-500 mb-1 flex gap-1.5"><span className="text-green-600/60">+</span>{s}</div>)}
          </div>
          <div>
            <div className="text-[10px] font-mono text-red-500/70 uppercase tracking-wider mb-2">Weaknesses</div>
            {model.weaknesses.map((w,i) => <div key={i} className="text-xs text-gray-500 mb-1 flex gap-1.5"><span className="text-red-500/60">{'\u2212'}</span>{w}</div>)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 mb-3">
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Works best when</div>
            <div className="text-xs text-gray-600">{model.whenToUse.bestWhen}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Watch out if</div>
            <div className="text-xs text-gray-600">{model.whenToUse.watchOut}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Combine with</div>
            <div className="text-xs text-gray-600 font-medium" style={{color: (MODELS.find(m=>m.name===model.whenToUse.combineWith)||{}).color || '#3b82f6'}}>{model.whenToUse.combineWith}</div>
          </div>
        </div>

        <button onClick={() => onSeeInPlayground({ models: [model.key], step: 3 })}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all">
          See it in Playground {'\u2192'}
        </button>
      </div>
    )}
  </div>
);

function AdvisorSection({ onConfigurePlayground, diag }) {
  const [chips, setChips] = useState([]);
  const [text, setText] = useState('');
  const [rec, setRec] = useState(null);

  const toggleChip = (c) => setChips(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const generate = () => {
    const r = generateAdvisorRec(chips, text, diag);
    setRec(r);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Model Recommendation Advisor</h3>
        <p className="text-sm text-gray-500">Describe your problem and we'll recommend which models to use.</p>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
        placeholder="Describe your recommendation problem..."
        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 resize-none" />
      <div className="flex flex-wrap gap-2">
        {PAIN_POINTS.map(p => (
          <button key={p} onClick={() => toggleChip(p)}
            className={"px-2.5 py-1 rounded-full text-xs font-medium border transition-all " + (chips.includes(p) ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
            {p}
          </button>
        ))}
      </div>
      <button onClick={generate} disabled={!chips.length && !text.trim()}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        Generate Recommendation
      </button>
      {rec && (
        <div className="fade-up bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Primary model</div>
              <div className="text-sm font-semibold" style={{color: (MODELS.find(m=>m.key===rec.primary)||{}).color}}>{(MODELS.find(m=>m.key===rec.primary)||{}).name}</div>
            </div>
            <div className="text-gray-300">+</div>
            <div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Supporting</div>
              <div className="flex gap-1">{rec.support.map(mk => <span key={mk} className="text-xs font-medium" style={{color:(MODELS.find(m=>m.key===mk)||{}).color}}>{(MODELS.find(m=>m.key===mk)||{}).name}</span>)}</div>
            </div>
            <div className="text-gray-300">via</div>
            <div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Fusion</div>
              <div className="text-xs font-medium text-blue-600">{(FUSIONS.find(f=>f.key===rec.fusionKey)||{}).name}</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">{rec.reasoning}</div>
          {rec.watchouts && <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">Watch out: {rec.watchouts}</div>}
          {rec.gaps && <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2">Data gap: {rec.gaps}</div>}
          <button onClick={() => onConfigurePlayground({ models: [rec.primary, ...rec.support], fusion: rec.fusionKey, step: 3 })}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Build this stack in Playground {'\u2192'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ LEARN TAB ═══════════════════════════ */
function LearnTab({ onConfigurePlayground, diag }) {
  const [expandedModel, setExpandedModel] = useState(null);
  const [expandedFusion, setExpandedFusion] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [overlay, setOverlay] = useState(null);

  const filteredModels = activeStage ? MODELS.filter(m => m.stage === activeStage) : MODELS;

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-up">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">The Ranking Pipeline</h2>
        <p className="text-sm text-gray-500 mb-3">Every recommendation system follows a multi-stage funnel. Click a stage to filter models below.</p>
        <PipelineDiagram activeStage={activeStage} setActiveStage={setActiveStage} overlay={overlay} />
        <div className="flex gap-2 mt-3">
          {[['search','Show search influence','teal'],['personal','Show personalization influence','purple'],['multiindex','Show multi-index retrieval','amber']].map(([key,label,clr]) => (
            <button key={key} onClick={() => setOverlay(overlay === key ? null : key)}
              className={"text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all " +
                (overlay === key ? "bg-"+clr+"-50 text-"+clr+"-600 border-"+clr+"-200" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300")}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Core Concepts</h2>
        <p className="text-sm text-gray-500 mb-4">Three fundamental building blocks of modern recommendation systems.</p>
        <EduConceptCards onConfigurePlayground={onConfigurePlayground} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">9 Models Explained</h2>
            <p className="text-sm text-gray-500">Click any model to see how it thinks, a live example, and when to use it.</p>
          </div>
          {activeStage && (
            <button onClick={() => setActiveStage(null)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Show all models {'\u00D7'}
            </button>
          )}
        </div>
        <div className="space-y-2">
          {filteredModels.map(m => (
            <ModelCard key={m.key} model={m} expanded={expandedModel===m.key}
              onToggle={()=>setExpandedModel(expandedModel===m.key?null:m.key)}
              onSeeInPlayground={onConfigurePlayground} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Combining Models</h2>
        <p className="text-sm text-gray-500 mb-4">In production, multiple models are fused together. Here are four common strategies.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FUSIONS.map(f => (
            <button key={f.key} onClick={()=>setExpandedFusion(expandedFusion===f.key?null:f.key)}
              className={"text-left rounded-lg border p-3 transition-all " + (expandedFusion===f.key ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300')}>
              <div className="flex items-center gap-2">
                <FusionMiniDiagram type={f.key} />
                <div>
                  <div className="text-sm font-semibold text-gray-800">{f.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                </div>
              </div>
              {expandedFusion===f.key && (
                <div className="mt-2 space-y-1">
                  {f.key==='rrf' && <div className="font-mono text-[11px] text-blue-600 bg-gray-100 rounded p-2">score = {'\u03A3'} 1 / (60 + rank_i)</div>}
                  {f.key==='weighted' && <div className="font-mono text-[11px] text-blue-600 bg-gray-100 rounded p-2">score = {'\u03A3'} w_i {'\u00D7'} norm_score_i</div>}
                  <div className="text-[11px] text-gray-500 italic">Choose this if: {f.chooseIf}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <AdvisorSection onConfigurePlayground={onConfigurePlayground} diag={diag} />
      </section>
    </div>
  );
}

/* ═══════════════════════════ PLAYGROUND TAB ═══════════════════════════ */
const STEP_LABELS = ["Who to recommend to", "Search & intent", "Choose models", "Results"];

const StepIndicator = ({ step, setStep, maxReached }) => (
  <div className="flex items-center gap-1 mb-6">
    {STEP_LABELS.map((label, i) => {
      const n = i + 1;
      const active = step === n;
      const done = n < step;
      const reachable = n <= maxReached;
      return (
        <React.Fragment key={n}>
          <button onClick={() => reachable && setStep(n)} disabled={!reachable}
            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
              (active ? "bg-blue-100 text-blue-600 ring-1 ring-blue-200" :
               done ? "bg-green-50 text-green-600 cursor-pointer hover:bg-green-100" :
               reachable ? "text-gray-500 hover:text-gray-700 cursor-pointer" : "text-gray-300 cursor-not-allowed")}>
            <span className={"w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold " +
              (active ? "bg-blue-600 text-white" :
               done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>
              {done ? '\u2713' : n}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
          {i < 3 && <span className={"text-xs " + (n < step ? "text-green-400" : "text-gray-300")}>{'\u2192'}</span>}
        </React.Fragment>
      );
    })}
  </div>
);

function PlaygroundTab({ initialConfig, onConfigConsumed }) {
  const [wizStep, setWizStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [dataMode, setDataMode] = useState('sample');
  const [csvItems, setCsvItems] = useState(null);
  const [csvUsers, setCsvUsers] = useState(null);
  const [csvEvents, setCsvEvents] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [activeUser, setActiveUser] = useState('U1');
  const [query, setQuery] = useState('');
  const [intentWeight, setIntentWeight] = useState(40);
  const [fusion, setFusion] = useState('rrf');
  const [weights, setWeights] = useState({});
  const [cascadeN, setCascadeN] = useState(8);
  const [hasRun, setHasRun] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [computeTime, setComputeTime] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

  const { items, users, events, diag } = useMemo(() => {
    if (dataMode==='csv' && csvItems) return processData(csvItems, csvUsers, csvEvents);
    return processData(SAMPLE_ITEMS, SAMPLE_USERS, []);
  }, [dataMode, csvItems, csvUsers, csvEvents]);

  const user = useMemo(() => users.find(u=>u.id===activeUser)||users[0], [users, activeUser]);

  useEffect(() => { if (users.length && !users.find(u=>u.id===activeUser)) setActiveUser(users[0].id); }, [users]);

  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.models) setSelectedModels(initialConfig.models);
      if (initialConfig.query !== undefined) setQuery(initialConfig.query);
      if (initialConfig.fusion) setFusion(initialConfig.fusion);
      var targetStep = initialConfig.step || 3;
      setWizStep(targetStep);
      setMaxStep(function(p) { return Math.max(p, targetStep); });
      onConfigConsumed();
    }
  }, [initialConfig]);

  const handleCSV = useCallback((file, type) => {
    if (!file) return; setCsvError('');
    const reader = new FileReader();
    reader.onload = (e) => { try { const p=parseCSV(e.target.result); if(!p.length){setCsvError(type+' CSV is empty');return;} if(type==='items')setCsvItems(p);else if(type==='users')setCsvUsers(p);else setCsvEvents(p); } catch(err){setCsvError(err.message);} };
    reader.readAsText(file);
  }, []);

  const results = useMemo(() => {
    if (!hasRun) return {};
    const t0 = performance.now();
    const r = {};
    selectedModels.forEach(mk => { try { r[mk] = runModel(mk, items, user, users, events, diag, query.trim(), intentWeight); } catch(e){console.error(mk,e);} });
    setComputeTime(Math.round(performance.now() - t0));
    return r;
  }, [hasRun, selectedModels, items, user, users, events, diag, query, intentWeight]);

  const fusedResults = useMemo(() => {
    if (!hasRun || selectedModels.length < 2) {
      if (hasRun && selectedModels.length === 1 && results[selectedModels[0]]) return results[selectedModels[0]].ranked;
      return null;
    }
    const entries = selectedModels.map(mk=>results[mk]).filter(Boolean);
    if (entries.length < 2) return null;
    const w = selectedModels.map(mk=>weights[mk]||1/selectedModels.length);
    return fuse(fusion, entries, w, cascadeN);
  }, [hasRun, selectedModels, results, fusion, weights, cascadeN]);

  const resultsNoQuery = useMemo(() => {
    if (!hasRun || !query) return null;
    const r = {};
    selectedModels.forEach(mk => { try { r[mk] = runModel(mk, items, user, users, events, diag, '', intentWeight); } catch(e){} });
    return r;
  }, [hasRun, query, selectedModels, items, user, users, events, diag, intentWeight]);

  const fusedNoQuery = useMemo(() => {
    if (!resultsNoQuery || selectedModels.length < 2) {
      if (resultsNoQuery && selectedModels.length === 1 && resultsNoQuery[selectedModels[0]]) return resultsNoQuery[selectedModels[0]].ranked;
      return null;
    }
    const entries = selectedModels.map(mk=>resultsNoQuery[mk]).filter(Boolean);
    if (entries.length < 2) return null;
    const w = selectedModels.map(mk=>weights[mk]||1/selectedModels.length);
    return fuse(fusion, entries, w, cascadeN);
  }, [resultsNoQuery, selectedModels, fusion, weights, cascadeN]);

  const previewSearch = useMemo(() => {
    if (!query) return null;
    try { return runModel('bm25', items, user, users, events, diag, query.trim(), 80).ranked.slice(0,3); }
    catch(e) { return null; }
  }, [query, items, user, users, events, diag]);

  const previewPersonal = useMemo(() => {
    try { return runModel('als', items, user, users, events, diag, '', 0).ranked.slice(0,3); }
    catch(e) { return null; }
  }, [items, user, users, events, diag]);

  const confidence = useMemo(() => computeConfidence(fusedResults, results, selectedModels), [fusedResults, results, selectedModels]);
  const { consensus: consensusIds, unique: uniqueMap } = useMemo(() => computeConsensusAndUnique(results, selectedModels), [results, selectedModels]);

  const toggleModel = useCallback(key => setSelectedModels(p => p.includes(key)?p.filter(k=>k!==key):[...p,key]), []);

  const goStep = (n) => { setWizStep(n); setMaxStep(p => Math.max(p, n)); };

  const doRun = () => {
    setHasRun(true);
    setSelectedItem(null);
    goStep(4);
  };

  const histItems = useMemo(() => user ? user.history.map(id => items.find(i => i.id === id)).filter(Boolean) : [], [user, items]);
  const userCategories = useMemo(() => [...new Set(histItems.map(i => i.category))], [histItems]);
  const userTagsAll = useMemo(() => [...new Set([...(user ? user.preferences : []), ...histItems.flatMap(i => i.tags)])], [user, histItems]);

  const rankMap = useMemo(() => {
    if (!hasRun) return {};
    const rm = {};
    selectedModels.forEach(mk => {
      (results[mk] && results[mk].ranked || []).forEach((it, idx) => {
        if (!rm[it.id]) rm[it.id] = {};
        rm[it.id][mk] = idx + 1;
      });
    });
    return rm;
  }, [hasRun, selectedModels, results]);

  const intentLabel = useMemo(() => {
    const il = INTENT_LABELS.find(l => intentWeight <= l.max) || INTENT_LABELS[INTENT_LABELS.length-1];
    return il.desc.replace('{user}', user ? user.name : 'the user');
  }, [intentWeight, user]);

  return (
    <div className="max-w-5xl mx-auto fade-up">
      {showBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 flex items-center justify-between">
          <div className="text-sm text-blue-700">New here? Follow the 4 steps below. You don't need to know anything about ML to use this.</div>
          <button onClick={()=>setShowBanner(false)} className="text-blue-400 hover:text-blue-600 ml-3 text-lg leading-none">{'\u00D7'}</button>
        </div>
      )}

      <StepIndicator step={wizStep} setStep={goStep} maxReached={maxStep} />

      {/* ═══ STEP 1: User Selection ═══ */}
      {wizStep === 1 && (
        <div className="fade-up space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Who are you recommending to?</h2>
              <p className="text-sm text-gray-500 mt-0.5">Pick a user to personalize recommendations for them.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setDataMode('sample')} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " + (dataMode==='sample'?'bg-blue-50 text-blue-600 ring-1 ring-blue-200':'bg-gray-100 text-gray-500 hover:text-gray-700')}>
                Sample Data
              </button>
              <button onClick={()=>setDataMode('csv')} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " + (dataMode==='csv'?'bg-blue-50 text-blue-600 ring-1 ring-blue-200':'bg-gray-100 text-gray-500 hover:text-gray-700')}>
                Upload CSV
              </button>
            </div>
          </div>

          {dataMode === 'csv' && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[['items','Items CSV *'],['users','Users (optional)'],['events','Events (optional)']].map(([type,label])=>(
                  <div key={type}>
                    <label className="text-[11px] font-mono text-gray-400 block mb-1">{label}</label>
                    <input type="file" accept=".csv" onChange={e=>handleCSV(e.target.files[0],type)} className="text-xs text-gray-500 w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-gray-200 file:text-gray-800 file:cursor-pointer" />
                  </div>
                ))}
              </div>
              {csvError && <div className="text-xs text-red-500 bg-red-50 rounded-lg p-2 font-mono">{csvError}</div>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map(u => {
              const active = activeUser === u.id;
              const hItems = u.history.map(id => items.find(i => i.id === id)).filter(Boolean);
              const tagFreq = {};
              hItems.forEach(it => it.tags.forEach(t => { tagFreq[t] = (tagFreq[t]||0)+1; }));
              const topTags = Object.entries(tagFreq).sort((a,b)=>b[1]-a[1]).slice(0,4);
              return (
                <button key={u.id} onClick={() => setActiveUser(u.id)}
                  className={"rounded-xl border p-4 text-left transition-all " + (active ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={"w-11 h-11 rounded-full flex items-center justify-center text-base font-bold " + (active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600")}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                      <div className="flex gap-1 mt-0.5">
                        {u.preferences.map(p => <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{p}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {hItems.map(it => (
                      <Tip key={it.id} text={it.title}>
                        <span className="text-base" title={it.title}>{it.image}</span>
                      </Tip>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Signals: {topTags.map(([t,c]) => t+' ('+c+')').join(', ')}
                  </div>
                </button>
              );
            })}
          </div>

          {user && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{user.name}</span> has interacted with {histItems.length} items in: <span className="font-medium">{userCategories.join(', ')}</span>.
              Taste signals: <span className="font-mono text-xs text-blue-600">{userTagsAll.slice(0,5).join(', ')}</span>.
            </div>
          )}

          <button onClick={() => goStep(2)}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.99]">
            Pick this user {'\u2192'}
          </button>
        </div>
      )}

      {/* ═══ STEP 2: Search & Intent ═══ */}
      {wizStep === 2 && (
        <div className="fade-up space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">What are you looking for right now?</h2>
            <p className="text-sm text-gray-500 mt-0.5">This tells the models your current intent — separate from your history.</p>
          </div>

          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="e.g. vintage watch, rare art, gift under $5000"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200" />

          <div className="flex flex-wrap gap-2">
            {QUERY_CHIPS.map(chip => (
              <button key={chip} onClick={() => setQuery(chip)}
                className={"px-3 py-1.5 rounded-full text-xs font-medium transition-all border " + (query === chip ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                {chip}
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">How much should your search override your personal taste?</span>
            </div>
            <input type="range" min="0" max="100" value={intentWeight} onChange={e => setIntentWeight(parseInt(e.target.value))} className="w-full" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400">Pure personalization</span>
              <span className="text-[10px] text-gray-400">Pure search match</span>
            </div>
            <div className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 font-medium">{intentLabel}</div>
          </div>

          <details className="rounded-xl border border-gray-200 bg-white">
            <summary className="p-3 cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors">
              How each model uses your search
            </summary>
            <div className="px-3 pb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 text-gray-400 font-mono font-normal">Model</th>
                    <th className="text-center py-1.5 text-gray-400 font-mono font-normal">Status</th>
                    <th className="text-left py-1.5 text-gray-400 font-mono font-normal">How</th>
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map(m => (
                    <tr key={m.key} className="border-b border-gray-50">
                      <td className="py-1.5 font-medium" style={{color:m.color}}>{m.name}</td>
                      <td className="py-1.5 text-center">
                        <span className={"text-[9px] font-mono px-1.5 py-0.5 rounded " + (m.searchUsage === 'USES' ? "bg-green-50 text-green-600" : m.searchUsage === 'PARTIAL' ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400")}>{m.searchUsage}</span>
                      </td>
                      <td className="py-1.5 text-gray-500">{m.searchExplanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {query && previewSearch && previewPersonal && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Live Query Preview</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-medium text-purple-600 mb-2">Without query (ALS personalization)</div>
                  {previewPersonal.map((it, i) => (
                    <div key={it.id} className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-400">#{i+1}</span>
                      <span className="text-sm">{it.image}</span>
                      <span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[11px] font-medium text-teal-600 mb-2">With query (BM25 search)</div>
                  {previewSearch.map((it, i) => (
                    <div key={it.id} className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-400">#{i+1}</span>
                      <span className="text-sm">{it.image}</span>
                      <span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
            Your search query reflects your current session intent. Your user profile ({user ? user.name : 'User'}) reflects long-term taste from past interactions. The intent slider controls how much each matters.
          </div>

          <div className="flex gap-3">
            <button onClick={() => goStep(1)} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">{'\u2190'} Back</button>
            <button onClick={() => goStep(3)} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.99]">
              Set context {'\u2192'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Model Selection ═══ */}
      {wizStep === 3 && (
        <div className="fade-up space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Choose your models</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select 1 or more models. With 2+, you can fuse their outputs together.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {MODELS.map(m => {
              const active = selectedModels.includes(m.key);
              const mode = diag.modes[m.key];
              return (
                <button key={m.key} onClick={() => toggleModel(m.key)}
                  className={"rounded-xl border p-3 text-left transition-all " + (active ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: active ? m.color : '#d1d5db'}} />
                    <span className="text-xs font-semibold text-gray-800">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{m.typeBadge}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{background:m.color+'22',color:m.color}}>{m.stage}</span>
                    <span className="flex gap-0.5">
                      {[1,2,3].map(d => <span key={d} className={"w-1.5 h-1.5 rounded-full " + (d <= m.complexity ? "bg-gray-600" : "bg-gray-200")} />)}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight mb-1.5">{m.summary.split('.')[0]}.</div>
                  <div className="flex items-center gap-1.5">
                    <span className={"text-[9px] font-mono px-1.5 py-0.5 rounded-full " + (m.bestFor === 'Trending' ? "bg-pink-50 text-pink-600" : m.bestFor === 'Cold start' ? "bg-amber-50 text-amber-600" : m.bestFor === 'Hybrid' ? "bg-cyan-50 text-cyan-600" : m.bestFor === 'Exact search' ? "bg-teal-50 text-teal-600" : m.bestFor === 'Retrieval' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600")}>{m.bestFor}</span>
                    {mode && mode !== 'full' && <span className="text-[9px] font-mono text-amber-600">{mode}</span>}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1 italic">{m.tradeoff}</div>
                </button>
              );
            })}
          </div>

          {selectedModels.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">{'\uD83D\uDD0D'}</div>
              <div className="text-sm text-gray-500">Select at least one model above to see recommendations.</div>
              <div className="text-xs text-gray-400 mt-1">Not sure? Try <button onClick={() => toggleModel('als')} className="text-blue-600 underline">ALS</button> — it's the most common starting point.</div>
            </div>
          )}

          {selectedModels.length >= 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Fusion Strategy</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FUSIONS.map(f => (
                    <button key={f.key} onClick={() => setFusion(f.key)}
                      className={"rounded-lg border p-2.5 text-left transition-all " + (fusion===f.key ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300")}>
                      <div className="flex items-center gap-2">
                        <FusionMiniDiagram type={f.key} />
                        <div>
                          <div className="text-[11px] font-semibold text-gray-700">{f.name}</div>
                          <div className="text-[9px] text-gray-400 leading-tight">{f.chooseIf}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {fusion === 'weighted' && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
                    <div className="text-[11px] text-gray-500 mb-1">Adjust weights</div>
                    {selectedModels.map(mk => {
                      const md = MODELS.find(m=>m.key===mk);
                      const val = Math.round((weights[mk]||1/selectedModels.length)*100);
                      return (
                        <div key={mk} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono w-20 truncate" style={{color:md && md.color}}>{md && md.name}</span>
                          <input type="range" min="0" max="100" value={val} onChange={e=>setWeights(p=>({...p,[mk]:parseInt(e.target.value)/100}))} className="flex-1" />
                          <span className="text-[10px] font-mono text-gray-500 w-8 text-right">{val}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {fusion === 'cascade' && (
                  <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-200">
                    <span className="text-[11px] text-gray-500">Top-N candidates from first model:</span>
                    <input type="range" min="3" max="15" value={cascadeN} onChange={e=>setCascadeN(parseInt(e.target.value))} className="flex-1" />
                    <span className="text-xs font-mono text-blue-600">{cascadeN}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => goStep(2)} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">{'\u2190'} Back</button>
            <button onClick={doRun} disabled={!selectedModels.length}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.99]">
              Run {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''} {'\u2192'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 4: Results Dashboard ═══ */}
      {wizStep === 4 && hasRun && (
        <div className="fade-up space-y-5">
          {/* Summary bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono bg-gray-50 rounded-xl p-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white">{user.name.charAt(0)}</div>
            <span className="text-gray-700">{user.name}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{(fusedResults||[]).length} items</span>
            <span className="text-gray-300">|</span>
            <span className="flex gap-1">{selectedModels.map(mk => { const md = MODELS.find(m=>m.key===mk); return <Tip key={mk} text={md && md.full}><span className="px-1.5 py-0.5 rounded text-[9px]" style={{background:(md&&md.color||'#999')+'22',color:md&&md.color}}>{md&&md.name}</span></Tip>;})}</span>
            {selectedModels.length >= 2 && <React.Fragment><span className="text-gray-300">|</span><span className="text-blue-600">{(FUSIONS.find(f=>f.key===fusion)||{}).name}</span></React.Fragment>}
            {query && <React.Fragment><span className="text-gray-300">|</span><span className="text-amber-600">"{query}"</span></React.Fragment>}
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">{computeTime}ms</span>
            {selectedModels.length >= 2 && (
              <React.Fragment>
                <span className="text-gray-300">|</span>
                <span className={"font-medium " + (confidence > 70 ? "text-green-600" : confidence > 40 ? "text-amber-600" : "text-red-500")}>{confidence}% confidence</span>
              </React.Fragment>
            )}
          </div>

          {/* Confidence meter */}
          {selectedModels.length >= 2 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Recommendation Confidence</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: confidence + '%',
                    background: confidence > 90 ? '#16a34a' : confidence > 70 ? '#3b82f6' : confidence > 40 ? '#f59e0b' : '#ef4444'
                  }} />
                </div>
                <span className="text-sm font-mono font-medium" style={{color: confidence > 90 ? '#16a34a' : confidence > 70 ? '#3b82f6' : confidence > 40 ? '#f59e0b' : '#ef4444'}}>{confidence}%</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1.5">
                {confidence > 90 ? "Very high \u2014 all models strongly agree on top results" :
                 confidence > 70 ? "High \u2014 strong signal from multiple models" :
                 confidence > 40 ? "Moderate \u2014 some agreement across models" :
                 "Low \u2014 models disagree, results may be noisy"}
              </div>
            </div>
          )}

          {/* Consensus vs Unique */}
          {selectedModels.length >= 2 && (consensusIds.length > 0 || Object.keys(uniqueMap).length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Consensus Picks</div>
                <p className="text-[11px] text-gray-500 mb-2">Items in top 5 of every active model</p>
                {consensusIds.length > 0 ? consensusIds.map(id => {
                  const it = items.find(i => i.id === id);
                  return it ? (
                    <div key={id} className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{it.image}</span>
                      <span className="text-xs text-gray-700">{it.title.split(' ').slice(0,4).join(' ')}</span>
                      <span className="text-[9px] text-yellow-600">{'\u2B50'}</span>
                    </div>
                  ) : null;
                }) : <div className="text-[11px] text-gray-400 italic">No items appear in every model's top 5</div>}
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Unique Discoveries</div>
                <p className="text-[11px] text-gray-500 mb-2">Items found by exactly one model</p>
                {Object.keys(uniqueMap).length > 0 ? Object.entries(uniqueMap).map(([mk, ids]) => {
                  const md = MODELS.find(m => m.key === mk);
                  return ids.map(id => {
                    const it = items.find(i => i.id === id);
                    return it ? (
                      <div key={id} className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">{it.image}</span>
                        <span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span>
                        <span className="text-[9px] font-mono px-1 rounded" style={{background:(md&&md.color||'#999')+'22',color:md&&md.color}}>only {md&&md.name}</span>
                      </div>
                    ) : null;
                  });
                }) : <div className="text-[11px] text-gray-400 italic">No unique discoveries</div>}
              </div>
            </div>
          )}

          {/* Contribution map */}
          {selectedModels.length >= 2 && fusedResults && fusedResults.length > 0 && (
            <details className="rounded-xl border border-gray-200 bg-white">
              <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                Model Contribution Map
              </summary>
              <div className="px-4 pb-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-400 font-mono font-normal">Item</th>
                      {selectedModels.map(mk => { const md = MODELS.find(m=>m.key===mk); return <th key={mk} className="text-center py-2 font-mono font-normal" style={{color:md&&md.color}}>{md&&md.name}</th>; })}
                      <th className="text-center py-2 text-gray-400 font-mono font-normal">Consensus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fusedResults.slice(0, 8).map(it => {
                      const count = selectedModels.filter(mk => results[mk] && results[mk].ranked.slice(0,5).some(function(r) { return r.id === it.id; })).length;
                      return (
                        <tr key={it.id} className="border-b border-gray-50">
                          <td className="py-1.5 text-gray-700">{it.image} {it.title.split(' ').slice(0,3).join(' ')}</td>
                          {selectedModels.map(mk => {
                            const inTop5 = results[mk] && results[mk].ranked.slice(0,5).some(function(r) { return r.id === it.id; });
                            const md = MODELS.find(m=>m.key===mk);
                            return <td key={mk} className="text-center py-1.5">{inTop5 ? <span className="inline-block w-3 h-3 rounded-full" style={{background:md&&md.color}} /> : <span className="text-gray-200">{'\u2014'}</span>}</td>;
                          })}
                          <td className="text-center py-1.5 font-mono">
                            {count === selectedModels.length ? '\u2B50' : count + '/' + selectedModels.length}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Search impact */}
          {query && hasRun && fusedResults && fusedNoQuery && (
            <details className="rounded-xl border border-gray-200 bg-white">
              <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                Your Search Impact
              </summary>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-[11px] font-medium text-gray-500 mb-2">Without your query</div>
                    {(fusedNoQuery||[]).slice(0,3).map((it,i) => (
                      <div key={it.id} className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-gray-400">#{i+1}</span>
                        <span className="text-sm">{it.image}</span>
                        <span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-teal-600 mb-2">With "{query}"</div>
                    {fusedResults.slice(0,3).map((it,i) => (
                      <div key={it.id} className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-gray-400">#{i+1}</span>
                        <span className="text-sm">{it.image}</span>
                        <span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {(function() {
                    var noQIds = (fusedNoQuery||[]).slice(0,5).map(function(x){return x.id;});
                    var qIds = fusedResults.slice(0,5).map(function(x){return x.id;});
                    var moved = qIds.filter(function(id){return noQIds.indexOf(id)===-1;}).length;
                    return moved + ' of top 5 items changed due to your search query.';
                  })()}
                </div>
              </div>
            </details>
          )}

          {/* Results layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* LEFT: Ranked results */}
            <div className="lg:col-span-3 space-y-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                {selectedModels.length >= 2 ? "Fused Results \u2014 " + ((FUSIONS.find(f=>f.key===fusion)||{}).name || '') : ((MODELS.find(m=>m.key===selectedModels[0])||{}).name || '') + " Results"}
              </h3>
              {(fusedResults || []).map((it, i) => {
                const reasons = generateReasons(it, user, items, results, selectedModels, fusedResults, query);
                const modelRanks = rankMap[it.id] || {};
                const maxScore = Math.max(...(fusedResults||[]).map(x => x.score), 0.001);
                const pct = Math.round((it.score / maxScore) * 100);
                const isSelected = selectedItem && selectedItem.id === it.id;
                return (
                  <div key={it.id} onClick={() => setSelectedItem(it)}
                    className={"rounded-xl border p-3 cursor-pointer transition-all " + (isSelected ? "border-blue-300 bg-blue-50/30 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg font-mono text-gray-300 w-7 text-right mt-0.5">#{i+1}</span>
                      <span className="text-2xl">{it.image}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{it.title}</div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5 font-mono">
                          <span>{it.category}</span>
                          <span className="text-gray-800">${it.price ? it.price.toLocaleString() : '0'}</span>
                          <span>{it.bids} bids</span>
                          <span>{it.views ? it.views.toLocaleString() : '0'} views</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full grow-bar bg-blue-500" style={{width: pct+'%', animationDelay: i*0.05+'s'}} />
                          </div>
                          <Tip text={"Score: " + (it.score ? it.score.toFixed(4) : '0')}>
                            <span className="text-[10px] font-mono text-green-600 w-8 text-right">{pct}%</span>
                          </Tip>
                        </div>
                        {reasons.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {reasons.map((r, ri) => <div key={ri} className="text-[11px] text-gray-500 flex items-center gap-1"><span className="text-green-500">{'\u2713'}</span> {r}</div>)}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {selectedModels.map(mk => {
                            const md = MODELS.find(m=>m.key===mk);
                            const mRank = modelRanks[mk];
                            if (!mRank) return null;
                            const delta = mRank - (i + 1);
                            return (
                              <Tip key={mk} text={(md&&md.name) + ": rank #" + mRank + (selectedModels.length >= 2 ? " \u2192 merged #" + (i+1) : '')}>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{background:(md&&md.color||'#999')+'15',color:md&&md.color}}>
                                  {md&&md.name} #{mRank}
                                  {selectedModels.length >= 2 && delta !== 0 && (
                                    <span className={delta > 0 ? "text-green-600" : "text-red-500"}>{delta > 0 ? '\u2191'+delta : '\u2193'+Math.abs(delta)}</span>
                                  )}
                                </span>
                              </Tip>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Detail panel */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4 sticky top-20 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{selectedItem.image}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{selectedItem.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-gray-500">{selectedItem.category}</span>
                        <span className="font-mono text-purple-600">${selectedItem.price ? selectedItem.price.toLocaleString() : '0'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
                        <span>{selectedItem.bids} bids</span>
                        <span>{selectedItem.views ? selectedItem.views.toLocaleString() : '0'} views</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(selectedItem.tags||[]).map(t => <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Score breakdown</div>
                    {selectedModels.map(mk => {
                      const md = MODELS.find(m => m.key === mk);
                      const r = results[mk];
                      const found = r && r.ranked.find(x => x.id === selectedItem.id);
                      const maxS = r ? Math.max(...r.ranked.map(x => x.score), 0.001) : 1;
                      const barPct = found ? Math.round((found.score / maxS) * 100) : 0;
                      return (
                        <div key={mk} className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono w-16 truncate" style={{color: md && md.color}}>{md && md.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full" style={{width: barPct+'%', background: md && md.color}} />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 w-10 text-right">{found ? found.score.toFixed(3) : '\u2014'}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Why each model liked it</div>
                    {selectedModels.map(mk => {
                      const md = MODELS.find(m => m.key === mk);
                      const reason = whyModelLiked(mk, selectedItem, user, items);
                      return (
                        <div key={mk} className="text-[11px] text-gray-500 mb-1 flex items-start gap-1.5">
                          <span className="font-mono font-medium flex-shrink-0" style={{color: md && md.color}}>{md && md.name}:</span>
                          <span>{reason}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Similar items</div>
                    <div className="space-y-1.5">
                      {findSimilarItems(selectedItem, items, 3).map(sim => (
                        <div key={sim.id} onClick={() => setSelectedItem(sim)} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                          <span className="text-base">{sim.image}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-700 truncate">{sim.title}</div>
                            <div className="text-[10px] text-gray-400">{sim.category} {'\u00B7'} ${sim.price ? sim.price.toLocaleString() : '0'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center sticky top-20">
                  <div className="text-2xl mb-2">{'\uD83D\uDC46'}</div>
                  <div className="text-sm text-gray-400">Click a result to see detailed analysis</div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison table */}
          {selectedModels.length >= 2 && fusedResults && (
            <details className="rounded-xl border border-gray-200 bg-white">
              <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                What did combining models do?
              </summary>
              <div className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-400 font-mono font-normal">Item</th>
                        {selectedModels.map(mk => <th key={mk} className="text-center py-2 font-mono font-normal" style={{color: (MODELS.find(m=>m.key===mk)||{}).color}}>{(MODELS.find(m=>m.key===mk)||{}).name} rank</th>)}
                        <th className="text-center py-2 text-blue-600 font-mono font-normal">Merged</th>
                        <th className="text-center py-2 text-gray-400 font-mono font-normal">Movement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fusedResults.slice(0, 10).map((it, fi) => {
                        const mr = rankMap[it.id] || {};
                        const avgOrig = selectedModels.reduce((s, mk) => s + (mr[mk] || 11), 0) / selectedModels.length;
                        const delta = Math.round(avgOrig - (fi + 1));
                        return (
                          <tr key={it.id} className="border-b border-gray-50">
                            <td className="py-1.5 text-gray-700">{it.image} {it.title.split(' ').slice(0,3).join(' ')}</td>
                            {selectedModels.map(mk => <td key={mk} className="text-center py-1.5 font-mono text-gray-500">{mr[mk] ? '#'+mr[mk] : '\u2014'}</td>)}
                            <td className="text-center py-1.5 font-mono font-medium text-blue-600">#{fi+1}</td>
                            <td className="text-center py-1.5 font-mono">
                              {delta > 0 ? <span className="text-green-600">{'\u2191'}{delta}</span> : delta < 0 ? <span className="text-red-500">{'\u2193'}{Math.abs(delta)}</span> : <span className="text-gray-300">{'\u2014'}</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          )}

          {/* Per-model visualizations */}
          <details className="rounded-xl border border-gray-200 bg-white">
            <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              Model Internals & Visualizations
            </summary>
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedModels.map(mk => {
                const r = results[mk]; const md = MODELS.find(m=>m.key===mk);
                if (!r) return null;
                return (
                  <div key={mk} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{background:md&&md.color}} />
                      <span className="text-xs font-semibold text-gray-700">{md&&md.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{md&&md.full}</span>
                    </div>
                    {r.viz && <ModelViz modelKey={mk} viz={r.viz} color={md&&md.color} items={items} />}
                  </div>
                );
              })}
            </div>
          </details>

          {/* Diagnostics */}
          <details className="rounded-xl border border-gray-200 bg-white">
            <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Data Diagnostics</summary>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex gap-4 text-xs font-mono">
                <span><span className="text-blue-600">{items.length}</span> items</span>
                <span><span className="text-purple-600">{users.length}</span> users</span>
                <span><span className="text-green-600">{events.length}</span> events</span>
              </div>
              {Object.keys(diag.items.log||{}).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-[11px] font-mono space-y-0.5">
                  <div className="text-gray-700 font-medium mb-1">Item Schema</div>
                  {Object.entries(diag.items.log).map(([f,info])=>(
                    <div key={f} className="flex justify-between text-gray-500"><span>{f}</span><span className={info.ok?'text-green-600':'text-red-500'}>{info.ok?'\u2190 '+info.source:'missing'}</span></div>
                  ))}
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3 text-[11px] font-mono space-y-0.5">
                <div className="text-gray-700 font-medium mb-1">Model Modes</div>
                {Object.entries(diag.modes).map(([mk,mode])=>(
                  <div key={mk} className="flex justify-between text-gray-500"><span>{(MODELS.find(m=>m.key===mk)||{}).name}</span><span className={mode==='full'?'text-green-600':mode==='partial'?'text-amber-600':'text-red-500'}>{mode}</span></div>
                ))}
              </div>
              {diag.fallbacks.length > 0 && (
                <div className="text-[11px] text-amber-600 font-mono">
                  {diag.fallbacks.map(function(f){return f==='tags_from_text'?'\u00B7 Tags derived from text':f==='synthetic_users'?'\u00B7 Users auto-generated':'\u00B7 Histories from events';}).join('  ')}
                </div>
              )}
            </div>
          </details>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => goStep(1)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">Change user</button>
            <button onClick={() => goStep(2)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">Change search</button>
            {selectedModels.length >= 2 && <button onClick={() => goStep(3)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">Change fusion</button>}
            <button onClick={() => goStep(3)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">Add a model</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */
function ShapedModelExplorer() {
  const [tab, setTab] = useState('learn');
  const [pgConfig, setPgConfig] = useState(null);

  const configurePlayground = useCallback(function(config) {
    setPgConfig(config);
    setTab('playground');
  }, []);

  const diagForLearn = useMemo(function() {
    return processData(SAMPLE_ITEMS, SAMPLE_USERS, []).diag;
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-body">
      <StyleTag />

      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width={24} height={24} viewBox="0 0 24 24"><polygon points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5" fill="none" stroke="#3b82f6" strokeWidth="1.5"/><polygon points="12,5 18,8.5 18,15.5 12,19 6,15.5 6,8.5" fill="none" stroke="#3b82f6" strokeWidth="1" opacity=".4"/><circle cx="12" cy="12" r="2" fill="#3b82f6"/></svg>
            <span className="font-semibold text-sm tracking-tight text-gray-900">Shaped Model Explorer</span>
          </div>
          <nav className="flex gap-1">
            {[['learn','Learn'],['playground','Playground']].map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)}
                className={"px-4 py-1.5 rounded-lg text-sm font-medium transition-all " + (tab===key ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-700')}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="px-4 py-6">
        {tab === 'learn' && <LearnTab onConfigurePlayground={configurePlayground} diag={diagForLearn} />}
        {tab === 'playground' && <PlaygroundTab initialConfig={pgConfig} onConfigConsumed={function(){setPgConfig(null);}} />}
      </main>
    </div>
  );
}

window.ShapedModelExplorer = ShapedModelExplorer;
