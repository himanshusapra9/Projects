'use client';

import { Brain, TrendingUp, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface DecisionRationaleProps {
  query?: string;
  confidence?: number;
  productCount?: number;
}

export function DecisionRationale({ query = '', confidence = 87, productCount = 8 }: DecisionRationaleProps) {
  const confColor = confidence >= 80 ? '#059669' : confidence >= 60 ? '#D97706' : '#DC2626';
  const confLabel = confidence >= 80 ? 'High' : confidence >= 60 ? 'Moderate' : 'Low';

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden animate-fade-up" style={{ animationDelay: '200ms' }}>
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-[13px] font-semibold">Decision rationale</h3>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Confidence</span>
            <span className="text-[13px] font-semibold" style={{ color: confColor }}>{confLabel} ({confidence}%)</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#F5F5F4] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${confidence}%`, backgroundColor: confColor }} />
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Strategy</h4>
          <p className="text-[13px] text-muted leading-relaxed">
            Ranked {productCount} live results by relevance to &ldquo;{query}&rdquo;, weighted by rating, price value, and review sentiment.
          </p>
        </div>

        <div>
          <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Key ranking factors</h4>
          <div className="space-y-2.5">
            <RankingFactor icon={<TrendingUp className="h-3.5 w-3.5" />} label="Query relevance" value="High" color="#059669" />
            <RankingFactor icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Return risk" value="Factored" color="#059669" />
            <RankingFactor label="Review sentiment" value="Weighted" color="#F59E0B" />
            <RankingFactor label="Price-to-value" value="Analyzed" color="#2563EB" />
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Could improve with</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <AlertCircle className="h-3 w-3 text-muted-foreground" />
              Specific use-case for better matching
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <AlertCircle className="h-3 w-3 text-muted-foreground" />
              Budget range for price optimization
            </div>
          </div>
        </div>

        <button className="w-full h-9 rounded-lg border border-border bg-[#F5F5F4] text-[12px] font-medium text-foreground flex items-center justify-center gap-1.5 hover:bg-[#EBEBEA] transition-colors">
          Compare top 3
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function RankingFactor({ icon, label, value, color }: { icon?: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-[12px] text-muted">{label}</span>
      </div>
      <span className="text-[12px] font-medium" style={{ color }}>{value}</span>
    </div>
  );
}
