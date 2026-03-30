'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, ArrowRight, Sparkles, ShieldCheck, Zap, Mic, MicOff, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXAMPLE_QUERIES = [
  'best smartphone under $500',
  'quiet vacuum for pet hair',
  'comfortable running shoes',
  'wireless noise canceling headphones',
  'laptop for college students',
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
  const [focusedExample, setFocusedExample] = useState<number | null>(null);
  const handleVoice = useCallback((text: string) => {
    setQuery(text);
    window.location.href = `/search?q=${encodeURIComponent(text)}`;
  }, []);
  const { listening, toggle: toggleVoice } = useVoice(handleVoice);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-[1280px] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Discovery Copilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-[13px] text-muted hover:text-foreground transition-colors">How it works</a>
            <a href="#merchants" className="text-[13px] text-muted hover:text-foreground transition-colors">For merchants</a>
            <a href="/docs" className="text-[13px] text-muted hover:text-foreground transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/search" className="text-[13px] font-medium text-muted hover:text-foreground transition-colors">Try it</a>
            <a href="/dashboard" className="h-8 px-3.5 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium flex items-center gap-1.5 hover:bg-accent/90 transition-colors">
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[680px] mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F5F4] text-[12px] font-medium text-muted mb-6">
              <Sparkles className="h-3 w-3" />
              AI-powered product decisions
            </div>

            <h1 className="text-[48px] md:text-[56px] font-bold tracking-[-0.035em] leading-[1.08] text-foreground">
              Tell me what to buy
              <br />
              <span className="text-muted-foreground">and why.</span>
            </h1>

            <p className="mt-5 text-[17px] leading-relaxed text-muted max-w-[480px] mx-auto">
              Describe what you need in plain language. Our AI finds the best product, explains why it fits, and flags the tradeoffs.
            </p>
          </div>

          {/* Search input */}
          <div className="mt-10 max-w-[640px] mx-auto animate-fade-up" style={{ animationDelay: '150ms' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query)}`;
              }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-black/[0.03] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity -m-px" />
              <div className="relative flex items-center bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] group-focus-within:shadow-[var(--shadow-card-hover)] group-focus-within:border-foreground/15 transition-all duration-200">
                <Search className="absolute left-5 h-[18px] w-[18px] text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe what you're looking for..."
                  className="w-full h-14 pr-36 bg-transparent text-[15px] placeholder:text-muted-foreground/60 focus:outline-none"
                  style={{ paddingLeft: '52px' }}
                />
                <div className="absolute right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center transition-all',
                      listening
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'text-muted-foreground hover:text-foreground hover:bg-[#F5F5F4]'
                    )}
                    title={listening ? 'Stop' : 'Voice search'}
                  >
                    {listening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className={cn(
                      'h-9 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all duration-200',
                      query.trim()
                        ? 'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90'
                        : 'bg-[#F5F5F4] text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    Find
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Example queries */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {EXAMPLE_QUERIES.map((example, i) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  onMouseEnter={() => setFocusedExample(i)}
                  onMouseLeave={() => setFocusedExample(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[12px] border transition-all duration-200 animate-fade-up',
                    focusedExample === i
                      ? 'bg-card border-border text-foreground shadow-sm'
                      : 'bg-transparent border-transparent text-muted hover:text-foreground'
                  )}
                  style={{ animationDelay: `${300 + i * 60}ms` }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section id="how" className="py-24 px-6 border-t border-border/50">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold tracking-tight">Not search. Decisions.</h2>
            <p className="mt-3 text-[15px] text-muted max-w-[420px] mx-auto">
              Traditional search gives you a list. We give you a recommendation with evidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-powered decisions',
                description: 'Understands vague intent like "good for travel" or "not too flashy" and maps it to real product attributes and review evidence.',
              },
              {
                icon: Bot,
                title: 'Buy for me',
                description: 'Let our AI agent handle the shopping. It compares prices, checks availability, verifies return policies, and sends you straight to checkout.',
              },
              {
                icon: Mic,
                title: 'Voice & conversation',
                description: 'Speak naturally or type follow-up questions. Refine your search in a conversation, not a filter maze.',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-[#F5F5F4] flex items-center justify-center mb-5">
                  <feature.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For merchants */}
      <section id="merchants" className="py-24 px-6 bg-accent text-accent-foreground">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[600px]">
            <h2 className="text-[32px] font-bold tracking-tight">For merchants</h2>
            <p className="mt-3 text-[15px] text-white/60 leading-relaxed">
              Embed AI-powered product decisions into your store via API, or use our hosted search page. Works with Shopify, BigCommerce, custom stores, and any product catalog.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {[
                { label: 'API / SDK', desc: 'Embed decisions into your own UI. Full control.' },
                { label: 'Hosted search', desc: 'Drop-in search page with your branding. Deploy in a day.' },
                { label: 'Catalog sync', desc: 'JSON feed, CSV, or Shopify/BigCommerce native.' },
                { label: 'Analytics', desc: 'CTR, conversion, return-rate impact by recommendation.' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.06] border border-white/[0.08] p-5">
                  <div className="text-[13px] font-semibold">{item.label}</div>
                  <div className="mt-1 text-[12px] text-white/50">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <a href="/dashboard" className="h-10 px-5 rounded-xl bg-white text-black text-[13px] font-semibold flex items-center gap-2 hover:bg-white/90 transition-colors">
                Start free
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a href="/docs" className="h-10 px-5 rounded-xl border border-white/20 text-[13px] font-medium flex items-center hover:bg-white/5 transition-colors">
                Read docs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-accent-foreground" />
            </div>
            <span className="text-[13px] font-medium">Discovery Copilot</span>
          </div>
          <div className="text-[12px] text-muted-foreground">
            AI-powered product decisions for commerce
          </div>
        </div>
      </footer>
    </div>
  );
}
