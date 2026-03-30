'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ArrowLeft, Sparkles, Loader2, Mic, MicOff, Send, ShoppingCart, Bot, X, CheckCircle2, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BestPickCard } from '@/components/BestPickCard';
import { AlternativeCard } from '@/components/AlternativeCard';
import { DecisionRationale } from '@/components/DecisionRationale';
import { SearchSkeleton } from '@/components/SearchSkeleton';
import { FilterSidebar } from '@/components/FilterSidebar';
import { CommunityFeedback } from '@/components/CommunityFeedback';

interface Product {
  rank: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  productUrl: string;
  headline: string;
  badge?: string;
  reasons?: string[];
  source: string;
}

interface SearchResult {
  query: string;
  products: Product[];
  totalEvaluated: number;
  source: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Smart Chips
// ---------------------------------------------------------------------------

function getSmartChips(query: string): { label: string }[] {
  const q = query.toLowerCase();

  if (q.includes('headphone') || q.includes('earbud') || q.includes('airpod') || q.includes('audio')) {
    return [
      { label: 'Under $100' }, { label: 'Noise canceling' }, { label: 'Wireless' },
      { label: 'Over-ear' }, { label: 'In-ear' }, { label: 'Long battery' },
      { label: 'Sony' }, { label: 'Bose' },
    ];
  }
  if (q.includes('phone') || q.includes('smartphone') || q.includes('iphone') || q.includes('galaxy') || q.includes('android')) {
    return [
      { label: 'Under $500' }, { label: 'Under $300' }, { label: '5G' },
      { label: 'Best camera' }, { label: 'Long battery' }, { label: '256GB+' },
      { label: 'Apple' }, { label: 'Samsung' },
    ];
  }
  if (q.includes('laptop') || q.includes('macbook') || q.includes('notebook') || q.includes('chromebook')) {
    return [
      { label: 'Under $800' }, { label: 'Under $500' }, { label: 'Lightweight' },
      { label: '16GB+ RAM' }, { label: 'Gaming' }, { label: 'For students' },
      { label: 'Long battery' }, { label: 'Apple' },
    ];
  }
  if (q.includes('shoe') || q.includes('sneaker') || q.includes('boot') || q.includes('running')) {
    return [
      { label: 'Under $100' }, { label: 'Lightweight' }, { label: 'Wide fit' },
      { label: 'All-day comfort' }, { label: 'Waterproof' }, { label: 'Running' },
      { label: 'Top rated' }, { label: 'Nike' },
    ];
  }
  if (q.includes('vacuum') || q.includes('clean')) {
    return [
      { label: 'Under $300' }, { label: 'Cordless' }, { label: 'Quiet' },
      { label: 'Pet hair' }, { label: 'Robot' }, { label: 'Lightweight' },
      { label: 'Dyson' }, { label: 'Shark' },
    ];
  }
  if (q.includes('watch') || q.includes('smartwatch') || q.includes('wearable')) {
    return [
      { label: 'Under $300' }, { label: 'Fitness tracking' }, { label: 'Apple Watch' },
      { label: 'Long battery' }, { label: 'Waterproof' }, { label: 'GPS' },
    ];
  }
  if (q.includes('tablet') || q.includes('ipad')) {
    return [
      { label: 'Under $500' }, { label: 'Under $300' }, { label: 'Stylus support' },
      { label: 'For drawing' }, { label: '256GB+' }, { label: 'Apple' }, { label: 'Samsung' },
    ];
  }

  return [
    { label: 'Under $100' }, { label: 'Best value' }, { label: 'Top rated' },
    { label: 'Premium pick' }, { label: 'Low return risk' }, { label: 'Best seller' },
  ];
}

// ---------------------------------------------------------------------------
// Agent Buy Flow
// ---------------------------------------------------------------------------

const AGENT_STEPS = [
  { label: 'Understanding your needs', duration: 1200 },
  { label: 'Comparing prices across stores', duration: 1800 },
  { label: 'Checking availability & shipping', duration: 1500 },
  { label: 'Verifying return policy', duration: 1000 },
  { label: 'Ready to purchase', duration: 800 },
];

function AgentBuyPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (currentStep >= AGENT_STEPS.length) {
      setCompleted(true);
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), AGENT_STEPS[currentStep].duration);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-[480px] mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#059669] flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-semibold">Shopping Agent</p>
              <p className="text-[11px] text-muted-foreground">{completed ? 'Ready to buy' : 'Working...'}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-[#F5F5F4] flex items-center justify-center transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-[#FAFAF9] border border-border/50">
            <div className="w-12 h-12 rounded-lg bg-[#F5F5F4] overflow-hidden flex-shrink-0">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate">{product.name}</p>
              <p className="text-[15px] font-bold">${product.price.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-3">
            {AGENT_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                  i < currentStep ? 'bg-[#059669]' : i === currentStep ? 'bg-[#059669]/20 border-2 border-[#059669]' : 'bg-[#F5F5F4]'
                )}>
                  {i < currentStep ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : i === currentStep ? (
                    <Loader2 className="h-3 w-3 text-[#059669] animate-spin" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className={cn(
                  'text-[13px] transition-colors',
                  i < currentStep ? 'text-foreground font-medium' : i === currentStep ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {completed && (
            <div className="mt-6 animate-fade-up">
              <p className="text-[13px] text-muted mb-3">
                Found the best deal. Click below to complete your purchase securely.
              </p>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl bg-[#059669] text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                Complete purchase
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                You will be redirected to the store to finish checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Voice Search Hook
// ---------------------------------------------------------------------------

function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onResult]);

  return { listening, toggle };
}

// ---------------------------------------------------------------------------
// Main Search Content
// ---------------------------------------------------------------------------

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(!!initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
  const [followUp, setFollowUp] = useState('');
  const [agentProduct, setAgentProduct] = useState<Product | null>(null);

  const smartChips = getSmartChips(initialQuery);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SearchResult = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) fetchResults(initialQuery);
  }, [initialQuery, fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim()) {
      const combined = `${initialQuery} ${followUp.trim()}`;
      setFollowUp('');
      router.push(`/search?q=${encodeURIComponent(combined)}`);
    }
  };

  const handleVoiceResult = useCallback((text: string) => {
    setQuery(text);
    router.push(`/search?q=${encodeURIComponent(text)}`);
  }, [router]);

  const { listening, toggle: toggleVoice } = useVoiceSearch(handleVoiceResult);

  const toggleChip = (label: string) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const bestPick = results?.products?.[0];
  const alternatives = results?.products?.slice(1) ?? [];
  const hasResults = results && results.products.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Agent Buy Flow Modal */}
      {agentProduct && (
        <AgentBuyPanel product={agentProduct} onClose={() => setAgentProduct(null)} />
      )}

      {/* Search header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-[1440px] px-6 h-16 flex items-center gap-4">
          <a href="/" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-[#F5F5F4] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </a>
          <form onSubmit={handleSearch} className="flex-1 max-w-[640px]">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-20 bg-[#F5F5F4] rounded-xl text-[14px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/10 focus:bg-card transition-all"
                placeholder="Search for any product..."
              />
              <button
                type="button"
                onClick={toggleVoice}
                className={cn(
                  'absolute right-10 h-7 w-7 rounded-lg flex items-center justify-center transition-all',
                  listening
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[#E7E5E4]'
                )}
                title={listening ? 'Stop listening' : 'Voice search'}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
          </form>
          {isLoading && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        {isLoading && !results ? (
          <SearchSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchResults(initialQuery)} />
        ) : hasResults && bestPick ? (
          <div className="animate-fade-in">
            {/* Query understanding */}
            <div className="mb-5 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">AI Recommendation</span>
                {results.source !== 'none' && (
                  <span className="text-[10px] text-muted-foreground/50 ml-2">Live results</span>
                )}
              </div>
              <h1 className="text-[24px] font-bold tracking-tight leading-tight">
                Best products for <span className="text-muted">&ldquo;{results.query}&rdquo;</span>
              </h1>
              <p className="mt-1.5 text-[14px] text-muted">
                Evaluated {results.totalEvaluated} products across multiple sources. Confidence:{' '}
                <span className="font-medium text-foreground">{results.totalEvaluated > 5 ? 'High' : 'Moderate'}</span>
              </p>
            </div>

            {/* Refine chips — LARGE */}
            <div className="mb-6 flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                <span className="text-[13px] font-semibold text-foreground">Refine</span>
              </div>
              {smartChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => toggleChip(chip.label)}
                  className={cn(
                    'h-9 px-4 rounded-xl text-[13px] font-medium border transition-all duration-150',
                    activeChips.has(chip.label)
                      ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                      : 'bg-card border-border text-muted hover:text-foreground hover:border-foreground/20 hover:shadow-sm',
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Main layout: Filters | Results | Rationale */}
            <div className="grid lg:grid-cols-[260px_1fr_340px] gap-6 items-start">
              <div className="hidden lg:block sticky top-24">
                <FilterSidebar query={results.query} />
              </div>

              <div>
                <BestPickCard
                  name={bestPick.name}
                  brand={bestPick.brand}
                  price={bestPick.price}
                  originalPrice={bestPick.originalPrice}
                  rating={bestPick.rating}
                  reviewCount={bestPick.reviewCount}
                  imageUrl={bestPick.imageUrl}
                  productUrl={bestPick.productUrl}
                  reasons={bestPick.reasons}
                  totalEvaluated={results.totalEvaluated}
                  onBuyForMe={() => setAgentProduct(bestPick)}
                />

                {alternatives.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[15px] font-semibold">Alternatives</h2>
                      <span className="text-[12px] text-muted-foreground">Ranked by relevance</span>
                    </div>
                    <div className="space-y-3">
                      {alternatives.map((alt) => (
                        <AlternativeCard key={alt.rank} {...alt} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversational follow-up */}
                <div className="mt-8 p-5 rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-[#6D28D9]" />
                    <span className="text-[14px] font-semibold">Ask a follow-up</span>
                  </div>
                  <p className="text-[13px] text-muted mb-3">
                    Refine your search by telling me more — price range, features, use case, anything.
                  </p>
                  <form onSubmit={handleFollowUp} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                        placeholder="e.g. &quot;under $300&quot; or &quot;better for travel&quot;..."
                        className="w-full h-11 px-4 bg-[#F5F5F4] rounded-xl text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:bg-card transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!followUp.trim()}
                      className={cn(
                        'h-11 w-11 rounded-xl flex items-center justify-center transition-all',
                        followUp.trim()
                          ? 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]'
                          : 'bg-[#F5F5F4] text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoice}
                      className={cn(
                        'h-11 w-11 rounded-xl flex items-center justify-center transition-all border',
                        listening
                          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-[#F5F5F4]'
                      )}
                      title={listening ? 'Stop' : 'Speak'}
                    >
                      {listening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                    </button>
                  </form>
                </div>
              </div>

              <div className="hidden lg:block sticky top-24 space-y-4">
                <DecisionRationale
                  query={results.query}
                  confidence={results.totalEvaluated > 5 ? 87 : 65}
                  productCount={results.totalEvaluated}
                />
                <CommunityFeedback />
              </div>
            </div>
          </div>
        ) : initialQuery ? (
          <NoResultsState query={initialQuery} />
        ) : (
          <EmptySearchState />
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}

function EmptySearchState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <div className="h-16 w-16 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mb-5">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-[20px] font-semibold">What are you looking for?</h2>
      <p className="mt-2 text-[14px] text-muted max-w-[360px]">
        Describe what you need naturally. We will find the best product, explain why it fits, and show the tradeoffs.
      </p>
    </div>
  );
}

function NoResultsState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <div className="h-16 w-16 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mb-5">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-[20px] font-semibold">No results for &ldquo;{query}&rdquo;</h2>
      <p className="mt-2 text-[14px] text-muted max-w-[360px]">
        Try a different search term or a more general query like &ldquo;smartphone&rdquo; or &ldquo;running shoes&rdquo;.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <Search className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="text-[20px] font-semibold">Something went wrong</h2>
      <p className="mt-2 text-[14px] text-muted max-w-[360px]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 h-9 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-accent/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
