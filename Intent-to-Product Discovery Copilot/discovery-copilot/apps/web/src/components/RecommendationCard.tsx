'use client';

import { useState } from 'react';
import type { RankedCandidate, FeedbackEventType } from '@discovery-copilot/types';

interface RecommendationCardProps {
  candidate: RankedCandidate;
  onFeedback: (type: FeedbackEventType, productId?: string) => void;
}

export function RecommendationCard({ candidate, onFeedback }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { product, explanation, badges, tradeoffs } = candidate;

  return (
    <div className="group rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className="aspect-square bg-stone-100 relative">
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badges.map((badge) => (
              <span
                key={badge.type}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeColor(badge.type)}`}
                title={badge.tooltip}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Rank indicator */}
        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-semibold text-stone-700 shadow-sm">
          #{candidate.rank}
        </div>
      </div>

      <div className="p-4">
        {/* Product info */}
        <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">{product.brand}</p>
        <h3 className="mt-0.5 text-sm font-medium text-stone-900 line-clamp-2">{product.name}</h3>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold text-stone-900">
            ${product.price.amount.toFixed(2)}
          </span>
          {product.price.originalAmount && product.price.originalAmount > product.price.amount && (
            <>
              <span className="text-sm text-stone-400 line-through">
                ${product.price.originalAmount.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-emerald-600">
                -{product.price.discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Review summary */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-3.5 w-3.5 ${star <= Math.round(product.reviewSummary.averageRating) ? 'text-amber-400' : 'text-stone-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-stone-500">
            {product.reviewSummary.averageRating} ({product.reviewSummary.totalReviews})
          </span>
        </div>

        {/* Explanation headline */}
        <p className="mt-3 text-xs text-stone-600 leading-relaxed">
          {explanation.headline || 'Matches your requirements'}
        </p>

        {/* Tradeoffs */}
        {tradeoffs.length > 0 && (
          <div className="mt-2">
            {tradeoffs.map((tradeoff, i) => (
              <p key={i} className="text-[11px] text-amber-700 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {tradeoff.description}
              </p>
            ))}
          </div>
        )}

        {/* Expandable details */}
        {expanded && (
          <div className="mt-3 border-t border-stone-100 pt-3 space-y-2">
            {explanation.reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                  reason.strength === 'strong' ? 'bg-emerald-500' :
                  reason.strength === 'moderate' ? 'bg-amber-500' : 'bg-stone-400'
                }`} />
                <p className="text-[11px] text-stone-600">{reason.text}</p>
              </div>
            ))}

            {explanation.reviewHighlights.map((highlight, i) => (
              <blockquote key={i} className="border-l-2 border-stone-200 pl-2 text-[11px] text-stone-500 italic">
                "{highlight.snippet}"
                <span className="ml-1 not-italic text-amber-500">{'★'.repeat(highlight.rating)}</span>
              </blockquote>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-stone-500 hover:text-stone-700"
          >
            {expanded ? 'Show less' : 'Why this?'}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onFeedback('thumbs_up', product.id)}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 hover:text-emerald-600 transition-colors"
              title="Good recommendation"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              onClick={() => onFeedback('thumbs_down', product.id)}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 hover:text-rose-600 transition-colors"
              title="Not what I want"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
            <button
              onClick={() => onFeedback('click', product.id)}
              className="rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-stone-800 transition-colors"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function badgeColor(type: string): string {
  const colors: Record<string, string> = {
    best_match: 'bg-emerald-50 text-emerald-700',
    best_value: 'bg-blue-50 text-blue-700',
    low_return_risk: 'bg-teal-50 text-teal-700',
    top_rated: 'bg-amber-50 text-amber-700',
    great_for_use_case: 'bg-violet-50 text-violet-700',
    budget_friendly: 'bg-green-50 text-green-700',
    premium_choice: 'bg-slate-100 text-slate-700',
    most_popular: 'bg-orange-50 text-orange-700',
  };
  return colors[type] ?? 'bg-stone-100 text-stone-700';
}
