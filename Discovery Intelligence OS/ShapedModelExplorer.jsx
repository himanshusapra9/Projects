const { useState, useMemo, useCallback, useEffect } = React;

const StyleTag = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }
    .font-body { font-family: 'Inter', system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes growBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes pulseDot { 0%,100% { r: 4; opacity:.6; } 50% { r: 6; opacity:1; } }
    @keyframes travelBroken { 0% { offset-distance: 0%; opacity:1; } 100% { offset-distance: 100%; opacity:1; } }
    @keyframes travelFixed { 0% { offset-distance: 0%; opacity:1; } 100% { offset-distance: 100%; opacity:1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes circleGrow { from { stroke-dashoffset: 251; } }
    .fade-up { animation: fadeUp 0.4s ease-out both; }
    .grow-bar { animation: growBar 0.5s ease-out both; transform-origin: left; }
    .anim-fade-in { animation: fadeInUp 0.6s ease-out both; }
    .anim-slide-in { animation: slideIn 0.3s ease-out both; }
    input[type=range] { -webkit-appearance: none; background: #e2e8f0; height: 4px; border-radius: 2px; outline: none; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
    .tip-wrap { position: relative; display: inline-flex; }
    .tip-wrap:hover .tip-pop { display: block; }
    .tip-pop { display: none; position: absolute; z-index: 60; background: #1e293b; color: #f1f5f9; font-size: 10px; line-height: 1.4; padding: 5px 9px; border-radius: 6px; white-space: nowrap; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); pointer-events: none; font-family: 'Inter', sans-serif; font-weight: 400; }
    .tip-pop::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:4px solid transparent; border-top-color:#1e293b; }
    .step-transition { transition: opacity 0.35s ease, transform 0.35s ease; }
    html { scroll-behavior: smooth; }
    .health-ring { transition: stroke-dashoffset 1s ease-out; }
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
    how: ["Tokenize your search query into individual terms","For each term, count how many listings contain it (document frequency)","Score each listing: TF (term count in listing) × IDF (rarity across catalog)","Sum scores across all query terms for the final relevance score"],
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
    how: ["Build a user-item interaction matrix from browsing/purchase history","Factorize into two low-rank matrices: user factors and item factors","For each user, compute dot-product with every item vector","Rank unseen items by predicted affinity score"],
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
    how: ["Compute pairwise cosine similarity between all item feature vectors","For a given user, look up their history items","Score each candidate by summing similarity to all history items","Filter already-seen items and rank by total similarity"],
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
    how: ["User tower: aggregate features from history + preferences into an embedding","Item tower: encode item features (category, tags, price) into an embedding","Compute cosine similarity between user embedding and each item embedding","Return top-K most similar items as candidates"],
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
    how: ["Treat each user's history as a 'sentence' of item IDs","Train skip-gram style: predict context items from target item","Result: items that co-occur across users land near each other in vector space","Score candidates by distance to the user's most recent item"],
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
    how: ["Take the ordered sequence of user interactions","Apply self-attention with causal masking (each position attends to past only)","Weight recent items more heavily via positional + recency decay","Score candidates by similarity to the attended sequence representation"],
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
    how: ["Engineer features: price, bids, views, category match, tag overlap, query match","Normalize numeric features to comparable ranges","Combine via weighted feature importance (learned from gradient boosting)","Output a single relevance score per item"],
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
    how: ["Normalize engagement signals (bids, views, clicks) across the catalog","Compute a momentum score from weighted engagement features","Apply recency bias to favor recently-listed items","Rank by momentum — hot items surface to the top"],
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
    how: ["Wide branch: categorical crosses — does user's category preference match this item?","Deep branch: feed normalized numeric features through a multi-layer perceptron","Combine both branches: final score = 0.5 × wide + 0.5 × deep","The wide path memorizes specific patterns; the deep path generalizes"],
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

const TOOL_MODELS = MODELS.filter(m => m.key !== 'bm25');

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

const QUERY_CHIPS = ["vintage items", "rare collectibles", "high-value lots", "recently trending", "gift under $5000", "space memorabilia"];
const PAIN_POINTS = ["cold start", "weak personalization", "poor search relevance", "low diversity", "popularity bias", "sparse metadata", "strong text signals", "session intent", "explainability", "trending discovery"];

const TOOL_STEP_LABELS = ["Catalog", "Query", "Models", "Results", "Merch"];
const SOLUTION_PIPELINE = [
  { label: "CATALOG HEALTH", desc: "Ingest any feed. Normalize titles, extract missing attributes, group variants, score data quality. Know exactly what's broken before you even run a search." },
  { label: "QUERY UNDERSTANDING", desc: "Parse shopper intent into components: product type, attributes, constraints, price signals, use case. Know what the query MEANS, not just what it says." },
  { label: "MODEL ENSEMBLE", desc: "Run one or multiple recommendation models simultaneously. ALS, EASE, Two-Tower, SASRec, Item2Vec, LightGBM, Wide & Deep, Rising Popularity. Combine their outputs using fusion strategies." },
  { label: "EXPLAINABLE RESULTS", desc: "Every ranked result shows exactly why it's there. Which models agreed. What features drove the score. What a merchandising rule changed. No black boxes." },
  { label: "MERCH CONTROLS", desc: "Boost, bury, pin, and campaign-override — with live previews of how your rules interact with model scores. No engineering ticket required." },
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

const ITEM_ALIASES = { id: ['id','item_id','listing_id'], title: ['title','item_name','name','auction_title'], category: ['category','department','group','vertical'], price: ['price','current_price','start_price','amount'], bids: ['bids','bid_count','num_bids'], views: ['views','view_count','page_views','impressions','watch_count'], tags: ['tags','keywords','labels'], image: ['image','emoji','thumbnail','icon'], description: ['description','desc','details'] };
const USER_ALIASES = { id: ['id','user_id','buyer_id'], name: ['name','user_name','buyer_name'], history: ['history','item_history','clicked_items','watched_items','bought_items'], preferences: ['preferences','interests','tags','affinities'] };
const EVENT_ALIASES = { userId: ['user_id','buyer_id'], itemId: ['item_id','listing_id'], eventType: ['event','event_type','action'], timestamp: ['timestamp','time','created_at','date'], query: ['query','search_term','keyword'] };

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

/* ═══════════════════════════ SESSION & PRNG UTILITIES ═══════════════════════════ */
function blendWithSession(baseScore, itemId, sessionSignals) {
  var sig = sessionSignals && sessionSignals[itemId];
  if (!sig || sig.views === 0) return baseScore;
  const recencyBoost = Math.min(sig.views * 0.05, 0.15);
  return baseScore * 0.85 + baseScore * recencyBoost + recencyBoost;
}

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ═══════════════════════════ MODEL SCORING ═══════════════════════════ */
function runModel(key, items, user, users, events, diag, query, intentWeight, sessionSignals) {
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
    const K1_TITLE = 1.2, B_TITLE = 0.75;
    const K1_TAGS = 0.8,  B_TAGS = 0.5;
    const K1_CAT = 0.6,   B_CAT = 0.3;
    const corpus = items;
    const N = corpus.length;
    const dfTitle = {}, dfTags = {}, dfCat = {};
    const avgTitleLen = N > 0 ? corpus.reduce(function(s,i){return s + (i.title||'').split(' ').length;}, 0) / N : 1;
    const avgTagsLen  = N > 0 ? corpus.reduce(function(s,i){return s + (i.tags||[]).length;}, 0) / N : 1;
    const avgCatLen   = 1;
    corpus.forEach(function(item) {
      var titleTerms = new Set((item.title||'').toLowerCase().split(/\W+/).filter(Boolean));
      var tagTerms   = new Set((item.tags||[]).map(function(t){return t.toLowerCase();}));
      var catTerms   = new Set([(item.category||'').toLowerCase()]);
      titleTerms.forEach(function(t){ dfTitle[t] = (dfTitle[t]||0) + 1; });
      tagTerms.forEach(function(t){  dfTags[t]  = (dfTags[t]||0)  + 1; });
      catTerms.forEach(function(t){  dfCat[t]   = (dfCat[t]||0)   + 1; });
    });
    var bm25idf = function(df, n) { return Math.log((n - df + 0.5) / (df + 0.5) + 1); };
    function bm25Field(terms, freq, df, avgLen, fieldLen, k1, b) {
      return terms.reduce(function(s, term) {
        var f = freq[term] || 0;
        if (f === 0) return s;
        var idfScore = bm25idf(df[term] || 0, N);
        var tf = (f * (k1 + 1)) / (f + k1 * (1 - b + b * (fieldLen / avgLen)));
        return s + idfScore * tf;
      }, 0);
    }
    var queryTerms = (query||'').toLowerCase().split(/\W+/).filter(Boolean);
    if (queryTerms.length === 0) {
      scored = items.map(function(it, i) { return Object.assign({}, it, { score: 0.001 * (1 - i/items.length), modelScore: 0.001 }); });
      viz = { type:'features', importance:{} };
    } else {
      scored = corpus.map(function(item) {
        var titleWords = (item.title||'').toLowerCase().split(/\W+/).filter(Boolean);
        var tagWords   = (item.tags||[]).map(function(t){return t.toLowerCase();});
        var catWords   = [(item.category||'').toLowerCase()];
        var titleFreq = {}; titleWords.forEach(function(w){ titleFreq[w] = (titleFreq[w]||0)+1; });
        var tagFreq   = {}; tagWords.forEach(function(w){  tagFreq[w]  = (tagFreq[w]||0)+1; });
        var catFreq   = {}; catWords.forEach(function(w){  catFreq[w]  = 1; });
        var titleScore = bm25Field(queryTerms, titleFreq, dfTitle, avgTitleLen, titleWords.length, K1_TITLE, B_TITLE);
        var tagScore   = bm25Field(queryTerms, tagFreq,   dfTags,  avgTagsLen,  tagWords.length,   K1_TAGS,  B_TAGS);
        var catScore   = bm25Field(queryTerms, catFreq,   dfCat,   avgCatLen,   1,                 K1_CAT,   B_CAT);
        var score = titleScore * 0.6 + tagScore * 0.3 + catScore * 0.1;
        return Object.assign({}, item, { score: score, modelScore: score });
      });
      var imp = {}; queryTerms.forEach(function(t) { imp[t + ' (BM25)'] = 1 / queryTerms.length; });
      viz = { type:'features', importance: imp };
    }
  }
  else if (key === 'als') {
    var uv = vocab.map(function(_,vi) { var s=histItems.reduce(function(a,it){return a+(vecs[it.id] && vecs[it.id][vi]||0);},0); return histItems.length?s/histItems.length:0; });
    var allAlsScores = [];
    events.forEach(function() { allAlsScores.push(1.0); });
    var globalBias = allAlsScores.length > 0 ? allAlsScores.reduce(function(a,b){return a+b;},0)/allAlsScores.length : 0.5;
    var itemCounts = {};
    events.forEach(function(e) { itemCounts[e.itemId] = (itemCounts[e.itemId]||0) + 1; });
    var icVals = Object.values(itemCounts);
    var avgItemCount = icVals.length > 0 ? icVals.reduce(function(a,b){return a+b;},0) / icVals.length : 1;
    var getItemBias = function(itemId) { var c = itemCounts[itemId] || 0; return (c - avgItemCount) / (avgItemCount + 1) * 0.1; };
    var userEventCount = events.filter(function(e){return e.userId===user.id;}).length;
    var avgUserCount = events.length / (users.length || 1);
    var userBias = (userEventCount - avgUserCount) / (avgUserCount + 1) * 0.1;
    scored = items.filter(function(i){return !seen.has(i.id);}).map(function(it) {
      var dotVal = dot(uv, vecs[it.id]||[]);
      var score = globalBias + userBias + getItemBias(it.id) + dotVal + qb(it);
      return Object.assign({}, it, { score: score, modelScore: score });
    });
    var mx = {}; users.forEach(function(u) { mx[u.id]={}; u.history.forEach(function(id){mx[u.id][id]=1;}); });
    viz = { type:'heatmap', matrix:mx, rows:users.map(function(u){return u.id;}), cols:items.slice(0,12).map(function(i){return i.id;}) };
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
    var D_SR = 8;
    function posEncode(pos, d) {
      return Array.from({length: d}, function(_, i) {
        return i % 2 === 0
          ? Math.sin(pos / Math.pow(10000, i / d))
          : Math.cos(pos / Math.pow(10000, (i-1) / d));
      });
    }
    function getItemEmbed(item, d) {
      var catHash = (item.category||'').split('').reduce(function(a,c){return a+c.charCodeAt(0);},0) / 1000;
      var tagHash = (item.tags||[]).join('').split('').reduce(function(a,c){return a+c.charCodeAt(0);},0) / 5000;
      var raw = [
        (item.price||0) / 100000, (item.bids||0) / 200, (item.views||0) / 5000,
        catHash % 1, tagHash % 1, (item.title||'').length / 100,
        (item.tags||[]).length / 20, ((item.price||0) * (item.bids||0)) / 10000000
      ];
      return raw.slice(0, d);
    }
    function srDot(a, b) { return a.reduce(function(s,v,i){return s + v*(b[i]||0);}, 0); }
    function srSoftmax(arr) {
      var max = Math.max.apply(null, arr);
      var exp = arr.map(function(v){return Math.exp(v - max);});
      var sum = exp.reduce(function(a,b){return a+b;},0);
      return exp.map(function(v){return v/sum;});
    }
    var seq = events.filter(function(e){return e.userId===user.id;});
    seq = seq.length>1 ? seq.sort(function(a,b){return (a.timestamp||'').localeCompare(b.timestamp||'');}).map(function(e){return e.itemId;}) : [].concat(user.history);
    var seqIt = seq.map(function(id){return items.find(function(i){return i.id===id;});}).filter(Boolean);
    if (!seqIt.length) {
      scored = items.slice(0,10).map(function(it,i){return Object.assign({},it,{score:0.1,modelScore:0.1});});
      viz = {type:'attention',weights:[],seqItems:[]};
    } else {
      var seqLen = Math.min(seqIt.length, 10);
      var historyEmbeds = seqIt.slice(-seqLen).map(function(item,pos) {
        var embed = getItemEmbed(item, D_SR);
        var pe = posEncode(pos, D_SR);
        return embed.map(function(v, i){return v + pe[i];});
      });
      var scale = Math.sqrt(D_SR);
      scored = items.filter(function(i){return !seen.has(i.id);}).map(function(item) {
        var itemEmbed = getItemEmbed(item, D_SR);
        var attScores = historyEmbeds.map(function(h){return srDot(itemEmbed, h) / scale;});
        var attWeights = srSoftmax(attScores);
        var contextVec = Array.from({length: D_SR}, function(_, i) {
          return historyEmbeds.reduce(function(s, h, j){return s + attWeights[j] * h[i];}, 0);
        });
        var dotVal = srDot(itemEmbed, contextVec);
        var normItem = Math.sqrt(srDot(itemEmbed, itemEmbed)) || 1;
        var normCtx  = Math.sqrt(srDot(contextVec, contextVec)) || 1;
        var cosSim = dotVal / (normItem * normCtx);
        var base = (cosSim + 1) / 2;
        var score = blendWithSession(base, item.id, sessionSignals) + qb(item);
        return Object.assign({}, item, { score: score, modelScore: score });
      });
      var nw = seqIt.slice(-seqLen).map(function(_,i){return 1/seqLen;});
      viz = { type:'attention', weights:nw, seqItems:seqIt.slice(-seqLen) };
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
    var prices = items.map(function(i){return i.price||0;});
    var allBids = items.map(function(i){return i.bids||0;});
    var allViews = items.map(function(i){return i.views||0;});
    var allTagCounts = items.map(function(i){return (i.tags||[]).length;});
    var lgbmMinMax = function(arr) {
      var mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr);
      return { mn:mn, mx:mx, norm: function(v){return mx===mn ? 0.5 : (v-mn)/(mx-mn);} };
    };
    var priceNorm = lgbmMinMax(prices);
    var bidsNorm  = lgbmMinMax(allBids);
    var viewsNorm = lgbmMinMax(allViews);
    var tagNorm   = lgbmMinMax(allTagCounts);
    var pricesSorted = [].concat(prices).sort(function(a,b){return a-b;});
    var pricePercentile = function(p) { var idx = pricesSorted.indexOf(p); return idx / (pricesSorted.length-1||1); };
    var userCatSet = new Set(user.history.map(function(id){var it=items.find(function(x){return x.id===id;}); return it?it.category:null;}).filter(Boolean));
    var userTagSet = new Set(user.preferences||[]);
    scored = items.filter(function(i){return !seen.has(i.id);}).map(function(it) {
      var pricePct    = pricePercentile(it.price||0);
      var bidsN       = bidsNorm.norm(it.bids||0);
      var viewsN      = viewsNorm.norm(it.views||0);
      var tagCntN     = tagNorm.norm((it.tags||[]).length);
      var bidVelocity = (it.views||0) > 0 ? (it.bids||0)/(it.views||0) : 0;
      var crossFeat   = pricePct * bidVelocity;
      var catMatch    = userCatSet.has(it.category) ? 1 : 0;
      var tagOverlap  = (it.tags||[]).filter(function(t){return userTagSet.has(t);}).length / Math.max((it.tags||[]).length, 1);
      var queryMatch  = query ? ((it.title||'').toLowerCase().includes(query.toLowerCase()) ? 1 : 0) : 0;
      var score = pricePct*0.10 + bidsN*0.20 + viewsN*0.15 + bidVelocity*0.15 + crossFeat*0.05 + catMatch*0.15 + tagOverlap*0.10 + tagCntN*0.05 + queryMatch*0.05 + qb(it);
      var featureImportance = { pricePct:pricePct, bidsN:bidsN, viewsN:viewsN, bidVelocity:bidVelocity, catMatch:catMatch, tagOverlap:tagOverlap, queryMatch:queryMatch };
      return Object.assign({}, it, { score:score, modelScore:score, _lgbmFeatures:featureImportance });
    });
    viz = { type:'features', importance:{ price:0.10, bids:0.20, views:0.15, bidVelocity:0.15, catMatch:0.15, tagOverlap:0.10, queryMatch:0.05, tagCount:0.05, crossFeat:0.05 } };
  }
  else if (key === 'rising') {
    const bn=minMax(items.map(i=>i.bids)), vn=minMax(items.map(i=>i.views));
    scored = items.map((it,idx)=>{const m=bn[idx]*.5+vn[idx]*.3+(1-idx/items.length*.3)*.2; const trend=m>.6?'hot':m>.35?'warm':'cool'; return {...it,score:m,trend};});
    viz = { type:'trend' };
  }
  else if (key === 'widedeep') {
    const uCats=new Set(),uTags=new Set(user.preferences); histItems.forEach(it=>{uCats.add(it.category);it.tags.forEach(t=>uTags.add(t));});
    const pn=minMax(items.map(i=>i.price)),bn=minMax(items.map(i=>i.bids)),vn=minMax(items.map(i=>i.views));
    scored = items.filter(i=>!seen.has(i.id)).map(it=>{const oi=items.indexOf(it); const wide=(uCats.has(it.category) ? 0.5 : 0)+(it.tags.filter(t=>uTags.has(t)).length/Math.max(it.tags.length,1))*.5; const di=[pn[oi]||0,bn[oi]||0,vn[oi]||0]; const deep=Math.min(di[0]*.5+di[1]*.3+di[2]*.2,1); return {...it,score:wide*.5+deep*.5+qb(it),wide,deep};});
    viz = { type:'widedeep' };
  }
  scored.sort((a,b)=>b.score-a.score);
  return { ranked: scored.slice(0,10), viz };
}

/* ═══════════════════════════ A/B TEST SIMULATOR ═══════════════════════════ */
function simulateAB(controlModels, treatmentModels, baseUsers, items, events, diag, query, intentWeight, sessionSignals) {
  if (items.length === 0 || baseUsers.length === 0) return { control: {ctr:0,precision5:0,recall10:0}, treatment: {ctr:0,precision5:0,recall10:0} };
  var rng = mulberry32(items.length * 137 + baseUsers.length * 31);
  var virtualUsers = Array.from({length: 100}, function(_, idx) {
    var base = baseUsers[idx % baseUsers.length];
    var histLen = (base.history||[]).length || 1;
    var dropCount = Math.floor(rng() * 2);
    var newHistory = (base.history||[]).filter(function() { return rng() > dropCount/histLen; });
    return Object.assign({}, base, { id: 'V'+idx, history: newHistory });
  });
  function evalStack(models, usr) {
    if (models.length === 0) return { precision5: 0, recall10: 0, ctr: 0 };
    var allRanked = models.map(function(k) { try { return runModel(k, items, usr, baseUsers, events, diag, query, intentWeight, sessionSignals).ranked; } catch(e) { return []; } });
    var scores = {};
    allRanked.forEach(function(ranked) { ranked.forEach(function(item, rank) { scores[item.id] = (scores[item.id]||0) + 1/(60+rank); }); });
    var merged = Object.entries(scores).sort(function(a,b){return b[1]-a[1];}).map(function(e){return { id: e[0], score: e[1] };});
    var top5 = merged.slice(0,5);
    var top10 = merged.slice(0,10);
    var relevant = items.filter(function(i){return (i.bids||0) > 30 || (i.views||0) > 500;}).map(function(i){return String(i.id);});
    var ctr = top5.filter(function(i){return i.score > 0.04;}).length / 5;
    var p5  = top5.filter(function(i){return relevant.includes(String(i.id));}).length / 5;
    var r10 = top10.filter(function(i){return relevant.includes(String(i.id));}).length / Math.max(relevant.length,1);
    return { precision5: p5, recall10: r10, ctr: ctr };
  }
  var controlMetrics  = virtualUsers.slice(0,50).map(function(u){return evalStack(controlModels, u);});
  var treatmentMetrics = virtualUsers.slice(50).map(function(u){return evalStack(treatmentModels, u);});
  var avg = function(arr, key) { return arr.reduce(function(s,v){return s+v[key];},0)/arr.length; };
  return {
    control: { ctr: avg(controlMetrics,'ctr'), precision5: avg(controlMetrics,'precision5'), recall10: avg(controlMetrics,'recall10') },
    treatment: { ctr: avg(treatmentMetrics,'ctr'), precision5: avg(treatmentMetrics,'precision5'), recall10: avg(treatmentMetrics,'recall10') }
  };
}

/* ═══════════════════════════ DISCOVER TAB UTILITIES ═══════════════════════════ */
function profileDataset(items, users, events) {
  var n = items.length;
  if (n === 0) return null;
  var attrKeys = Object.keys(items[0] || {}).filter(function(k){return !['id','title'].includes(k);});
  var attrDensity = items.reduce(function(s,item) {
    var filled = attrKeys.filter(function(k){return item[k] !== undefined && item[k] !== null && item[k] !== '' && !(Array.isArray(item[k]) && item[k].length===0);});
    return s + filled.length / Math.max(attrKeys.length, 1);
  }, 0) / n;
  var userCount = users.length;
  var eventCount = events.length;
  var sparsity = userCount > 0 && n > 0 ? 1 - (eventCount / (userCount * n)) : 1;
  var userEventCounts = {};
  events.forEach(function(e){userEventCounts[e.userId||e.user_id] = (userEventCounts[e.userId||e.user_id]||0)+1;});
  var eventCountsArr = Object.values(userEventCounts);
  var avgSessionLen = eventCountsArr.length > 0 ? eventCountsArr.reduce(function(a,b){return a+b;},0)/eventCountsArr.length : 0;
  var coldStartRatio = eventCountsArr.length > 0 ? eventCountsArr.filter(function(c){return c<3;}).length / eventCountsArr.length : 1;
  var seen = {};
  var repeats = 0;
  events.forEach(function(e){
    var key = (e.userId||e.user_id)+':'+(e.itemId||e.item_id);
    if (seen[key]) repeats++;
    seen[key] = true;
  });
  var repeatRate = eventCount > 0 ? repeats / eventCount : 0;
  var categories = new Set(items.map(function(i){return i.category;}).filter(Boolean));
  var avgTitleLen = items.reduce(function(s,i){return s + (i.title||'').split(/\s+/).filter(Boolean).length;}, 0) / n;
  var tagCoverage = items.filter(function(i){return (i.tags||[]).length > 0;}).length / n;
  var prices = items.map(function(i){return parseFloat(i.price)||0;}).sort(function(a,b){return a-b;});
  var priceMed = prices[Math.floor(prices.length/2)] || 0;
  var priceSkew = priceMed > 0
    ? (prices[Math.floor(prices.length*0.75)] - priceMed) / priceMed > 1.5 ? 'right-skewed' : 'roughly uniform'
    : 'unknown';
  var itemEventCounts = {};
  events.forEach(function(e){itemEventCounts[e.itemId||e.item_id] = (itemEventCounts[e.itemId||e.item_id]||0)+1;});
  var itemCountsArr = Object.values(itemEventCounts).sort(function(a,b){return b-a;});
  var top10pct = Math.max(1, Math.floor(itemCountsArr.length * 0.1));
  var top10pctEvents = itemCountsArr.slice(0, top10pct).reduce(function(a,b){return a+b;},0);
  var popularityConcentration = eventCount > 0 ? top10pctEvents / eventCount : 0;
  var signals = {
    textQuality:       Math.min(100, Math.round(avgTitleLen / 8 * 100)),
    userHistory:       Math.min(100, Math.round(Math.min(avgSessionLen / 10, 1) * 100)),
    interactionVolume: Math.min(100, Math.round(Math.min(eventCount / 1000, 1) * 100)),
    attributeCoverage: Math.min(100, Math.round(attrDensity * 100)),
    categoryStructure: Math.min(100, Math.round(Math.min(categories.size / 10, 1) * 100)),
    temporalRecency:   Math.min(100, 65)
  };
  return {
    catalogSize: n, attrDensity: attrDensity, userCount: userCount, eventCount: eventCount,
    sparsity: sparsity, avgSessionLen: avgSessionLen, coldStartRatio: coldStartRatio, repeatRate: repeatRate,
    categoryCount: categories.size, textRichness: avgTitleLen,
    tagCoverage: tagCoverage, priceMin: prices[0]||0, priceMedian: priceMed,
    priceMax: prices[prices.length-1]||0, priceSkew: priceSkew,
    popularityConcentration: popularityConcentration, signals: signals, attrKeys: attrKeys
  };
}

function recommendModels(fp) {
  if (!fp) return [];
  var scores = { bm25:0, als:0, ease:0, twotower:0, item2vec:0, sasrec:0, lightgbm:0, rising:0, widedeep:0 };
  if (fp.textRichness > 5 && fp.tagCoverage > 0.6 && fp.attrDensity > 0.4) { scores.bm25 += 3; scores.twotower += 2; }
  if (fp.eventCount > 500 && fp.sparsity < 0.9) { scores.als += 3; scores.ease += 2; }
  if (fp.avgSessionLen > 4) { scores.sasrec += 3; }
  if (fp.coldStartRatio > 0.3) { scores.rising += 3; scores.item2vec += 1; }
  if (fp.attrDensity > 0.5 && fp.eventCount > 200) { scores.lightgbm += 2; scores.widedeep += 2; }
  if (fp.repeatRate > 0.4) { scores.ease += 2; }
  if (fp.textRichness > 6) { scores.bm25 += 1; scores.twotower += 1; }
  if (fp.popularityConcentration > 0.5) { scores.rising += 1; }
  if (fp.eventCount < 50) { scores.als -= 3; scores.sasrec -= 2; scores.ease -= 2; }
  if (fp.textRichness < 3) { scores.bm25 -= 2; scores.twotower -= 1; }
  if (fp.userCount < 10) { scores.als -= 2; scores.ease -= 1; }
  var MODEL_META = {
    bm25:     { name:'BM25', type:'Lexical Search', prereq:'title + tags', prereqMet: fp.textRichness>3 && fp.tagCoverage>0.3 },
    als:      { name:'ALS', type:'Collaborative Filter', prereq:'≥200 events, ≥20 users', prereqMet: fp.eventCount>200 && fp.userCount>20 },
    ease:     { name:'EASE', type:'Item-Item CF', prereq:'≥100 events', prereqMet: fp.eventCount>100 },
    twotower: { name:'Two-Tower', type:'Neural Retrieval', prereq:'rich attributes + events', prereqMet: fp.attrDensity>0.4 },
    item2vec: { name:'Item2Vec', type:'Item Embeddings', prereq:'≥50 events', prereqMet: fp.eventCount>50 },
    sasrec:   { name:'SASRec', type:'Sequential', prereq:'avg session >3 events', prereqMet: fp.avgSessionLen>3 },
    lightgbm: { name:'LightGBM', type:'Gradient Boosted', prereq:'structured attributes', prereqMet: fp.attrDensity>0.4 },
    rising:   { name:'Rising Popularity', type:'Trending', prereq:'engagement data', prereqMet: fp.eventCount>10 },
    widedeep: { name:'Wide & Deep', type:'Neural Hybrid', prereq:'attributes + events', prereqMet: fp.attrDensity>0.4 && fp.eventCount>200 }
  };
  return Object.entries(scores).filter(function(e){return e[1]>0;}).sort(function(a,b){return b[1]-a[1];}).map(function(e) {
    return Object.assign({ key: e[0], score: e[1], maxScore: 10 }, MODEL_META[e[0]]);
  });
}

function analyzeGaps(fp) {
  if (!fp) return [];
  var gaps = [];
  var sev = function(val, thresholds) { return val >= thresholds[0] ? 'LOW' : val >= thresholds[1] ? 'MEDIUM' : 'HIGH'; };
  gaps.push({
    id:'zero_result', mode:'Zero-result risk', severity: sev(fp.attrDensity, [0.6, 0.35]),
    evidence: Math.round((1-fp.attrDensity)*100)+'% of items have sparse attributes',
    cause:'Low attribute density reduces query surface area',
    detail:'When items lack structured attributes, search queries that reference those attributes return zero results even when matching items exist.'
  });
  gaps.push({
    id:'cold_start', mode:'Cold-start exposure', severity: sev(1-fp.coldStartRatio, [0.7, 0.4]),
    evidence: Math.round(fp.coldStartRatio*100)+'% of users have <3 interactions',
    cause:'Collaborative filtering fails for new users',
    detail:'Users with fewer than 3 interactions cannot benefit from ALS, EASE, or SASRec. They see generic or popularity-based results unless a fallback is configured.'
  });
  gaps.push({
    id:'popularity_bias', mode:'Popularity bias risk', severity: sev(1-fp.popularityConcentration, [0.6, 0.4]),
    evidence: 'Top 10% of items receive '+Math.round(fp.popularityConcentration*100)+'% of interactions',
    cause:'High engagement concentration creates feedback loops',
    detail:'When most interactions concentrate on few items, collaborative models learn to recommend those items to everyone, suppressing long-tail discovery.'
  });
  gaps.push({
    id:'vocabulary', mode:'Vocabulary mismatch', severity: sev(fp.textRichness, [6, 3]),
    evidence: 'Avg title length: '+fp.textRichness.toFixed(1)+' words, tag coverage: '+Math.round(fp.tagCoverage*100)+'%',
    cause:'Weak text signals limit lexical search effectiveness',
    detail:'BM25 and Two-Tower models rely on rich textual content. Short titles and missing tags mean shopper queries find no lexical match.'
  });
  gaps.push({
    id:'serendipity', mode:'Serendipity deficit', severity: sev(fp.repeatRate < 0.3 ? 1 : 0, [0.7, 0.3]),
    evidence: 'Category repeat rate in sessions: '+Math.round(fp.repeatRate*100)+'%',
    cause:'Users see repetitive same-category results',
    detail:'Without explicit diversity mechanisms, recommendation models tend to surface items from the same category the user has already explored.'
  });
  gaps.push({
    id:'recency', mode:'Recency blindness',
    severity: fp.eventCount < 100 ? 'HIGH' : fp.avgSessionLen < 2 ? 'MEDIUM' : 'LOW',
    evidence: 'Avg session length: '+fp.avgSessionLen.toFixed(1)+' events',
    cause:'Short or sparse sessions limit temporal signal',
    detail:'SASRec and session-based models need at least 3-4 in-session events to build meaningful attention patterns.'
  });
  return gaps;
}

function generateActionPlan(fp) {
  if (!fp) return [];
  var actions = [];
  if (fp.attrDensity < 0.4) actions.push({ id:'attr', priority:'P0', label:'Enrich item attributes', target:'Increase attribute density from '+Math.round(fp.attrDensity*100)+'% → 60%+', impact:'Enables BM25, Two-Tower, LightGBM — unlocks 3 models' });
  if (fp.tagCoverage < 0.5) actions.push({ id:'tags', priority:'P0', label:'Add keyword tags to items', target:'Increase tag coverage from '+Math.round(fp.tagCoverage*100)+'% → 70%+', impact:'Improves BM25 recall by ~30%, enables tag-based filtering' });
  if (fp.eventCount < 100) actions.push({ id:'events', priority:'P0', label:'Collect more interaction data', target:'Reach 200+ events before deploying collaborative filtering', impact:'Prerequisite for ALS, EASE, SASRec — currently blocked' });
  if (fp.coldStartRatio > 0.4) actions.push({ id:'coldstart', priority:'P1', label:'Add user onboarding questionnaire', target:'Reduce cold-start ratio from '+Math.round(fp.coldStartRatio*100)+'% → <20%', impact:'Enables personalization for more users from day 1' });
  if (fp.textRichness < 4) actions.push({ id:'titles', priority:'P1', label:'Improve item title quality', target:'Increase avg title length from '+fp.textRichness.toFixed(1)+' → 6+ words', impact:'Better BM25 term matching, richer Two-Tower representations' });
  if (fp.repeatRate < 0.1) actions.push({ id:'diversity', priority:'P2', label:'Add diversity re-ranking', target:'Ensure top-10 results span ≥3 distinct categories', impact:'Improves serendipity and long-tail item exposure' });
  return actions;
}

/* ═══════════════════════════ RADAR CHART ═══════════════════════════ */
function RadarChart(_ref) {
  var signals = _ref.signals, size = _ref.size || 220;
  var axes = [
    { key:'textQuality', label:'Text Quality' },
    { key:'userHistory', label:'User History' },
    { key:'interactionVolume', label:'Interaction Vol.' },
    { key:'attributeCoverage', label:'Attributes' },
    { key:'categoryStructure', label:'Categories' },
    { key:'temporalRecency', label:'Recency' }
  ];
  var N = axes.length, cx = size/2, cy = size/2, r = size * 0.38;
  var benchmark = 75;
  function polarPoint(angleIdx, value, maxVal) {
    if (maxVal === undefined) maxVal = 100;
    var angle = (angleIdx / N) * 2 * Math.PI - Math.PI/2;
    var dist = (value / maxVal) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  }
  var actualPoints = axes.map(function(a,i){return polarPoint(i, signals[a.key]||0);});
  var benchPoints  = axes.map(function(a,i){return polarPoint(i, benchmark);});
  var labelPoints  = axes.map(function(a,i){return polarPoint(i, 115);});
  var gridLevels   = [25,50,75,100];
  var toPath = function(pts){return pts.map(function(p,i){return (i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1);}).join(' ')+'Z';};
  return React.createElement('svg', { width:size, height:size, viewBox:'0 0 '+size+' '+size },
    gridLevels.map(function(lvl){return React.createElement('polygon',{key:lvl,points:axes.map(function(_,i){var p=polarPoint(i,lvl);return p.x+','+p.y;}).join(' '),fill:'none',stroke:'#d1d5db',strokeWidth:'0.5'});}),
    axes.map(function(_,i){var outer=polarPoint(i,100);return React.createElement('line',{key:i,x1:cx,y1:cy,x2:outer.x,y2:outer.y,stroke:'#d1d5db',strokeWidth:'0.5'});}),
    React.createElement('path',{d:toPath(benchPoints),fill:'#3B82F6',fillOpacity:'0.06',stroke:'#3B82F6',strokeWidth:'1',strokeDasharray:'3,2'}),
    React.createElement('path',{d:toPath(actualPoints),fill:'#10B981',fillOpacity:'0.2',stroke:'#10B981',strokeWidth:'1.5'}),
    actualPoints.map(function(p,i){return React.createElement('circle',{key:i,cx:p.x,cy:p.y,r:'3',fill:'#10B981'});}),
    axes.map(function(a,i){var p=labelPoints[i];return React.createElement('text',{key:i,x:p.x,y:p.y,textAnchor:'middle',dominantBaseline:'middle',fontSize:'7.5',fill:'#6b7280'},a.label);})
  );
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
    reasons.push("\u2713 Matches your " + tagOverlap.slice(0, 2).join(" & ") + " interests");
  if (item.bids > 60) reasons.push("\u2713 High demand \u2014 " + item.bids + " active bids");
  if (item.views > 1500) reasons.push("\u2713 Popular right now \u2014 " + item.views.toLocaleString() + " views");
  const userCats = new Set(histItems.map(i => i.category));
  if (userCats.has(item.category)) {
    const similar = histItems.find(h => h.category === item.category);
    if (similar) reasons.push("\u2713 Similar to " + similar.image + " " + similar.title.split(' ').slice(0,3).join(' ') + " you engaged with");
  }
  if (query && item.title.toLowerCase().includes(query.toLowerCase()))
    reasons.push("\u2713 Matches your search for '" + query + "'");
  const modelsWithItemInTop5 = selectedModels.filter(mk => results[mk] && results[mk].ranked.slice(0,5).some(x => x.id === item.id));
  if (modelsWithItemInTop5.length === selectedModels.length && selectedModels.length >= 2)
    reasons.push("\u2713 Recommended by all " + selectedModels.length + " active models");
  else if (modelsWithItemInTop5.length === 1 && selectedModels.length >= 2)
    reasons.push("\u2605 Only " + (MODELS.find(m => m.key === modelsWithItemInTop5[0]) || {}).name + " found this \u2014 hidden gem");
  if (item.trend === 'hot') reasons.push("\u2191 Trending \u2014 high recent bid activity");
  selectedModels.forEach(mk => {
    const r = results[mk];
    if (r) {
      const maxScore = Math.max(...r.ranked.map(x => x.score), 0.001);
      const found = r.ranked.find(x => x.id === item.id);
      if (found && found.score / maxScore > 0.8)
        reasons.push("\u2713 Strong " + (MODELS.find(m => m.key === mk) || {}).name + " signal");
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
  selectedModels.forEach(function(mk) { top5Sets[mk] = new Set((results[mk] && results[mk].ranked || []).slice(0, 5).map(function(x) { return x.id; })); });
  const allIds = new Set();
  Object.values(top5Sets).forEach(function(s) { s.forEach(function(id) { allIds.add(id); }); });
  const consensus = []; var unique = {};
  allIds.forEach(function(id) {
    const inModels = selectedModels.filter(function(mk) { return top5Sets[mk] && top5Sets[mk].has(id); });
    if (inModels.length === selectedModels.length) consensus.push(id);
    else if (inModels.length === 1) { if (!unique[inModels[0]]) unique[inModels[0]] = []; unique[inModels[0]].push(id); }
  });
  return { consensus, unique };
}

function generateAdvisorRec(chips, text, diag) {
  const has = function(s) { return chips.some(function(c) { return c.includes(s); }) || (text || '').toLowerCase().includes(s); };
  var primary, support, fusionKey, reasoning, watchouts, gaps;
  if (has('search') || has('text')) { primary = 'bm25'; support = ['lightgbm', 'twotower']; fusionKey = 'cascade'; reasoning = "BM25 handles exact keyword intent, Two-Tower adds semantic coverage, LightGBM re-ranks with features."; watchouts = "BM25 alone won't personalize — add ALS if you need taste-based results."; }
  else if (has('cold') || has('sparse')) { primary = 'rising'; support = ['bm25']; fusionKey = 'rrf'; reasoning = "Rising Popularity works without history. BM25 adds search coverage. Both work for new users."; watchouts = "This stack won't personalize. Add collaborative models as you gather interaction data."; }
  else if (has('personal') || has('session')) { primary = 'sasrec'; support = ['als', 'ease']; fusionKey = 'rrf'; reasoning = "SASRec captures sequential intent, ALS provides long-term taste, EASE adds item-similarity coverage."; watchouts = "Needs sufficient interaction history. May underperform for new users."; }
  else if (has('diversity') || has('popularity')) { primary = 'als'; support = ['item2vec', 'bm25']; fusionKey = 'rrf'; reasoning = "RRF across diverse retrieval methods maximizes coverage. Item2Vec finds unexpected connections."; watchouts = "More models = more compute. Monitor for latency."; }
  else if (has('explain')) { primary = 'lightgbm'; support = ['bm25']; fusionKey = 'cascade'; reasoning = "LightGBM provides interpretable feature importance. BM25 adds transparent text matching."; watchouts = "Less personalized than collaborative models."; }
  else if (has('trend')) { primary = 'rising'; support = ['lightgbm', 'als']; fusionKey = 'weighted'; reasoning = "Rising Popularity surfaces trending items. LightGBM adds feature scoring. ALS personalizes."; watchouts = "Trending items may not match individual taste."; }
  else { primary = 'als'; support = ['lightgbm']; fusionKey = 'rrf'; reasoning = "ALS provides strong personalization, LightGBM adds feature-based scoring. A solid starting stack."; watchouts = "Consider adding BM25 for search, SASRec for session-aware ranking."; }
  gaps = '';
  if (diag && diag.items && diag.items.count < 10) gaps = "Very small catalog — collaborative models may underperform.";
  else if (diag && diag.users && diag.users.synthetic) gaps = "No real user data — collaborative models use synthetic users.";
  return { primary, support, fusionKey, reasoning, watchouts, gaps };
}

/* ═══════════════════════════ CATALOG HEALTH ═══════════════════════════ */
function computeCatalogHealth(items) {
  const total = items.length;
  const withFullTags = items.filter(i => i.tags && i.tags.length >= 2).length;
  const completeness = Math.round((withFullTags / total) * 100);
  const withBrand = items.filter(i => { const words = i.title.split(' '); return words.length >= 3; }).length;
  const consistency = Math.round((withBrand / total) * 100);
  const cats = [...new Set(items.map(i => i.category))];
  const withCat = items.filter(i => i.category && i.category !== 'Unknown').length;
  const coverage = Math.round((withCat / total) * 100);
  const grouped = {};
  items.forEach(i => { const k = i.category; if (!grouped[k]) grouped[k] = []; grouped[k].push(i); });
  const variantScore = Math.round(Object.values(grouped).filter(g => g.length > 1).length / Math.max(cats.length, 1) * 100);
  const overall = Math.round((completeness * 0.3 + consistency * 0.25 + coverage * 0.25 + variantScore * 0.2));
  return { overall, completeness, consistency, coverage, variantScore, issues: [
    { text: '"Rolex Submariner" and "Omega Speedmaster" not grouped as Watch variants', level: 'warn' },
    { text: '4 items missing "material" attribute \u2014 may hurt filter quality', level: 'warn' },
    { text: '"Vintage" appears in tags AND titles inconsistently', level: 'warn' },
  ]};
}

function parseQueryIntent(query) {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase().trim();
  const categories = ['watch','watches','art','painting','music','guitar','jewelry','ring','sports','card','fashion','book','car','space','history'];
  const attributes = ['vintage','rare','luxury','antique','modern','collectible','limited','signed','original','classic'];
  const pricePatterns = [/under\s*\$?(\d+)/i, /below\s*\$?(\d+)/i, /less than\s*\$?(\d+)/i, /\$(\d+)\s*-\s*\$?(\d+)/i, /budget/i, /cheap/i, /expensive/i, /high.?value/i];
  const useCases = ['gift','invest','collect','display','wear','resell','decorate'];
  const foundType = categories.find(c => q.includes(c));
  const foundAttrs = attributes.filter(a => q.includes(a));
  const foundUseCase = useCases.find(u => q.includes(u));
  let priceSignal = null;
  for (const p of pricePatterns) { if (p.test(q)) { priceSignal = q.match(p)[0]; break; } }
  const ambiguity = (foundType ? 0 : 1) + (foundAttrs.length === 0 ? 1 : 0);
  return {
    productType: foundType ? foundType.charAt(0).toUpperCase() + foundType.slice(1) : null,
    attributes: foundAttrs,
    priceSignal: priceSignal || null,
    useCase: foundUseCase || (foundAttrs.includes('collectible') ? 'collecting' : null),
    ambiguity: ambiguity === 0 ? 'Low' : ambiguity === 1 ? 'Medium' : 'High',
    confidence: ambiguity === 0 ? 'HIGH' : ambiguity === 1 ? 'MODERATE' : 'LOW',
  };
}

/* ═══════════════════════════ MERCH HELPERS ═══════════════════════════ */
function applyMerchRules(fusedResults, merchRules) {
  if (!fusedResults) return fusedResults;
  let arr = fusedResults.map(it => {
    const rule = merchRules[it.id];
    if (rule === 'boost') return { ...it, score: it.score * 1.5, merchRule: 'boost' };
    if (rule === 'bury') return { ...it, score: it.score * 0.3, merchRule: 'bury' };
    if (rule === 'pin') return { ...it, score: 999, merchRule: 'pin' };
    return { ...it, merchRule: null };
  });
  arr.sort((a, b) => b.score - a.score);
  return arr;
}

/* ═══════════════════════════ UI COMPONENTS ═══════════════════════════ */
const Tip = ({ text, children }) => (
  React.createElement('span', { className: 'tip-wrap' }, children, React.createElement('span', { className: 'tip-pop' }, text))
);

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
  const pts=items.slice(0,20).map(it=>{const e=(viz.emb && viz.emb[it.id])||[0,0]; return {x:pad+e[0]*(w-2*pad),y:h-pad-e[1]*(h-2*pad),it};});
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
  if (type === 'avg') return (<svg width={40} height={28} className="flex-shrink-0"><rect x={2} y={4} width={6} height={18} fill="#3b82f6" rx={1} opacity={.6} /><rect x={10} y={8} width={6} height={14} fill="#8b5cf6" rx={1} opacity={.6} /><rect x={18} y={6} width={6} height={16} fill="#f59e0b" rx={1} opacity={.6} /><text x={27} y={16} fill="#9ca3af" fontSize={8}>{'\u2192'}</text><rect x={32} y={6} width={6} height={16} fill="#10b981" rx={1} /></svg>);
  if (type === 'rrf') return (<svg width={40} height={28} className="flex-shrink-0"><text x={2} y={10} fill="#3b82f6" fontSize={7} fontFamily="JetBrains Mono">#1#3</text><text x={2} y={22} fill="#8b5cf6" fontSize={7} fontFamily="JetBrains Mono">#2#1</text><text x={22} y={16} fill="#9ca3af" fontSize={8}>{'\u2192'}</text><rect x={29} y={4} width={9} height={20} fill="#10b981" rx={2} opacity={.2} /><text x={33} y={17} textAnchor="middle" fill="#10b981" fontSize={7} fontWeight={600}>{'\u2713'}</text></svg>);
  if (type === 'weighted') return (<svg width={40} height={28} className="flex-shrink-0"><rect x={2} y={4} width={10} height={18} fill="#3b82f6" rx={1} opacity={.7} /><rect x={14} y={8} width={6} height={14} fill="#8b5cf6" rx={1} opacity={.4} /><rect x={22} y={10} width={4} height={12} fill="#f59e0b" rx={1} opacity={.3} /><text x={28} y={16} fill="#9ca3af" fontSize={8}>{'\u2192'}</text><rect x={33} y={5} width={6} height={17} fill="#10b981" rx={1} /></svg>);
  return (<svg width={40} height={28} className="flex-shrink-0"><polygon points="2,2 28,2 22,26 8,26" fill="#3b82f6" opacity={.1} stroke="#3b82f6" strokeWidth={.8} /><text x={15} y={10} textAnchor="middle" fill="#3b82f6" fontSize={6}>100</text><text x={15} y={22} textAnchor="middle" fill="#3b82f6" fontSize={6}>{'\u2192'}5</text><rect x={31} y={8} width={7} height={12} fill="#10b981" rx={2} opacity={.3} /><text x={34} y={17} textAnchor="middle" fill="#10b981" fontSize={6} fontWeight={600}>5</text></svg>);
};

/* ═══════════════════════════ LANDING PAGE ═══════════════════════════ */
const HeroPipeline = () => (
  <div className="space-y-4">
    <div className="relative flex items-center gap-2">
      {["Messy catalog","Blunt search","Wrong results","Lost revenue"].map((s,i) => (
        <React.Fragment key={i}>
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 font-medium text-center min-w-[100px]">{s}</div>
          {i < 3 && <svg width={20} height={12}><line x1={0} y1={6} x2={20} y2={6} stroke="#fca5a5" strokeWidth={2} /><polygon points="16,2 20,6 16,10" fill="#fca5a5" /></svg>}
        </React.Fragment>
      ))}
      <svg className="absolute" width={8} height={8} style={{left:'10%',top:'50%',transform:'translateY(-50%)'}}><circle cx={4} cy={4} r={4} fill="#ef4444"><animate attributeName="cx" values="4;450;4" dur="4s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;0.3;1" dur="4s" repeatCount="indefinite" /></circle></svg>
    </div>
    <div className="relative flex items-center gap-2">
      {["Clean catalog","Intent engine","Model ensemble","Right results"].map((s,i) => (
        <React.Fragment key={i}>
          <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-[11px] text-green-700 font-medium text-center min-w-[100px]">{s}</div>
          {i < 3 && <svg width={20} height={12}><line x1={0} y1={6} x2={20} y2={6} stroke="#86efac" strokeWidth={2} /><polygon points="16,2 20,6 16,10" fill="#86efac" /></svg>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

function LandingPage({ onEnterTool }) {
  const [expandedStage, setExpandedStage] = useState(null);

  return (
    <div className="anim-fade-in">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Your catalog is full of great products.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">Your shoppers can't find them.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-3">
            58% of desktop sites and 78% of mobile sites have mediocre-or-worse product discovery. The problem isn't your inventory — it's the gap between what shoppers mean and what your search understands.
          </p>
          <p className="text-xs text-gray-400 italic mb-8">— Baymard Institute, 2025 Product List & Search Benchmark</p>
          <div className="flex gap-3">
            <button onClick={onEnterTool} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all active:scale-[0.98]">See it live →</button>
            <button onClick={() => document.getElementById('solution-section').scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:border-gray-400 font-medium text-sm transition-all">How it works ↓</button>
          </div>
        </div>
        <div className="hidden lg:block"><HeroPipeline /></div>
      </section>

      {/* PROBLEM CARDS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">The Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <svg width={32} height={32} viewBox="0 0 32 32"><rect x={6} y={4} width={20} height={24} rx={3} fill="none" stroke="#ef4444" strokeWidth={2}/><line x1={11} y1={11} x2={21} y2={11} stroke="#ef4444" strokeWidth={1.5}/><line x1={11} y1={16} x2={21} y2={16} stroke="#ef4444" strokeWidth={1.5}/><line x1={11} y1={21} x2={17} y2={21} stroke="#ef4444" strokeWidth={1.5}/><circle cx={24} cy={7} r={5} fill="#fef2f2" stroke="#ef4444" strokeWidth={1.5}/><text x={24} y={10} textAnchor="middle" fill="#ef4444" fontSize={8} fontWeight="bold">!</text></svg>,
                title: "Your data is messier than you think",
                body: "Inconsistent titles. Missing attributes. Variants scattered across duplicate SKUs. Filters that don't match how shoppers talk. Even the best search engine fails when the data underneath is broken.",
                stat: "Missing attributes cause 23% of zero-result searches" },
              { icon: <svg width={32} height={32} viewBox="0 0 32 32"><circle cx={14} cy={14} r={9} fill="none" stroke="#f59e0b" strokeWidth={2}/><line x1={20} y1={20} x2={28} y2={28} stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round"/><text x={14} y={18} textAnchor="middle" fill="#f59e0b" fontSize={12} fontWeight="bold">?</text></svg>,
                title: "Search doesn't understand what shoppers mean",
                body: "A shopper types 'gift for 8 year old who likes building toys.' Your search sees individual words. Intent is lost. Constraints are ignored. Results are random.",
                stat: "68% of sites fail searches with product-attribute constraints" },
              { icon: <svg width={32} height={32} viewBox="0 0 32 32"><rect x={4} y={8} width={8} height={16} rx={2} fill="none" stroke="#8b5cf6" strokeWidth={1.5}/><rect x={14} y={4} width={8} height={24} rx={2} fill="none" stroke="#8b5cf6" strokeWidth={1.5}/><rect x={24} y={12} width={4} height={8} rx={1} fill="none" stroke="#8b5cf6" strokeWidth={1.5}/><circle cx={8} cy={14} r={2} fill="#8b5cf6"/><circle cx={18} cy={14} r={2} fill="#8b5cf6"/></svg>,
                title: "Business rules fight your relevance engine",
                body: "Your team pins high-margin SKUs. Buries low-stock items. Boosts seasonal campaigns. But no one can see how these rules interact with model scores — or when they destroy relevance.",
                stat: "Nontechnical teams have no visibility into ranking logic" },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">{card.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.body}</p>
                <div className="text-xs font-medium text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{card.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION PIPELINE */}
      <section id="solution-section" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">One system. The full discovery stack.</h2>
          <p className="text-sm text-gray-500 text-center mb-10">From raw catalog to ranked results — with every decision explained.</p>
          <div className="flex items-start gap-2 overflow-x-auto pb-4">
            {SOLUTION_PIPELINE.map((stage, i) => (
              <React.Fragment key={i}>
                <button onClick={() => setExpandedStage(expandedStage === i ? null : i)}
                  className={"flex-1 min-w-[160px] rounded-xl border p-4 text-left transition-all cursor-pointer " + (expandedStage === i ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                  <div className="text-[10px] font-mono text-blue-500 mb-1">STAGE {i + 1}</div>
                  <div className="text-sm font-bold text-gray-900 mb-2">{stage.label}</div>
                  {expandedStage === i && <p className="text-xs text-gray-600 leading-relaxed anim-slide-in">{stage.desc}</p>}
                </button>
                {i < SOLUTION_PIPELINE.length - 1 && <div className="flex-shrink-0 text-gray-300 text-lg mt-6">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONA CARDS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Who this is for</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { initials: "MM", role: "Merchandising Manager", pain: "I can pin products, but I have no idea if my overrides are helping or hurting relevance. I find out after the fact.", gain: "See rank impact before publishing. Understand which model your boost is fighting against.", color: "bg-pink-100 text-pink-700" },
              { initials: "SE", role: "Search / Relevance Engineer", pain: "Our search quality is hard to explain to stakeholders. I know ALS works better than Rising Popularity for returning users but I can't show why.", gain: "Show the model contribution map. Run A/B comparisons between fusion strategies. Export explainability for any query.", color: "bg-blue-100 text-blue-700" },
              { initials: "VP", role: "VP of E-commerce", pain: "We have a 6-figure search contract and still have a 15% zero-result rate. I don't know where the problem is.", gain: "Catalog health score. Zero-result root cause analysis. Model consensus confidence. Revenue impact of discovery gaps.", color: "bg-amber-100 text-amber-700" },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={"w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold " + p.color}>{p.initials}</div>
                  <div className="text-sm font-bold text-gray-900">{p.role}</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                  <div className="text-[10px] font-mono text-red-400 uppercase mb-1">Pain</div>
                  <p className="text-xs text-red-700 leading-relaxed">{p.pain}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="text-[10px] font-mono text-green-500 uppercase mb-1">Gain</div>
                  <p className="text-xs text-green-700 leading-relaxed">{p.gain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE PREVIEW TEASER */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">See the difference a model makes</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Same user. Same catalog. Different model. Completely different results.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Rising Popularity only</div>
              {[{e:"🏎️",n:"Porsche 911",s:"102 bids"},{e:"🎸",n:"Gibson Les Paul",s:"89 bids"},{e:"🃏",n:"Mickey Mantle Card",s:"77 bids"}].map((it,i) => (
                <div key={i} className="flex items-center gap-2 mb-2"><span className="text-[10px] font-mono text-gray-400">#{i+1}</span><span className="text-base">{it.e}</span><span className="text-xs text-gray-700">{it.n}</span><span className="text-[10px] text-gray-400 ml-auto">{it.s}</span></div>
              ))}
              <div className="text-[11px] text-gray-400 mt-3 italic">No personalization. Same for everyone.</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">ALS + SASRec for Alex Chen</div>
              {[{e:"⌚",n:"Omega Speedmaster",s:"luxury match"},{e:"👜",n:"LV Trunk",s:"vintage + luxury"},{e:"🪔",n:"Tiffany Lamp",s:"art + vintage"}].map((it,i) => (
                <div key={i} className="flex items-center gap-2 mb-2"><span className="text-[10px] font-mono text-blue-400">#{i+1}</span><span className="text-base">{it.e}</span><span className="text-xs text-gray-700">{it.n}</span><span className="text-[10px] text-blue-500 ml-auto">{it.s}</span></div>
              ))}
              <div className="text-[11px] text-blue-500 mt-3 italic">Personalized to Alex's luxury + vintage history.</div>
            </div>
          </div>
          <div className="text-center mt-6">
            <button onClick={onEnterTool} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all">Try it with your own user and query →</button>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-gray-900 py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-2">Discovery problems are catalog problems.</h2>
          <p className="text-lg text-gray-400 mb-8">And catalog problems are solvable.</p>
          <button onClick={onEnterTool} className="px-8 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-base transition-all">Enter the tool →</button>
        </div>
      </section>
    </div>
  );
}

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
              style={{ borderColor: s.color + (isActive ? 'aa' : '55'), background: s.color + (isActive ? '18' : '08') }}>
              <div className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</div>
              <div className="text-[11px] text-gray-500 mt-1 leading-tight">{s.desc}</div>
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {MODELS.filter(m=>m.stage===s.key).map(m=>(
                  <Tip key={m.key} text={m.full}><span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{background:m.color+'22',color:m.color}}>{m.name}</span></Tip>
                ))}
              </div>
              {overlay === 'search' && s.search && <div className="text-[9px] text-teal-600 mt-2 font-medium bg-teal-50 rounded px-1.5 py-0.5">{s.search}</div>}
              {overlay === 'personal' && s.personal && <div className="text-[9px] text-purple-600 mt-2 font-medium bg-purple-50 rounded px-1.5 py-0.5">{s.personal}</div>}
            </button>
            {i < STAGES.length - 1 && <div className="flex-shrink-0 text-gray-300 text-lg">→</div>}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

const LiveExampleStep = ({ step, index, color }) => (
  <div className={"flex gap-3 items-start " + (step.winner ? "bg-green-50 border border-green-200 -mx-2 px-2 py-2 rounded-lg" : "py-1")}>
    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{background: step.winner ? '#16a34a22' : color+'22', color: step.winner ? '#16a34a' : color}}>{index + 1}</div>
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
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold flex-shrink-0" style={{ background: model.color+'22', color: model.color }}>{model.name.slice(0,2).toUpperCase()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2"><span className="font-semibold text-gray-900">{model.name}</span><span className="text-[10px] font-mono text-gray-400">{model.full}</span></div>
        <div className="text-xs text-gray-500 mt-0.5">{model.summary}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{background:model.color+'22',color:model.color}}>{model.stage}</span>
        <span className={"text-[9px] font-mono px-1.5 py-0.5 rounded " + (model.searchUsage === 'USES' ? "bg-green-50 text-green-600" : model.searchUsage === 'PARTIAL' ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400")}>{model.searchUsage}</span>
        <span className="text-gray-400 text-sm">{expanded ? '▾' : '▸'}</span>
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
              {model.how.map((step,i) => (<li key={i} className="flex gap-2 text-xs text-gray-700 leading-relaxed"><span className="font-mono text-[10px] mt-0.5 flex-shrink-0" style={{color:model.color}}>{i+1}.</span>{step}</li>))}
            </ol>
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Live example</div>
            <div className="space-y-2 mb-3">{model.liveExample.map((step, i) => (<LiveExampleStep key={i} step={step} index={i} color={model.color} />))}</div>
            <div className="text-[11px] text-gray-500 italic bg-gray-50 rounded-lg p-2.5 border border-gray-100"><span className="font-medium text-gray-600 not-italic">Why this matters:</span> {model.whyMatters}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 mb-3">
          <div><div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Works best when</div><div className="text-xs text-gray-600">{model.whenToUse.bestWhen}</div></div>
          <div><div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Watch out if</div><div className="text-xs text-gray-600">{model.whenToUse.watchOut}</div></div>
          <div><div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Combine with</div><div className="text-xs text-gray-600 font-medium" style={{color: (MODELS.find(m=>m.name===model.whenToUse.combineWith)||{}).color || '#3b82f6'}}>{model.whenToUse.combineWith}</div></div>
        </div>
        <button onClick={() => onSeeInPlayground({ models: [model.key], step: 3 })} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all">See it in Playground →</button>
      </div>
    )}
  </div>
);

function AdvisorSection({ onConfigurePlayground, diag }) {
  const [chips, setChips] = useState([]);
  const [text, setText] = useState('');
  const [rec, setRec] = useState(null);
  const toggleChip = (c) => setChips(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const generate = () => setRec(generateAdvisorRec(chips, text, diag));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div><h3 className="text-base font-semibold text-gray-900 mb-1">Model Recommendation Advisor</h3><p className="text-sm text-gray-500">Describe your problem and we'll recommend which models to use.</p></div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={2} placeholder="Describe your recommendation problem..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 resize-none" />
      <div className="flex flex-wrap gap-2">{PAIN_POINTS.map(p => (<button key={p} onClick={() => toggleChip(p)} className={"px-2.5 py-1 rounded-full text-xs font-medium border transition-all " + (chips.includes(p) ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>{p}</button>))}</div>
      <button onClick={generate} disabled={!chips.length && !text.trim()} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Generate Recommendation</button>
      {rec && (
        <div className="fade-up bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div><div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Primary</div><div className="text-sm font-semibold" style={{color: (MODELS.find(m=>m.key===rec.primary)||{}).color}}>{(MODELS.find(m=>m.key===rec.primary)||{}).name}</div></div>
            <div className="text-gray-300">+</div>
            <div><div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Supporting</div><div className="flex gap-1">{rec.support.map(mk => <span key={mk} className="text-xs font-medium" style={{color:(MODELS.find(m=>m.key===mk)||{}).color}}>{(MODELS.find(m=>m.key===mk)||{}).name}</span>)}</div></div>
            <div className="text-gray-300">via</div>
            <div><div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Fusion</div><div className="text-xs font-medium text-blue-600">{(FUSIONS.find(f=>f.key===rec.fusionKey)||{}).name}</div></div>
          </div>
          <div className="text-xs text-gray-600">{rec.reasoning}</div>
          {rec.watchouts && <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">Watch out: {rec.watchouts}</div>}
          {rec.gaps && <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2">Data gap: {rec.gaps}</div>}
          <button onClick={() => onConfigurePlayground({ models: [rec.primary, ...rec.support], fusion: rec.fusionKey, step: 3 })} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">Build this stack in Playground →</button>
        </div>
      )}
    </div>
  );
}

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
          {[['search','Show search influence','teal'],['personal','Show personalization influence','purple']].map(([key,label,clr]) => (
            <button key={key} onClick={() => setOverlay(overlay === key ? null : key)}
              className={"text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all " + (overlay === key ? "bg-"+clr+"-50 text-"+clr+"-600 border-"+clr+"-200" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300")}>{label}</button>
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-lg font-semibold text-gray-900 mb-1">{activeStage ? STAGES.find(s=>s.key===activeStage).label + ' Models' : '9 Models Explained'}</h2></div>
          {activeStage && <button onClick={() => setActiveStage(null)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Show all ×</button>}
        </div>
        <div className="space-y-2">{filteredModels.map(m => (<ModelCard key={m.key} model={m} expanded={expandedModel===m.key} onToggle={()=>setExpandedModel(expandedModel===m.key?null:m.key)} onSeeInPlayground={onConfigurePlayground} />))}</div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Combining Models</h2>
        <p className="text-sm text-gray-500 mb-4">Four common fusion strategies used in production.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FUSIONS.map(f => (
            <button key={f.key} onClick={()=>setExpandedFusion(expandedFusion===f.key?null:f.key)}
              className={"text-left rounded-lg border p-3 transition-all " + (expandedFusion===f.key ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300')}>
              <div className="flex items-center gap-2"><FusionMiniDiagram type={f.key} /><div><div className="text-sm font-semibold text-gray-800">{f.name}</div><div className="text-xs text-gray-500 mt-0.5">{f.desc}</div></div></div>
              {expandedFusion===f.key && <div className="mt-2"><div className="text-[11px] text-gray-500 italic">Choose this if: {f.chooseIf}</div></div>}
            </button>
          ))}
        </div>
      </section>
      <section><AdvisorSection onConfigurePlayground={onConfigurePlayground} diag={diag} /></section>
    </div>
  );
}

/* ═══════════════════════════ TOOL STEP INDICATOR ═══════════════════════════ */
const ToolStepIndicator = ({ step, setStep, maxReached }) => (
  <div className="flex items-center gap-1 mb-6 overflow-x-auto">
    {TOOL_STEP_LABELS.map((label, i) => {
      const n = i + 1, active = step === n, done = n < step, reachable = n <= maxReached;
      return (
        <React.Fragment key={n}>
          <button onClick={() => reachable && setStep(n)} disabled={!reachable}
            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
              (active ? "bg-blue-100 text-blue-600 ring-1 ring-blue-200" : done ? "bg-green-50 text-green-600 cursor-pointer hover:bg-green-100" : reachable ? "text-gray-500 hover:text-gray-700 cursor-pointer" : "text-gray-300 cursor-not-allowed")}>
            <span className={"w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold " + (active ? "bg-blue-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>{done ? '✓' : n}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
          {i < 4 && <span className={"text-xs " + (n < step ? "text-green-400" : "text-gray-300")}>→</span>}
        </React.Fragment>
      );
    })}
  </div>
);

/* ═══════════════════════════ DISCOVER TAB ═══════════════════════════ */
function DiscoverTab({ items, users, events, discoverProfile, setDiscoverProfile, discoverActionsDone, setDiscoverActionsDone, onLoadIntoWizard }) {
  const [dataSource, setDataSource] = React.useState('sample');
  const [csvItemsLocal, setCsvItemsLocal] = React.useState(null);
  const [csvUsersLocal, setCsvUsersLocal] = React.useState(null);
  const [csvEventsLocal, setCsvEventsLocal] = React.useState(null);
  const [csvError, setCsvError] = React.useState('');

  const handleDiscoverCSV = React.useCallback(function(file, type) {
    if (!file) return; setCsvError('');
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var p = parseCSV(e.target.result);
        if (!p.length) { setCsvError(type + ' CSV is empty'); return; }
        if (type === 'items') setCsvItemsLocal(p);
        else if (type === 'users') setCsvUsersLocal(p);
        else setCsvEventsLocal(p);
      } catch(err) { setCsvError(err.message); }
    };
    reader.readAsText(file);
  }, []);

  const activeItems = dataSource === 'csv' && csvItemsLocal ? csvItemsLocal : items;
  const activeUsers = dataSource === 'csv' && csvUsersLocal ? csvUsersLocal : users;
  const activeEvents = dataSource === 'csv' && csvEventsLocal ? csvEventsLocal : events;

  const { items: resolvedItems, users: resolvedUsers, events: resolvedEvents } = React.useMemo(function() {
    if (dataSource === 'csv' && csvItemsLocal) {
      return processData(csvItemsLocal, csvUsersLocal || [], csvEventsLocal || []);
    }
    return { items: items, users: users, events: events, diag: {} };
  }, [dataSource, csvItemsLocal, csvUsersLocal, csvEventsLocal, items, users, events]);

  const fp = discoverProfile;
  const gaps = React.useMemo(() => analyzeGaps(fp), [fp]);
  const recommendations = React.useMemo(() => recommendModels(fp), [fp]);
  const actions = React.useMemo(() => generateActionPlan(fp), [fp]);
  const [expandedGap, setExpandedGap] = React.useState(null);
  const [configJson, setConfigJson] = React.useState(null);

  React.useEffect(() => {
    if (resolvedItems.length > 0 && !discoverProfile) {
      setDiscoverProfile(profileDataset(resolvedItems, resolvedUsers, resolvedEvents));
    }
  }, [resolvedItems, resolvedUsers, resolvedEvents, discoverProfile]);

  React.useEffect(() => {
    if (recommendations.length > 0 && fp) {
      var top3 = recommendations.slice(0,3).map(function(r){return r.key;});
      setConfigJson({
        recommended_stack: {
          models: top3,
          fusion: fp.eventCount > 500 ? 'rrf' : fp.coldStartRatio > 0.4 ? 'cascade' : 'avg',
          rationale: 'Based on your dataset: '+fp.catalogSize+' items, '+fp.userCount+' users, '+Math.round((fp.attrDensity||0)*100)+'% attribute density.'
        },
        data_gaps: gaps.filter(function(g){return g.severity==='HIGH';}).map(function(g){return g.mode;}),
        next_steps: actions.slice(0,3).map(function(a){return a.label;})
      });
    }
  }, [recommendations, gaps, actions]);

  const sevColor = (s) => s==='HIGH' ? 'text-red-600 bg-red-50 border-red-200' : s==='MEDIUM' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200';
  const priorityColor = (p) => p==='P0' ? 'bg-red-50 text-red-600' : p==='P1' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Data source toggle */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-semibold text-gray-700">Data Source</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => { setDataSource('sample'); setDiscoverProfile(null); }}
              className={"px-3 py-1.5 text-xs font-medium transition-all " + (dataSource==='sample' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50')}>
              Sample Auction Data
            </button>
            <button onClick={() => setDataSource('csv')}
              className={"px-3 py-1.5 text-xs font-medium transition-all border-l border-gray-200 " + (dataSource==='csv' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50')}>
              Upload CSV
            </button>
          </div>
        </div>

        {dataSource === 'sample' && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
            Analyzing built-in sample dataset: 20 items · 4 users · 10 categories · auction domain.
          </div>
        )}

        {dataSource === 'csv' && (
          <div className="space-y-4">
            {/* Download sample CSVs */}
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs font-semibold text-gray-700 mb-2">Download sample CSVs to see the expected format</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { file: 'sample_items.csv', label: '📦 Items CSV' },
                  { file: 'sample_users.csv', label: '👤 Users CSV' },
                  { file: 'sample_events.csv', label: '📊 Events CSV' },
                ].map(function(dl) {
                  return (
                    <a key={dl.file} href={dl.file} download={dl.file}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all inline-flex items-center gap-1.5">
                      {dl.label} <span className="text-gray-400">↓</span>
                    </a>
                  );
                })}
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Preview expected format</summary>
                <div className="mt-2 space-y-2 font-mono text-[10px] text-gray-600">
                  <div>
                    <div className="font-semibold text-gray-700 mb-0.5">items.csv</div>
                    <div className="bg-white rounded border border-gray-200 p-2 overflow-x-auto whitespace-pre">id,title,category,price,bids,views,tags{'\n'}1,Vintage Rolex Submariner,Watches,12000,47,890,"luxury,vintage,swiss"{'\n'}2,Abstract Oil Painting 1960s,Art,3400,12,230,"art,vintage,painting"</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-0.5">users.csv</div>
                    <div className="bg-white rounded border border-gray-200 p-2 overflow-x-auto whitespace-pre">id,name,history,preferences{'\n'}U1,Alex Chen,"1,4,9,12","luxury,watches"</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-0.5">events.csv</div>
                    <div className="bg-white rounded border border-gray-200 p-2 overflow-x-auto whitespace-pre">user_id,item_id,event_type,timestamp{'\n'}U1,1,view,2025-12-01T10:00:00Z{'\n'}U1,1,bid,2025-12-01T10:05:00Z</div>
                  </div>
                </div>
              </details>
            </div>

            {/* Upload slots */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'items', label: 'Items CSV', hint: 'Columns: id, title, category, price, tags…', file: csvItemsLocal, required: true },
                { type: 'users', label: 'Users CSV', hint: 'Columns: id, name, preferences…', file: csvUsersLocal, required: false },
                { type: 'events', label: 'Events CSV', hint: 'Columns: user_id, item_id, timestamp…', file: csvEventsLocal, required: false },
              ].map(function(slot) {
                return (
                  <div key={slot.type} className={"p-3 rounded-lg border text-center transition-all " + (slot.file ? "border-green-300 bg-green-50/50" : "border-dashed border-gray-300 bg-gray-50")}>
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      {slot.label} {slot.required && <span className="text-red-400">*</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 mb-2">{slot.hint}</div>
                    <label className={"inline-block px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all " + (slot.file ? "bg-green-100 border border-green-300 text-green-700" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {slot.file ? '✓ Loaded' : 'Choose file'}
                      <input type="file" accept=".csv" className="hidden"
                        onChange={function(e) { handleDiscoverCSV(e.target.files[0], slot.type); }} />
                    </label>
                    {slot.file && <div className="text-[10px] text-green-600 mt-1">{slot.file.length} rows parsed</div>}
                  </div>
                );
              })}
            </div>
            {csvError && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{csvError}</div>}
            {csvItemsLocal && (
              <button onClick={() => setDiscoverProfile(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-all">
                Re-analyze uploaded data
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Dataset fingerprint + radar */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dataset Fingerprint</h3>
          {fp && (
            <React.Fragment>
              <div className="flex justify-center">
                <RadarChart signals={fp.signals} size={210}/>
              </div>
              <div className="space-y-1.5">
                {[
                  { label:'Catalog size', val: fp.catalogSize, th:[50,10], fmt: function(v){return v+' items';} },
                  { label:'Attribute density', val: Math.round(fp.attrDensity*100), th:[60,35], fmt: function(v){return v+'%';} },
                  { label:'Users', val: fp.userCount, th:[20,5], fmt: function(v){return ''+v;} },
                  { label:'Events', val: fp.eventCount, th:[200,50], fmt: function(v){return ''+v;} },
                  { label:'Interaction sparsity', val: Math.round(fp.sparsity*100), thInv:[70,90], fmt: function(v){return v+'% sparse';} },
                  { label:'Avg session length', val: parseFloat(fp.avgSessionLen.toFixed(1)), th:[4,2], fmt: function(v){return v+' events';} },
                  { label:'Cold-start ratio', val: Math.round(fp.coldStartRatio*100), thInv:[20,40], fmt: function(v){return v+'% users';} },
                  { label:'Tag coverage', val: Math.round(fp.tagCoverage*100), th:[70,40], fmt: function(v){return v+'%';} },
                  { label:'Text richness', val: parseFloat(fp.textRichness.toFixed(1)), th:[6,3], fmt: function(v){return v+' words avg';} },
                  { label:'Categories', val: fp.categoryCount, th:[8,3], fmt: function(v){return ''+v;} },
                ].map(function(row) {
                  var color = row.thInv
                    ? row.val <= row.thInv[0] ? 'bg-green-500' : row.val <= row.thInv[1] ? 'bg-amber-500' : 'bg-red-500'
                    : row.val >= row.th[0] ? 'bg-green-500' : row.val >= row.th[1] ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-mono">{row.fmt(row.val)}</span>
                        <span className={"w-2 h-2 rounded-full " + color}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>Good</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>Needs work</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Critical</span>
              </div>
            </React.Fragment>
          )}
        </div>

        {/* CENTER: Gaps + recommendations */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Discovery Failure Modes</h3>
            <div className="space-y-2">
              {gaps.map(function(gap) {
                return (
                  <div key={gap.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setExpandedGap(expandedGap===gap.id ? null : gap.id)}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center gap-3 text-left hover:bg-gray-100 transition-all">
                      <span className={"px-2 py-0.5 rounded text-[10px] font-mono border " + sevColor(gap.severity)}>{gap.severity}</span>
                      <span className="text-sm text-gray-800 flex-1">{gap.mode}</span>
                      <span className="text-[10px] text-gray-400">{gap.evidence}</span>
                      <span className="text-gray-400 text-xs">{expandedGap===gap.id?'▲':'▼'}</span>
                    </button>
                    {expandedGap===gap.id && (
                      <div className="px-4 py-3 bg-white border-t border-gray-100 text-sm text-gray-600 space-y-1">
                        <p><span className="text-gray-500 font-medium">Root cause:</span> {gap.cause}</p>
                        <p className="text-gray-400 italic text-xs">{gap.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recommended Models</h3>
            <div className="space-y-3">
              {recommendations.map(function(rec, idx) {
                return (
                  <div key={rec.key} className="p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">{idx+1}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{rec.name}</p>
                        <p className="text-[10px] text-gray-400">{rec.type}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-[10px] text-gray-400">Fit score</p>
                        <p className="font-mono text-blue-600 text-sm">{rec.score}/10</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{width: (rec.score/10)*100+'%'}}/>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-gray-400">Prerequisites:</span>
                      <span className={rec.prereqMet ? 'text-green-600' : 'text-amber-500'}>{rec.prereqMet ? '✓' : '⚠'} {rec.prereq}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Action plan + export */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action Plan</h3>
          <div className="space-y-2">
            {actions.map(function(action) {
              return (
                <div key={action.id} className={"p-3 rounded-lg border transition-all " + (discoverActionsDone.includes(action.id) ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-200 bg-white')}>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={discoverActionsDone.includes(action.id)}
                      onChange={() => setDiscoverActionsDone(function(prev) {
                        return prev.includes(action.id) ? prev.filter(function(id){return id!==action.id;}) : [].concat(prev, [action.id]);
                      })}
                      className="mt-0.5 accent-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={"px-1.5 py-0.5 rounded text-[10px] font-mono " + priorityColor(action.priority)}>{action.priority}</span>
                        <span className="text-xs text-gray-700 font-medium">{action.label}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{action.target}</p>
                      <p className="text-[10px] text-blue-600 mt-0.5">{action.impact}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {configJson && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick-Start Config</h4>
              <pre className="text-[10px] bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto text-green-700 font-mono whitespace-pre-wrap">{JSON.stringify(configJson, null, 2)}</pre>
              <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(JSON.stringify(configJson, null, 2)); }}
                className="mt-2 w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 transition-all">Copy JSON</button>
              <button onClick={() => onLoadIntoWizard(configJson.recommended_stack)}
                className="mt-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-all">Load this config into Wizard →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ TOOL VIEW ═══════════════════════════ */
function ToolView({ initialConfig, onConfigConsumed }) {
  const [wizStep, setWizStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [activeTab, setActiveTab] = useState('learn');
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
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [merchRules, setMerchRules] = useState({});
  const [sessionSignals, setSessionSignals] = useState({});
  const [abExpanded, setAbExpanded] = useState(false);
  const [abTreatmentModels, setAbTreatmentModels] = useState([]);
  const [abResults, setAbResults] = useState(null);
  const [discoverProfile, setDiscoverProfile] = useState(null);
  const [discoverActionsDone, setDiscoverActionsDone] = useState([]);

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
      setWizStep(targetStep); setMaxStep(p => Math.max(p, targetStep));
      setActiveTab('wizard');
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
    selectedModels.forEach(mk => { try { r[mk] = runModel(mk, items, user, users, events, diag, query.trim(), intentWeight, sessionSignals); } catch(e){} });
    setComputeTime(Math.round(performance.now() - t0));
    return r;
  }, [hasRun, selectedModels, items, user, users, events, diag, query, intentWeight, sessionSignals]);

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

  const finalResults = useMemo(() => applyMerchRules(fusedResults, merchRules), [fusedResults, merchRules]);

  const resultsNoQuery = useMemo(() => {
    if (!hasRun || !query) return null;
    const r = {};
    selectedModels.forEach(mk => { try { r[mk] = runModel(mk, items, user, users, events, diag, '', intentWeight, sessionSignals); } catch(e){} });
    return r;
  }, [hasRun, query, selectedModels, items, user, users, events, diag, intentWeight, sessionSignals]);

  const fusedNoQuery = useMemo(() => {
    if (!resultsNoQuery || selectedModels.length < 2) {
      if (resultsNoQuery && selectedModels.length === 1 && resultsNoQuery[selectedModels[0]]) return resultsNoQuery[selectedModels[0]].ranked;
      return null;
    }
    const entries = selectedModels.map(mk=>resultsNoQuery[mk]).filter(Boolean);
    if (entries.length < 2) return null;
    return fuse(fusion, entries, selectedModels.map(mk=>weights[mk]||1/selectedModels.length), cascadeN);
  }, [resultsNoQuery, selectedModels, fusion, weights, cascadeN]);

  const previewSearch = useMemo(() => {
    if (!query) return null;
    try { return runModel('bm25', items, user, users, events, diag, query.trim(), 80, sessionSignals).ranked.slice(0,3); } catch(e) { return null; }
  }, [query, items, user, users, events, diag, sessionSignals]);

  const previewPersonal = useMemo(() => {
    try { return runModel('als', items, user, users, events, diag, '', 0, sessionSignals).ranked.slice(0,3); } catch(e) { return null; }
  }, [items, user, users, events, diag, sessionSignals]);

  const confidence = useMemo(() => computeConfidence(fusedResults, results, selectedModels), [fusedResults, results, selectedModels]);
  const { consensus: consensusIds, unique: uniqueMap } = useMemo(() => computeConsensusAndUnique(results, selectedModels), [results, selectedModels]);
  const catalogHealth = useMemo(() => computeCatalogHealth(items), [items]);
  const parsedIntent = useMemo(() => parseQueryIntent(query), [query]);

  const toggleModel = useCallback(key => setSelectedModels(p => p.includes(key)?p.filter(k=>k!==key):[...p,key]), []);
  const goStep = (n) => { setWizStep(n); setMaxStep(p => Math.max(p, n)); };
  const doRun = () => { setHasRun(true); setSelectedItem(null); setMerchRules({}); goStep(4); };

  const histItems = useMemo(() => user ? user.history.map(id => items.find(i => i.id === id)).filter(Boolean) : [], [user, items]);
  const userTagsAll = useMemo(() => [...new Set([...(user ? user.preferences : []), ...histItems.flatMap(i => i.tags)])], [user, histItems]);
  const userCategories = useMemo(() => [...new Set(histItems.map(i => i.category))], [histItems]);

  const rankMap = useMemo(() => {
    if (!hasRun) return {};
    const rm = {};
    selectedModels.forEach(mk => { (results[mk] && results[mk].ranked || []).forEach((it, idx) => { if (!rm[it.id]) rm[it.id] = {}; rm[it.id][mk] = idx + 1; }); });
    return rm;
  }, [hasRun, selectedModels, results]);

  const scoreCI = useMemo(() => {
    if (!hasRun || !user) return {};
    var history = user.history || [];
    if (history.length < 2) return {};
    var N_BOOT = 20;
    var ci = {};
    selectedModels.forEach(function(modelKey) {
      var itemScores = {};
      for (var b = 0; b < N_BOOT; b++) {
        var dropIdx = b % history.length;
        var subsampledHistory = history.filter(function(_, i){return i !== dropIdx;});
        var fakeUser = Object.assign({}, user, { history: subsampledHistory });
        try {
          var result = runModel(modelKey, items, fakeUser, users, events, diag, query, intentWeight, sessionSignals);
          result.ranked.forEach(function(item) {
            if (!itemScores[item.id]) itemScores[item.id] = [];
            itemScores[item.id].push(item.score);
          });
        } catch(e) {}
      }
      Object.entries(itemScores).forEach(function(entry) {
        var itemId = entry[0], scores = entry[1];
        var mean = scores.reduce(function(a,b){return a+b;},0)/scores.length;
        var variance = scores.reduce(function(s,v){return s+(v-mean)*(v-mean);},0)/scores.length;
        var std = Math.sqrt(variance);
        var range = std / (mean || 1);
        if (!ci[itemId]) ci[itemId] = {};
        ci[itemId][modelKey] = {
          mean: mean, std: std, range: range,
          stability: range < 0.05 ? 'stable' : range < 0.15 ? 'uncertain' : 'noisy'
        };
      });
    });
    return ci;
  }, [hasRun, user, selectedModels, items, users, events, query, intentWeight, sessionSignals]);

  const intentLabel = useMemo(() => {
    const il = INTENT_LABELS.find(l => intentWeight <= l.max) || INTENT_LABELS[INTENT_LABELS.length-1];
    return il.desc.replace('{user}', user ? user.name : 'the user');
  }, [intentWeight, user]);

  const configureFromLearn = useCallback((config) => {
    if (config.models) setSelectedModels(config.models);
    if (config.query !== undefined) setQuery(config.query);
    if (config.fusion) setFusion(config.fusion);
    const targetStep = config.step || 3;
    setWizStep(targetStep); setMaxStep(p => Math.max(p, targetStep));
    setActiveTab('wizard');
  }, []);

  const diagForLearn = useMemo(() => processData(SAMPLE_ITEMS, SAMPLE_USERS, []).diag, []);

  return (
    <div className="fade-up">
      {/* Tab bar for wizard vs learn */}
      <div className="max-w-5xl mx-auto px-4 mb-4 flex gap-2">
        {[['learn','Learn'],['discover','Discover'],['wizard','Wizard']].map(([k,l]) => (
          <button key={k} onClick={()=>setActiveTab(k)} className={"px-4 py-1.5 rounded-lg text-sm font-medium transition-all " + (activeTab===k ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-400 hover:text-gray-700')}>{l}</button>
        ))}
      </div>

      {activeTab === 'learn' && (
        <div className="px-4 py-4"><LearnTab onConfigurePlayground={configureFromLearn} diag={diagForLearn} /></div>
      )}

      {activeTab === 'discover' && (
        <DiscoverTab
          items={items} users={users} events={events}
          discoverProfile={discoverProfile} setDiscoverProfile={setDiscoverProfile}
          discoverActionsDone={discoverActionsDone} setDiscoverActionsDone={setDiscoverActionsDone}
          onLoadIntoWizard={(stack) => {
            setSelectedModels(stack.models || []);
            setFusion(stack.fusion || 'rrf');
            setActiveTab('wizard');
            setWizStep(3);
            setMaxStep(function(p){return Math.max(p, 3);});
          }}
        />
      )}

      {activeTab === 'wizard' && (
        <div className="max-w-5xl mx-auto px-4">
          {showOnboarding && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 flex items-center justify-between">
              <div className="text-sm text-blue-700">New to this? Start at Step 1 and follow the wizard. Each step explains what's happening and why it matters. You don't need to know anything about ML to use this.</div>
              <button onClick={()=>setShowOnboarding(false)} className="text-blue-400 hover:text-blue-600 ml-3 text-lg leading-none">×</button>
            </div>
          )}

          <ToolStepIndicator step={wizStep} setStep={goStep} maxReached={maxStep} />

          {/* ═══ STAGE 1: CATALOG HEALTH ═══ */}
          {wizStep === 1 && (
            <div className="fade-up space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Start with your catalog</h2>
                <p className="text-sm text-gray-500 mt-0.5">Before any model runs, we analyze your product data quality. This is where most discovery problems begin.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={()=>setDataMode('sample')} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " + (dataMode==='sample'?'bg-blue-50 text-blue-600 ring-1 ring-blue-200':'bg-gray-100 text-gray-500')}>Sample Auction Data ✓</button>
                <button onClick={()=>setDataMode('csv')} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " + (dataMode==='csv'?'bg-blue-50 text-blue-600 ring-1 ring-blue-200':'bg-gray-100 text-gray-500')}>Upload CSV</button>
              </div>
              {dataMode === 'sample' && <div className="text-xs text-gray-500 font-mono">{items.length} items · {users.length} users · {[...new Set(items.map(i=>i.category))].length} categories · 19 attributes tracked</div>}

              {dataMode === 'csv' && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[['items','Items CSV *'],['users','Users (optional)'],['events','Events (optional)']].map(([type,label])=>(
                      <div key={type}><label className="text-[11px] font-mono text-gray-400 block mb-1">{label}</label><input type="file" accept=".csv" onChange={e=>handleCSV(e.target.files[0],type)} className="text-xs text-gray-500 w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-gray-200 file:text-gray-800 file:cursor-pointer" /></div>
                    ))}
                  </div>
                  {csvError && <div className="text-xs text-red-500 bg-red-50 rounded-lg p-2 font-mono">{csvError}</div>}
                </div>
              )}

              {/* Health Score */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Catalog Health Score</div>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg width={96} height={96} viewBox="0 0 96 96">
                      <circle cx={48} cy={48} r={40} fill="none" stroke="#e5e7eb" strokeWidth={6} />
                      <circle cx={48} cy={48} r={40} fill="none" stroke={catalogHealth.overall > 80 ? '#22c55e' : catalogHealth.overall > 60 ? '#3b82f6' : '#f59e0b'} strokeWidth={6}
                        strokeDasharray={251} strokeDashoffset={251 - (251 * catalogHealth.overall / 100)} strokeLinecap="round" transform="rotate(-90 48 48)" className="health-ring" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div><div className="text-2xl font-bold text-gray-900 text-center">{catalogHealth.overall}</div><div className="text-[10px] text-gray-400 text-center">/100</div></div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[
                      { label: "Attribute completeness", val: catalogHealth.completeness, detail: Math.round(items.length * catalogHealth.completeness / 100) + "/" + items.length + " items have full tags" },
                      { label: "Title consistency", val: catalogHealth.consistency, detail: "Some titles lack brand/model" },
                      { label: "Category coverage", val: catalogHealth.coverage, detail: Math.round(items.length * catalogHealth.coverage / 100) + "/" + items.length + " correctly categorized" },
                      { label: "Variant grouping", val: catalogHealth.variantScore, detail: "Watches not fully grouped" },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex items-center justify-between mb-0.5"><span className="text-xs text-gray-600">{m.label}</span><span className="text-[10px] font-mono text-gray-400">{m.val}%</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2"><div className="h-full rounded-full grow-bar" style={{ width: m.val + '%', background: m.val > 80 ? '#22c55e' : m.val > 60 ? '#3b82f6' : '#f59e0b' }} /></div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{m.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Issues */}
              <details className="rounded-xl border border-gray-200 bg-white">
                <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-700">Issues Detected</summary>
                <div className="px-4 pb-4 space-y-2">
                  {catalogHealth.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs"><span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span><span className="text-gray-600">{issue.text}</span></div>
                  ))}
                </div>
              </details>

              {/* Attribute Extraction Preview */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Attribute Extraction Preview</div>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-[10px] font-mono text-gray-400 mb-1">RAW TITLE</div>
                  <div className="text-sm font-medium text-gray-900">"Gibson Les Paul 1959 Vintage Sunburst Electric Guitar Used"</div>
                </div>
                <div className="text-[10px] font-mono text-gray-400 mb-2">EXTRACTED</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[["Brand","Gibson"],["Model","Les Paul"],["Year","1959"],["Finish","Sunburst"],["Condition","Used"],["Category","Electric Guitar"]].map(([k,v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 w-16">{k}:</span>
                      <span className="text-[11px] font-medium text-gray-800">{v}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-600">✓ high</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Selector */}
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-3">Who are we recommending to?</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {users.map(u => {
                    const active = activeUser === u.id;
                    const hItems = u.history.map(id => items.find(i => i.id === id)).filter(Boolean);
                    const tagFreq = {}; hItems.forEach(it => it.tags.forEach(t => { tagFreq[t] = (tagFreq[t]||0)+1; }));
                    const topTags = Object.entries(tagFreq).sort((a,b)=>b[1]-a[1]).slice(0,3);
                    return (
                      <button key={u.id} onClick={() => setActiveUser(u.id)}
                        className={"rounded-xl border p-3 text-left transition-all " + (active ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={"w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold " + (active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600")}>{u.name.charAt(0)}</div>
                          <div className="text-xs font-semibold text-gray-900">{u.name}</div>
                        </div>
                        <div className="flex gap-1 mb-1.5 flex-wrap">{u.preferences.map(p => <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{p}</span>)}</div>
                        <div className="flex gap-1 mb-1">{hItems.map(it => <span key={it.id} className="text-sm" title={it.title}>{it.image}</span>)}</div>
                        <div className="text-[9px] text-gray-400 font-mono">{hItems.length} interactions · {topTags.length > 0 ? topTags[0][0] + ' signal' : ''}</div>
                      </button>
                    );
                  })}
                </div>
                {user && (
                  <div className="bg-gray-50 rounded-xl p-3 mt-3 text-sm text-gray-600">
                    <span className="font-medium text-gray-800">{user.name}</span> has engaged with {histItems.length} items across {userCategories.join(', ')}.
                    Strongest signals: <span className="font-mono text-xs text-blue-600">{userTagsAll.slice(0,4).map((t,i) => { const c = histItems.filter(it=>it.tags.includes(t)).length; return t + ' (' + c + '×)'; }).join(', ')}</span>.
                  </div>
                )}
              </div>

              <button onClick={() => goStep(2)} className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.99]">Analyze catalog → Next: Set your query</button>
            </div>
          )}

          {/* ═══ STAGE 2: QUERY & INTENT ═══ */}
          {wizStep === 2 && (
            <div className="fade-up space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">What is the shopper looking for right now?</h2>
                <p className="text-sm text-gray-500 mt-0.5">This is intent injection — separate from history. A watch collector might be shopping for a gift today.</p>
              </div>

              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder='e.g. vintage watch, rare collectible, gift under $5k...'
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200" />
              <div className="flex flex-wrap gap-2">{QUERY_CHIPS.map(chip => (
                <button key={chip} onClick={() => setQuery(chip)} className={"px-3 py-1.5 rounded-full text-xs font-medium transition-all border " + (query === chip ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>{chip}</button>
              ))}</div>

              {/* Intent Parser */}
              {parsedIntent && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Intent Parser</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {parsedIntent.productType && <span className="text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Product: {parsedIntent.productType}</span>}
                    {parsedIntent.attributes.map(a => <span key={a} className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Attr: {a}</span>)}
                    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Price: {parsedIntent.priceSignal || 'none detected'}</span>
                    {parsedIntent.useCase && <span className="text-[11px] px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Use: {parsedIntent.useCase}</span>}
                    <span className={"text-[11px] px-2 py-1 rounded-full border " + (parsedIntent.ambiguity === 'Low' ? "bg-green-50 text-green-700 border-green-200" : parsedIntent.ambiguity === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200")}>Ambiguity: {parsedIntent.ambiguity}</span>
                  </div>
                  <div className={"text-xs font-medium " + (parsedIntent.confidence === 'HIGH' ? "text-green-600" : parsedIntent.confidence === 'MODERATE' ? "text-amber-600" : "text-red-500")}>Query confidence: {parsedIntent.confidence} — {parsedIntent.confidence === 'HIGH' ? 'all models can use this signal' : 'some models may struggle'}</div>
                </div>
              )}

              {/* Intent Slider */}
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">How much should this query override {user.name}'s personal taste?</div>
                <input type="range" min="0" max="100" value={intentWeight} onChange={e => setIntentWeight(parseInt(e.target.value))} className="w-full" />
                <div className="flex justify-between mt-1"><span className="text-[10px] text-gray-400">Pure personalization</span><span className="text-[10px] text-gray-400">Pure search match</span></div>
                <div className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 font-medium">{intentLabel}</div>
              </div>

              {/* How each model uses query */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">How each model uses your query</div>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gray-100"><th className="text-left py-1.5 text-gray-400 font-mono font-normal">Model</th><th className="text-center py-1.5 text-gray-400 font-mono font-normal">Uses query?</th><th className="text-left py-1.5 text-gray-400 font-mono font-normal">How</th></tr></thead>
                  <tbody>
                    {TOOL_MODELS.map(m => (
                      <tr key={m.key} className="border-b border-gray-50">
                        <td className="py-1.5 font-medium" style={{color:m.color}}>{m.name}</td>
                        <td className="py-1.5 text-center">
                          <span className={"text-[9px] font-mono px-1.5 py-0.5 rounded " + (m.searchUsage === 'USES' ? "bg-green-50 text-green-600" : m.searchUsage === 'PARTIAL' ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400")}>{m.searchUsage === 'USES' ? '● Yes' : m.searchUsage === 'PARTIAL' ? '◑ Partial' : '○ No'}</span>
                        </td>
                        <td className="py-1.5 text-gray-500">{m.searchExplanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Preview */}
              {query && previewSearch && previewPersonal && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Early preview — how results shift with your query</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-medium text-purple-600 mb-2">Without query (personalization)</div>
                      {previewPersonal.map((it, i) => (<div key={it.id} className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono text-gray-400">#{i+1}</span><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span></div>))}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-teal-600 mb-2">With query (search)</div>
                      {previewSearch.map((it, i) => (<div key={it.id} className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono text-gray-400">#{i+1}</span><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span></div>))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                Your history tells models WHO you are. Your query tells models WHAT you want right now. The best systems blend both signals — which is exactly what controlling the slider above lets you do.
              </div>

              <div className="flex gap-3">
                <button onClick={() => goStep(1)} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">← Back</button>
                <button onClick={() => goStep(3)} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.99]">Set intent → Next: Choose models</button>
              </div>
            </div>
          )}

          {/* ═══ STAGE 3: MODEL CONFIGURATION ═══ */}
          {wizStep === 3 && (
            <div className="fade-up space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Choose your models</h2>
                <p className="text-sm text-gray-500 mt-0.5">Pick one or more. With 2+, you can fuse their outputs. Each model sees the catalog differently.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TOOL_MODELS.map(m => {
                  const active = selectedModels.includes(m.key);
                  return (
                    <button key={m.key} onClick={() => toggleModel(m.key)}
                      className={"rounded-xl border p-3 text-left transition-all " + (active ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: active ? m.color : '#d1d5db'}} />
                        <span className="text-xs font-semibold text-gray-800">{m.name}</span>
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-gray-100 text-gray-500 ml-auto">{m.typeBadge}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 leading-tight mb-1.5">{m.summary.split('.')[0]}.</div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="flex gap-0.5">{[1,2,3].map(d => <span key={d} className={"w-1.5 h-1.5 rounded-full " + (d <= m.complexity ? "bg-gray-600" : "bg-gray-200")} />)}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">{m.bestFor}</span>
                      </div>
                      <div className="text-[9px] text-gray-400 italic">{m.tradeoff}</div>
                    </button>
                  );
                })}
              </div>

              {/* Status */}
              {selectedModels.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                  You've selected <span className="font-bold text-gray-800">{selectedModels.length}</span> model{selectedModels.length !== 1 ? 's' : ''}{selectedModels.length >= 2 ? ' using ' + (FUSIONS.find(f=>f.key===fusion)||{}).name : ' — single model mode'}.
                </div>
              )}

              {selectedModels.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-sm text-gray-500">Select at least one model above.</div>
                  <div className="text-xs text-gray-400 mt-1">Not sure? Try <button onClick={() => toggleModel('als')} className="text-blue-600 underline">ALS</button>.</div>
                </div>
              )}

              {/* Fusion */}
              {selectedModels.length >= 2 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Fusion Strategy</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FUSIONS.map(f => (
                      <button key={f.key} onClick={() => setFusion(f.key)}
                        className={"rounded-lg border p-2.5 text-left transition-all " + (fusion===f.key ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300")}>
                        <div className="flex items-center gap-2"><FusionMiniDiagram type={f.key} /><div><div className="text-[11px] font-semibold text-gray-700">{f.name}</div><div className="text-[9px] text-gray-400 leading-tight">{f.chooseIf}</div></div></div>
                      </button>
                    ))}
                  </div>
                  {fusion === 'weighted' && (
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      <div className="text-[11px] text-gray-500">Adjust weights (sum to 100%)</div>
                      {selectedModels.map(mk => {
                        const md = MODELS.find(m=>m.key===mk);
                        const val = Math.round((weights[mk]||1/selectedModels.length)*100);
                        return (<div key={mk} className="flex items-center gap-2"><span className="text-[10px] font-mono w-20 truncate" style={{color:md&&md.color}}>{md&&md.name}</span><input type="range" min="0" max="100" value={val} onChange={e=>setWeights(p=>({...p,[mk]:parseInt(e.target.value)/100}))} className="flex-1" /><span className="text-[10px] font-mono text-gray-500 w-8 text-right">{val}%</span></div>);
                      })}
                    </div>
                  )}
                  {fusion === 'cascade' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <span className="text-[11px] text-gray-500">Top-N from first model:</span>
                      <input type="range" min="3" max="15" value={cascadeN} onChange={e=>setCascadeN(parseInt(e.target.value))} className="flex-1" />
                      <span className="text-xs font-mono text-blue-600">{cascadeN}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => goStep(2)} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">← Back</button>
                <button onClick={doRun} disabled={!selectedModels.length} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.99]">Configure models → Next: See results</button>
              </div>
            </div>
          )}

          {/* ═══ STAGE 4: RESULTS + EXPLAINABILITY ═══ */}
          {wizStep === 4 && hasRun && (
            <div className="fade-up space-y-5">
              {/* Summary bar */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono bg-gray-50 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white">{user.name.charAt(0)}</div>
                <span className="text-gray-700">{user.name}</span><span className="text-gray-300">|</span>
                <span className="text-gray-500">{(fusedResults||[]).length} results</span><span className="text-gray-300">|</span>
                <span className="flex gap-1">{selectedModels.map(mk => { const md = MODELS.find(m=>m.key===mk); return <span key={mk} className="px-1.5 py-0.5 rounded text-[9px]" style={{background:(md&&md.color||'#999')+'22',color:md&&md.color}}>{md&&md.name}</span>;})}</span>
                {selectedModels.length >= 2 && <React.Fragment><span className="text-gray-300">|</span><span className="text-blue-600">{(FUSIONS.find(f=>f.key===fusion)||{}).name}</span></React.Fragment>}
                {query && <React.Fragment><span className="text-gray-300">|</span><span className="text-amber-600">"{query}"</span></React.Fragment>}
                <span className="text-gray-300">|</span><span className="text-gray-400">{computeTime}ms</span>
                {Object.keys(sessionSignals).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block"/>
                    Learning from session
                  </span>
                )}
              </div>

              {/* Confidence */}
              {selectedModels.length >= 2 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Recommendation Confidence</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: confidence+'%', background: confidence > 90 ? '#16a34a' : confidence > 70 ? '#3b82f6' : confidence > 40 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <span className="text-sm font-mono font-medium" style={{color: confidence > 90 ? '#16a34a' : confidence > 70 ? '#3b82f6' : confidence > 40 ? '#f59e0b' : '#ef4444'}}>{confidence}%</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1.5">{confidence > 90 ? "Very high — full consensus" : confidence > 70 ? "High — strong multi-model signal" : confidence > 40 ? "Moderate — partial agreement" : "Low — models disagree"}</div>
                </div>
              )}

              {/* Consensus vs Unique */}
              {selectedModels.length >= 2 && (consensusIds.length > 0 || Object.keys(uniqueMap).length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-4">
                    <div className="text-xs font-mono text-teal-600 uppercase tracking-wider mb-2">★ Consensus Picks</div>
                    <p className="text-[11px] text-gray-500 mb-2">All {selectedModels.length} models agreed on these</p>
                    {consensusIds.length > 0 ? consensusIds.map(id => { const it = items.find(i => i.id === id); return it ? (<div key={id} className="flex items-center gap-2 mb-1.5"><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700">{it.title.split(' ').slice(0,4).join(' ')}</span><span className="text-[9px] text-yellow-600">⭐</span></div>) : null; }) : <div className="text-[11px] text-gray-400 italic">No items in every model's top 5</div>}
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                    <div className="text-xs font-mono text-amber-600 uppercase tracking-wider mb-2">◆ Unique Discoveries</div>
                    <p className="text-[11px] text-gray-500 mb-2">You'd miss these without that model</p>
                    {Object.keys(uniqueMap).length > 0 ? Object.entries(uniqueMap).map(([mk, ids]) => { const md = MODELS.find(m => m.key === mk); return ids.slice(0,2).map(id => { const it = items.find(i => i.id === id); return it ? (<div key={id} className="flex items-center gap-2 mb-1.5"><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span><span className="text-[9px] font-mono px-1 rounded" style={{background:(md&&md.color||'#999')+'22',color:md&&md.color}}>only {md&&md.name}</span></div>) : null; }); }) : <div className="text-[11px] text-gray-400 italic">No unique discoveries</div>}
                  </div>
                </div>
              )}

              {/* Results + Detail Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">{selectedModels.length >= 2 ? "Fused Results" : (MODELS.find(m=>m.key===selectedModels[0])||{}).name + " Results"}</h3>
                  {(fusedResults || []).map((it, i) => {
                    const reasons = generateReasons(it, user, items, results, selectedModels, fusedResults, query);
                    const modelRanks = rankMap[it.id] || {};
                    const maxScore = Math.max(...(fusedResults||[]).map(x => x.score), 0.001);
                    const pct = Math.round((it.score / maxScore) * 100);
                    const isSelected = selectedItem && selectedItem.id === it.id;
                    return (
                      <div key={it.id} onClick={() => {
                        setSelectedItem(it);
                        setSessionSignals(prev => ({
                          ...prev,
                          [it.id]: {
                            views: ((prev[it.id] && prev[it.id].views) || 0) + 1,
                            lastSeen: Date.now()
                          }
                        }));
                      }}
                        className={"rounded-xl border p-3 cursor-pointer transition-all " + (isSelected ? "border-blue-300 bg-blue-50/30 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                        <div className="flex items-start gap-3">
                          <span className="text-lg font-mono text-gray-300 w-7 text-right mt-0.5">#{i+1}</span>
                          <span className="text-2xl">{it.image}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">{it.title}</div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5 font-mono">
                              <span>{it.category}</span><span className="text-gray-800">${it.price?it.price.toLocaleString():'0'}</span><span>{it.bids} bids</span><span>{it.views?it.views.toLocaleString():'0'} views</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className="h-full rounded-full grow-bar bg-blue-500" style={{width:pct+'%',animationDelay:i*0.05+'s'}} /></div>
                              <span className="text-[10px] font-mono text-green-600 w-8 text-right">{pct}%</span>
                            </div>
                            {reasons.length > 0 && <div className="mt-1.5 space-y-0.5">{reasons.map((r, ri) => <div key={ri} className="text-[11px] text-gray-500">{r}</div>)}</div>}
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {selectedModels.map(mk => {
                                const md = MODELS.find(m=>m.key===mk); const mRank = modelRanks[mk]; if (!mRank) return null;
                                const delta = mRank - (i + 1);
                                return (<span key={mk} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{background:(md&&md.color||'#999')+'15',color:md&&md.color}}>{md&&md.name} #{mRank}{selectedModels.length >= 2 && delta !== 0 && (<span className={delta > 0 ? "text-green-600" : "text-red-500"}>{delta > 0 ? '↑'+delta : '↓'+Math.abs(delta)}</span>)}</span>);
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detail panel */}
                <div className="lg:col-span-2">
                  {selectedItem ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 sticky top-20 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{selectedItem.image}</div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">{selectedItem.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs"><span className="text-gray-500">{selectedItem.category}</span><span className="font-mono text-purple-600">${selectedItem.price?selectedItem.price.toLocaleString():'0'}</span></div>
                          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-1"><span>{selectedItem.bids} bids</span><span>{selectedItem.views?selectedItem.views.toLocaleString():'0'} views</span></div>
                          <div className="flex flex-wrap gap-1 mt-2">{(selectedItem.tags||[]).map(t => <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>)}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Score breakdown</div>
                        {selectedModels.map(mk => {
                          const md = MODELS.find(m => m.key === mk); const r = results[mk];
                          const found = r && r.ranked.find(x => x.id === selectedItem.id);
                          const maxS = r ? Math.max(...r.ranked.map(x => x.score), 0.001) : 1;
                          const barPct = found ? Math.round((found.score / maxS) * 100) : 0;
                          var ciData = selectedItem && scoreCI[selectedItem.id] && scoreCI[selectedItem.id][mk];
                          return (<div key={mk} className="mb-2"><div className="flex items-center gap-2 mb-0.5"><span className="text-[10px] font-mono w-16 truncate" style={{color:md&&md.color}}>{md&&md.name}</span><div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-full rounded-full" style={{width:barPct+'%',background:md&&md.color}} /></div><span className="text-[10px] font-mono text-gray-400 w-10 text-right">{found?found.score.toFixed(3):'—'}</span>{ciData && <span className={"text-[9px] ml-1 " + (ciData.stability==='stable'?'text-green-600':ciData.stability==='uncertain'?'text-amber-500':'text-red-500')}>±{(ciData.std*100).toFixed(1)}% {ciData.stability}</span>}</div><div className="text-[10px] text-gray-500 ml-[68px]">{whyModelLiked(mk, selectedItem, user, items)}</div></div>);
                        })}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">Similar items</div>
                        {findSimilarItems(selectedItem, items, 3).map(sim => (
                          <div key={sim.id} onClick={() => setSelectedItem(sim)} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors mb-1">
                            <span className="text-base">{sim.image}</span><div className="flex-1 min-w-0"><div className="text-xs text-gray-700 truncate">{sim.title}</div><div className="text-[10px] text-gray-400">{sim.category} · ${sim.price?sim.price.toLocaleString():'0'}</div></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center sticky top-20"><div className="text-2xl mb-2">👆</div><div className="text-sm text-gray-400">Click a result to see detailed analysis</div></div>
                  )}
                </div>
              </div>

              {/* Search Impact */}
              {query && fusedResults && fusedNoQuery && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Your Search Impact</div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-[11px] font-medium text-gray-500 mb-2">Without "{query}"</div>
                      {(fusedNoQuery||[]).slice(0,3).map((it,i) => (<div key={it.id} className="flex items-center gap-2 mb-1 opacity-50"><span className="text-[10px] font-mono text-gray-400">#{i+1}</span><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span></div>))}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-teal-600 mb-2">With "{query}"</div>
                      {fusedResults.slice(0,3).map((it,i) => (<div key={it.id} className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono text-teal-500">#{i+1}</span><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span></div>))}
                    </div>
                  </div>
                </div>
              )}

              {/* What combining did */}
              {selectedModels.length >= 2 && fusedResults && (
                <details className="rounded-xl border border-gray-200 bg-white">
                  <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">What did combining models do?</summary>
                  <div className="px-4 pb-4 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-400 font-mono font-normal">Item</th>{selectedModels.map(mk => <th key={mk} className="text-center py-2 font-mono font-normal" style={{color:(MODELS.find(m=>m.key===mk)||{}).color}}>{(MODELS.find(m=>m.key===mk)||{}).name}</th>)}<th className="text-center py-2 text-blue-600 font-mono font-normal">Merged</th><th className="text-center py-2 text-gray-400 font-mono font-normal">Δ</th></tr></thead>
                      <tbody>
                        {fusedResults.slice(0,8).map((it, fi) => {
                          const mr = rankMap[it.id] || {};
                          const avgOrig = selectedModels.reduce((s, mk) => s + (mr[mk] || 11), 0) / selectedModels.length;
                          const delta = Math.round(avgOrig - (fi + 1));
                          return (<tr key={it.id} className="border-b border-gray-50"><td className="py-1.5 text-gray-700">{it.image} {it.title.split(' ').slice(0,3).join(' ')}</td>{selectedModels.map(mk => <td key={mk} className="text-center py-1.5 font-mono text-gray-500">{mr[mk]?'#'+mr[mk]:'—'}</td>)}<td className="text-center py-1.5 font-mono font-medium text-blue-600">#{fi+1}</td><td className="text-center py-1.5 font-mono">{delta > 0 ? <span className="text-green-600">↑{delta}</span> : delta < 0 ? <span className="text-red-500">↓{Math.abs(delta)}</span> : <span className="text-gray-300">—</span>}</td></tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}

              {/* A/B Test Simulator */}
              {hasRun && selectedModels.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <button onClick={() => setAbExpanded(v => !v)} className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-100 transition-all">
                    <span className="font-semibold">⚗ Simulate A/B Test</span>
                    <span className="text-gray-400">{abExpanded ? '▲' : '▼'}</span>
                  </button>
                  {abExpanded && (
                    <div className="p-4 space-y-4">
                      <p className="text-xs text-gray-500">Compare your current stack (Control) against an alternative (Treatment) using 100 synthetic users. Directional estimates only.</p>
                      <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Treatment stack (pick models):</p>
                        <div className="flex flex-wrap gap-2">
                          {MODELS.filter(function(m){return m.key!=='bm25';}).map(function(md) {
                            return (
                              <button key={md.key} onClick={() => setAbTreatmentModels(prev => prev.includes(md.key) ? prev.filter(function(k){return k!==md.key;}) : [].concat(prev, [md.key]))}
                                className={"px-3 py-1 rounded-full text-xs border transition-all " + (abTreatmentModels.includes(md.key) ? 'bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-200' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}>
                                {md.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button onClick={() => { var r = simulateAB(selectedModels, abTreatmentModels, users, items, events, diag, query, intentWeight, sessionSignals); setAbResults(r); }}
                        disabled={abTreatmentModels.length === 0}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-sm text-white font-medium transition-all">
                        Run simulation (100 users)
                      </button>
                      {abResults && (function() {
                        var metrics = ['ctr','precision5','recall10'];
                        var labels = { ctr:'CTR (engagement)', precision5:'Precision@5', recall10:'Recall@10' };
                        return (
                          <div>
                            <table className="w-full text-sm">
                              <thead><tr className="text-gray-500 text-xs"><th className="text-left py-1">Metric</th><th className="text-right py-1">Control</th><th className="text-right py-1">Treatment</th><th className="text-right py-1">Δ</th></tr></thead>
                              <tbody>
                                {metrics.map(function(m) {
                                  var ctrl = abResults.control[m];
                                  var trt  = abResults.treatment[m];
                                  var delta = trt - ctrl;
                                  var winner = Math.abs(delta) < 0.02 ? 'tie' : delta > 0 ? 'treatment' : 'control';
                                  return (
                                    <tr key={m} className="border-t border-gray-100">
                                      <td className="py-2 text-gray-600">{labels[m]}</td>
                                      <td className={"text-right py-2 " + (winner==='control'?'text-green-600 font-bold':'text-gray-600')}>{(ctrl*100).toFixed(1)}%</td>
                                      <td className={"text-right py-2 " + (winner==='treatment'?'text-green-600 font-bold':'text-gray-600')}>{(trt*100).toFixed(1)}%</td>
                                      <td className={"text-right py-2 text-xs " + (delta>0.02?'text-green-600':delta<-0.02?'text-red-500':'text-gray-400')}>{delta>=0?'+':''}{(delta*100).toFixed(1)}%</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-400 mt-2 italic">Simulated with synthetic users derived from seed profiles. Directional only.</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Model Internals */}
              <details className="rounded-xl border border-gray-200 bg-white">
                <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">Model Internals & Visualizations</summary>
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedModels.map(mk => {
                    const r = results[mk]; const md = MODELS.find(m=>m.key===mk);
                    if (!r) return null;
                    return (<div key={mk} className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full" style={{background:md&&md.color}} /><span className="text-xs font-semibold text-gray-700">{md&&md.name}</span><span className="text-[10px] font-mono text-gray-400">{md&&md.full}</span></div>{r.viz && <ModelViz modelKey={mk} viz={r.viz} color={md&&md.color} items={items} />}</div>);
                  })}
                </div>
              </details>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => goStep(1)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300">← Change user</button>
                <button onClick={() => goStep(2)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300">← Edit query</button>
                <button onClick={() => goStep(3)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300">← Add a model</button>
                <button onClick={() => { setHasRun(false); setTimeout(() => setHasRun(true), 50); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300">Re-run ↺</button>
              </div>

              <button onClick={() => goStep(5)} className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.99]">Apply merchandising rules → Next: Merch controls</button>
            </div>
          )}

          {/* ═══ STAGE 5: MERCHANDISING CONTROLS ═══ */}
          {wizStep === 5 && hasRun && fusedResults && (
            <div className="fade-up space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Apply business rules</h2>
                <p className="text-sm text-gray-500 mt-0.5">Boost, bury, or pin items on top of model scores — and see exactly how your rules interact with relevance.</p>
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Boost high-margin items", fn: () => { const r = {}; fusedResults.slice(0,3).forEach(it => { r[it.id] = 'boost'; }); setMerchRules(r); }},
                  { label: "Bury low-inventory", fn: () => { const r = {}; fusedResults.slice(-2).forEach(it => { r[it.id] = 'bury'; }); setMerchRules(r); }},
                  { label: "Pin seasonal campaign", fn: () => { const r = {}; if (fusedResults[3]) r[fusedResults[3].id] = 'pin'; setMerchRules(r); }},
                  { label: "Clear all rules", fn: () => setMerchRules({}) },
                ].map((preset, i) => (
                  <button key={i} onClick={preset.fn} className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-all">{preset.label}</button>
                ))}
              </div>

              {/* Rule Builder */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Rule Builder</div>
                {fusedResults.slice(0, 8).map((it, i) => {
                  const rule = merchRules[it.id] || null;
                  return (
                    <div key={it.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                      <span className="text-base">{it.image}</span>
                      <span className="text-xs text-gray-800 flex-1 truncate">{it.title}</span>
                      <span className="text-[10px] font-mono text-gray-400">score: {it.score.toFixed(2)}</span>
                      <div className="flex gap-1">
                        {[['boost','▲ Boost','bg-green-50 text-green-600 border-green-200'],['bury','▼ Bury','bg-red-50 text-red-600 border-red-200'],['pin','📌 Pin #1','bg-blue-50 text-blue-600 border-blue-200'],[null,'– None','bg-gray-50 text-gray-500 border-gray-200']].map(([val, label, cls]) => (
                          <button key={label} onClick={() => setMerchRules(p => { const n = {...p}; if (val) n[it.id] = val; else delete n[it.id]; return n; })}
                            className={"px-2 py-1 rounded text-[10px] font-medium border transition-all " + (rule === val ? cls + " ring-1 ring-offset-1" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300")}>{label}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Rank Preview */}
              {Object.keys(merchRules).length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Live Rank Preview</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-medium text-gray-500 mb-2">Before rules</div>
                      {fusedResults.slice(0, 5).map((it, i) => (<div key={it.id} className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono text-gray-400">#{i+1}</span><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span></div>))}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-blue-600 mb-2">After rules</div>
                      {finalResults.slice(0, 5).map((it, i) => {
                        const origIdx = fusedResults.findIndex(x => x.id === it.id);
                        const delta = origIdx - i;
                        return (<div key={it.id} className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-blue-500">#{i+1}</span><span className="text-sm">{it.image}</span><span className="text-xs text-gray-700 truncate">{it.title.split(' ').slice(0,3).join(' ')}</span>
                          {it.merchRule && <span className={"text-[9px] px-1 rounded " + (it.merchRule === 'pin' ? 'bg-blue-100 text-blue-600' : it.merchRule === 'boost' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>{it.merchRule === 'pin' ? '📌 pinned' : it.merchRule === 'boost' ? '▲ boosted' : '▼ buried'}</span>}
                          {delta !== 0 && <span className={"text-[9px] font-mono " + (delta > 0 ? "text-green-600" : "text-red-500")}>{delta > 0 ? '↑'+delta : '↓'+Math.abs(delta)}</span>}
                        </div>);
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Rule Transparency */}
              {Object.keys(merchRules).length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-2">
                  <div className="text-xs font-mono text-amber-600 uppercase tracking-wider mb-1">Rule Transparency</div>
                  {Object.entries(merchRules).map(([id, rule]) => {
                    const it = items.find(i => i.id === parseInt(id));
                    if (!it) return null;
                    const origIdx = fusedResults.findIndex(x => x.id === it.id);
                    const modelsAgreeing = selectedModels.filter(mk => results[mk] && results[mk].ranked.slice(0, 3).some(x => x.id === it.id)).length;
                    const conflictsAll = rule === 'bury' && modelsAgreeing === selectedModels.length;
                    return (
                      <div key={id} className={"text-xs p-2 rounded-lg " + (conflictsAll ? "bg-red-50 border border-red-200" : "bg-white border border-gray-100")}>
                        {rule === 'pin' && <span>Your <span className="font-bold">pin</span> of {it.image} {it.title.split(' ').slice(0,3).join(' ')} overrides model rank #{origIdx + 1}. </span>}
                        {rule === 'boost' && <span>Your <span className="font-bold">boost</span> of {it.image} {it.title.split(' ').slice(0,3).join(' ')} multiplies score ×1.5. </span>}
                        {rule === 'bury' && <span>Your <span className="font-bold">bury</span> of {it.image} {it.title.split(' ').slice(0,3).join(' ')} reduces score ×0.3. </span>}
                        {conflictsAll && <span className="text-red-600 font-medium">⚠ This override strongly conflicts with model consensus — all {selectedModels.length} models ranked it in their top 3.</span>}
                        {!conflictsAll && modelsAgreeing > 0 && <span className="text-gray-500">{modelsAgreeing} model{modelsAgreeing>1?'s':''} ranked it in top 3.</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => goStep(4)} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">← Back to results</button>
                <button onClick={() => { setWizStep(1); setMaxStep(1); setHasRun(false); setSelectedModels([]); setMerchRules({}); setQuery(''); }} className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 transition-all">Start over</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */
function App() {
  const [view, setView] = useState('landing');
  const [toolConfig, setToolConfig] = useState(null);

  const enterTool = useCallback((config) => {
    if (config) setToolConfig(config);
    setView('tool');
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-body">
      <StyleTag />

      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2.5">
            <svg width={24} height={24} viewBox="0 0 24 24"><polygon points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5" fill="none" stroke="#3b82f6" strokeWidth="1.5"/><polygon points="12,5 18,8.5 18,15.5 12,19 6,15.5 6,8.5" fill="none" stroke="#3b82f6" strokeWidth="1" opacity=".4"/><circle cx="12" cy="12" r="2" fill="#3b82f6"/></svg>
            <span className="font-bold text-sm tracking-tight text-gray-900">Discovery Intelligence OS</span>
          </button>
          <nav className="flex items-center gap-2">
            {view === 'landing' ? (
              <button onClick={() => enterTool()} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all">See it live →</button>
            ) : (
              <button onClick={() => setView('landing')} className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-all">← Landing</button>
            )}
          </nav>
        </div>
      </header>

      <main>
        {view === 'landing' && <LandingPage onEnterTool={() => enterTool()} />}
        {view === 'tool' && <div className="py-6"><ToolView initialConfig={toolConfig} onConfigConsumed={() => setToolConfig(null)} /></div>}
      </main>
    </div>
  );
}

window.App = App;
