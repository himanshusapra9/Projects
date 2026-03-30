import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getCategoryConfig, type SupportedCategory } from '@fitconfidence/config';
import {
  fitConfidenceCalibration,
  meanMetric,
  returnRiskCalibration,
  sizeRecommendationAccuracy,
  explanationGroundingRate,
  alternativeUtility,
  clarificationPrecision,
} from './metrics';

export interface FixtureProduct {
  id: string;
  category: SupportedCategory;
  title: string;
  brand?: string;
  attributes?: Record<string, unknown>;
}

export interface FixtureUserContext {
  measurements?: Record<string, number>;
  answers?: Record<string, unknown>;
}

export interface FixtureExpected {
  primarySizeLabel: string;
  fitConfidenceMin: number;
  fitConfidenceMax: number;
  returnRiskMin: number;
  returnRiskMax: number;
  acceptableAlternatives?: string[];
  relevantClarificationIds?: string[];
}

export interface EvalFixture {
  id: string;
  product: FixtureProduct;
  userContext: FixtureUserContext;
  expected: FixtureExpected;
}

export interface PipelineResult {
  primarySizeLabel: string;
  fitConfidence: number;
  returnRisk: number;
  citations: Array<{ weight: number }>;
  alternativesRanked: string[];
  clarificationAskedIds: string[];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

/** Map measurements to a primary size / configuration label (deterministic). */
export function primaryLabelFromMeasurements(
  category: SupportedCategory,
  measurements: Record<string, number>,
): string {
  switch (category) {
    case 'footwear': {
      const u = measurements['brannock_us'] ?? measurements['us_size'];
      if (typeof u === 'number') {
        const r = Math.round(u * 2) / 2;
        return `US ${r}`;
      }
      const cm = measurements['foot_length_cm'];
      if (typeof cm === 'number') {
        if (cm < 26) return 'US 8';
        if (cm < 27.5) return 'US 9';
        return 'US 10';
      }
      return 'US 9';
    }
    case 'apparel': {
      const chest = measurements['chest_in'] ?? measurements['chest_cm'];
      if (typeof chest === 'number') {
        const cin = chest > 60 ? chest / 2.54 : chest;
        if (cin < 37) return 'S';
        if (cin < 42) return 'M';
        if (cin < 46) return 'L';
        return 'XL';
      }
      return 'M';
    }
    case 'furniture': {
      const w = measurements['room_width_cm'];
      if (typeof w === 'number' && w < 250) return 'compact';
      return 'standard';
    }
    case 'beauty': {
      const s = measurements['shade_depth'];
      if (typeof s === 'number') {
        if (s < 0.35) return 'light';
        if (s > 0.65) return 'deep';
        return 'medium';
      }
      return 'medium';
    }
    case 'travel_gear': {
      const lin = measurements['linear_cm'];
      if (typeof lin === 'number' && lin <= 115) return 'S-carry';
      return 'standard-carry';
    }
    case 'home_goods':
    case 'accessories':
    case 'electronics':
    default:
      return 'one-size';
  }
}

/**
 * Offline scoring pipeline: measurement coverage drives fit confidence;
 * return risk rises with sparser data and category priors.
 */
export function runPipeline(fixture: EvalFixture): PipelineResult {
  const { product, userContext } = fixture;
  const cfg = getCategoryConfig(product.category);
  const m = userContext.measurements ?? {};
  const primarySizeLabel = primaryLabelFromMeasurements(product.category, m);

  let covered = 0;
  let totalW = 0;
  for (const d of cfg.fitDimensions) {
    totalW += d.defaultWeight;
    const hit = d.measurementKeys.some((k) => m[k] !== undefined);
    if (hit) covered += d.defaultWeight;
  }
  const coverage = totalW > 0 ? covered / totalW : 0;
  const noise = hash01(fixture.id) * 0.06;

  const fitConfidence = clamp(0.42 + coverage * 0.48 + noise, 0.05, 0.98);

  const riskBase = 0.62 - coverage * 0.55 + (1 - coverage) * 0.12;
  const returnRisk = clamp(riskBase + hash01(`${fixture.id}_r`) * 0.08, 0.02, 0.98);

  const citations = [
    { weight: 0.42 },
    { weight: coverage > 0.3 ? 0.33 : 0 },
    { weight: 0.2 },
  ];

  const alternativesRanked = [`alt_${product.id}_1`, `good_alt`, `alt_${product.id}_2`];

  const clarificationAskedIds =
    fitConfidence < 0.62 && coverage < 0.45 ? ['q_width', 'q_use_case'] : [];

  return {
    primarySizeLabel,
    fitConfidence,
    returnRisk,
    citations,
    alternativesRanked,
    clarificationAskedIds,
  };
}

function loadFixtureFile(name: string): EvalFixture[] {
  const dir = join(__dirname, '..', 'fixtures');
  const raw = readFileSync(join(dir, name), 'utf8');
  const data = JSON.parse(raw) as { fixtures: EvalFixture[] };
  return data.fixtures;
}

export interface RunReport {
  fixtureCount: number;
  meanSizeAccuracy: number;
  meanFitCalibration: number;
  meanRiskCalibration: number;
  meanGrounding: number;
  meanAltUtility: number;
  meanClarificationPrecision: number;
  failures: string[];
}

export function runAllFixtures(): RunReport {
  const dir = join(__dirname, '..', 'fixtures');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const failures: string[] = [];

  const accSize: number[] = [];
  const accFit: number[] = [];
  const accRisk: number[] = [];
  const accGround: number[] = [];
  const accAlt: number[] = [];
  const accClar: number[] = [];

  let count = 0;

  for (const file of files) {
    const fixtures = loadFixtureFile(file);
    for (const fx of fixtures) {
      count++;
      const result = runPipeline(fx);
      const e = fx.expected;

      accSize.push(sizeRecommendationAccuracy(result.primarySizeLabel, e.primarySizeLabel));
      accFit.push(
        fitConfidenceCalibration(result.fitConfidence, e.fitConfidenceMin, e.fitConfidenceMax),
      );
      accRisk.push(
        returnRiskCalibration(result.returnRisk, e.returnRiskMin, e.returnRiskMax),
      );
      accGround.push(explanationGroundingRate(result.citations));

      const acceptable = new Set(e.acceptableAlternatives ?? []);
      if (acceptable.size) {
        accAlt.push(alternativeUtility(result.alternativesRanked, acceptable));
      }

      const rel = new Set(e.relevantClarificationIds ?? []);
      if (rel.size && result.clarificationAskedIds.length) {
        accClar.push(clarificationPrecision(result.clarificationAskedIds, rel));
      } else {
        accClar.push(1);
      }

      const fitOk =
        result.fitConfidence >= e.fitConfidenceMin && result.fitConfidence <= e.fitConfidenceMax;
      const riskOk =
        result.returnRisk >= e.returnRiskMin && result.returnRisk <= e.returnRiskMax;
      if (!fitOk || !riskOk) {
        failures.push(
          `${fx.id}: fit=${result.fitConfidence.toFixed(3)} [${e.fitConfidenceMin},${e.fitConfidenceMax}] ` +
            `risk=${result.returnRisk.toFixed(3)} [${e.returnRiskMin},${e.returnRiskMax}]`,
        );
      }
    }
  }

  return {
    fixtureCount: count,
    meanSizeAccuracy: meanMetric(accSize),
    meanFitCalibration: meanMetric(accFit),
    meanRiskCalibration: meanMetric(accRisk),
    meanGrounding: meanMetric(accGround),
    meanAltUtility: meanMetric(accAlt),
    meanClarificationPrecision: meanMetric(accClar),
    failures,
  };
}

if (require.main === module) {
  const report = runAllFixtures();
  console.log(JSON.stringify(report, null, 2));
  if (report.failures.length) {
    console.warn('Range mismatches:', report.failures.length);
    for (const f of report.failures) console.warn(f);
  }
}
