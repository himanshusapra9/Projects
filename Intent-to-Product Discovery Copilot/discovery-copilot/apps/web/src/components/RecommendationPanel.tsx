'use client';

import type { SubmitQueryResponse, FeedbackEventType } from '@discovery-copilot/types';
import { RecommendationCard } from './RecommendationCard';

interface RecommendationPanelProps {
  response: SubmitQueryResponse;
  onFeedback: (type: FeedbackEventType, productId?: string) => void;
}

export function RecommendationPanel({ response, onFeedback }: RecommendationPanelProps) {
  const recs = response.recommendations;
  if (!recs || recs.candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-stone-500">No recommendations yet. Try refining your search.</p>
        {response.confidence.uncertaintyFactors.length > 0 && (
          <div className="mt-4 text-left">
            <p className="text-xs font-medium text-stone-600 mb-2">What would help:</p>
            <ul className="space-y-1">
              {response.confidence.uncertaintyFactors.map((factor, i) => (
                <li key={i} className="text-xs text-stone-500 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-stone-400 shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-stone-800">{recs.explanation.summary}</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Confidence: {Math.round(response.confidence.overall * 100)}%
          </p>
        </div>
        {recs.refinementSuggestions.length > 0 && (
          <div className="flex gap-1.5">
            {recs.refinementSuggestions.map((suggestion, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-[11px] text-stone-600 cursor-pointer hover:bg-stone-200 transition-colors"
              >
                {suggestion}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recs.candidates.map((candidate) => (
          <RecommendationCard
            key={candidate.product.id}
            candidate={candidate}
            onFeedback={onFeedback}
          />
        ))}
      </div>

      {recs.hasMore && (
        <button className="w-full rounded-xl border border-stone-200 bg-white py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
          Show more results
        </button>
      )}
    </div>
  );
}
