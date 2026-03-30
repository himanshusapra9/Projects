import type { Logger } from '@discovery-copilot/shared';
import type {
  ComparisonAttribute,
  ComparisonProduct,
  ComparisonTable,
  ComparisonValue,
  ComplementReasoning,
  ProductRelationship,
  RelationshipType,
  RelationalContext,
  SubstituteReasoning,
  TradeoffExplanation,
  UpgradePath,
  UserHistoryRelation,
} from '@discovery-copilot/types';

/** Minimal product shape for relational reasoning (catalog search / vector hits). */
export interface RelationalProduct {
  productId: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  attributes: Record<string, string | number | boolean>;
  /** Optional embedding or category for similarity heuristics. */
  category?: string;
}

export interface CatalogSearchPort {
  getProduct(productId: string): Promise<RelationalProduct | null>;
  /** Neighbors in embedding space or same category. */
  listCandidatesSimilarTo(productId: string, limit: number): Promise<RelationalProduct[]>;
  /** Often-bought-with style complements. */
  listComplementsFor(productId: string, limit: number): Promise<RelationalProduct[]>;
}

export interface RelationalReasoningServiceDeps {
  logger: Logger;
  catalog?: CatalogSearchPort;
}

/**
 * Derives product relationships, tradeoffs, comparison tables, and query↔history links.
 */
export class RelationalReasoningService {
  private readonly logger: Logger;
  private readonly catalog?: CatalogSearchPort;

  constructor(deps: RelationalReasoningServiceDeps) {
    this.logger = deps.logger;
    this.catalog = deps.catalog;
  }

  /**
   * Finds typed relationships between a source product and candidate SKUs.
   */
  async findRelationships(
    sourceProductId: string,
    candidateIds: string[],
  ): Promise<ProductRelationship[]> {
    if (!this.catalog || candidateIds.length === 0) return [];

    const source = await this.catalog.getProduct(sourceProductId);
    if (!source) {
      this.logger.warn('relational.findRelationships: source missing', { sourceProductId });
      return [];
    }

    const out: ProductRelationship[] = [];

    for (const id of candidateIds) {
      if (id === sourceProductId) continue;
      const target = await this.catalog.getProduct(id);
      if (!target) continue;

      const { type, tradeoff, confidence } = this.classifyRelationship(source, target);
      out.push({
        sourceProductId,
        targetProductId: id,
        type,
        strength: confidence,
        explanation: this.relationshipExplanation(type, source, target),
        tradeoff,
        confidence,
      });
    }

    this.logger.info('relational.findRelationships', { sourceProductId, count: out.length });
    return out;
  }

  /**
   * Narrative tradeoff between two concrete products.
   */
  explainTradeoff(a: RelationalProduct, b: RelationalProduct): TradeoffExplanation {
    const gains: string[] = [];
    const losses: string[] = [];

    if (b.price < a.price) gains.push(`Lower price (${b.price} vs ${a.price})`);
    else if (b.price > a.price) losses.push(`Higher price (${b.price} vs ${a.price})`);

    const aDur = Number(a.attributes.durability ?? a.attributes.rating ?? 0);
    const bDur = Number(b.attributes.durability ?? b.attributes.rating ?? 0);
    if (bDur > aDur) gains.push('Potentially better durability / ratings');
    else if (aDur > bDur) losses.push('May trade away some durability / ratings');

    let netAssessment: TradeoffExplanation['netAssessment'] = 'different';
    if (b.price > a.price && bDur >= aDur) netAssessment = 'upgrade';
    else if (b.price < a.price && bDur <= aDur) netAssessment = 'downgrade';
    else if (Math.abs(b.price - a.price) / Math.max(a.price, 1) < 0.1) netAssessment = 'sidegrade';

    return {
      gains,
      losses,
      netAssessment,
      summary: `Compared to ${a.name}, ${b.name} is a ${netAssessment}: ${gains.join('; ') || 'no major upsides'} vs ${losses.join('; ') || 'no major downsides'}.`,
    };
  }

  /**
   * Builds a comparison matrix suitable for UI tables.
   */
  buildComparisonTable(products: RelationalProduct[], attributeNames: string[]): ComparisonTable {
    const comparisonProducts: ComparisonProduct[] = products.map((p, idx) => ({
      productId: p.productId,
      name: p.name,
      brand: p.brand,
      price: p.price,
      imageUrl: p.imageUrl,
      overallScore: 0.75 - idx * 0.02,
    }));

    const attributes: ComparisonAttribute[] = attributeNames.map((name) => {
      const label = name.replace(/_/g, ' ');
      const values: ComparisonValue[] = products.map((p) => {
        const raw = p.attributes[name];
        const value = raw === undefined ? '—' : String(raw);
        const rating = this.ratingFromRaw(raw);
        return { productId: p.productId, value, rating };
      });
      const order: Record<ComparisonValue['rating'], number> = {
        excellent: 4,
        good: 3,
        fair: 2,
        poor: 1,
        'n/a': 0,
      };
      let winner: string | undefined;
      let best = -1;
      for (const v of values) {
        const score = order[v.rating];
        if (score > best) {
          best = score;
          winner = v.productId;
        }
      }

      return {
        name,
        label,
        values,
        winner,
        importance: name === 'price' || name === 'durability' ? 'critical' : 'important',
      };
    });

    return {
      products: comparisonProducts,
      attributes,
      recommendation: products.length
        ? `Compare ${products.length} options on ${attributeNames.join(', ')} — see tradeoffs per row.`
        : 'Add products to compare.',
    };
  }

  /**
   * Maps the current query text to prior user events (views, purchases, returns).
   */
  relateQueryToHistory(params: {
    query: string;
    priorProductIds: string[];
    returnReasonsByProduct?: Record<string, string>;
  }): UserHistoryRelation[] {
    const q = params.query.toLowerCase();
    const rels: UserHistoryRelation[] = [];

    for (const pid of params.priorProductIds) {
      if (q.length > 3) {
        rels.push({
          type: 'similar_to_past_view',
          description: 'Your search relates to products you recently viewed.',
          confidence: 0.55,
          referenceProductId: pid,
          referenceEvent: 'view',
        });
      }
    }

    if (params.returnReasonsByProduct) {
      for (const [pid, reason] of Object.entries(params.returnReasonsByProduct)) {
        if (reason && q.includes(reason.split(' ')[0]?.toLowerCase() ?? '')) {
          rels.push({
            type: 'addresses_past_return_reason',
            description: `This query may be addressing a past return concern (${reason}).`,
            confidence: 0.62,
            referenceProductId: pid,
            referenceEvent: 'return',
          });
        }
      }
    }

    return rels;
  }

  /**
   * Substitutes and upgrade paths using catalog similarity when available.
   */
  async findSubstituteAndUpgradePaths(
    productId: string,
    limit: number = 6,
  ): Promise<{ substitutes: SubstituteReasoning[]; upgradePath: UpgradePath | null; complements: ComplementReasoning[] }> {
    if (!this.catalog) {
      return { substitutes: [], upgradePath: null, complements: [] };
    }

    const source = await this.catalog.getProduct(productId);
    if (!source) {
      return { substitutes: [], upgradePath: null, complements: [] };
    }

    const similar = await this.catalog.listCandidatesSimilarTo(productId, limit);
    const complements = await this.catalog.listComplementsFor(productId, Math.min(4, limit));

    const substitutes: SubstituteReasoning[] = similar
      .filter((p) => p.price <= source.price * 1.05)
      .map((p) => ({
        productId: p.productId,
        reason: `Similar role in the same category at comparable price.`,
        differentiator: `${p.brand} vs ${source.brand}`,
        whenToPick: `Choose ${p.name} if ${p.brand} or price fits better.`,
      }));

    let upgradePath: UpgradePath | null = null;
    const upgrade = similar.find((p) => p.price > source.price * 1.05);
    if (upgrade) {
      upgradePath = {
        fromProductId: productId,
        toProductId: upgrade.productId,
        priceDelta: upgrade.price - source.price,
        valueProposition: 'Higher tier with likely better materials or features.',
        keyImprovements: ['Build quality', 'Feature set', 'Brand support'],
      };
    }

    const comp: ComplementReasoning[] = complements.map((c) => ({
      productId: c.productId,
      reason: 'Frequently used together in the same use case.',
      bundleDiscount: undefined,
      useTogether: `Pair with ${source.name} for a complete setup.`,
    }));

    return { substitutes, upgradePath, complements: comp };
  }

  /**
   * Full relational context bundle for ranking/explanations.
   */
  async buildRelationalContext(
    currentProductId: string,
    candidateIds: string[],
    history: { priorProductIds: string[]; returnReasonsByProduct?: Record<string, string> },
    query: string,
  ): Promise<RelationalContext> {
    const related = await this.findRelationships(currentProductId, candidateIds);
    const paths = await this.findSubstituteAndUpgradePaths(currentProductId);
    const userHistoryRelations = this.relateQueryToHistory({
      query,
      priorProductIds: history.priorProductIds,
      returnReasonsByProduct: history.returnReasonsByProduct,
    });

    return {
      currentProduct: currentProductId,
      relatedProducts: related,
      substitutes: paths.substitutes,
      complements: paths.complements,
      upgradePath: paths.upgradePath,
      userHistoryRelations,
    };
  }

  private classifyRelationship(
    source: RelationalProduct,
    target: RelationalProduct,
  ): { type: RelationshipType; tradeoff: TradeoffExplanation; confidence: number } {
    const tradeoff = this.explainTradeoff(source, target);
    let type: RelationshipType = 'similar_style';
    let confidence = 0.55;

    if (target.price < source.price * 0.85) {
      type = 'cheaper_alternative';
      confidence = 0.7;
    } else if (target.price > source.price * 1.15) {
      type = 'premium_upgrade';
      confidence = 0.68;
    }

    if (String(target.attributes.noise_db ?? '') && String(source.attributes.noise_db ?? '')) {
      const tn = Number(target.attributes.noise_db);
      const sn = Number(source.attributes.noise_db);
      if (tn < sn) {
        type = 'quieter_alternative';
        confidence = 0.72;
      }
    }

    return { type, tradeoff, confidence };
  }

  private relationshipExplanation(type: RelationshipType, source: RelationalProduct, target: RelationalProduct): string {
    const label: Record<RelationshipType, string> = {
      similar_style: 'Similar style and use case',
      better_tradeoff: 'Better overall tradeoff for most shoppers',
      more_durable: 'Likely more durable',
      cheaper_alternative: 'Lower-cost alternative',
      premium_upgrade: 'Premium step-up',
      lower_return_risk: 'Lower reported return risk',
      same_usecase_different_aesthetic: 'Same job, different look',
      substitute: 'Functional substitute',
      complement: 'Goes well together',
      bundle: 'Bundle-friendly',
      related_need: 'Related need in the same project',
      lighter_alternative: 'Lighter option',
      quieter_alternative: 'Quieter option',
      easier_to_clean: 'Easier to clean / maintain',
    };
    return `${label[type]} between ${source.name} and ${target.name}.`;
  }

  private ratingFromRaw(raw: string | number | boolean | undefined): ComparisonValue['rating'] {
    if (raw === undefined) return 'n/a';
    const n = Number(raw);
    if (!Number.isFinite(n)) return 'good';
    if (n >= 4.5) return 'excellent';
    if (n >= 3.5) return 'good';
    if (n >= 2.5) return 'fair';
    return 'poor';
  }
}
