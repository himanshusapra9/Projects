import { FitScoringService, type CategoryKind } from '../services/fit-scoring.service';

/** Find a product id whose hash maps to the desired category (deterministic service rule). */
export function productIdForCategory(fit: FitScoringService, kind: CategoryKind): string {
  for (let i = 0; i < 8000; i++) {
    const id = `pid_${i}`;
    if (fit.resolveCategory(id) === kind) return id;
  }
  throw new Error(`No product id found for category ${kind}`);
}
