import type { Logger } from '@discovery-copilot/shared';
import type {
  AdaptiveRankingUpdate,
  BehaviorEvent,
  BehaviorEventType,
  BoostFactor,
  ExtractedSignal,
  InferredUserPreference,
  PenaltyFactor,
  SignalExtraction,
  UserPreferenceInference,
} from '@discovery-copilot/types';

/** Optional persistence for behavior aggregates (Postgres, etc.). */
export interface BehaviorStorePort {
  saveSignals(userId: string, signals: ExtractedSignal[]): Promise<void>;
  loadSignals(userId: string): Promise<ExtractedSignal[] | null>;
  saveInference(userId: string, inference: UserPreferenceInference): Promise<void>;
  loadInference(userId: string): Promise<UserPreferenceInference | null>;
}

/** Optional cache (Redis) for hot paths. */
export interface BehaviorCachePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
}

export interface BehaviorTrackingServiceDeps {
  logger: Logger;
  /** Default half-life in days for exponential decay of signal strength. */
  signalHalfLifeDays?: number;
  /** Clock override for deterministic tests. */
  now?: () => Date;
  db?: BehaviorStorePort;
  cache?: BehaviorCachePort;
}

const CACHE_PREFIX = 'behavior:signals:';
const CACHE_TTL_SECONDS = 3600;

const COLOR_ATTRS = new Set(['color', 'colour', 'finish', 'pattern']);

function isBrightColorValue(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.toLowerCase();
  return /neon|bright|fluorescent|high.?vis|lime|hot pink|electric/i.test(v);
}

function strengthFromRepeatCount(count: number): ExtractedSignal['strength'] {
  if (count >= 4) return 'strong';
  if (count >= 2) return 'moderate';
  return 'weak';
}

function behaviorTypeToSignalStrength(type: BehaviorEventType): ExtractedSignal['strength'] {
  switch (type) {
    case 'purchase':
    case 'add_to_cart':
    case 'save':
      return 'strong';
    case 'click':
    case 'recommendation_accept':
      return 'moderate';
    case 'dwell':
      return 'weak';
    case 'dismiss':
    case 'feedback_negative':
      return 'moderate';
    default:
      return 'weak';
  }
}

/**
 * Tracks user behavior, extracts preference signals, applies time decay,
 * and produces adaptive ranking updates for personalized search.
 */
export class BehaviorTrackingService {
  private readonly logger: Logger;
  private readonly signalHalfLifeMs: number;
  private readonly now: () => Date;
  private readonly db?: BehaviorStorePort;
  private readonly cache?: BehaviorCachePort;

  /** In-memory fallback when DB/cache are absent or miss. */
  private readonly memorySignals = new Map<string, ExtractedSignal[]>();
  private readonly memoryInference = new Map<string, UserPreferenceInference>();
  /** Per-user last-seen timestamps (ms) for each signal key — used for exponential decay. */
  private readonly signalLastSeenMs = new Map<string, Map<string, number>>();

  constructor(deps: BehaviorTrackingServiceDeps) {
    this.logger = deps.logger;
    const halfLifeDays = deps.signalHalfLifeDays ?? 30;
    this.signalHalfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;
    this.now = deps.now ?? (() => new Date());
    this.db = deps.db;
    this.cache = deps.cache;
  }

  /**
   * Ingests a single behavior event: extracts signals, merges state, and optionally persists.
   */
  async ingestEvent(event: BehaviorEvent): Promise<void> {
    const uid = event.userId;
    if (!uid) {
      this.logger.debug('behavior.ingest skipped: no userId', { eventId: event.id, type: event.type });
      return;
    }

    const extracted = this.extractSignalsFromEvent(event);
    if (extracted.length === 0) {
      this.logger.debug('behavior.ingest: no signals extracted', { eventId: event.id, type: event.type });
      return;
    }

    const existing = await this.loadSignalsInternal(uid);
    const eventTimeMs = Date.parse(event.timestamp);
    const merged = this.mergeSignals(uid, existing, extracted, Number.isFinite(eventTimeMs) ? eventTimeMs : this.now().getTime());
    await this.persistSignals(uid, merged);
    this.logger.info('behavior.event ingested', {
      userId: uid,
      eventType: event.type,
      signalsAdded: extracted.length,
      totalSignals: merged.length,
    });
  }

  /** Batch ingest with partial failure handling per event. */
  async ingestBatch(events: BehaviorEvent[]): Promise<{ ok: number; failed: number }> {
    let ok = 0;
    let failed = 0;
    for (const ev of events) {
      try {
        await this.ingestEvent(ev);
        ok += 1;
      } catch (err) {
        failed += 1;
        this.logger.error('behavior.batch item failed', {
          eventId: ev.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { ok, failed };
  }

  /**
   * Returns current extracted signals for a user after applying decay to weights for display/scoring.
   */
  async getExtractedSignals(userId: string): Promise<SignalExtraction> {
    const raw = await this.loadSignalsInternal(userId);
    const decayed = this.applyDecayToSignals(userId, raw);
    return {
      userId,
      signals: decayed,
      extractedAt: this.now().toISOString(),
    };
  }

  /**
   * Computes preference inference from accumulated (decayed) signals.
   */
  async inferPreferences(userId: string): Promise<UserPreferenceInference> {
    const { signals } = await this.getExtractedSignals(userId);
    const preferences = this.signalsToPreferences(userId, signals);
    const totalEvents = signals.reduce((acc: number, s: ExtractedSignal) => acc + s.examples.length, 0);

    let confidenceLevel: UserPreferenceInference['confidenceLevel'] = 'low';
    if (preferences.length >= 5 && totalEvents >= 20) confidenceLevel = 'high';
    else if (preferences.length >= 2 && totalEvents >= 8) confidenceLevel = 'medium';

    const inference: UserPreferenceInference = {
      userId,
      preferences,
      lastUpdated: this.now().toISOString(),
      totalEvents,
      confidenceLevel,
    };

    this.memoryInference.set(userId, inference);
    if (this.db) {
      await this.db.saveInference(userId, inference).catch((err) => {
        this.logger.error('behavior.saveInference failed', { userId, error: err instanceof Error ? err.message : err });
      });
    }

    return inference;
  }

  /**
   * Produces ranking weight adjustments from current inference (explicit vs inferred, decay-aware).
   */
  async buildAdaptiveRankingUpdate(userId: string): Promise<AdaptiveRankingUpdate> {
    const inference = await this.inferPreferences(userId);
    const appliedAt = this.now().toISOString();
    const weightAdjustments: Record<string, number> = {};
    const boostFactors: BoostFactor[] = [];
    const penaltyFactors: PenaltyFactor[] = [];

    for (const pref of inference.preferences) {
      const key = `${pref.attribute}::weight`;
      const delta = (pref.strength * pref.confidence) / 100;
      weightAdjustments[key] = (weightAdjustments[key] ?? 0) + delta;

      for (const v of pref.preferredValues) {
        boostFactors.push({
          attribute: pref.attribute,
          value: v,
          boostMultiplier: 1 + pref.strength / 200,
          reason:
            pref.type === 'explicit'
              ? 'Explicit preference'
              : pref.type === 'inferred_strong'
                ? 'Strong inferred preference from behavior'
                : 'Weak inferred preference from behavior',
        });
      }
      for (const v of pref.avoidedValues) {
        penaltyFactors.push({
          attribute: pref.attribute,
          value: v,
          penaltyMultiplier: 1 + pref.strength / 150,
          reason: 'Negative signal from dismissals or feedback',
        });
      }
    }

    return {
      userId,
      weightAdjustments,
      boostFactors,
      penaltyFactors,
      appliedAt,
    };
  }

  /**
   * Heuristic signal extraction from one event (e.g. repeated bright-color dismissals → negative color preference).
   */
  extractSignalsFromEvent(event: BehaviorEvent): ExtractedSignal[] {
    const out: ExtractedSignal[] = [];
    const attrs = event.payload.attributes ?? {};

    const base = (): Omit<ExtractedSignal, 'attribute' | 'direction' | 'value' | 'examples'> => ({
      strength: behaviorTypeToSignalStrength(event.type),
      source: event.type,
      confidence: 0.5,
      decayRate: 1 / this.signalHalfLifeMs,
    });

    switch (event.type) {
      case 'dismiss':
      case 'feedback_negative': {
        for (const [attr, val] of Object.entries(attrs)) {
          const value = String(val);
          const direction: ExtractedSignal['direction'] = 'negative';
          let strength = base().strength;
          if (COLOR_ATTRS.has(attr.toLowerCase()) && isBrightColorValue(value)) {
            strength = strengthFromRepeatCount(3);
          }
          out.push({
            ...base(),
            attribute: attr,
            direction,
            value,
            strength,
            confidence: strength === 'strong' ? 0.75 : 0.55,
            examples: [event.id],
          });
        }
        if (event.payload.brand) {
          out.push({
            ...base(),
            attribute: 'brand',
            direction: 'negative',
            value: event.payload.brand,
            confidence: 0.45,
            examples: [event.id],
          });
        }
        break;
      }
      case 'click':
      case 'save':
      case 'add_to_cart':
      case 'purchase':
      case 'recommendation_accept': {
        for (const [attr, val] of Object.entries(attrs)) {
          out.push({
            ...base(),
            attribute: attr,
            direction: 'positive',
            value: String(val),
            confidence: event.type === 'purchase' ? 0.9 : 0.65,
            examples: [event.id],
          });
        }
        if (event.payload.brand) {
          out.push({
            ...base(),
            attribute: 'brand',
            direction: 'positive',
            value: event.payload.brand,
            confidence: event.type === 'purchase' ? 0.92 : 0.7,
            examples: [event.id],
          });
        }
        break;
      }
      case 'dwell': {
        const ms = event.payload.dwellTimeMs ?? 0;
        if (ms > 5000 && event.payload.productId) {
          out.push({
            ...base(),
            attribute: 'engagement',
            direction: 'positive',
            value: event.payload.productId,
            strength: ms > 20000 ? 'moderate' : 'weak',
            confidence: Math.min(0.85, 0.4 + ms / 120000),
            examples: [event.id],
          });
        }
        break;
      }
      case 'compare': {
        if (event.payload.productIds?.length) {
          out.push({
            ...base(),
            attribute: 'comparison_intent',
            direction: 'neutral',
            value: event.payload.productIds.join(','),
            confidence: 0.5,
            examples: [event.id],
          });
        }
        break;
      }
      default:
        break;
    }

    return out;
  }

  private mergeSignals(
    userId: string,
    existing: ExtractedSignal[],
    incoming: ExtractedSignal[],
    eventTimeMs: number,
  ): ExtractedSignal[] {
    const byKey = new Map<string, ExtractedSignal>();

    const keyOf = (s: ExtractedSignal) => `${s.attribute}::${s.direction}::${s.value ?? ''}`;

    for (const s of existing) {
      byKey.set(keyOf(s), { ...s });
    }

    for (const s of incoming) {
      const k = keyOf(s);
      const prev = byKey.get(k);
      this.recordSignalSeen(userId, k, eventTimeMs);
      if (!prev) {
        byKey.set(k, { ...s });
        continue;
      }
      const count = prev.examples.length + s.examples.length;
      const merged: ExtractedSignal = {
        ...prev,
        strength: strengthFromRepeatCount(count),
        confidence: Math.min(0.97, prev.confidence + 0.05),
        examples: [...prev.examples, ...s.examples].slice(-50),
      };
      byKey.set(k, merged);
    }

    return [...byKey.values()];
  }

  private recordSignalSeen(userId: string, signalKey: string, tsMs: number): void {
    const inner = this.signalLastSeenMs.get(userId) ?? new Map<string, number>();
    inner.set(signalKey, tsMs);
    this.signalLastSeenMs.set(userId, inner);
  }

  private applyDecayToSignals(userId: string, signals: ExtractedSignal[]): ExtractedSignal[] {
    const now = this.now().getTime();
    const inner = this.signalLastSeenMs.get(userId);
    const keyOf = (s: ExtractedSignal) => `${s.attribute}::${s.direction}::${s.value ?? ''}`;

    return signals.map((s) => {
      const k = keyOf(s);
      /* Missing timestamps (e.g. cold load): assume ~one half-life of age so stale rows still decay. */
      const lastSeen = inner?.get(k) ?? now - this.signalHalfLifeMs;
      const ageMs = Math.max(0, now - lastSeen);
      const halfLives = ageMs / this.signalHalfLifeMs;
      const factor = Math.pow(0.5, halfLives);
      return {
        ...s,
        confidence: s.confidence * factor,
      };
    });
  }

  private signalsToPreferences(_userId: string, signals: ExtractedSignal[]): InferredUserPreference[] {
    const posMap = new Map<string, Set<string>>();
    const negMap = new Map<string, Set<string>>();
    const evidence = new Map<string, number>();

    for (const s of signals) {
      if (!s.value) continue;
      const key = s.attribute;
      evidence.set(key, (evidence.get(key) ?? 0) + 1);
      if (s.direction === 'positive') {
        if (!posMap.has(key)) posMap.set(key, new Set());
        posMap.get(key)!.add(s.value);
      } else if (s.direction === 'negative') {
        if (!negMap.has(key)) negMap.set(key, new Set());
        negMap.get(key)!.add(s.value);
      }
    }

    const prefs: InferredUserPreference[] = [];

    const allAttrs = new Set([...posMap.keys(), ...negMap.keys()]);
    for (const attr of allAttrs) {
      const preferredValues = [...(posMap.get(attr) ?? [])];
      const avoidedValues = [...(negMap.get(attr) ?? [])];
      const ev = evidence.get(attr) ?? 0;
      const net = preferredValues.length + avoidedValues.length;
      const strength = Math.min(100, net * 12 + ev * 4);
      const confidence = Math.min(0.95, 0.35 + ev * 0.08 + (signals.find((x) => x.attribute === attr)?.confidence ?? 0) * 0.3);

      let type: InferredUserPreference['type'] = 'inferred_weak';
      if (ev >= 6) type = 'inferred_strong';
      if (preferredValues.length > 0 && signals.some((x) => x.attribute === attr && x.source === 'clarification_response')) {
        type = 'explicit';
      }

      prefs.push({
        attribute: attr,
        preferredValues,
        avoidedValues,
        strength,
        confidence,
        evidenceCount: ev,
        lastObserved: this.now().toISOString(),
        decayFactor: Math.pow(0.5, 1 / 30),
        type,
      });
    }

    return prefs;
  }

  private async loadSignalsInternal(userId: string): Promise<ExtractedSignal[]> {
    const cacheKey = `${CACHE_PREFIX}${userId}`;
    if (this.cache) {
      try {
        const raw = await this.cache.get(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw) as ExtractedSignal[];
          return parsed;
        }
      } catch (err) {
        this.logger.warn('behavior.cache get failed', { userId, error: err instanceof Error ? err.message : err });
      }
    }

    if (this.db) {
      try {
        const row = await this.db.loadSignals(userId);
        if (row?.length) return row;
      } catch (err) {
        this.logger.error('behavior.db loadSignals failed', { userId, error: err instanceof Error ? err.message : err });
      }
    }

    return this.memorySignals.get(userId) ?? [];
  }

  private async persistSignals(userId: string, signals: ExtractedSignal[]): Promise<void> {
    this.memorySignals.set(userId, signals);

    if (this.cache) {
      try {
        await this.cache.set(`${CACHE_PREFIX}${userId}`, JSON.stringify(signals), CACHE_TTL_SECONDS);
      } catch (err) {
        this.logger.warn('behavior.cache set failed', { userId, error: err instanceof Error ? err.message : err });
      }
    }

    if (this.db) {
      try {
        await this.db.saveSignals(userId, signals);
      } catch (err) {
        this.logger.error('behavior.db saveSignals failed', { userId, error: err instanceof Error ? err.message : err });
      }
    }
  }
}
