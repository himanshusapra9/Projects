import { Injectable } from '@nestjs/common';
import { FitScoringService } from './fit-scoring.service';

export interface CommunityFeedbackSummary {
  productId: string;
  sampleSize: number;
  sentiment: number;
  variance: 'LOW' | 'MEDIUM' | 'HIGH';
  topPhrases: Array<{ phrase: string; weight: number }>;
  contradictionNote?: string;
  disclaimer: string;
  freshnessDays: number;
}

@Injectable()
export class CommunityFeedbackService {
  constructor(private readonly fit: FitScoringService) {}

  summary(productId: string): CommunityFeedbackSummary {
    const category = this.fit.resolveCategory(productId);
    const h = this.hash(productId);
    const sampleSize = 12 + (h % 40);

    const phrases: Array<{ phrase: string; weight: number }> = [
      { phrase: 'Runs true to size for most', weight: 0.28 + (h % 20) / 100 },
      { phrase: 'Toe box feels narrow on first wear', weight: 0.18 + (h % 15) / 100 },
      { phrase: 'Break-in period ~1 week', weight: 0.14 },
    ];

    if (category === 'APPAREL') {
      phrases[0] = { phrase: 'Slim cut—size up if between sizes', weight: 0.32 };
    }

    const variance: 'LOW' | 'MEDIUM' | 'HIGH' =
      h % 3 === 0 ? 'HIGH' : h % 3 === 1 ? 'MEDIUM' : 'LOW';

    return {
      productId,
      sampleSize,
      sentiment: Math.tanh((h % 100) / 50 - 0.5),
      variance,
      topPhrases: phrases.sort((a, b) => b.weight - a.weight),
      contradictionNote:
        variance === 'HIGH' ?
          'Community opinions diverge; treat as secondary evidence.'
        : undefined,
      disclaimer:
        'Community mentions are unverified and may not reflect the merchant’s position.',
      freshnessDays: 90,
    };
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h;
  }
}
