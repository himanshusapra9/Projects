'use client';

import { useState } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  icon: 'positive' | 'negative' | 'neutral';
  text: string;
  confidence: 'high' | 'moderate' | 'low';
  detail?: string;
}

const MOCK_INSIGHTS: Insight[] = [
  { icon: 'positive', text: 'Reddit users frequently mention comfort for all-day wear', confidence: 'high', detail: '47 mentions across r/nursing, r/teachers, r/standingdesk' },
  { icon: 'positive', text: 'Sizing is generally accurate, runs slightly wide', confidence: 'moderate', detail: '23 mentions of sizing across multiple threads' },
  { icon: 'negative', text: 'Some users report sole separation after 6-8 months', confidence: 'moderate', detail: '12 reports across r/BuyItForLife' },
  { icon: 'neutral', text: 'Mixed reviews on color options \u2014 limited but well-chosen', confidence: 'low' },
];

export function CommunityFeedback() {
  const [expanded, setExpanded] = useState(false);

  const iconMap = {
    positive: <ThumbsUp className="h-3 w-3 text-[#059669]" />,
    negative: <ThumbsDown className="h-3 w-3 text-[#DC2626]" />,
    neutral: <AlertCircle className="h-3 w-3 text-[#D97706]" />,
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden animate-fade-up" style={{ animationDelay: '300ms' }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#FAFAF9] transition-colors">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#D97706]" />
          <h3 className="text-[13px] font-semibold">Community feedback</h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#FFFBEB] text-[#B45309] uppercase">Beta</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          <p className="text-[11px] text-muted-foreground mb-3">
            Aggregated from public discussions. Not verified product claims.
          </p>

          <div className="space-y-2.5">
            {MOCK_INSIGHTS.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">{iconMap[insight.icon]}</div>
                <div className="flex-1">
                  <p className="text-[12px] text-foreground leading-relaxed">{insight.text}</p>
                  {insight.detail && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{insight.detail}</p>
                  )}
                </div>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[9px] font-medium flex-shrink-0',
                  insight.confidence === 'high' ? 'bg-[#ECFDF5] text-[#047857]' :
                  insight.confidence === 'moderate' ? 'bg-[#FFFBEB] text-[#B45309]' :
                  'bg-[#F5F5F4] text-muted-foreground'
                )}>
                  {insight.confidence}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground italic">Source: public community discussions</p>
            <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              Learn more <ExternalLink className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
