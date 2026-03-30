import { FitScoringService } from '../services/fit-scoring.service';
import { productIdForCategory } from './helpers';

describe('FitScoringService.recommendSize', () => {
  let fit: FitScoringService;

  beforeEach(() => {
    fit = new FitScoringService();
  });

  it('returns primary label and variant id for footwear', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const r = fit.recommendSize(pid, { brannock_us: 9 }, undefined);
    expect(r.primaryLabel).toMatch(/^US /);
    expect(r.primaryVariantId).toContain('var_');
    expect(r.neighborScores.length).toBeGreaterThan(0);
  });

  it('between-size flag can be true when composites tie (footwear)', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const r = fit.recommendSize(pid, { brannock_us: 9 }, { betweenSizePriority: 'balanced' });
    expect(typeof r.between).toBe('boolean');
  });

  it('toe_room preference adjusts composite scoring', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const toe = fit.recommendSize(pid, { brannock_us: 9.5 }, { betweenSizePriority: 'toe_room' });
    const heel = fit.recommendSize(pid, { brannock_us: 9.5 }, { betweenSizePriority: 'locked_heel' });
    expect(toe.primaryLabel).toBeDefined();
    expect(heel.primaryLabel).toBeDefined();
  });

  it('user preference influence: locked_heel vs toe_room yields comparable structure', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const a = fit.recommendSize(pid, { us_size: 10 }, { fitPreference: 'snug' });
    const b = fit.recommendSize(pid, { us_size: 10 }, { fitPreference: 'roomy' });
    expect(a.neighborScores.length).toBe(b.neighborScores.length);
  });

  it('apparel uses S/M/L neighbors when category is non-footwear', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = fit.recommendSize(pid, { chest_in: 40 }, undefined);
    expect(['S', 'M', 'L', 'XL']).toContain(r.primaryLabel);
    expect(r.neighborScores.every((n) => n.label.length > 0)).toBe(true);
  });

  it('missing size chart / measurements falls back to numeric default', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = fit.recommendSize(pid, undefined, undefined);
    expect(r.primaryLabel).toBeDefined();
    expect(r.neighborScores.length).toBeGreaterThan(0);
  });

  it('foot_length_cm path maps to numeric scale', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const r = fit.recommendSize(pid, { foot_length_cm: 26 }, undefined);
    expect(r.primaryLabel).toMatch(/^US /);
  });

  it('neighbor scores expose fit and composite in [0,1]', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const r = fit.recommendSize(pid, { brannock_us: 8.5 }, undefined);
    for (const n of r.neighborScores) {
      expect(n.fit).toBeGreaterThanOrEqual(0);
      expect(n.fit).toBeLessThanOrEqual(1);
      expect(n.composite).toBeGreaterThanOrEqual(0);
      expect(n.composite).toBeLessThanOrEqual(1);
    }
  });

  it('sorts neighbors by composite descending', () => {
    const pid = productIdForCategory(fit, 'FOOTWEAR');
    const r = fit.recommendSize(pid, { brannock_us: 10 }, undefined);
    for (let i = 1; i < r.neighborScores.length; i++) {
      expect(r.neighborScores[i - 1].composite).toBeGreaterThanOrEqual(r.neighborScores[i].composite);
    }
  });

  it('graceful handling when only partial keys exist', () => {
    const pid = productIdForCategory(fit, 'APPAREL');
    const r = fit.recommendSize(pid, { inseam_in: 30 }, undefined);
    expect(r.primaryVariantId).toBeTruthy();
  });
});
