'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Search, ArrowRight, Sparkles, ShieldCheck, Zap, Mic, MicOff,
  Bot, BarChart3, Brain, ShoppingCart, MessageSquare, SlidersHorizontal,
  Globe, Lock, Clock, ChevronRight, Star, Code2, Layers, Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EXAMPLE_QUERIES = [
  'best smartphone under $500',
  'quiet vacuum for pet hair',
  'comfortable running shoes',
  'wireless noise canceling headphones',
  'laptop for college students',
];

const STATS = [
  { value: '<2s', label: 'Query latency', sub: 'Live Bing scraping' },
  { value: '8+', label: 'Products ranked', sub: 'Per query' },
  { value: '5', label: 'Plain reasons', sub: 'Per recommendation' },
  { value: '0', label: 'API keys needed', sub: 'Zero config start' },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Live product search',
    description: 'Real-time Bing Shopping scraping. No stale catalogs, no pre-built indexes. Fresh data on every query.',
  },
  {
    icon: Brain,
    title: 'Plain-English reasons',
    description: 'Every pick comes with structured reasons: rating, price, brand trust, features. No scores — just clarity.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Dynamic smart filters',
    description: 'Filters adapt to what you search. Phones get storage & 5G. Headphones get noise-canceling & style.',
  },
  {
    icon: Mic,
    title: 'Voice search',
    description: 'Click the mic and speak naturally. Web Speech API — no external services, works on every modern browser.',
  },
  {
    icon: MessageSquare,
    title: 'Conversational refinement',
    description: 'Type follow-ups like "under $300" or "better for travel." The system appends context and re-ranks.',
  },
  {
    icon: ShoppingCart,
    title: 'Agentic "Buy for me"',
    description: 'Let the AI agent compare prices, check availability, verify return policies, and take you to checkout.',
  },
];

const USE_CASES = [
  { icon: '📱', label: 'Electronics', example: '"best phone with good camera under $400"' },
  { icon: '👟', label: 'Footwear', example: '"lightweight running shoes for flat feet"' },
  { icon: '🎧', label: 'Audio', example: '"noise canceling headphones for flights"' },
  { icon: '💻', label: 'Laptops', example: '"MacBook alternative for students"' },
  { icon: '🧹', label: 'Home', example: '"quiet robot vacuum for pet hair"' },
  { icon: '🎁', label: 'Gifts', example: '"minimalist gift for someone who has everything"' },
];

const ARCH_LAYERS = [
  {
    icon: Layers,
    title: 'Query layer',
    sub: 'Real-time retrieval & ranking',
    items: ['Bing Shopping scraper', 'Relevance scoring', 'Badge assignment'],
    color: '#7C3AED',
  },
  {
    icon: Brain,
    title: 'Intelligence layer',
    sub: 'AI models & reasoning',
    items: ['Intent parsing', 'Reason generation', 'Confidence scoring'],
    color: '#2563EB',
  },
  {
    icon: Database,
    title: 'Data layer',
    sub: 'Live sources & fallbacks',
    items: ['Bing Shopping', 'DummyJSON', 'Deduplication'],
    color: '#059669',
  },
];

function useVoice(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const ref = useRef<SpeechRecognition | null>(null);
  const toggle = useCallback(() => {
    if (listening) { ref.current?.stop(); setListening(false); return; }
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported in this browser.'); return; }
    const r = new (SR as new () => SpeechRecognition)();
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: SpeechRecognitionEvent) => { onResult(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    ref.current = r; r.start(); setListening(true);
  }, [listening, onResult]);
  return { listening, toggle };
}

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const handleVoice = useCallback((text: string) => {
    setQuery(text);
    window.location.href = `/search?q=${encodeURIComponent(text)}`;
  }, []);
  const { listening, toggle: toggleVoice } = useVoice(handleVoice);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Header ─── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 glass border-b border-border/60">
        <div className="mx-auto max-w-[1200px] px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Discovery Copilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[13px] text-muted hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-[13px] text-muted hover:text-foreground transition-colors">How it works</a>
            <a href="#use-cases" className="text-[13px] text-muted hover:text-foreground transition-colors">Use cases</a>
            <a href="#merchants" className="text-[13px] text-muted hover:text-foreground transition-colors">For merchants</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <a href="/search" className="text-[13px] font-medium text-muted hover:text-foreground transition-colors">Try it</a>
            <a href="/search" className="h-8 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium flex items-center gap-1.5 hover:bg-foreground/90 transition-colors">
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="pt-[140px] pb-20 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[800px] mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface text-[12px] font-medium text-muted mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              AI-powered product decisions — live data
            </div>

            <h1 className="text-[52px] md:text-[64px] font-bold tracking-[-0.04em] leading-[1.05]">
              The recommendation
              <br />
              engine for{' '}
              <span className="gradient-text">shopping intent.</span>
            </h1>

            <p className="mt-6 text-[18px] leading-relaxed text-muted max-w-[540px] mx-auto">
              Describe what you need in plain language. Get the best product, clear reasons why, alternatives ranked, and tradeoffs explained.
            </p>
          </div>

          {/* Search */}
          <div className="mt-12 max-w-[640px] mx-auto animate-fade-up" style={{ animationDelay: '100ms' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query)}`;
              }}
              className="relative"
            >
              <div className="relative flex items-center bg-card rounded-2xl border border-border shadow-[var(--shadow-hero)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
                <Search className="absolute left-5 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe what you're looking for..."
                  className="w-full h-[56px] pl-[52px] pr-[140px] bg-transparent text-[15px] placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <div className="absolute right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center transition-all',
                      listening
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                    )}
                    title={listening ? 'Stop' : 'Voice search'}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className={cn(
                      'h-9 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all',
                      query.trim()
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'bg-surface text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    Search
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {EXAMPLE_QUERIES.map((example, i) => (
                <button
                  key={example}
                  onClick={() => { setQuery(example); window.location.href = `/search?q=${encodeURIComponent(example)}`; }}
                  className="px-3 py-1.5 rounded-lg text-[12px] text-muted border border-transparent hover:border-border hover:text-foreground hover:bg-surface transition-all duration-200 animate-fade-up"
                  style={{ animationDelay: `${200 + i * 50}ms` }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 max-w-[800px] mx-auto animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-border overflow-hidden bg-border">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-card p-5 text-center">
                  <p className="text-[28px] font-bold tracking-tight">{stat.value}</p>
                  <p className="text-[12px] font-medium text-foreground mt-1">{stat.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Query Demo ─── */}
      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold tracking-tight">Query products like you query SQL</h2>
            <p className="mt-3 text-[15px] text-muted max-w-[480px] mx-auto">
              Natural language in, decision-quality recommendations out. Every result comes with structured reasons.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[960px] mx-auto">
            {/* Input */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-5 py-3 border-b border-border bg-surface flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[12px] font-medium text-muted">User query</span>
              </div>
              <div className="p-5">
                <p className="text-[15px] font-medium">&ldquo;best smartphone under $500&rdquo;</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <span className="h-1 w-1 rounded-full bg-purple" />
                    Intent: purchase recommendation
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <span className="h-1 w-1 rounded-full bg-purple" />
                    Budget: hard cap $500
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <span className="h-1 w-1 rounded-full bg-purple" />
                    Category: smartphones
                  </div>
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="rounded-2xl border border-border bg-[#09090B] text-white overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple" />
                <span className="text-[12px] font-medium text-white/60">AI Response</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed">
                <div className="text-white/40">{'{'}</div>
                <div className="ml-4">
                  <span className="text-purple-light">&quot;best_pick&quot;</span><span className="text-white/40">: </span><span className="text-emerald-400">&quot;Samsung Galaxy A54&quot;</span><span className="text-white/40">,</span>
                </div>
                <div className="ml-4">
                  <span className="text-purple-light">&quot;price&quot;</span><span className="text-white/40">: </span><span className="text-amber-400">$319</span><span className="text-white/40">,</span>
                </div>
                <div className="ml-4">
                  <span className="text-purple-light">&quot;reasons&quot;</span><span className="text-white/40">: [</span>
                </div>
                <div className="ml-8 text-emerald-400">&quot;Rated 4.6/5 by 1,200+ buyers&quot;</div>
                <div className="ml-8 text-emerald-400">&quot;$181 under your budget&quot;</div>
                <div className="ml-8 text-emerald-400">&quot;Samsung — trusted brand&quot;</div>
                <div className="ml-4 text-white/40">]</div>
                <div className="text-white/40">{'}'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-14">
            <h2 className="text-[32px] font-bold tracking-tight">Built for every shopping decision</h2>
            <p className="mt-3 text-[15px] text-muted max-w-[480px] mx-auto">
              One engine to search, rank, explain, and purchase. Voice, text, or conversation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-7 hover:shadow-[var(--shadow-card-hover)] hover:border-border transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center mb-5 group-hover:bg-foreground group-hover:border-foreground transition-colors duration-300">
                  <feature.icon className="h-5 w-5 text-foreground group-hover:text-background transition-colors duration-300" />
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Architecture ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-surface border-y border-border">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-14">
            <h2 className="text-[32px] font-bold tracking-tight">Three-layer architecture</h2>
            <p className="mt-3 text-[15px] text-muted max-w-[480px] mx-auto">
              A unified, queryable recommendation engine built for real-time product decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto">
            {ARCH_LAYERS.map((layer, i) => (
              <div
                key={layer.title}
                className="rounded-2xl border border-border bg-card p-6 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${layer.color}15` }}>
                  <layer.icon className="h-5 w-5" style={{ color: layer.color }} />
                </div>
                <h3 className="text-[15px] font-semibold">{layer.title}</h3>
                <p className="text-[12px] text-muted mt-1 mb-4">{layer.sub}</p>
                <div className="space-y-2">
                  {layer.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full" style={{ backgroundColor: layer.color }} />
                      <span className="text-[12px] text-muted">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="/search" className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground hover:text-purple transition-colors">
              See it in action
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section id="use-cases" className="py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-14">
            <h2 className="text-[32px] font-bold tracking-tight">Built for every category</h2>
            <p className="mt-3 text-[15px] text-muted max-w-[480px] mx-auto">
              Dynamic filters, badges, and reasons adapt to what you're shopping for.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[800px] mx-auto">
            {USE_CASES.map((uc, i) => (
              <button
                key={uc.label}
                onClick={() => { window.location.href = `/search?q=${encodeURIComponent(uc.example.replace(/"/g, ''))}`; }}
                className="group rounded-xl border border-border bg-card p-5 text-left hover:shadow-[var(--shadow-card-hover)] hover:border-foreground/10 transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-[24px]">{uc.icon}</span>
                <p className="mt-2 text-[14px] font-semibold">{uc.label}</p>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">{uc.example}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-purple opacity-0 group-hover:opacity-100 transition-opacity">
                  Try this
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── For Merchants ─── */}
      <section id="merchants" className="py-24 px-6 bg-foreground text-background">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <p className="text-[12px] font-medium text-white/40 uppercase tracking-wider mb-4">For merchants</p>
            <h2 className="text-[36px] font-bold tracking-tight leading-tight">
              Embed AI-powered product decisions into your store.
            </h2>
            <p className="mt-4 text-[15px] text-white/50 leading-relaxed">
              Works with Shopify, BigCommerce, custom stores, and any product catalog. API, SDK, or drop-in hosted page.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              {[
                { label: 'API / SDK', desc: 'Embed decisions into your UI with full control.', icon: Code2 },
                { label: 'Hosted search', desc: 'Drop-in search page with your branding.', icon: Globe },
                { label: 'Analytics', desc: 'CTR, conversion, and return-rate impact.', icon: BarChart3 },
                { label: 'Secure', desc: 'No API keys required for core search.', icon: Lock },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-5 flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-white/60" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">{item.label}</p>
                    <p className="mt-0.5 text-[12px] text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <a href="/search" className="h-10 px-5 rounded-xl bg-white text-black text-[13px] font-semibold flex items-center gap-2 hover:bg-white/90 transition-colors">
                Start free
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a href="#features" className="h-10 px-5 rounded-xl border border-white/20 text-[13px] font-medium flex items-center hover:bg-white/5 transition-colors">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-[1200px] text-center">
          <h2 className="text-[36px] font-bold tracking-tight">Get started today</h2>
          <p className="mt-4 text-[15px] text-muted max-w-[420px] mx-auto">
            No API keys. No database setup. Install, run, and search live products in under 60 seconds.
          </p>

          <div className="mt-10 max-w-[600px] mx-auto rounded-2xl border border-border bg-[#09090B] text-white overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-white/10" />
                <span className="h-3 w-3 rounded-full bg-white/10" />
                <span className="h-3 w-3 rounded-full bg-white/10" />
              </div>
              <span className="text-[11px] text-white/30 ml-2">Terminal</span>
            </div>
            <div className="p-5 font-mono text-[13px] leading-loose text-left">
              <div><span className="text-emerald-400">$</span> git clone https://github.com/himanshusapra9/Projects.git</div>
              <div><span className="text-emerald-400">$</span> cd &quot;Intent-to-Product Discovery Copilot/discovery-copilot&quot;</div>
              <div><span className="text-emerald-400">$</span> npm install && npm run dev</div>
              <div className="mt-2 text-white/40"># Open http://localhost:3000</div>
            </div>
          </div>

          <div className="mt-8">
            <a href="/search" className="inline-flex h-11 px-6 rounded-xl bg-foreground text-background text-[14px] font-semibold items-center gap-2 hover:bg-foreground/90 transition-colors">
              Try it now
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-foreground flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-background" />
              </div>
              <span className="text-[14px] font-semibold">Discovery Copilot</span>
            </div>

            <div className="flex items-center gap-8">
              <a href="#features" className="text-[12px] text-muted hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-[12px] text-muted hover:text-foreground transition-colors">Architecture</a>
              <a href="#use-cases" className="text-[12px] text-muted hover:text-foreground transition-colors">Use cases</a>
              <a href="#merchants" className="text-[12px] text-muted hover:text-foreground transition-colors">Merchants</a>
              <a href="https://github.com/himanshusapra9/Projects/tree/main/Intent-to-Product%20Discovery%20Copilot" target="_blank" rel="noopener noreferrer" className="text-[12px] text-muted hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-muted-foreground">
              Created by <span className="font-semibold text-foreground">Himanshu Sapra</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              AI-powered product decisions for commerce
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
