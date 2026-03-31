const { useState, useMemo, useCallback, useEffect } = React;

/* ─────────────────────── STYLE TAG ─────────────────────── */
const StyleTag = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
    .font-syne { font-family: 'Syne', sans-serif; }
    .font-jet { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0a0e1a; }
    ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #374151; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 8px rgba(0,212,255,0.2); } 50% { box-shadow: 0 0 20px rgba(0,212,255,0.5); } }
    @keyframes bar-grow { from { width: 0; } }
    .anim-fade { animation: fadeIn 0.35s ease-out both; }
    .anim-slide { animation: slideRight 0.3s ease-out both; }
    .pulse-border { animation: pulse-glow 2s ease-in-out infinite; }
    .bar-anim { animation: bar-grow 0.6s ease-out both; }
    input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #00d4ff; cursor: pointer; }
    input[type="range"] { -webkit-appearance: none; background: #1f2937; height: 4px; border-radius: 2px; }
  ` }} />
);

/* ─────────────────────── SAMPLE DATA ─────────────────────── */
const AUCTION_ITEMS = [
  { id: 1, title: "Vintage Rolex Submariner", category: "Watches", price: 12000, bids: 47, views: 890, tags: ["luxury", "vintage", "swiss"], image: "⌚" },
  { id: 2, title: "Abstract Oil Painting 1960s", category: "Art", price: 3400, bids: 12, views: 230, tags: ["art", "vintage", "painting"], image: "🎨" },
  { id: 3, title: "Gibson Les Paul 1959", category: "Music", price: 45000, bids: 89, views: 2100, tags: ["guitar", "vintage", "music"], image: "🎸" },
  { id: 4, title: "Diamond Engagement Ring", category: "Jewelry", price: 8500, bids: 34, views: 670, tags: ["luxury", "jewelry", "diamond"], image: "💍" },
  { id: 5, title: "Rare Baseball Card Babe Ruth", category: "Sports", price: 22000, bids: 61, views: 1450, tags: ["sports", "collectible", "rare"], image: "⚾" },
  { id: 6, title: "Louis Vuitton Trunk 1920s", category: "Fashion", price: 6700, bids: 28, views: 540, tags: ["luxury", "vintage", "fashion"], image: "👜" },
  { id: 7, title: "First Edition Hemingway", category: "Books", price: 4100, bids: 19, views: 310, tags: ["rare", "books", "collectible"], image: "📚" },
  { id: 8, title: "Porsche 911 1973", category: "Cars", price: 85000, bids: 102, views: 3800, tags: ["vintage", "cars", "luxury"], image: "🏎️" },
  { id: 9, title: "Cartier Brooch Art Deco", category: "Jewelry", price: 5200, bids: 22, views: 410, tags: ["luxury", "jewelry", "art deco"], image: "✨" },
  { id: 10, title: "NASA Apollo Mission Patch", category: "Space", price: 1800, bids: 55, views: 920, tags: ["space", "collectible", "rare"], image: "🚀" },
  { id: 11, title: "Tiffany Lamp 1905", category: "Art", price: 9300, bids: 38, views: 760, tags: ["art", "vintage", "luxury"], image: "🪔" },
  { id: 12, title: "Omega Speedmaster 1969", category: "Watches", price: 15000, bids: 71, views: 1620, tags: ["luxury", "vintage", "space"], image: "⌚" },
  { id: 13, title: "Stradivarius Violin Bow", category: "Music", price: 31000, bids: 44, views: 1100, tags: ["music", "rare", "collectible"], image: "🎻" },
  { id: 14, title: "Mickey Mantle Rookie Card", category: "Sports", price: 18000, bids: 77, views: 2300, tags: ["sports", "collectible", "rare"], image: "🃏" },
  { id: 15, title: "Chanel No. 5 Vintage Bottle", category: "Fashion", price: 950, bids: 41, views: 580, tags: ["fashion", "vintage", "collectible"], image: "🌸" },
  { id: 16, title: "WWII German Enigma Machine", category: "History", price: 27000, bids: 33, views: 890, tags: ["history", "rare", "collectible"], image: "🔐" },
  { id: 17, title: "Banksy Signed Print", category: "Art", price: 7600, bids: 58, views: 1740, tags: ["art", "modern", "rare"], image: "🖼️" },
  { id: 18, title: "Faberge Egg Replica", category: "Art", price: 4400, bids: 16, views: 290, tags: ["art", "luxury", "collectible"], image: "🥚" },
  { id: 19, title: "Meteorite Fragment Mars", category: "Space", price: 11000, bids: 29, views: 640, tags: ["space", "rare", "science"], image: "🌑" },
  { id: 20, title: "Zippo Vietnam War Lighter", category: "History", price: 2200, bids: 63, views: 1050, tags: ["history", "vintage", "collectible"], image: "🔥" },
];

const USERS = [
  { id: "U1", name: "Alex Chen", history: [1, 4, 9, 12], preferences: ["luxury", "watches"] },
  { id: "U2", name: "Maria Santos", history: [2, 7, 11, 17], preferences: ["art", "vintage"] },
  { id: "U3", name: "James Wright", history: [3, 13, 5, 14], preferences: ["music", "sports"] },
  { id: "U4", name: "Priya Patel", history: [8, 19, 10, 16], preferences: ["cars", "space", "history"] },
];

/* ─────────────────────── MODEL METADATA ─────────────────────── */
const MODEL_DEFS = [
  { key: "als", name: "ALS", full: "Alternating Least Squares", color: "#00d4ff", desc: "Matrix factorization via latent user-item factors" },
  { key: "ease", name: "EASE", full: "Embarrassingly Shallow Autoencoders", color: "#7c3aed", desc: "Item-item similarity autoencoder" },
  { key: "twotower", name: "Two-Tower", full: "Neural Retrieval", color: "#f59e0b", desc: "Dual encoder: user tower + item tower" },
  { key: "sasrec", name: "SASRec", full: "Self-Attentive Sequential", color: "#10b981", desc: "Sequential recommendation with attention" },
  { key: "item2vec", name: "Item2Vec", full: "Item Embeddings", color: "#ef4444", desc: "Co-occurrence based item embeddings" },
  { key: "lightgbm", name: "LightGBM", full: "Gradient Boosted Trees", color: "#f97316", desc: "Feature-based gradient boosted scoring" },
  { key: "rising", name: "Rising Pop.", full: "Rising Popularity", color: "#ec4899", desc: "Trending engagement momentum" },
  { key: "widedeep", name: "Wide & Deep", full: "Wide & Deep Network", color: "#06b6d4", desc: "Memorization (wide) + generalization (deep)" },
];

const FUSION_STRATEGIES = [
  { key: "avg", name: "Score Averaging" },
  { key: "rrf", name: "Reciprocal Rank Fusion" },
  { key: "weighted", name: "Weighted Blend" },
  { key: "cascade", name: "Cascade" },
];

/* ─────────────────────── CSV PARSING ─────────────────────── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

/* ─────────────────────── SCHEMA INFERENCE ─────────────────────── */
const ITEM_ALIASES = {
  id: ['id', 'item_id', 'listing_id'],
  title: ['title', 'item_name', 'name', 'auction_title'],
  category: ['category', 'department', 'group', 'vertical'],
  price: ['price', 'current_price', 'start_price', 'amount'],
  bids: ['bids', 'bid_count', 'num_bids'],
  views: ['views', 'view_count', 'page_views', 'impressions', 'watch_count'],
  tags: ['tags', 'keywords', 'labels'],
  image: ['image', 'emoji', 'thumbnail', 'icon'],
  description: ['description', 'desc', 'details'],
};

const USER_ALIASES = {
  id: ['id', 'user_id', 'buyer_id'],
  name: ['name', 'user_name', 'buyer_name'],
  history: ['history', 'item_history', 'clicked_items', 'watched_items', 'bought_items'],
  preferences: ['preferences', 'interests', 'tags', 'affinities'],
};

const EVENT_ALIASES = {
  userId: ['user_id', 'buyer_id'],
  itemId: ['item_id', 'listing_id'],
  eventType: ['event', 'event_type', 'action'],
  timestamp: ['timestamp', 'time', 'created_at', 'date'],
  query: ['query', 'search_term', 'keyword'],
};

function mapFields(row, aliases) {
  const keys = Object.keys(row);
  const mapped = {};
  const mappingLog = {};
  for (const [canonical, alts] of Object.entries(aliases)) {
    const found = alts.find(a => keys.includes(a));
    if (found) { mapped[canonical] = found; mappingLog[canonical] = { source: found, status: 'mapped' }; }
    else { mappingLog[canonical] = { source: null, status: 'missing' }; }
  }
  return { mapped, mappingLog };
}

function getVal(row, fieldMap, canonical, fallback = '') {
  const col = fieldMap[canonical];
  if (!col) return fallback;
  return row[col] !== undefined ? row[col] : fallback;
}

const CATEGORY_EMOJI = {
  watches: '⌚', art: '🎨', music: '🎸', jewelry: '💍', sports: '⚾',
  fashion: '👜', books: '📚', cars: '🏎️', space: '🚀', history: '🔐',
  electronics: '💻', toys: '🧸', home: '🏠', food: '🍷', tools: '🔧',
};

function inferEmoji(category) {
  if (!category) return '📦';
  const lower = category.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
    if (lower.includes(k)) return v;
  }
  return '📦';
}

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
}

function inferSchema(rawItems, rawUsers, rawEvents) {
  const diag = { items: {}, users: {}, events: {}, fallbacks: [], modelModes: {} };

  let items = [], users = [], events = [];
  let itemFieldMap = {}, userFieldMap = {}, eventFieldMap = {};
  let itemMappingLog = {}, userMappingLog = {}, eventMappingLog = {};

  if (rawItems && rawItems.length > 0) {
    const { mapped, mappingLog } = mapFields(rawItems[0], ITEM_ALIASES);
    itemFieldMap = mapped; itemMappingLog = mappingLog;

    items = rawItems.map((row, idx) => {
      const id = parseInt(getVal(row, itemFieldMap, 'id', idx + 1)) || idx + 1;
      const title = getVal(row, itemFieldMap, 'title', `Item ${id}`);
      const category = getVal(row, itemFieldMap, 'category', '');
      const priceRaw = getVal(row, itemFieldMap, 'price', '0');
      const price = parseFloat(priceRaw.toString().replace(/[^0-9.]/g, '')) || 0;
      const bids = parseInt(getVal(row, itemFieldMap, 'bids', '0')) || 0;
      const views = parseInt(getVal(row, itemFieldMap, 'views', '0')) || 0;
      let tags = getVal(row, itemFieldMap, 'tags', '');
      if (typeof tags === 'string') tags = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (!tags.length) {
        const desc = getVal(row, itemFieldMap, 'description', '');
        tags = [...new Set(tokenize(title + ' ' + desc))].slice(0, 5);
        if (!diag.fallbacks.includes('tags_from_text')) diag.fallbacks.push('tags_from_text');
      }
      const image = getVal(row, itemFieldMap, 'image', '') || inferEmoji(category);
      const description = getVal(row, itemFieldMap, 'description', '');
      return { id, title, category: category || 'Unknown', price, bids, views, tags, image, description };
    });
  }

  if (rawUsers && rawUsers.length > 0) {
    const { mapped, mappingLog } = mapFields(rawUsers[0], USER_ALIASES);
    userFieldMap = mapped; userMappingLog = mappingLog;

    users = rawUsers.map((row, idx) => {
      const id = getVal(row, userFieldMap, 'id', `U${idx + 1}`);
      const name = getVal(row, userFieldMap, 'name', `User ${idx + 1}`);
      let history = getVal(row, userFieldMap, 'history', '');
      if (typeof history === 'string') history = history.split(',').map(h => parseInt(h.trim())).filter(Boolean);
      let preferences = getVal(row, userFieldMap, 'preferences', '');
      if (typeof preferences === 'string') preferences = preferences.split(',').map(p => p.trim()).filter(Boolean);
      return { id: String(id), name, history, preferences };
    });
  }

  if (rawEvents && rawEvents.length > 0) {
    const { mapped, mappingLog } = mapFields(rawEvents[0], EVENT_ALIASES);
    eventFieldMap = mapped; eventMappingLog = mappingLog;

    events = rawEvents.map(row => ({
      userId: String(getVal(row, eventFieldMap, 'userId', '')),
      itemId: parseInt(getVal(row, eventFieldMap, 'itemId', '0')) || 0,
      eventType: getVal(row, eventFieldMap, 'eventType', 'view'),
      timestamp: getVal(row, eventFieldMap, 'timestamp', ''),
      query: getVal(row, eventFieldMap, 'query', ''),
    })).filter(e => e.userId && e.itemId);
  }

  if (!users.length && items.length) {
    const cats = [...new Set(items.map(i => i.category))];
    users = cats.slice(0, 4).map((cat, idx) => {
      const catItems = items.filter(i => i.category === cat);
      const history = catItems.slice(0, Math.min(4, catItems.length)).map(i => i.id);
      const allTags = catItems.flatMap(i => i.tags);
      const prefs = [...new Set(allTags)].slice(0, 3);
      return { id: `U${idx + 1}`, name: `Synth User ${idx + 1}`, history, preferences: prefs };
    });
    if (!users.length) {
      users = [{ id: "U1", name: "Default User", history: items.slice(0, 4).map(i => i.id), preferences: items.slice(0, 2).flatMap(i => i.tags).slice(0, 3) }];
    }
    diag.fallbacks.push('synthetic_users');
  }

  if (events.length && users.length) {
    const userEvents = {};
    events.forEach(e => {
      if (!userEvents[e.userId]) userEvents[e.userId] = [];
      userEvents[e.userId].push(e);
    });
    users = users.map(u => {
      const ue = userEvents[u.id];
      if (ue) {
        const sorted = ue.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
        const hist = [...new Set(sorted.map(e => e.itemId))];
        if (hist.length) u.history = hist;
      }
      return u;
    });
    diag.fallbacks.push('history_from_events');
  }

  const hasField = (f) => itemFieldMap[f] !== undefined;
  diag.items = { count: items.length, mappingLog: itemMappingLog, hasPrice: hasField('price'), hasBids: hasField('bids'), hasViews: hasField('views'), hasTags: hasField('tags'), hasCategory: hasField('category'), hasDescription: hasField('description') };
  diag.users = { count: users.length, mappingLog: userMappingLog, synthetic: diag.fallbacks.includes('synthetic_users') };
  diag.events = { count: events.length, mappingLog: eventMappingLog, used: events.length > 0 };

  const fullMode = (name) => ({ mode: 'full', label: name + ': Full' });
  const degraded = (name, reason) => ({ mode: 'degraded', label: name + ': Degraded — ' + reason });

  diag.modelModes = {
    als: users.some(u => u.history.length > 0) ? fullMode('ALS') : degraded('ALS', 'no user histories'),
    ease: items.length > 1 ? fullMode('EASE') : degraded('EASE', 'insufficient items'),
    twotower: fullMode('Two-Tower'),
    sasrec: events.length > 0 ? fullMode('SASRec') : (users.some(u => u.history.length > 1) ? { mode: 'partial', label: 'SASRec: Using static history order' } : degraded('SASRec', 'no sequence data')),
    item2vec: fullMode('Item2Vec'),
    lightgbm: fullMode('LightGBM'),
    rising: (hasField('bids') || hasField('views')) ? fullMode('Rising Pop.') : degraded('Rising Pop.', 'no engagement signals'),
    widedeep: fullMode('Wide & Deep'),
  };

  return { items, users, events, diag };
}

/* ─────────────────────── VECTOR / NORMALIZATION ─────────────────────── */
function minMaxNorm(vals) {
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const range = mx - mn || 1;
  return vals.map(v => (v - mn) / range);
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function dotProduct(a, b) {
  let s = 0; for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i]; return s;
}

function buildVocab(items) {
  const allTokens = new Set();
  items.forEach(item => {
    item.tags.forEach(t => allTokens.add(t));
    allTokens.add(item.category.toLowerCase());
  });
  return [...allTokens];
}

function itemToVec(item, vocab) {
  return vocab.map(tok => {
    if (item.tags.includes(tok)) return 1;
    if (item.category.toLowerCase() === tok) return 1.5;
    return 0;
  });
}

/* ─────────────────────── MODEL SCORING FUNCTIONS ─────────────────────── */

function scoreALS(items, user, allUsers, query) {
  const vocab = buildVocab(items);
  const itemVecs = {};
  items.forEach(item => { itemVecs[item.id] = itemToVec(item, vocab); });
  const histItems = user.history.map(id => items.find(i => i.id === id)).filter(Boolean);
  const userVec = vocab.map((_, vi) => {
    const sum = histItems.reduce((s, it) => s + (itemVecs[it.id]?.[vi] || 0), 0);
    return histItems.length ? sum / histItems.length : 0;
  });
  const seen = new Set(user.history);
  let scored = items.filter(i => !seen.has(i.id)).map(item => {
    let score = dotProduct(userVec, itemVecs[item.id] || []);
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) score *= 1.5;
      if (item.tags.some(t => t.includes(q))) score *= 1.3;
      if (item.category.toLowerCase().includes(q)) score *= 1.2;
    }
    return { ...item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { userVec, vocab, itemVecs, histItems } };
}

function scoreEASE(items, user, query) {
  const vocab = buildVocab(items);
  const itemVecs = {};
  items.forEach(item => { itemVecs[item.id] = itemToVec(item, vocab); });
  const simMatrix = {};
  items.forEach(a => {
    simMatrix[a.id] = {};
    items.forEach(b => {
      if (a.id === b.id) { simMatrix[a.id][b.id] = 1; return; }
      simMatrix[a.id][b.id] = cosineSim(itemVecs[a.id], itemVecs[b.id]);
    });
  });
  const seen = new Set(user.history);
  const histItems = user.history.map(id => items.find(i => i.id === id)).filter(Boolean);
  let scored = items.filter(i => !seen.has(i.id)).map(item => {
    let score = histItems.reduce((s, h) => s + (simMatrix[h.id]?.[item.id] || 0), 0);
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) score *= 1.5;
      if (item.tags.some(t => t.includes(q))) score *= 1.3;
    }
    return { ...item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { simMatrix, itemIds: items.map(i => i.id) } };
}

function scoreTwoTower(items, user, query) {
  const vocab = buildVocab(items);
  const itemVecs = {};
  items.forEach(item => { itemVecs[item.id] = itemToVec(item, vocab); });
  const histItems = user.history.map(id => items.find(i => i.id === id)).filter(Boolean);
  const userTower = vocab.map((_, vi) => {
    const sum = histItems.reduce((s, it) => s + (itemVecs[it.id]?.[vi] || 0), 0);
    return histItems.length ? sum / histItems.length : 0;
  });
  const prefBoost = vocab.map(tok => user.preferences.includes(tok) ? 0.3 : 0);
  const finalUser = userTower.map((v, i) => v + prefBoost[i]);

  const seen = new Set(user.history);
  let scored = items.filter(i => !seen.has(i.id)).map(item => {
    let score = cosineSim(finalUser, itemVecs[item.id] || []);
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) score += 0.3;
      if (item.tags.some(t => t.includes(q))) score += 0.2;
      if (item.category.toLowerCase().includes(q)) score += 0.15;
    }
    return { ...item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { userTower: finalUser, vocab } };
}

function scoreSASRec(items, user, events, query) {
  let sequence = [];
  const userEvents = events.filter(e => e.userId === user.id);
  if (userEvents.length > 1) {
    const sorted = userEvents.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    sequence = sorted.map(e => e.itemId);
  } else {
    sequence = [...user.history];
  }
  const seqItems = sequence.map(id => items.find(i => i.id === id)).filter(Boolean);
  if (seqItems.length === 0) {
    return { ranked: items.slice(0, 10).map((it, i) => ({ ...it, score: 1 - i * 0.05 })), viz: { attentionWeights: [], seqItems: [] } };
  }
  const weights = seqItems.map((_, i) => Math.pow(0.7, seqItems.length - 1 - i));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const normWeights = weights.map(w => w / wSum);
  const vocab = buildVocab(items);
  const itemVecs = {};
  items.forEach(item => { itemVecs[item.id] = itemToVec(item, vocab); });
  const attendedVec = vocab.map((_, vi) => seqItems.reduce((s, it, idx) => s + (itemVecs[it.id]?.[vi] || 0) * normWeights[idx], 0));

  const seen = new Set(user.history);
  let scored = items.filter(i => !seen.has(i.id)).map(item => {
    let score = cosineSim(attendedVec, itemVecs[item.id] || []);
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) score += 0.3;
      if (item.tags.some(t => t.includes(q))) score += 0.2;
    }
    return { ...item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { attentionWeights: normWeights, seqItems } };
}

function scoreItem2Vec(items, users, user, query) {
  const cooccur = {};
  items.forEach(i => { cooccur[i.id] = {}; });
  users.forEach(u => {
    for (let i = 0; i < u.history.length; i++) {
      for (let j = i + 1; j < u.history.length; j++) {
        const a = u.history[i], b = u.history[j];
        if (cooccur[a]) cooccur[a][b] = (cooccur[a][b] || 0) + 1;
        if (cooccur[b]) cooccur[b][a] = (cooccur[b][a] || 0) + 1;
      }
    }
  });
  const cats = [...new Set(items.map(i => i.category))];
  const embeddings = {};
  items.forEach(item => {
    const coVals = Object.values(cooccur[item.id] || {});
    const density = coVals.reduce((a, b) => a + b, 0);
    embeddings[item.id] = [cats.indexOf(item.category) / Math.max(cats.length - 1, 1), density / 10];
  });

  const lastId = user.history[user.history.length - 1];
  const anchor = embeddings[lastId] || [0.5, 0.5];
  const seen = new Set(user.history);
  let scored = items.filter(i => !seen.has(i.id)).map(item => {
    const emb = embeddings[item.id] || [0, 0];
    const dist = Math.sqrt((emb[0] - anchor[0]) ** 2 + (emb[1] - anchor[1]) ** 2);
    let score = 1 / (1 + dist);
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) score += 0.3;
      if (item.tags.some(t => t.includes(q))) score += 0.2;
    }
    return { ...item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { embeddings, anchor, cats } };
}

function scoreLightGBM(items, user, diag, query) {
  const hasPrice = diag.items.hasPrice !== false;
  const hasBids = diag.items.hasBids !== false;
  const hasViews = diag.items.hasViews !== false;
  const hasTags = diag.items.hasTags !== false;
  const hasCat = diag.items.hasCategory !== false;

  const prices = items.map(i => i.price);
  const bidVals = items.map(i => i.bids);
  const viewVals = items.map(i => i.views);
  const pNorm = minMaxNorm(prices);
  const bNorm = minMaxNorm(bidVals);
  const vNorm = minMaxNorm(viewVals);

  let wPrice = hasPrice ? 0.15 : 0;
  let wBids = hasBids ? 0.25 : 0;
  let wViews = hasViews ? 0.2 : 0;
  let wCatMatch = hasCat ? 0.2 : 0;
  let wTagOverlap = hasTags ? 0.15 : 0;
  let wQuery = 0.05;
  const total = wPrice + wBids + wViews + wCatMatch + wTagOverlap + wQuery;
  wPrice /= total; wBids /= total; wViews /= total; wCatMatch /= total; wTagOverlap /= total; wQuery /= total;

  const featureImportance = { price: wPrice, bids: wBids, views: wViews, categoryMatch: wCatMatch, tagOverlap: wTagOverlap, queryMatch: wQuery };
  const userCats = new Set();
  const userTags = new Set(user.preferences);
  user.history.forEach(id => { const it = items.find(i => i.id === id); if (it) { userCats.add(it.category); it.tags.forEach(t => userTags.add(t)); } });

  const seen = new Set(user.history);
  let scored = items.filter(i => !seen.has(i.id)).map((item, idx) => {
    const origIdx = items.indexOf(item);
    const catMatch = userCats.has(item.category) ? 1 : 0;
    const tagOv = item.tags.filter(t => userTags.has(t)).length / Math.max(item.tags.length, 1);
    let qMatch = 0;
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) qMatch = 1;
      else if (item.tags.some(t => t.includes(q))) qMatch = 0.7;
      else if (item.category.toLowerCase().includes(q)) qMatch = 0.5;
    }
    const score = wPrice * (pNorm[origIdx] || 0) + wBids * (bNorm[origIdx] || 0) + wViews * (vNorm[origIdx] || 0) + wCatMatch * catMatch + wTagOverlap * tagOv + wQuery * qMatch;
    return { ...item, score, features: { price: pNorm[origIdx] || 0, bids: bNorm[origIdx] || 0, views: vNorm[origIdx] || 0, catMatch, tagOv, qMatch } };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { featureImportance, topFeatures: scored[0]?.features } };
}

function scoreRising(items, diag, query) {
  const hasBids = diag.items.hasBids !== false;
  const hasViews = diag.items.hasViews !== false;
  const bidVals = items.map(i => i.bids);
  const viewVals = items.map(i => i.views);
  const bNorm = minMaxNorm(bidVals);
  const vNorm = minMaxNorm(viewVals);

  let scored = items.map((item, idx) => {
    const bidSig = hasBids ? bNorm[idx] : 0;
    const viewSig = hasViews ? vNorm[idx] : 0;
    const recency = 1 - (idx / items.length) * 0.3;
    let momentum = (bidSig * 0.5 + viewSig * 0.3 + recency * 0.2);
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) momentum *= 1.4;
      if (item.tags.some(t => t.includes(q))) momentum *= 1.2;
    }
    const trend = momentum > 0.6 ? 'hot' : momentum > 0.35 ? 'warm' : 'cool';
    return { ...item, score: momentum, trend };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { trends: scored.slice(0, 10) } };
}

function scoreWideDeep(items, user, diag, query) {
  const hasCat = diag.items.hasCategory !== false;
  const hasPrice = diag.items.hasPrice !== false;
  const hasBids = diag.items.hasBids !== false;
  const hasViews = diag.items.hasViews !== false;

  const userCats = new Set();
  const userTags = new Set(user.preferences);
  user.history.forEach(id => { const it = items.find(i => i.id === id); if (it) { userCats.add(it.category); it.tags.forEach(t => userTags.add(t)); } });

  const prices = minMaxNorm(items.map(i => i.price));
  const bids = minMaxNorm(items.map(i => i.bids));
  const views = minMaxNorm(items.map(i => i.views));

  const seen = new Set(user.history);
  let scored = items.filter(i => !seen.has(i.id)).map((item, idx) => {
    const origIdx = items.indexOf(item);
    const wide = (hasCat && userCats.has(item.category) ? 0.5 : 0) + (item.tags.filter(t => userTags.has(t)).length / Math.max(item.tags.length, 1)) * 0.5;
    const deepInputs = [hasPrice ? prices[origIdx] : 0, hasBids ? bids[origIdx] : 0, hasViews ? views[origIdx] : 0];
    const l1 = deepInputs.map(v => Math.max(0, v * 0.8 + 0.1));
    const l2 = [l1[0] * 0.5 + l1[1] * 0.3 + l1[2] * 0.2];
    const deep = Math.min(l2[0], 1);
    let score = wide * 0.5 + deep * 0.5;
    if (query) {
      const q = query.toLowerCase();
      if (item.title.toLowerCase().includes(q)) score += 0.3;
      if (item.tags.some(t => t.includes(q))) score += 0.15;
    }
    return { ...item, score, wide, deep };
  });
  scored.sort((a, b) => b.score - a.score);
  return { ranked: scored.slice(0, 10), viz: { wide: scored.slice(0, 5).map(s => s.wide), deep: scored.slice(0, 5).map(s => s.deep) } };
}

/* ─────────────────────── FUSION FUNCTIONS ─────────────────────── */
function normalizeScores(ranked) {
  const scores = ranked.map(r => r.score);
  const mn = Math.min(...scores), mx = Math.max(...scores);
  const range = mx - mn || 1;
  return ranked.map(r => ({ ...r, normScore: (r.score - mn) / range }));
}

function fuseAvg(modelResults) {
  const allItems = {};
  modelResults.forEach(({ ranked }) => {
    normalizeScores(ranked).forEach(item => {
      if (!allItems[item.id]) allItems[item.id] = { ...item, scores: [], models: [] };
      allItems[item.id].scores.push(item.normScore);
    });
  });
  return Object.values(allItems).map(item => ({
    ...item, score: item.scores.reduce((a, b) => a + b, 0) / item.scores.length,
  })).sort((a, b) => b.score - a.score).slice(0, 10);
}

function fuseRRF(modelResults) {
  const allItems = {};
  modelResults.forEach(({ ranked }, mi) => {
    ranked.forEach((item, rank) => {
      if (!allItems[item.id]) allItems[item.id] = { ...item, rrfScore: 0, models: [] };
      allItems[item.id].rrfScore += 1 / (60 + rank);
      allItems[item.id].models.push(mi);
    });
  });
  return Object.values(allItems).map(item => ({ ...item, score: item.rrfScore })).sort((a, b) => b.score - a.score).slice(0, 10);
}

function fuseWeighted(modelResults, weights) {
  const allItems = {};
  modelResults.forEach(({ ranked }, mi) => {
    const w = weights[mi] || 0;
    normalizeScores(ranked).forEach(item => {
      if (!allItems[item.id]) allItems[item.id] = { ...item, weightedScore: 0, models: [] };
      allItems[item.id].weightedScore += item.normScore * w;
      allItems[item.id].models.push(mi);
    });
  });
  return Object.values(allItems).map(item => ({ ...item, score: item.weightedScore })).sort((a, b) => b.score - a.score).slice(0, 10);
}

function fuseCascade(modelResults, topN) {
  if (modelResults.length === 0) return [];
  let candidates = modelResults[0].ranked.slice(0, topN);
  for (let i = 1; i < modelResults.length; i++) {
    const nextScores = {};
    modelResults[i].ranked.forEach(r => { nextScores[r.id] = r.score; });
    candidates = candidates.map(c => ({ ...c, score: nextScores[c.id] || 0 })).sort((a, b) => b.score - a.score);
  }
  return candidates.slice(0, 10);
}

/* ─────────────────────── EXPLANATION FUNCTIONS ─────────────────────── */
function generateExplanation(item, modelKey, user, diag) {
  const parts = [];
  const mm = diag.modelModes[modelKey];
  if (mm?.mode === 'degraded') parts.push(mm.label);
  if (mm?.mode === 'partial') parts.push(mm.label);

  if (diag.fallbacks.includes('tags_from_text')) parts.push('Tags were derived from title/description text tokenization.');
  if (diag.fallbacks.includes('synthetic_users')) parts.push('Synthetic users were generated from category clusters.');
  if (diag.fallbacks.includes('history_from_events')) parts.push('User histories were built from uploaded interaction events.');
  if (!diag.items.hasViews && (modelKey === 'lightgbm' || modelKey === 'rising')) parts.push('Views not available; model relied on other engagement signals.');
  if (!diag.items.hasBids && modelKey === 'rising') parts.push('Bids not available; momentum computed from remaining features.');

  const userCats = new Set();
  user.history.forEach(id => { const it = AUCTION_ITEMS.find(i => i.id === id); if (it) userCats.add(it.category); });

  if (modelKey === 'als') parts.push(`Scored via dot-product of user latent vector with item latent vector. User profile shaped by ${user.history.length} historical interactions.`);
  if (modelKey === 'ease') parts.push(`Scored by aggregated item-item similarity to ${user.history.length} history items.`);
  if (modelKey === 'twotower') parts.push(`User tower embedding compared to item tower via cosine similarity. Preferences boosted: ${user.preferences.join(', ')}.`);
  if (modelKey === 'sasrec') parts.push(`Sequential attention applied across interaction history with recency weighting.`);
  if (modelKey === 'item2vec') parts.push(`Embedding proximity to last interacted item in co-occurrence space.`);
  if (modelKey === 'lightgbm') parts.push(`Gradient-boosted tree scoring using available numeric and categorical features.`);
  if (modelKey === 'rising') parts.push(`Momentum-based scoring from normalized engagement signals.`);
  if (modelKey === 'widedeep') parts.push(`Wide branch (categorical matches) + deep branch (numeric MLP) combined.`);

  return parts.join(' ');
}

/* ─────────────────────── VISUALIZATION COMPONENTS ─────────────────────── */

const HeatmapViz = ({ matrix, ids, title, color }) => {
  const size = Math.min(ids.length, 10);
  const cellSize = Math.min(28, 260 / size);
  const displayIds = ids.slice(0, size);
  return (
    <div className="anim-fade">
      <div className="text-xs font-jet text-gray-400 mb-2">{title}</div>
      <svg width={size * cellSize + 30} height={size * cellSize + 30} className="overflow-visible">
        {displayIds.map((rid, ri) => displayIds.map((cid, ci) => {
          const val = matrix[rid]?.[cid] || 0;
          const opacity = Math.min(val, 1);
          return <rect key={`${ri}-${ci}`} x={30 + ci * cellSize} y={ri * cellSize} width={cellSize - 1} height={cellSize - 1} fill={color} opacity={opacity * 0.8 + 0.1} rx={2} />;
        }))}
        {displayIds.map((id, i) => <text key={`l-${i}`} x={26} y={i * cellSize + cellSize / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={8} fontFamily="JetBrains Mono">{id}</text>)}
      </svg>
    </div>
  );
};

const AttentionViz = ({ weights, seqItems }) => (
  <div className="anim-fade">
    <div className="text-xs font-jet text-gray-400 mb-2">Attention Weights (Sequence)</div>
    <div className="space-y-1">
      {seqItems.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-jet text-gray-500 w-6">{item.image}</span>
          <div className="flex-1 bg-gray-800 rounded h-4 overflow-hidden">
            <div className="h-full rounded bar-anim" style={{ width: `${(weights[i] || 0) * 100}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', animationDelay: `${i * 0.1}s` }} />
          </div>
          <span className="text-xs font-jet text-gray-400 w-10 text-right">{((weights[i] || 0) * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  </div>
);

const ScatterViz = ({ embeddings, anchor, items, cats }) => {
  const w = 260, h = 180, pad = 20;
  const points = items.map(item => {
    const e = embeddings[item.id] || [0, 0];
    return { x: pad + e[0] * (w - 2 * pad), y: h - pad - e[1] * (h - 2 * pad), item };
  });
  const ax = pad + anchor[0] * (w - 2 * pad), ay = h - pad - anchor[1] * (h - 2 * pad);
  return (
    <div className="anim-fade">
      <div className="text-xs font-jet text-gray-400 mb-2">Item2Vec Embedding Space</div>
      <svg width={w} height={h}>
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#ef4444" opacity={0.6} />)}
        <circle cx={ax} cy={ay} r={7} fill="none" stroke="#00d4ff" strokeWidth={2} />
        <circle cx={ax} cy={ay} r={3} fill="#00d4ff" />
        <text x={ax + 10} y={ay - 5} fill="#00d4ff" fontSize={9} fontFamily="JetBrains Mono">anchor</text>
      </svg>
    </div>
  );
};

const FeatureImportanceViz = ({ importance }) => {
  const entries = Object.entries(importance).sort((a, b) => b[1] - a[1]);
  return (
    <div className="anim-fade">
      <div className="text-xs font-jet text-gray-400 mb-2">Feature Importance</div>
      <div className="space-y-1">
        {entries.map(([name, val], i) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-xs font-jet text-gray-400 w-20 truncate">{name}</span>
            <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
              <div className="h-full rounded bar-anim" style={{ width: `${val * 100}%`, background: '#f97316', animationDelay: `${i * 0.08}s` }} />
            </div>
            <span className="text-xs font-jet text-gray-500 w-10 text-right">{(val * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const WideDeepViz = ({ wide, deep }) => (
  <div className="anim-fade">
    <div className="text-xs font-jet text-gray-400 mb-2">Wide & Deep Architecture</div>
    <svg width={260} height={160}>
      <rect x={10} y={10} width={100} height={60} rx={6} fill="none" stroke="#06b6d4" strokeWidth={1.5} />
      <text x={60} y={35} textAnchor="middle" fill="#06b6d4" fontSize={10} fontFamily="JetBrains Mono">Wide</text>
      <text x={60} y={50} textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="JetBrains Mono">Categorical</text>
      <rect x={150} y={10} width={100} height={60} rx={6} fill="none" stroke="#7c3aed" strokeWidth={1.5} />
      <text x={200} y={35} textAnchor="middle" fill="#7c3aed" fontSize={10} fontFamily="JetBrains Mono">Deep</text>
      <text x={200} y={50} textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="JetBrains Mono">Numeric MLP</text>
      <line x1={60} y1={70} x2={130} y2={110} stroke="#4b5563" strokeWidth={1} />
      <line x1={200} y1={70} x2={130} y2={110} stroke="#4b5563" strokeWidth={1} />
      <rect x={90} y={100} width={80} height={30} rx={6} fill="none" stroke="#00d4ff" strokeWidth={1.5} />
      <text x={130} y={120} textAnchor="middle" fill="#00d4ff" fontSize={10} fontFamily="JetBrains Mono">Combined</text>
      {wide && wide.slice(0, 3).map((w, i) => <text key={`w${i}`} x={15} y={78 + i * 10} fill="#06b6d4" fontSize={7} fontFamily="JetBrains Mono">{w.toFixed(2)}</text>)}
      {deep && deep.slice(0, 3).map((d, i) => <text key={`d${i}`} x={215} y={78 + i * 10} fill="#7c3aed" fontSize={7} fontFamily="JetBrains Mono">{d.toFixed(2)}</text>)}
    </svg>
  </div>
);

const TwoTowerViz = ({ userTower, vocab }) => {
  const topIdx = userTower.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).slice(0, 6);
  return (
    <div className="anim-fade">
      <div className="text-xs font-jet text-gray-400 mb-2">Two-Tower: User Embedding</div>
      <svg width={260} height={140}>
        <rect x={10} y={10} width={110} height={50} rx={6} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={65} y={40} textAnchor="middle" fill="#f59e0b" fontSize={10} fontFamily="JetBrains Mono">User Tower</text>
        <rect x={140} y={10} width={110} height={50} rx={6} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.5} />
        <text x={195} y={40} textAnchor="middle" fill="#f59e0b" fontSize={10} fontFamily="JetBrains Mono">Item Tower</text>
        <line x1={120} y1={35} x2={140} y2={35} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4" />
        {topIdx.map((t, i) => (
          <text key={i} x={15 + (i % 3) * 85} y={80 + Math.floor(i / 3) * 14} fill="#94a3b8" fontSize={7} fontFamily="JetBrains Mono">
            {(vocab[t.i] || '?').slice(0, 8)}: {t.v.toFixed(2)}
          </text>
        ))}
      </svg>
    </div>
  );
};

const TrendViz = ({ trends }) => (
  <div className="anim-fade">
    <div className="text-xs font-jet text-gray-400 mb-2">Trending Momentum</div>
    <div className="space-y-1">
      {trends.slice(0, 8).map((item, i) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="text-lg w-6">{item.image}</span>
          <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
            <div className="h-full rounded bar-anim" style={{ width: `${item.score * 100}%`, background: item.trend === 'hot' ? '#ef4444' : item.trend === 'warm' ? '#f59e0b' : '#6b7280', animationDelay: `${i * 0.08}s` }} />
          </div>
          <span className={`text-xs font-jet ${item.trend === 'hot' ? 'text-red-400' : item.trend === 'warm' ? 'text-yellow-400' : 'text-gray-500'}`}>
            {item.trend === 'hot' ? '🔥' : item.trend === 'warm' ? '📈' : '—'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */
function ShapedModelExplorer() {
  const [dataMode, setDataMode] = useState('sample');
  const [csvItems, setCsvItems] = useState(null);
  const [csvUsers, setCsvUsers] = useState(null);
  const [csvEvents, setCsvEvents] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [activeModels, setActiveModels] = useState(['als']);
  const [activeUser, setActiveUser] = useState('U1');
  const [fusionStrategy, setFusionStrategy] = useState('avg');
  const [fusionWeights, setFusionWeights] = useState({});
  const [cascadeTopN, setCascadeTopN] = useState(8);
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [centerTab, setCenterTab] = useState('results');
  const [hasRun, setHasRun] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const { items, users, events, diag } = useMemo(() => {
    if (dataMode === 'sample') {
      return inferSchema(AUCTION_ITEMS, USERS, []);
    }
    if (csvItems) {
      return inferSchema(csvItems, csvUsers || null, csvEvents || null);
    }
    return inferSchema(AUCTION_ITEMS, USERS, []);
  }, [dataMode, csvItems, csvUsers, csvEvents]);

  const currentUser = useMemo(() => users.find(u => u.id === activeUser) || users[0], [users, activeUser]);

  useEffect(() => {
    if (users.length && !users.find(u => u.id === activeUser)) {
      setActiveUser(users[0].id);
    }
  }, [users, activeUser]);

  const handleCSVUpload = useCallback((file, type) => {
    if (!file) return;
    setCsvError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target.result);
        if (parsed.length === 0) { setCsvError(`${type} CSV appears empty or invalid.`); return; }
        if (type === 'items') setCsvItems(parsed);
        else if (type === 'users') setCsvUsers(parsed);
        else if (type === 'events') setCsvEvents(parsed);
      } catch (err) { setCsvError(`Error parsing ${type} CSV: ${err.message}`); }
    };
    reader.readAsText(file);
  }, []);

  const modelResults = useMemo(() => {
    if (!hasRun) return {};
    const results = {};
    const q = query.trim() || '';
    activeModels.forEach(mk => {
      try {
        if (mk === 'als') results.als = scoreALS(items, currentUser, users, q);
        if (mk === 'ease') results.ease = scoreEASE(items, currentUser, q);
        if (mk === 'twotower') results.twotower = scoreTwoTower(items, currentUser, q);
        if (mk === 'sasrec') results.sasrec = scoreSASRec(items, currentUser, events, q);
        if (mk === 'item2vec') results.item2vec = scoreItem2Vec(items, users, currentUser, q);
        if (mk === 'lightgbm') results.lightgbm = scoreLightGBM(items, currentUser, diag, q);
        if (mk === 'rising') results.rising = scoreRising(items, diag, q);
        if (mk === 'widedeep') results.widedeep = scoreWideDeep(items, currentUser, diag, q);
      } catch (err) { console.error(`Model ${mk} error:`, err); }
    });
    return results;
  }, [hasRun, activeModels, items, users, events, currentUser, query, diag]);

  const fusedResults = useMemo(() => {
    if (!hasRun || activeModels.length < 2) return null;
    const entries = activeModels.map(mk => modelResults[mk]).filter(Boolean);
    if (entries.length < 2) return null;
    if (fusionStrategy === 'avg') return fuseAvg(entries);
    if (fusionStrategy === 'rrf') return fuseRRF(entries);
    if (fusionStrategy === 'weighted') {
      const wArr = activeModels.map(mk => fusionWeights[mk] || 1 / activeModels.length);
      const wSum = wArr.reduce((a, b) => a + b, 0);
      return fuseWeighted(entries, wArr.map(w => w / wSum));
    }
    if (fusionStrategy === 'cascade') return fuseCascade(entries, cascadeTopN);
    return null;
  }, [hasRun, activeModels, modelResults, fusionStrategy, fusionWeights, cascadeTopN]);

  const individualRanks = useMemo(() => {
    const ranks = {};
    activeModels.forEach(mk => {
      const r = modelResults[mk];
      if (r) r.ranked.forEach((item, idx) => {
        if (!ranks[item.id]) ranks[item.id] = {};
        ranks[item.id][mk] = idx + 1;
      });
    });
    return ranks;
  }, [activeModels, modelResults]);

  const toggleModel = useCallback((key) => {
    setActiveModels(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);

  const runModels = useCallback(() => { setHasRun(true); }, []);

  const HexLogo = () => (
    <svg width={32} height={32} viewBox="0 0 32 32">
      <polygon points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5" fill="none" stroke="#00d4ff" strokeWidth="2" />
      <polygon points="16,6 24,10.5 24,21.5 16,26 8,21.5 8,10.5" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="#00d4ff" />
    </svg>
  );

  const ResultCard = ({ item, rank, modelBadges, fused }) => {
    const isSelected = selectedItem?.id === item.id;
    return (
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 anim-fade ${isSelected ? 'border-accent1 bg-gray-800/50 pulse-border' : 'border-border bg-card hover:border-gray-600'}`}
        style={{ animationDelay: `${rank * 0.04}s` }}
        onClick={() => setSelectedItem(item)}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl w-8 text-center flex-shrink-0">{item.image}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-jet text-accent1 text-xs font-bold">#{rank}</span>
              <span className="font-syne text-sm text-txt font-semibold truncate">{item.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-jet text-gray-400">{item.category}</span>
              <span className="text-xs font-jet text-accent2">${item.price?.toLocaleString()}</span>
              {item.score !== undefined && <span className="text-xs font-jet text-green-400 ml-auto">{item.score.toFixed(3)}</span>}
            </div>
            {modelBadges && modelBadges.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {modelBadges.map(mk => {
                  const md = MODEL_DEFS.find(m => m.key === mk);
                  return md ? <span key={mk} className="px-1.5 py-0.5 rounded text-[9px] font-jet" style={{ background: md.color + '22', color: md.color }}>{md.name}</span> : null;
                })}
              </div>
            )}
            {fused && individualRanks[item.id] && (
              <div className="flex gap-2 mt-1">
                {Object.entries(individualRanks[item.id]).map(([mk, r]) => {
                  const delta = r - rank;
                  return (
                    <span key={mk} className="text-[9px] font-jet text-gray-500">
                      {MODEL_DEFS.find(m => m.key === mk)?.name}: #{r}
                      {delta > 0 && <span className="text-green-400 ml-0.5">+{delta}</span>}
                      {delta < 0 && <span className="text-red-400 ml-0.5">{delta}</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DiagnosticsPanel = () => (
    <div className="space-y-3 anim-fade">
      <div className="text-sm font-syne text-txt font-bold mb-2">Data Diagnostics</div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-lg font-jet text-accent1">{items.length}</div>
          <div className="text-[10px] font-jet text-gray-400">Items</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-lg font-jet text-accent2">{users.length}</div>
          <div className="text-[10px] font-jet text-gray-400">Users</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-lg font-jet text-green-400">{events.length}</div>
          <div className="text-[10px] font-jet text-gray-400">Events</div>
        </div>
      </div>

      <div className="bg-card rounded p-2 border border-border">
        <div className="text-xs font-jet text-accent1 mb-1">Mapped Schema (Items)</div>
        {Object.entries(diag.items.mappingLog || {}).map(([field, info]) => (
          <div key={field} className="flex justify-between text-[10px] font-jet py-0.5">
            <span className="text-gray-300">{field}</span>
            <span className={info.status === 'mapped' ? 'text-green-400' : 'text-red-400'}>
              {info.status === 'mapped' ? `← ${info.source}` : 'missing'}
            </span>
          </div>
        ))}
      </div>

      {Object.keys(diag.users.mappingLog || {}).length > 0 && (
        <div className="bg-card rounded p-2 border border-border">
          <div className="text-xs font-jet text-accent2 mb-1">Mapped Schema (Users)</div>
          {Object.entries(diag.users.mappingLog).map(([field, info]) => (
            <div key={field} className="flex justify-between text-[10px] font-jet py-0.5">
              <span className="text-gray-300">{field}</span>
              <span className={info.status === 'mapped' ? 'text-green-400' : 'text-red-400'}>
                {info.status === 'mapped' ? `← ${info.source}` : 'missing'}
              </span>
            </div>
          ))}
        </div>
      )}

      {diag.fallbacks.length > 0 && (
        <div className="bg-card rounded p-2 border border-border">
          <div className="text-xs font-jet text-yellow-400 mb-1">Fallback Logic Active</div>
          {diag.fallbacks.map(fb => (
            <div key={fb} className="text-[10px] font-jet text-gray-400 py-0.5">
              {fb === 'tags_from_text' && '• Tags derived from title/description tokens'}
              {fb === 'synthetic_users' && '• Users synthesized from category clusters'}
              {fb === 'history_from_events' && '• Histories built from interaction events'}
            </div>
          ))}
        </div>
      )}

      <div className="bg-card rounded p-2 border border-border">
        <div className="text-xs font-jet text-accent1 mb-1">Model Modes</div>
        {Object.entries(diag.modelModes).map(([mk, info]) => (
          <div key={mk} className="flex justify-between text-[10px] font-jet py-0.5">
            <span className="text-gray-300">{MODEL_DEFS.find(m => m.key === mk)?.name}</span>
            <span className={info.mode === 'full' ? 'text-green-400' : info.mode === 'partial' ? 'text-yellow-400' : 'text-red-400'}>
              {info.mode}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card rounded p-2 border border-border">
        <div className="text-xs font-jet text-accent1 mb-1">User Histories</div>
        <div className="text-[10px] font-jet text-gray-400">
          {diag.users.synthetic ? 'Synthetic (generated)' : diag.events.used ? 'From interaction events' : 'Explicit (from user data)'}
        </div>
      </div>
    </div>
  );

  const ModelInternalsPanel = () => {
    if (!hasRun) return <div className="text-gray-500 font-jet text-sm text-center py-8">Run models to see internals</div>;
    return (
      <div className="space-y-4">
        {modelResults.als && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#00d4ff] font-bold mb-2">ALS — Interaction Matrix</div>
            <HeatmapViz matrix={(() => {
              const m = {};
              users.forEach(u => { m[u.id] = {}; u.history.forEach(id => { m[u.id][id] = 1; }); });
              return m;
            })()} ids={[...users.map(u => u.id)]} title="User-Item Interactions" color="#00d4ff" />
          </div>
        )}
        {modelResults.ease && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#7c3aed] font-bold mb-2">EASE — Similarity Matrix</div>
            <HeatmapViz matrix={modelResults.ease.viz.simMatrix} ids={modelResults.ease.viz.itemIds.slice(0, 10)} title="Item-Item Cosine Similarity" color="#7c3aed" />
          </div>
        )}
        {modelResults.twotower && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#f59e0b] font-bold mb-2">Two-Tower — Embeddings</div>
            <TwoTowerViz userTower={modelResults.twotower.viz.userTower} vocab={modelResults.twotower.viz.vocab} />
          </div>
        )}
        {modelResults.sasrec && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#10b981] font-bold mb-2">SASRec — Attention</div>
            <AttentionViz weights={modelResults.sasrec.viz.attentionWeights} seqItems={modelResults.sasrec.viz.seqItems} />
          </div>
        )}
        {modelResults.item2vec && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#ef4444] font-bold mb-2">Item2Vec — Embeddings</div>
            <ScatterViz embeddings={modelResults.item2vec.viz.embeddings} anchor={modelResults.item2vec.viz.anchor} items={items} cats={modelResults.item2vec.viz.cats} />
          </div>
        )}
        {modelResults.lightgbm && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#f97316] font-bold mb-2">LightGBM — Feature Importance</div>
            <FeatureImportanceViz importance={modelResults.lightgbm.viz.featureImportance} />
          </div>
        )}
        {modelResults.rising && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#ec4899] font-bold mb-2">Rising Popularity</div>
            <TrendViz trends={modelResults.rising.viz.trends} />
          </div>
        )}
        {modelResults.widedeep && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-syne text-[#06b6d4] font-bold mb-2">Wide & Deep</div>
            <WideDeepViz wide={modelResults.widedeep.viz.wide} deep={modelResults.widedeep.viz.deep} />
          </div>
        )}
      </div>
    );
  };

  const ComparisonPanel = () => {
    if (!hasRun || activeModels.length < 2) return <div className="text-gray-500 font-jet text-sm text-center py-8">Select 2+ models and run to compare</div>;

    const allItemIds = new Set();
    activeModels.forEach(mk => {
      modelResults[mk]?.ranked.forEach(r => allItemIds.add(r.id));
    });

    return (
      <div className="space-y-3 anim-fade">
        <div className="text-sm font-syne text-txt font-bold">Model Comparison</div>

        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="text-xs font-jet text-gray-400 mb-2">Overlap Matrix</div>
          <div className="overflow-x-auto">
            <table className="text-[10px] font-jet">
              <thead>
                <tr>
                  <th className="p-1 text-gray-500"></th>
                  {activeModels.map(mk => <th key={mk} className="p-1" style={{ color: MODEL_DEFS.find(m => m.key === mk)?.color }}>{MODEL_DEFS.find(m => m.key === mk)?.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {activeModels.map(mk1 => (
                  <tr key={mk1}>
                    <td className="p-1" style={{ color: MODEL_DEFS.find(m => m.key === mk1)?.color }}>{MODEL_DEFS.find(m => m.key === mk1)?.name}</td>
                    {activeModels.map(mk2 => {
                      const set1 = new Set(modelResults[mk1]?.ranked.map(r => r.id) || []);
                      const set2 = new Set(modelResults[mk2]?.ranked.map(r => r.id) || []);
                      const overlap = [...set1].filter(id => set2.has(id)).length;
                      return <td key={mk2} className="p-1 text-center text-gray-300">{overlap}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="text-xs font-jet text-gray-400 mb-2">Rank Movements (Fused)</div>
          {fusedResults && fusedResults.slice(0, 8).map((item, fi) => {
            const movements = activeModels.map(mk => {
              const origRank = modelResults[mk]?.ranked.findIndex(r => r.id === item.id);
              return { mk, origRank: origRank >= 0 ? origRank + 1 : null };
            }).filter(m => m.origRank !== null);
            return (
              <div key={item.id} className="flex items-center gap-2 py-1 border-b border-gray-800 last:border-0">
                <span className="text-xs font-jet text-accent1 w-5">#{fi + 1}</span>
                <span className="text-sm w-5">{item.image}</span>
                <span className="text-xs font-jet text-gray-300 flex-1 truncate">{item.title}</span>
                <div className="flex gap-1">
                  {movements.map(({ mk, origRank }) => {
                    const delta = origRank - (fi + 1);
                    const md = MODEL_DEFS.find(m => m.key === mk);
                    return (
                      <span key={mk} className="text-[9px] font-jet px-1 rounded" style={{ background: md?.color + '22', color: md?.color }}>
                        {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '='}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg text-txt">
      <StyleTag />
      <div className="h-screen overflow-hidden relative">
        {/* LEFT PANEL — overlay on narrow viewports */}
        {showLeft && <div className="absolute top-0 left-0 bottom-0 w-72 z-30 border-r border-border overflow-y-auto bg-bg" style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.5)' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <HexLogo />
                <div>
                  <div className="font-syne font-bold text-txt text-sm tracking-wide">Shaped</div>
                  <div className="font-syne text-gray-400 text-[10px]">Model Explorer</div>
                </div>
              </div>
              <button onClick={() => setShowLeft(false)} className="text-gray-400 hover:text-accent1 transition-colors text-lg leading-none" title="Close panel">✕</button>
            </div>

            {/* Data Source */}
            <div className="mb-5">
              <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Data Source</div>
              <div className="flex gap-1 mb-3">
                <button onClick={() => setDataMode('sample')} className={`flex-1 text-xs font-jet py-1.5 px-2 rounded transition-all ${dataMode === 'sample' ? 'bg-accent1/20 text-accent1 border border-accent1/40' : 'bg-card text-gray-400 border border-border hover:border-gray-600'}`}>
                  Sample Data
                </button>
                <button onClick={() => setDataMode('csv')} className={`flex-1 text-xs font-jet py-1.5 px-2 rounded transition-all ${dataMode === 'csv' ? 'bg-accent2/20 text-accent2 border border-accent2/40' : 'bg-card text-gray-400 border border-border hover:border-gray-600'}`}>
                  Load CSV
                </button>
              </div>
              {dataMode === 'csv' && (
                <div className="space-y-2 anim-fade">
                  <div>
                    <label className="text-[10px] font-jet text-gray-400 block mb-1">Items CSV *</label>
                    <input type="file" accept=".csv" onChange={e => handleCSVUpload(e.target.files[0], 'items')} className="text-[10px] text-gray-400 font-jet w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-jet file:bg-card file:text-accent1 file:cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[10px] font-jet text-gray-400 block mb-1">Users CSV (optional)</label>
                    <input type="file" accept=".csv" onChange={e => handleCSVUpload(e.target.files[0], 'users')} className="text-[10px] text-gray-400 font-jet w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-jet file:bg-card file:text-accent1 file:cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[10px] font-jet text-gray-400 block mb-1">Events CSV (optional)</label>
                    <input type="file" accept=".csv" onChange={e => handleCSVUpload(e.target.files[0], 'events')} className="text-[10px] text-gray-400 font-jet w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-jet file:bg-card file:text-accent1 file:cursor-pointer" />
                  </div>
                  {csvError && <div className="text-[10px] font-jet text-red-400 bg-red-900/20 rounded p-2">{csvError}</div>}
                  <div className="text-[9px] font-jet text-gray-500 bg-gray-800/30 rounded p-2">
                    Columns are auto-mapped. Supports aliases like item_name, auction_title, bid_count, page_views, etc.
                  </div>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="mb-5">
              <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Select Models</div>
              <div className="space-y-1">
                {MODEL_DEFS.map(md => (
                  <button
                    key={md.key}
                    onClick={() => toggleModel(md.key)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all ${activeModels.includes(md.key) ? 'bg-gray-800 border border-gray-600' : 'border border-transparent hover:bg-gray-800/50'}`}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: activeModels.includes(md.key) ? md.color : '#374151' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-jet text-gray-200 truncate">{md.name}</div>
                      <div className="text-[9px] font-jet text-gray-500 truncate">{md.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active User */}
            <div className="mb-5">
              <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Active User</div>
              <div className="space-y-1">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setActiveUser(u.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all ${activeUser === u.id ? 'bg-accent2/15 border border-accent2/30' : 'border border-transparent hover:bg-gray-800/50'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-jet text-gray-300 flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-jet text-gray-200 truncate">{u.name}</div>
                      <div className="text-[9px] font-jet text-gray-500 truncate">{u.preferences.slice(0, 3).join(', ')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fusion Strategy */}
            {activeModels.length >= 2 && (
              <div className="mb-5 anim-fade">
                <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Fusion Strategy</div>
                <div className="space-y-1">
                  {FUSION_STRATEGIES.map(fs => (
                    <button
                      key={fs.key}
                      onClick={() => setFusionStrategy(fs.key)}
                      className={`w-full text-xs font-jet py-1.5 px-2 rounded text-left transition-all ${fusionStrategy === fs.key ? 'bg-accent1/15 text-accent1 border border-accent1/30' : 'text-gray-400 border border-transparent hover:bg-gray-800/50'}`}
                    >
                      {fs.name}
                    </button>
                  ))}
                </div>
                {fusionStrategy === 'weighted' && (
                  <div className="mt-2 space-y-1">
                    {activeModels.map(mk => {
                      const md = MODEL_DEFS.find(m => m.key === mk);
                      return (
                        <div key={mk} className="flex items-center gap-2">
                          <span className="text-[9px] font-jet w-14 truncate" style={{ color: md?.color }}>{md?.name}</span>
                          <input type="range" min="0" max="100" value={(fusionWeights[mk] || (1 / activeModels.length)) * 100}
                            onChange={e => setFusionWeights(prev => ({ ...prev, [mk]: parseInt(e.target.value) / 100 }))}
                            className="flex-1" />
                          <span className="text-[9px] font-jet text-gray-500 w-8 text-right">{((fusionWeights[mk] || (1 / activeModels.length)) * 100).toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {fusionStrategy === 'cascade' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-jet text-gray-400">Top-N:</span>
                    <input type="range" min="3" max="15" value={cascadeTopN} onChange={e => setCascadeTopN(parseInt(e.target.value))} className="flex-1" />
                    <span className="text-[10px] font-jet text-accent1">{cascadeTopN}</span>
                  </div>
                )}
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={runModels}
              className="w-full py-2.5 rounded-lg font-syne font-bold text-sm transition-all bg-gradient-to-r from-accent1/20 to-accent2/20 text-accent1 border border-accent1/30 hover:from-accent1/30 hover:to-accent2/30 hover:border-accent1/50 active:scale-[0.98]"
            >
              Run Models
            </button>
          </div>
        </div>}

        {/* CENTER PANEL */}
        <div className="absolute inset-0 overflow-y-auto z-10">
          <div className="p-4">
            {/* Panel Toggles */}
            <div className="flex items-center gap-2 mb-3 relative z-40">
              <button onClick={() => setShowLeft(p => !p)} className="px-2 py-1 rounded text-[10px] font-jet border border-border hover:border-gray-500 transition-colors" style={{ color: showLeft ? '#00d4ff' : '#6b7280' }}>
                {showLeft ? '◂ Hide Config' : '▸ Show Config'}
              </button>
              <div className="flex-1" />
              <button onClick={() => setShowRight(p => !p)} className="px-2 py-1 rounded text-[10px] font-jet border border-border hover:border-gray-500 transition-colors" style={{ color: showRight ? '#00d4ff' : '#6b7280' }}>
                {showRight ? 'Hide Inspector ▸' : '◂ Show Inspector'}
              </button>
            </div>
            {/* Query Input */}
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search items... e.g. 'vintage watch'"
                  className="w-full bg-card border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm font-jet text-txt placeholder-gray-500 focus:outline-none focus:border-accent1/50 transition-colors"
                />
              </div>
            </div>

            {/* Summary Row */}
            {hasRun && (
              <div className="flex gap-2 mb-4 flex-wrap anim-fade">
                <div className="bg-card rounded-lg px-3 py-1.5 border border-border flex items-center gap-2">
                  <span className="text-[10px] font-jet text-gray-400">Models:</span>
                  <span className="text-xs font-jet text-accent1">{activeModels.length}</span>
                </div>
                <div className="bg-card rounded-lg px-3 py-1.5 border border-border flex items-center gap-2">
                  <span className="text-[10px] font-jet text-gray-400">User:</span>
                  <span className="text-xs font-jet text-accent2">{currentUser.name}</span>
                </div>
                <div className="bg-card rounded-lg px-3 py-1.5 border border-border flex items-center gap-2">
                  <span className="text-[10px] font-jet text-gray-400">Items:</span>
                  <span className="text-xs font-jet text-green-400">{items.length}</span>
                </div>
                {fusedResults && (
                  <div className="bg-card rounded-lg px-3 py-1.5 border border-border flex items-center gap-2">
                    <span className="text-[10px] font-jet text-gray-400">Fusion:</span>
                    <span className="text-xs font-jet text-accent1">{FUSION_STRATEGIES.find(f => f.key === fusionStrategy)?.name}</span>
                  </div>
                )}
                {query && (
                  <div className="bg-card rounded-lg px-3 py-1.5 border border-border flex items-center gap-2">
                    <span className="text-[10px] font-jet text-gray-400">Query:</span>
                    <span className="text-xs font-jet text-yellow-400">"{query}"</span>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-border pb-2">
              {['results', 'internals', 'comparison', 'diagnostics'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setCenterTab(tab)}
                  className={`px-3 py-1.5 rounded-t text-xs font-jet transition-all ${centerTab === tab ? 'text-accent1 bg-card border border-border border-b-0' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab === 'results' ? 'Results' : tab === 'internals' ? 'Model Internals' : tab === 'comparison' ? 'Comparison' : 'Data Diagnostics'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {centerTab === 'results' && (
              <div>
                {!hasRun ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4 opacity-30">🔮</div>
                    <div className="font-syne text-gray-400 text-sm">Select models and click Run to see recommendations</div>
                    <div className="font-jet text-gray-600 text-[10px] mt-2">Multi-stage: Retrieve → Score → Re-rank → Final Results</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Fused Results */}
                    {fusedResults && (
                      <div className="anim-fade">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent1" />
                          <span className="text-xs font-syne text-txt font-bold">Fused Results — {FUSION_STRATEGIES.find(f => f.key === fusionStrategy)?.name}</span>
                        </div>
                        <div className="space-y-2">
                          {fusedResults.map((item, i) => (
                            <ResultCard key={item.id} item={item} rank={i + 1} modelBadges={Object.keys(individualRanks[item.id] || {})} fused />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Model Results */}
                    {activeModels.map(mk => {
                      const r = modelResults[mk];
                      const md = MODEL_DEFS.find(m => m.key === mk);
                      if (!r) return null;
                      return (
                        <div key={mk} className="anim-fade">
                          <div className="flex items-center gap-2 mb-2 mt-4">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: md?.color }} />
                            <span className="text-xs font-syne text-txt font-bold">{md?.name}</span>
                            <span className="text-[10px] font-jet text-gray-500">{md?.full}</span>
                            {diag.modelModes[mk]?.mode !== 'full' && (
                              <span className="text-[9px] font-jet text-yellow-400 bg-yellow-400/10 px-1.5 rounded">{diag.modelModes[mk]?.mode}</span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {r.ranked.slice(0, 10).map((item, i) => (
                              <ResultCard key={item.id} item={item} rank={i + 1} modelBadges={[mk]} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {centerTab === 'internals' && <ModelInternalsPanel />}
            {centerTab === 'comparison' && <ComparisonPanel />}
            {centerTab === 'diagnostics' && <DiagnosticsPanel />}
          </div>
        </div>

        {/* RIGHT PANEL — overlay */}
        {showRight && <div className="absolute top-0 right-0 bottom-0 w-72 z-30 border-l border-border overflow-y-auto bg-bg" style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.5)' }}>
          <div className="p-4">
            {/* Item Inspector */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-syne text-gray-400 uppercase tracking-wider">Item Inspector</div>
                <button onClick={() => setShowRight(false)} className="text-gray-400 hover:text-accent1 transition-colors text-lg leading-none" title="Close panel">✕</button>
              </div>
              {selectedItem ? (
                <div className="anim-slide">
                  <div className="bg-card rounded-lg p-3 border border-border mb-3">
                    <div className="text-3xl text-center mb-2">{selectedItem.image}</div>
                    <div className="font-syne text-sm text-txt font-bold text-center">{selectedItem.title}</div>
                    <div className="text-xs font-jet text-accent2 text-center mt-1">{selectedItem.category}</div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center">
                        <div className="text-xs font-jet text-accent1">${selectedItem.price?.toLocaleString()}</div>
                        <div className="text-[9px] font-jet text-gray-500">price</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-jet text-green-400">{selectedItem.bids}</div>
                        <div className="text-[9px] font-jet text-gray-500">bids</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-jet text-yellow-400">{selectedItem.views?.toLocaleString()}</div>
                        <div className="text-[9px] font-jet text-gray-500">views</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 justify-center">
                      {selectedItem.tags?.map(t => <span key={t} className="text-[9px] font-jet px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{t}</span>)}
                    </div>
                    {selectedItem.score !== undefined && (
                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-jet text-gray-400">Score: </span>
                        <span className="text-xs font-jet text-accent1">{selectedItem.score.toFixed(4)}</span>
                      </div>
                    )}
                  </div>

                  {/* Similar Items */}
                  <div className="mb-3">
                    <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Similar Items</div>
                    <div className="space-y-1">
                      {items
                        .filter(i => i.id !== selectedItem.id && (i.category === selectedItem.category || i.tags?.some(t => selectedItem.tags?.includes(t))))
                        .slice(0, 4)
                        .map(item => (
                          <div key={item.id} className="flex items-center gap-2 py-1 px-2 rounded bg-gray-800/30 hover:bg-gray-800/60 cursor-pointer transition-colors" onClick={() => setSelectedItem(item)}>
                            <span className="text-sm">{item.image}</span>
                            <span className="text-[10px] font-jet text-gray-300 truncate flex-1">{item.title}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Explanations */}
                  {hasRun && activeModels.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Model Explanations</div>
                      <div className="space-y-2">
                        {activeModels.map(mk => {
                          const md = MODEL_DEFS.find(m => m.key === mk);
                          const explanation = generateExplanation(selectedItem, mk, currentUser, diag);
                          return (
                            <div key={mk} className="bg-gray-800/30 rounded p-2">
                              <div className="text-[10px] font-jet font-bold mb-0.5" style={{ color: md?.color }}>{md?.name}</div>
                              <div className="text-[9px] font-jet text-gray-400 leading-relaxed">{explanation}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Combination Delta */}
                  {fusedResults && (
                    <div className="mb-3">
                      <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Combination Delta</div>
                      <div className="bg-card rounded p-2 border border-border">
                        {(() => {
                          const fusedRank = fusedResults.findIndex(r => r.id === selectedItem.id);
                          if (fusedRank === -1) return <div className="text-[10px] font-jet text-gray-500">Not in fused results</div>;
                          return (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-jet">
                                <span className="text-gray-400">Fused Rank:</span>
                                <span className="text-accent1">#{fusedRank + 1}</span>
                              </div>
                              {activeModels.map(mk => {
                                const origRank = individualRanks[selectedItem.id]?.[mk];
                                if (!origRank) return null;
                                const delta = origRank - (fusedRank + 1);
                                const md = MODEL_DEFS.find(m => m.key === mk);
                                return (
                                  <div key={mk} className="flex justify-between text-[10px] font-jet">
                                    <span style={{ color: md?.color }}>{md?.name} #{origRank}</span>
                                    <span className={delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-500'}>
                                      {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '='}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Data Adaptation Notes */}
                  {diag.fallbacks.length > 0 && (
                    <div>
                      <div className="text-xs font-syne text-gray-400 uppercase tracking-wider mb-2">Data Adaptation</div>
                      <div className="bg-yellow-900/10 rounded p-2 border border-yellow-900/30">
                        {diag.fallbacks.map(fb => (
                          <div key={fb} className="text-[9px] font-jet text-yellow-400/80 py-0.5 leading-relaxed">
                            {fb === 'tags_from_text' && 'Tags were missing — derived from title/description tokenization.'}
                            {fb === 'synthetic_users' && 'No user data uploaded — synthetic users generated from category clusters.'}
                            {fb === 'history_from_events' && 'Sequential histories built from uploaded interaction timestamps.'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-2xl opacity-20 mb-2">🎯</div>
                  <div className="text-[10px] font-jet text-gray-500">Click an item to inspect</div>
                </div>
              )}
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}

window.ShapedModelExplorer = ShapedModelExplorer;
