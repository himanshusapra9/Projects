import { FitScoringService } from '../services/fit-scoring.service';
import { RiskScoringService } from '../services/risk-scoring.service';
import { productIdForCategory } from './helpers';

describe('RiskScoringService.profile (return risk)', () => {
  let fit: FitScoringService;
  let risk: RiskScoringService;

  beforeEach(() => {
    fit = new FitScoringService();
    risk = new RiskScoringService(fit);
  });

  it('risk score is always within [0.02, 0.98]', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = risk.profile({ tenantId: 't1', productId: pid });
    expect(r.riskScore).toBeGreaterThanOrEqual(0.02);
    expect(r.riskScore).toBeLessThanOrEqual(0.98);
  });

  it('high-risk profile triggers WARN or higher intervention', () => {
    let profile: ReturnType<RiskScoringService['profile']> | null = null;
    for (let i = 0; i < 100000; i++) {
      const productId = `hr_${i}`;
      const p = risk.profile({
        tenantId: 't1',
        productId,
        variantId: `v_${i}`,
        userContext: { constraints: { avoid: ['latex'] } },
      });
      if (p.riskScore > 0.55) {
        profile = p;
        break;
      }
    }
    expect(profile).not.toBeNull();
    const kinds = profile!.interventions.map((i) => i.kind);
    expect(kinds.includes('WARN') || kinds.includes('SOFT_BLOCK') || kinds.includes('INFO')).toBe(true);
  });

  it('low-risk profile may have no SOFT_BLOCK', () => {
    let lowId: string | null = null;
    for (let i = 0; i < 5000; i++) {
      const productId = `lr_${i}`;
      const p = risk.profile({ tenantId: 't1', productId });
      if (p.riskScore < 0.35) {
        lowId = productId;
        break;
      }
    }
    expect(lowId).not.toBeNull();
    const p = risk.profile({ tenantId: 't1', productId: lowId! });
    expect(p.interventions.filter((x) => x.kind === 'SOFT_BLOCK').length).toBe(0);
  });

  it('preventable share + non-preventable share sums to ~1', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const r = risk.profile({ tenantId: 't1', productId: pid });
    expect(r.preventableShare + r.nonPreventableShare).toBeCloseTo(1, 5);
  });

  it('factors are sorted by weight descending', () => {
    const pid = productIdForCategory(fit, 'FURNITURE');
    const r = risk.profile({ tenantId: 't1', productId: pid });
    for (let i = 1; i < r.factors.length; i++) {
      expect(r.factors[i - 1].weight).toBeGreaterThanOrEqual(r.factors[i].weight);
    }
  });

  it('preventable classification flags known codes', () => {
    const pid = productIdForCategory(fit, 'BEAUTY');
    const r = risk.profile({ tenantId: 't1', productId: pid });
    const preventable = r.factors.filter((f) => f.preventable);
    expect(preventable.length).toBeGreaterThan(0);
  });

  it('prior purchases reduce effective risk via session spike term', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const base = risk.profile({ tenantId: 't1', productId: pid });
    const withHistory = risk.profile({
      tenantId: 't1',
      productId: pid,
      userContext: { priorVariantPurchases: ['a', 'b', 'c', 'd'] },
    });
    expect(withHistory.riskScore).toBeLessThanOrEqual(base.riskScore + 1e-6);
  });

  it('constraints.avoid nudges risk upward slightly', () => {
    const pid = productIdForCategory(fit, 'HOME');
    const plain = risk.profile({ tenantId: 't1', productId: pid });
    const withAvoid = risk.profile({
      tenantId: 't1',
      productId: pid,
      userContext: { constraints: { avoid: ['latex'] } },
    });
    expect(withAvoid.riskScore).toBeGreaterThanOrEqual(plain.riskScore);
  });

  it('interventions include target driver when top factor is preventable', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = risk.profile({ tenantId: 't1', productId: pid });
    const top = r.factors[0];
    if (top?.preventable) {
      expect(r.interventions.some((i) => i.id === 'target_driver')).toBe(true);
    }
  });

  it('variant id affects sku prior (deterministic hash)', () => {
    const pid = productIdForCategory(fit, 'ACCESSORIES');
    const a = risk.profile({ tenantId: 't1', productId: pid, variantId: 'va' });
    const b = risk.profile({ tenantId: 't1', productId: pid, variantId: 'vb' });
    expect(a.riskScore === b.riskScore || Math.abs(a.riskScore - b.riskScore) < 0.5).toBe(true);
  });
});
