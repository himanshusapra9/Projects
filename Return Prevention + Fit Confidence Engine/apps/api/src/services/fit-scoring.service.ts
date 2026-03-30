import { Injectable } from '@nestjs/common';
import { EvidenceRef } from '../common/types/decision.types';
import {
  FitConfidenceAssessment,
  FitDimensionScore,
} from '../common/types/api-responses.types';
import { UserContextDto } from '../common/dto/user-context.dto';

export type CategoryKind =
  | 'APPAREL'
  | 'FOOTWEAR'
  | 'FURNITURE'
  | 'BEAUTY'
  | 'TRAVEL'
  | 'HOME'
  | 'ACCESSORIES'
  | 'OTHER';

interface FitScoringInput {
  tenantId: string;
  productId: string;
  variantId?: string;
  userContext?: UserContextDto;
}

@Injectable()
export class FitScoringService {
  private readonly dimensionLabels: Record<CategoryKind, string[]> = {
    APPAREL: ['chest_fit', 'waist_fit', 'length_fit', 'stretch_alignment'],
    FOOTWEAR: ['length_fit', 'width_fit', 'arch_alignment', 'use_case_match'],
    FURNITURE: ['spatial_clearance', 'firmness_match', 'modularity_fit'],
    BEAUTY: ['skin_concern_match', 'active_tolerance', 'fragrance_alignment'],
    TRAVEL: ['bin_constraint', 'weight_burden', 'feature_match'],
    HOME: ['floor_type_match', 'pet_hair_lift', 'noise_tolerance'],
    ACCESSORIES: ['circumference_fit', 'strap_length', 'style_match'],
    OTHER: ['generic_attr_a', 'generic_attr_b', 'evidence_strength'],
  };

  /** Deterministic category from product id (placeholder for catalog join). */
  resolveCategory(productId: string): CategoryKind {
    let h = 0;
    for (let i = 0; i < productId.length; i++) {
      h = (h * 31 + productId.charCodeAt(i)) >>> 0;
    }
    const kinds: CategoryKind[] = [
      'FOOTWEAR',
      'APPAREL',
      'FURNITURE',
      'BEAUTY',
      'TRAVEL',
      'HOME',
      'ACCESSORIES',
      'OTHER',
    ];
    return kinds[h % kinds.length];
  }

  assess(input: FitScoringInput): FitConfidenceAssessment {
    const category = this.resolveCategory(input.productId);
    const weights = this.weightsFor(category);
    const measurements = input.userContext?.measurements ?? {};
    const hasMeasurements = Object.keys(measurements).length > 0;

    const dimensions: FitDimensionScore[] = weights.map((w) => {
      const raw = this.scoreDimension(w.key, measurements, category, input.productId);
      return {
        key: w.key,
        label: w.label,
        score: raw,
        weight: w.weight,
        detail: hasMeasurements ? 'Derived from stated measurements vs priors' : 'Category prior (sparse user input)',
      };
    });

    const weighted =
      dimensions.reduce((acc, d) => acc + d.score * d.weight, 0) /
      dimensions.reduce((acc, d) => acc + d.weight, 0);

    const epistemic = hasMeasurements ? 0.12 + this.hashNoise(input.productId, 1) * 0.15 : 0.35;
    const aleatoric = 0.15 + (category === 'FOOTWEAR' || category === 'APPAREL' ? 0.12 : 0.08);
    const total = Math.min(0.95, Math.sqrt(epistemic * epistemic + aleatoric * aleatoric));

    const logistic = (x: number) => 1 / (1 + Math.exp(-6 * (x - 0.5)));
    let confidence = logistic(weighted) * (1 - 0.35 * total);
    confidence = Math.max(0.05, Math.min(0.98, confidence));

    const evidence = this.buildEvidence(category, weighted, hasMeasurements);

    const betweenNote =
      category === 'FOOTWEAR' && this.isBetweenSizeScenario(measurements)
        ? 'You are between labeled sizes; half-size or width variants often reduce mismatch risk.'
        : category === 'APPAREL' && this.chartOverlap(measurements)
          ? 'Size chart bands overlap for your measurements; layering preference shifts the safer size.'
          : undefined;

    return {
      confidence,
      categoryKind: category,
      evidence,
      dimensions,
      betweenSizeNote: betweenNote,
      uncertainty: { epistemic, aleatoric, total },
    };
  }

  /** Size recommendation with between-size handling. */
  recommendSize(
    productId: string,
    measurements: Record<string, number> | undefined,
    prefs: { fitPreference?: string; betweenSizePriority?: string } | undefined,
  ): {
    primaryLabel: string;
    primaryVariantId: string;
    between: boolean;
    neighborScores: Array<{ label: string; variantId: string; fit: number; composite: number }>;
  } {
    const category = this.resolveCategory(productId);
    const base = this.numericFromMeasurements(measurements, category);
    const neighbors = this.neighborSizes(base, category);

    const priority = prefs?.betweenSizePriority ?? 'balanced';
    const scored = neighbors.map((n) => {
      const fit = 1 - Math.abs(n.numeric - base) / 4;
      const painPenalty =
        priority === 'toe_room' && n.label.includes('0.5')
          ? 0.05
          : priority === 'locked_heel' && !n.label.includes('0.5')
            ? 0.08
            : 0;
      const composite = Math.max(0, Math.min(1, fit - painPenalty));
      return { ...n, fit, composite };
    });

    scored.sort((a, b) => b.composite - a.composite);
    const best = scored[0];
    const second = scored[1];
    const between =
      !!second && Math.abs(best.composite - second.composite) < 0.06 && category === 'FOOTWEAR';

    return {
      primaryLabel: best.label,
      primaryVariantId: best.variantId,
      between,
      neighborScores: scored.slice(0, 4).map((s) => ({
        label: s.label,
        variantId: s.variantId,
        fit: s.fit,
        composite: s.composite,
      })),
    };
  }

  private weightsFor(category: CategoryKind): Array<{ key: string; label: string; weight: number }> {
    const keys = this.dimensionLabels[category];
    const w = 1 / keys.length;
    return keys.map((k, i) => ({
      key: k,
      label: k.replace(/_/g, ' '),
      weight: w + (i === 0 ? 0.08 : 0),
    }));
  }

  private scoreDimension(
    key: string,
    m: Record<string, number>,
    category: CategoryKind,
    productId: string,
  ): number {
    const noise = this.hashNoise(productId + key, 2);
    if (Object.keys(m).length === 0) {
      return 0.45 + noise * 0.25;
    }
    const foot =
      m['foot_length_cm'] ?? m['foot_length_in'] ?? m['brannock_us'];
    const chest = m['chest_in'] ?? m['chest_cm'];
    if (category === 'FOOTWEAR' && key.startsWith('length') && foot !== undefined) {
      const ideal = 27;
      const val = typeof foot === 'number' && foot < 20 ? foot * 2.54 : foot;
      return Math.max(0, 1 - Math.abs(val - ideal) / 6) * 0.9 + noise * 0.05;
    }
    if (category === 'APPAREL' && chest !== undefined) {
      return Math.max(0, 1 - Math.abs(chest - 40) / 15) * 0.85 + noise * 0.08;
    }
    return 0.55 + noise * 0.3;
  }

  private buildEvidence(category: CategoryKind, quality: number, hasMeasurements: boolean): EvidenceRef[] {
    const refs: EvidenceRef[] = [
      {
        source: 'MODEL',
        id: `fit_prior_${category}`,
        snippet: `Category prior (${category}) blended with variant resolution`,
        weight: 0.35,
      },
    ];
    if (hasMeasurements) {
      refs.push({
        source: 'MERCHANT',
        id: 'size_chart_projection',
        snippet: 'Measurement projection against chart midpoints',
        weight: 0.45,
      });
    }
    if (quality > 0.65) {
      refs.push({
        source: 'REVIEW',
        id: 'review_consensus_tts',
        snippet: 'Review phrases lean true-to-size for this family',
        weight: 0.2,
      });
    }
    return refs;
  }

  private hashNoise(seed: string, salt: number): number {
    let h = salt;
    for (let i = 0; i < seed.length; i++) {
      h = (h * 33 + seed.charCodeAt(i)) >>> 0;
    }
    return (h % 1000) / 1000;
  }

  private isBetweenSizeScenario(m: Record<string, number>): boolean {
    const br = m['brannock_us'] ?? m['us_size'];
    if (typeof br !== 'number') return false;
    return Math.abs(br - Math.round(br)) > 0.15 && Math.abs(br - Math.round(br)) < 0.45;
  }

  private chartOverlap(m: Record<string, number>): boolean {
    const chest = m['chest_in'];
    if (typeof chest !== 'number') return false;
    return chest > 39 && chest < 41;
  }

  private numericFromMeasurements(m: Record<string, number> | undefined, category: CategoryKind): number {
    if (!m) return 9;
    if (category === 'FOOTWEAR') {
      const v = m['brannock_us'] ?? m['us_size'] ?? m['foot_length_cm'];
      if (typeof v === 'number') {
        return v < 20 ? 6 + v / 3 : v;
      }
    }
    return 9;
  }

  private neighborSizes(
    center: number,
    category: CategoryKind,
  ): Array<{ label: string; variantId: string; numeric: number }> {
    if (category !== 'FOOTWEAR') {
      const labels = ['S', 'M', 'L', 'XL'];
      return labels.map((l, i) => ({
        label: l,
        variantId: `var_${l}`,
        numeric: 8 + i * 0.5,
      }));
    }
    const base = Math.round(center * 2) / 2;
    return [
      { label: `US ${base - 0.5}`, variantId: `var_${base - 0.5}`, numeric: base - 0.5 },
      { label: `US ${base}`, variantId: `var_${base}`, numeric: base },
      { label: `US ${base + 0.5}`, variantId: `var_${base + 0.5}`, numeric: base + 0.5 },
      { label: `US ${base + 1}`, variantId: `var_${base + 1}`, numeric: base + 1 },
    ];
  }
}
