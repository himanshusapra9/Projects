import type { Logger } from '@discovery-copilot/shared';
import type {
  AppliedMemoryItem,
  BrandAffinity,
  BudgetTendency,
  MemoryDislike,
  MemoryEditRequest,
  MemoryPreference,
  MemoryRetrievalResult,
  MemoryTransparencyNote,
  UserMemory,
} from '@discovery-copilot/types';

export interface UserMemoryStorePort {
  get(userId: string, tenantId: string): Promise<UserMemory | null>;
  save(memory: UserMemory): Promise<void>;
  delete(userId: string, tenantId: string): Promise<void>;
}

export interface MemoryCachePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
}

/** Optional LLM for richer summaries (falls back to deterministic text if absent). */
export interface MemoryLlmPort {
  summarizeForPrompt(memory: MemoryRetrievalResult, query: string): Promise<string>;
}

export interface EnhancedMemoryServiceDeps {
  logger: Logger;
  db?: UserMemoryStorePort;
  cache?: MemoryCachePort;
  llm?: MemoryLlmPort;
  /** Days without reinforcement after which preference strength decays toward neutral. */
  preferenceDecayHalfLifeDays?: number;
  now?: () => Date;
}

const CACHE_PREFIX = 'enhanced-memory:';
const CACHE_TTL = 1800;

/**
 * Cross-session user memory with relevance gating, transparency notes,
 * decay, conflict resolution, and edit/pause flows.
 */
export class EnhancedMemoryService {
  private readonly logger: Logger;
  private readonly db?: UserMemoryStorePort;
  private readonly cache?: MemoryCachePort;
  private readonly llm?: MemoryLlmPort;
  private readonly preferenceDecayHalfLifeDays: number;
  private readonly now: () => Date;

  private readonly memoryByUser = new Map<string, UserMemory>();
  private readonly pausedUsers = new Set<string>();

  constructor(deps: EnhancedMemoryServiceDeps) {
    this.logger = deps.logger;
    this.db = deps.db;
    this.cache = deps.cache;
    this.llm = deps.llm;
    this.preferenceDecayHalfLifeDays = deps.preferenceDecayHalfLifeDays ?? 45;
    this.now = deps.now ?? (() => new Date());
  }

  /**
   * Loads raw {@link UserMemory}, applying reinforcement decay and brand/return conflict resolution.
   */
  async getUserMemory(userId: string, tenantId: string): Promise<UserMemory | null> {
    const key = `${CACHE_PREFIX}${tenantId}:${userId}`;
    if (this.cache) {
      try {
        const raw = await this.cache.get(key);
        if (raw) {
          const parsed = JSON.parse(raw) as UserMemory;
          return this.applyMemoryDecayAndResolveConflicts(parsed);
        }
      } catch (err) {
        this.logger.warn('memory.cache get failed', { userId, error: err instanceof Error ? err.message : err });
      }
    }

    if (this.db) {
      try {
        const row = await this.db.get(userId, tenantId);
        if (row) {
          const resolved = this.applyMemoryDecayAndResolveConflicts(row);
          await this.cacheSet(key, resolved);
          return resolved;
        }
      } catch (err) {
        this.logger.error('memory.db get failed', { userId, error: err instanceof Error ? err.message : err });
      }
    }

    const local = this.memoryByUser.get(`${tenantId}:${userId}`);
    return local ? this.applyMemoryDecayAndResolveConflicts(local) : null;
  }

  /**
   * Persists updated memory (e.g. after session summarization).
   */
  async saveUserMemory(memory: UserMemory): Promise<void> {
    const resolved = this.applyMemoryDecayAndResolveConflicts(memory);
    const key = `${CACHE_PREFIX}${resolved.tenantId}:${resolved.userId}`;
    this.memoryByUser.set(`${resolved.tenantId}:${resolved.userId}`, resolved);
    await this.cacheSet(key, resolved);
    if (this.db) {
      await this.db.save(resolved).catch((err) => {
        this.logger.error('memory.db save failed', { userId: resolved.userId, error: err instanceof Error ? err.message : err });
      });
    }
    this.logger.info('memory.saved', { userId: resolved.userId, tenantId: resolved.tenantId });
  }

  /**
   * Retrieves memory items relevant to the current query/category and summarizes for ranking/prompting.
   */
  async retrieveForContext(params: {
    userId: string;
    tenantId: string;
    query: string;
    category?: string;
  }): Promise<MemoryRetrievalResult> {
    if (this.pausedUsers.has(`${params.tenantId}:${params.userId}`)) {
      return this.emptyRetrieval();
    }

    const mem = await this.getUserMemory(params.userId, params.tenantId);
    if (!mem) {
      return this.emptyRetrieval();
    }

    const q = params.query.toLowerCase();
    const cat = (params.category ?? '').toLowerCase();

    const relevantPreferences = mem.preferences.filter((p: MemoryPreference) => {
      if (this.preferenceMatchesContext(p, q, cat)) return true;
      if (!cat) return false;
      return mem.categoryPatterns.some((cp: (typeof mem.categoryPatterns)[number]) => {
        const cMatch =
          cp.category.toLowerCase() === cat ||
          cp.category.toLowerCase().includes(cat) ||
          cat.includes(cp.category.toLowerCase());
        if (!cMatch) return false;
        return (
          cp.preferredAttributes[p.attribute] === p.value ||
          Object.values(cp.preferredAttributes).includes(p.value)
        );
      });
    });

    const relevantDislikes = mem.dislikes.filter((d: MemoryDislike) => {
      if (this.preferenceMatchesContext(d, q, cat)) return true;
      if (!cat) return false;
      return mem.fitSensitivities.some((f: (typeof mem.fitSensitivities)[number]) => f.category.toLowerCase() === cat);
    });

    const brandSignals = mem.brandAffinities.filter((b: BrandAffinity) => {
      if (q.includes(b.brand.toLowerCase())) return true;
      return b.score >= 0.35;
    });

    let budgetSignal: BudgetTendency | null = mem.budgetTendency;
    if (budgetSignal && budgetSignal.confidence < 0.2) {
      budgetSignal = null;
    }

    const appliedMemoryItems: AppliedMemoryItem[] = [];

    for (const p of relevantPreferences) {
      appliedMemoryItems.push({
        type: 'preference',
        description: `${p.attribute}: ${p.value}`,
        influence: p.strength > 60 ? 'boosted' : 'informed',
        confidence: p.confidence * (p.decayedStrength / 100),
      });
    }
    for (const d of relevantDislikes) {
      appliedMemoryItems.push({
        type: 'dislike',
        description: `${d.attribute}: ${d.value}`,
        influence: 'penalized',
        confidence: Math.min(1, d.strength / 100),
      });
    }
    if (budgetSignal) {
      appliedMemoryItems.push({
        type: 'budget',
        description: `Typical spend band: ${budgetSignal.preferredRange[0]}–${budgetSignal.preferredRange[1]} ${budgetSignal.currency}`,
        influence: 'filtered',
        confidence: budgetSignal.confidence,
      });
    }
    for (const b of brandSignals) {
      appliedMemoryItems.push({
        type: 'brand',
        description: `Brand affinity: ${b.brand}`,
        influence: b.returnCount > b.purchaseCount ? 'penalized' : 'boosted',
        confidence: Math.min(1, b.score + 0.1),
      });
    }

    const memoryTransparency = this.buildTransparencyNotes(mem, relevantPreferences, brandSignals);

    return {
      relevantPreferences,
      relevantDislikes,
      budgetSignal,
      brandSignals,
      appliedMemoryItems,
      memoryTransparency,
    };
  }

  /**
   * Optional LLM-backed summary line for system prompts; deterministic fallback if no LLM.
   */
  async summarizeRetrieval(result: MemoryRetrievalResult, query: string): Promise<string> {
    if (this.llm) {
      try {
        return await this.llm.summarizeForPrompt(result, query);
      } catch (err) {
        this.logger.warn('memory.llm summarize failed, using fallback', {
          error: err instanceof Error ? err.message : err,
        });
      }
    }
    const n = result.appliedMemoryItems.length;
    if (n === 0) return 'No prior memory applied for this query.';
    return `Applying ${n} memory signal(s): ${result.appliedMemoryItems.map((a: AppliedMemoryItem) => a.description).join('; ')}.`;
  }

  /**
   * Handles user-driven memory edits: clear, remove preference/dislike, or pause personalization.
   */
  async processEditRequest(req: MemoryEditRequest, tenantId: string): Promise<{ success: boolean; message: string }> {
    const key = `${tenantId}:${req.userId}`;

    switch (req.action) {
      case 'pause_memory':
        this.pausedUsers.add(key);
        this.logger.info('memory.paused', { userId: req.userId, tenantId });
        return { success: true, message: 'Memory personalization paused for this account.' };

      case 'clear_all': {
        this.pausedUsers.delete(key);
        this.memoryByUser.delete(key);
        await this.cache?.set(`${CACHE_PREFIX}${key}`, '', 1).catch(() => undefined);
        if (this.db) {
          await this.db.delete(req.userId, tenantId).catch((err) => {
            this.logger.error('memory.clear db delete failed', { error: err instanceof Error ? err.message : err });
          });
        }
        return { success: true, message: 'All stored memory cleared.' };
      }

      case 'clear_category': {
        const mem = await this.getUserMemory(req.userId, tenantId);
        if (!mem || !req.target) {
          return { success: false, message: 'No memory or target category.' };
        }
        mem.categoryPatterns = mem.categoryPatterns.filter((c: (typeof mem.categoryPatterns)[number]) => c.category !== req.target);
        mem.priorClarifications = mem.priorClarifications.filter((p: (typeof mem.priorClarifications)[number]) => p.category !== req.target);
        await this.saveUserMemory(mem);
        return { success: true, message: `Cleared memory for category ${req.target}.` };
      }

      case 'remove_preference': {
        const mem = await this.getUserMemory(req.userId, tenantId);
        if (!mem || !req.target) {
          return { success: false, message: 'No memory or target preference key.' };
        }
        mem.preferences = mem.preferences.filter((p: MemoryPreference) => `${p.attribute}:${p.value}` !== req.target);
        await this.saveUserMemory(mem);
        return { success: true, message: 'Preference removed.' };
      }

      case 'remove_dislike': {
        const mem = await this.getUserMemory(req.userId, tenantId);
        if (!mem || !req.target) {
          return { success: false, message: 'No memory or target dislike key.' };
        }
        mem.dislikes = mem.dislikes.filter((d: MemoryDislike) => `${d.attribute}:${d.value}` !== req.target);
        await this.saveUserMemory(mem);
        return { success: true, message: 'Dislike removed.' };
      }

      default:
        return { success: false, message: 'Unknown action.' };
    }
  }

  private emptyRetrieval(): MemoryRetrievalResult {
    return {
      relevantPreferences: [],
      relevantDislikes: [],
      budgetSignal: null,
      brandSignals: [],
      appliedMemoryItems: [],
      memoryTransparency: [],
    };
  }

  private preferenceMatchesContext(
    p: MemoryPreference | MemoryDislike,
    queryLower: string,
    categoryLower: string,
  ): boolean {
    if (queryLower.includes(p.attribute.toLowerCase()) || queryLower.includes(p.value.toLowerCase())) {
      return true;
    }
    if (categoryLower && p.attribute.toLowerCase().includes('category')) {
      return p.value.toLowerCase().includes(categoryLower);
    }
    return false;
  }

  private buildTransparencyNotes(
    mem: UserMemory,
    prefs: MemoryPreference[],
    brands: BrandAffinity[],
  ): MemoryTransparencyNote[] {
    const notes: MemoryTransparencyNote[] = [];

    if (prefs.length > 0) {
      notes.push({
        text: `We are boosting results that match ${prefs.length} remembered preference(s).`,
        icon: 'heart',
        userCanDismiss: true,
      });
    }

    if (mem.rejectedRecommendations.length > 0) {
      notes.push({
        text: 'Past dismissals influence ranking to avoid similar items.',
        icon: 'history',
        userCanDismiss: true,
      });
    }

    const conflictBrand = brands.find((b) => b.returnCount > b.purchaseCount && b.purchaseCount > 0);
    if (conflictBrand) {
      notes.push({
        text: `You previously purchased ${conflictBrand.brand} but also returned items — we are weighing that carefully.`,
        icon: 'alert',
        userCanDismiss: false,
      });
    }

    return notes;
  }

  /**
   * Weakens preference strengths over time without reinforcement; resolves liked brand vs recent returns.
   */
  private applyMemoryDecayAndResolveConflicts(mem: UserMemory): UserMemory {
    const now = this.now().getTime();
    const halfLifeMs = this.preferenceDecayHalfLifeDays * 24 * 60 * 60 * 1000;

    const preferences: MemoryPreference[] = mem.preferences.map((p: MemoryPreference) => {
      const last = Date.parse(p.lastSeen);
      const ageMs = Math.max(0, now - (Number.isFinite(last) ? last : now));
      const halfLives = ageMs / halfLifeMs;
      const decayFactor = Math.pow(0.5, halfLives);
      const decayedStrength = p.strength * decayFactor;
      return {
        ...p,
        decayedStrength,
        confidence: p.confidence * (0.85 + 0.15 * decayFactor),
      };
    });

    const brandAffinities: BrandAffinity[] = mem.brandAffinities.map((b: BrandAffinity) => {
      let score = b.score;
      if (b.returnCount > b.purchaseCount && b.purchaseCount > 0) {
        score *= 0.65;
        this.logger.info('memory.conflict brand affinity damped', { brand: b.brand, userId: mem.userId });
      }
      const last = Date.parse(b.lastInteraction);
      const ageMs = Math.max(0, now - (Number.isFinite(last) ? last : now));
      const staleFactor = Math.pow(0.5, ageMs / (halfLifeMs * 2));
      score *= 0.5 + 0.5 * staleFactor;
      return { ...b, score: Math.max(0, Math.min(1, score)) };
    });

    return {
      ...mem,
      preferences,
      brandAffinities,
      lastUpdated: this.now().toISOString(),
    };
  }

  private async cacheSet(key: string, memory: UserMemory): Promise<void> {
    if (!this.cache) return;
    try {
      await this.cache.set(key, JSON.stringify(memory), CACHE_TTL);
    } catch (err) {
      this.logger.warn('memory.cache set failed', { error: err instanceof Error ? err.message : err });
    }
  }
}
