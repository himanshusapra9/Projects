/**
 * Offline evaluation cases, measured results, and reusable test fixtures for
 * regression testing the decision engine.
 */

import type { DecisionResponse } from "./recommendation.js";
import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * Single labeled evaluation scenario for automated tests or human review.
 */
export interface EvaluationCase {
  /** Case identifier. */
  caseId: string;
  /** Human-readable title. */
  title: string;
  /** Tenant id for fixture data. */
  tenantId: string;
  /** Product id under test. */
  productId: string;
  /** Optional variant focus. */
  variantSku?: string;
  /** Category for stratified metrics. */
  category: ProductCategory;
  /** Shopper fixture identifier (synthetic profile). */
  shopperFixtureId: string;
  /** Session fixture identifier. */
  sessionFixtureId: string;
  /** Input snapshot hash for reproducibility. */
  inputSnapshotHash: string;
  /** Expected properties (soft constraints) for assertions. */
  expectedConstraints: {
    /** Minimum allowed fit confidence level. */
    minFitConfidence?: ConfidenceLevel;
    /** Maximum allowed return risk probability. */
    maxReturnRiskProbability?: number;
    /** SKUs that must not appear in top pick. */
    forbiddenSkus?: string[];
    /** Required mention of uncertainty codes. */
    requiredUncertaintyCodes?: string[];
    /** Required alternative sku in top-k. */
    requiredAlternativeSkus?: string[];
  };
  /** Severity for CI gating. */
  severity: "blocking" | "warning" | "informational";
  /** Tags for suite selection (smoke, full, nightly). */
  tags: string[];
  /** ISO timestamp when case authored. */
  authoredAt: string;
  /** Author email or service id. */
  authoredBy: string;
  /** Notes for human reviewers. */
  notes?: string;
  /** Linked production incident ids if regression. */
  incidentIds?: string[];
  /** Baseline decision id from golden run. */
  baselineDecisionId?: string;
  /** Whether case uses live vs recorded inventory. */
  inventoryMode: "recorded" | "live_sandbox";
  /** Maximum latency SLA milliseconds for this case. */
  maxLatencyMs?: number;
  /** Locale under test. */
  locale: string;
}

/**
 * Outcome metrics from running an evaluation case or suite.
 */
export interface EvaluationResult {
  /** Result identifier. */
  resultId: string;
  /** Evaluation case id. */
  caseId: string;
  /** Engine version under test. */
  engineVersion: string;
  /** Whether assertions passed. */
  passed: boolean;
  /** Individual assertion results. */
  assertionResults: Array<{
    assertionKey: string;
    passed: boolean;
    message?: string;
    actualValue?: unknown;
    expectedValue?: unknown;
  }>;
  /** Latency milliseconds end-to-end. */
  latencyMs: number;
  /** Full decision response for debugging (may be redacted). */
  decisionSnapshot?: DecisionResponse;
  /** ISO timestamp of run. */
  executedAt: string;
  /** Host or CI job identifier. */
  runnerId: string;
  /** Aggregate scores for ranking experiments. */
  metricOverrides: Record<string, number>;
  /** Whether flake detection retry was needed. */
  flakyRetryCount: number;
  /** Error code if run failed before assertions. */
  errorCode?: string;
  /** stderr excerpt if tooling failed. */
  errorDetail?: string;
  /** Cost estimate minor units for cloud spend accounting. */
  estimatedRunCostMinor?: number;
  /** Whether result promoted to golden baseline. */
  promotedToGolden: boolean;
  /** Diff summary vs golden baseline if any. */
  goldenDiffSummary?: string;
  /** Tags copied from case for analytics. */
  tags: string[];
}

/**
 * Reusable frozen inputs for deterministic tests (shopper, inventory, etc.).
 */
export interface TestFixture {
  /** Fixture identifier. */
  fixtureId: string;
  /** Fixture kind. */
  fixtureType: "shopper" | "session" | "inventory" | "product_snapshot" | "full_graph";
  /** Tenant scope. */
  tenantId: string;
  /** Version string for schema evolution. */
  schemaVersion: number;
  /** Serialized payload blob reference (e.g., S3 URI). */
  payloadUri: string;
  /** Inline small payload for unit tests (optional). */
  inlinePayload?: Record<string, unknown>;
  /** Checksum for integrity. */
  checksumSha256: string;
  /** ISO timestamp when fixture captured. */
  capturedAt: string;
  /** Environment where captured (prod snapshot vs synthetic). */
  provenance: "synthetic" | "anonymized_prod" | "merchant_staging";
  /** PII classification for handling rules. */
  piiClassification: "none" | "low" | "high";
  /** Related evaluation case ids using this fixture. */
  linkedCaseIds: string[];
  /** Whether fixture is safe for public CI logs. */
  redactedForPublicCi: boolean;
  /** Owner team maintaining fixture. */
  ownerTeam: string;
  /** Expiry for stale fixtures. */
  expiresAt?: string;
  /** Tags for discovery. */
  tags: string[];
  /** Notes for engineers. */
  notes?: string;
  /** Size bytes for storage planning. */
  approximateSizeBytes?: number;
  /** Compression codec if blob stored compressed. */
  compression?: "none" | "gzip" | "zstd";
}
