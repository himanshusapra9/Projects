import { FitScoringService } from '../services/fit-scoring.service';
import { productIdForCategory } from './helpers';

describe('FitScoringService.assess (fit confidence)', () => {
  let fit: FitScoringService;

  beforeEach(() => {
    fit = new FitScoringService();
  });

  it('returns confidence in (0,1] with structured uncertainty', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: { chest_in: 40 } },
    });
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThanOrEqual(0.98);
    expect(r.uncertainty.total).toBeGreaterThan(0);
    expect(r.dimensions.length).toBeGreaterThan(0);
  });

  it('strong measurement signal yields higher confidence than empty context (same product)', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const sparse = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: {},
    });
    const rich = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: {
        measurements: { foot_length_cm: 27, brannock_us: 9, foot_width: 100 },
      },
    });
    expect(rich.confidence).toBeGreaterThan(sparse.confidence);
  });

  it('weak / sparse signal keeps confidence in a moderate band', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = fit.assess({ tenantId: 't1', productId: pid, userContext: {} });
    expect(r.confidence).toBeLessThan(0.85);
    expect(r.evidence.some((e) => e.source === 'MODEL')).toBe(true);
  });

  it('between-size note appears for fractional Brannock in footwear', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const r = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: { brannock_us: 9.25 } },
    });
    expect(r.betweenSizeNote).toBeDefined();
    expect(r.betweenSizeNote).toMatch(/between/i);
  });

  it('apparel chart overlap note when chest in overlap band', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: { chest_in: 40 } },
    });
    expect(r.betweenSizeNote).toBeDefined();
    expect(r.betweenSizeNote).toMatch(/overlap|layer/i);
  });

  it('category-specific dimension labels are present for furniture', () => {
    const pid = productIdForCategory(fit, 'FURNITURE');
    const r = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: { room_width_cm: 300 } },
    });
    const keys = r.dimensions.map((d) => d.key);
    expect(keys.some((k) => k.includes('spatial') || k.includes('firmness') || k.includes('modularity'))).toBe(
      true,
    );
  });

  it('beauty category uses skin / sensitivity dimensions', () => {
    const pid = productIdForCategory(fit, 'BEAUTY');
    const r = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: {} },
    });
    expect(r.categoryKind).toBe('BEAUTY');
    expect(r.dimensions.length).toBeGreaterThanOrEqual(3);
  });

  it('evidence includes merchant chart when measurements exist', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: { chest_in: 38 } },
    });
    expect(r.evidence.some((e) => e.id === 'size_chart_projection')).toBe(true);
  });

  it('epistemic uncertainty is higher without measurements', () => {
    const pid = productIdForCategory(fit, 'TRAVEL');
    const without = fit.assess({ tenantId: 't1', productId: pid });
    const withM = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: { linear_cm: 110 } },
    });
    expect(without.uncertainty.epistemic).toBeGreaterThan(withM.uncertainty.epistemic);
  });

  it('dimension scores are weighted and bounded', () => {
    const pid = productIdForCategory(fit, 'ACCESSORIES');
    const r = fit.assess({
      tenantId: 't1',
      productId: pid,
      userContext: { measurements: { wrist_cm: 17 } },
    });
    for (const d of r.dimensions) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(1);
      expect(d.weight).toBeGreaterThan(0);
    }
  });
});
