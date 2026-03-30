'use client';

import { Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlternativeCardProps {
  rank: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  headline: string;
  badge?: string;
  imageUrl?: string;
  productUrl?: string;
}

export function AlternativeCard({ rank, name, brand, price, rating, reviewCount, headline, badge, imageUrl, productUrl = '#' }: AlternativeCardProps) {
  return (
    <a
      href={productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-border-strong transition-all duration-200 animate-fade-up"
      style={{ animationDelay: `${rank * 80}ms` }}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg bg-[#F5F5F4] flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Image</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground/60">#{rank}</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{brand}</span>
            </div>
            {badge && (
              <span className={cn(
                'px-2 py-0.5 rounded-md text-[10px] font-medium',
                badge === 'Best Value' ? 'bg-[#EFF6FF] text-[#1D4ED8]' :
                badge === 'Premium' ? 'bg-[#F5F5F4] text-foreground' :
                badge === 'Low Risk' ? 'bg-[#ECFDF5] text-[#047857]' :
                'bg-[#ECFDF5] text-[#047857]'
              )}>
                {badge}
              </span>
            )}
          </div>
          <h4 className="mt-1 text-[14px] font-semibold tracking-tight leading-snug truncate">{name}</h4>
          <p className="mt-1 text-[12px] text-muted leading-relaxed line-clamp-1">{headline}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[16px] font-bold">${price}</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-[11px] text-muted-foreground">{rating} ({reviewCount.toLocaleString()})</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </div>
    </a>
  );
}
