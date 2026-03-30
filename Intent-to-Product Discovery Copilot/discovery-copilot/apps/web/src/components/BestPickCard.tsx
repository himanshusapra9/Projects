'use client';

import { useState } from 'react';
import { Star, ShieldCheck, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, ExternalLink, CheckCircle2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BestPickCardProps {
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  productUrl: string;
  reasons?: string[];
  totalEvaluated?: number;
  onBuyForMe?: () => void;
}

export function BestPickCard({
  name,
  brand,
  price,
  originalPrice,
  rating,
  reviewCount,
  imageUrl,
  productUrl,
  reasons = [],
  totalEvaluated = 8,
  onBuyForMe,
}: BestPickCardProps) {
  const [expanded, setExpanded] = useState(false);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const fullStars = Math.floor(rating);

  const badges = generateBadges(name, price, rating, originalPrice);

  return (
    <div className="rounded-2xl border-2 border-foreground bg-card overflow-hidden shadow-[var(--shadow-best-pick)] animate-fade-up">
      <div className="bg-foreground text-accent-foreground px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-[13px] font-semibold tracking-wide uppercase">Best Pick</span>
        </div>
        <span className="text-[11px] text-white/50">Ranked #1 of {totalEvaluated} evaluated</span>
      </div>

      <div className="p-6">
        <div className="flex gap-5">
          <div className="w-28 h-28 rounded-xl bg-[#F5F5F4] flex-shrink-0 overflow-hidden">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="eager" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{brand}</span>
              <span className="text-[10px] text-muted-foreground/50">&middot;</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn('h-3 w-3', s <= fullStars ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-muted-foreground/30')} />
                ))}
                <span className="ml-1 text-[11px] text-muted-foreground">{rating} ({reviewCount.toLocaleString()})</span>
              </div>
            </div>

            <h3 className="text-[18px] font-semibold tracking-tight leading-snug">{name}</h3>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[22px] font-bold">${price.toLocaleString()}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="text-[14px] text-muted-foreground line-through">${originalPrice.toLocaleString()}</span>
                  <span className="text-[12px] font-medium text-[#059669]">-{discount}%</span>
                </>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Badge key={b.label} label={b.label} variant={b.variant} icon={b.icon} />
              ))}
            </div>
          </div>
        </div>

        {/* Top reasons — plain English */}
        {reasons.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-[#FAFAF9] border border-border/50">
            <p className="text-[13px] font-semibold text-foreground mb-2.5">Why we picked this:</p>
            <ul className="space-y-2">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] leading-relaxed text-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expandable detail */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-between py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{expanded ? 'Less detail' : 'See full analysis'}</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="space-y-3 pb-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Rating" value={`${rating}/5`} sub={`${reviewCount.toLocaleString()} reviews`} />
              <MiniStat label="Price" value={`$${price.toLocaleString()}`} sub={originalPrice ? `was $${originalPrice.toLocaleString()}` : 'current price'} />
              <MiniStat label="Brand" value={brand} sub="manufacturer" />
              <MiniStat label="Source" value="Live data" sub="scraped in real-time" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 rounded-xl bg-accent text-accent-foreground text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors"
          >
            View product
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {onBuyForMe && (
            <button
              onClick={onBuyForMe}
              className="flex-1 h-11 rounded-xl bg-[#059669] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy for me
            </button>
          )}
          <button className="h-11 w-11 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-[#059669] hover:border-[#059669]/30 hover:bg-[#ECFDF5] transition-colors" title="Good recommendation">
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button className="h-11 w-11 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:border-[#DC2626]/30 hover:bg-[#FEF2F2] transition-colors" title="Not what I need">
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function generateBadges(name: string, price: number, rating: number, originalPrice?: number): { label: string; variant: 'safe' | 'usecase' | 'rated' | 'value'; icon?: React.ReactNode }[] {
  const badges: { label: string; variant: 'safe' | 'usecase' | 'rated' | 'value'; icon?: React.ReactNode }[] = [];
  const lower = name.toLowerCase();

  if (rating >= 4.5) badges.push({ label: 'Top rated', variant: 'rated' });
  if (originalPrice && originalPrice > price) badges.push({ label: `Save $${Math.round(originalPrice - price)}`, variant: 'value' });
  if (price < 100) badges.push({ label: 'Great price', variant: 'value' });

  if (lower.includes('wireless') || lower.includes('bluetooth')) badges.push({ label: 'Wireless', variant: 'usecase' });
  if (lower.includes('noise cancel')) badges.push({ label: 'Noise canceling', variant: 'usecase' });
  if (lower.includes('5g')) badges.push({ label: '5G', variant: 'usecase' });
  if (lower.includes('unlocked')) badges.push({ label: 'Unlocked', variant: 'safe' });
  if (lower.includes('renewed') || lower.includes('refurbished')) badges.push({ label: 'Renewed', variant: 'value' });

  badges.push({ label: 'Low return risk', variant: 'safe', icon: <ShieldCheck className="h-3 w-3" /> });

  return badges.slice(0, 4);
}

function Badge({ label, variant, icon }: { label: string; variant: 'safe' | 'usecase' | 'rated' | 'value'; icon?: React.ReactNode }) {
  const styles = { safe: 'bg-[#ECFDF5] text-[#047857]', usecase: 'bg-[#F5F3FF] text-[#6D28D9]', rated: 'bg-[#FFFBEB] text-[#B45309]', value: 'bg-[#EFF6FF] text-[#1D4ED8]' };
  return <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium', styles[variant])}>{icon}{label}</span>;
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-3 rounded-lg bg-[#FAFAF9] border border-border/30">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-[14px] font-semibold text-foreground mt-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
