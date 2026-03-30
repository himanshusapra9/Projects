/**
 * API client for Return Prevention + Fit Confidence Engine backend.
 * Base URL: set NEXT_PUBLIC_API_URL (e.g. http://localhost:3001/api/v1)
 */

export type TenantSession = {
  tenant_id: string;
  session_id: string;
  user_id?: string;
};

export type UserContext = {
  measurements?: Record<string, number>;
  measurementUnit?: "IN" | "CM";
  answers?: Record<string, unknown>;
  statedUseCase?: string;
  priorVariantPurchases?: string[];
  constraints?: {
    maxPrice?: { amount: string; currency: string };
    mustHave?: string[];
    avoid?: string[];
  };
};

export type EvidenceRef = {
  source: "MERCHANT" | "REVIEW" | "RETURN_STATS" | "BEHAVIOR" | "COMMUNITY" | "MODEL";
  id: string;
  snippet?: string;
  weight: number;
};

export type DecisionResponse = {
  schemaVersion: "1.0.0";
  requestId: string;
  tenantId: string;
  productId: string;
  resolvedVariantIds: string[];
  recommendedVariantIds: string[];
  recommendedAction: "BUY" | "CLARIFY" | "REFINE" | "COMPARE" | "CONSIDER_ALTERNATIVE";
  fitConfidence: number;
  returnRisk: number;
  uncertainty: { epistemic: number; aleatoric: number; total: number };
  alternatives: Array<{
    productId: string;
    variantId?: string;
    score: number;
    tradeoffs: string[];
    saferOnDimensions?: string[];
  }>;
  explanation: {
    summary: string;
    bullets: Array<{ text: string; featureIds?: string[] }>;
    citations: EvidenceRef[];
  };
};

export type FitConfidenceBody = TenantSession & {
  product_id: string;
  variant_id?: string;
  user_context?: UserContext;
};

export type ReturnRiskBody = FitConfidenceBody;

export type SizeRecommendationBody = TenantSession & {
  product_id: string;
  user_measurements?: Record<string, number>;
  user_preferences?: {
    fitPreference?: string;
    betweenSizePriority?: "toe_room" | "locked_heel" | "balanced";
    style?: Record<string, unknown>;
  };
};

export type AlternativesBody = TenantSession & {
  product_id: string;
  exclude_product_ids?: string[];
  user_context?: UserContext;
  limit?: number;
  filter_state?: Record<string, unknown>;
};

export type AlternativesResponse = {
  alternatives: Array<{
    productId: string;
    variantId?: string;
    score: number;
    tradeoffs: string[];
    saferOnDimensions?: string[];
    lowerRisk: boolean;
    betterFit: boolean;
  }>;
};

export type ReturnRiskResponse = {
  riskScore: number;
  preventableShare: number;
  nonPreventableShare: number;
  factors: Array<{
    code: string;
    weight: number;
    preventable: boolean;
    label: string;
  }>;
  interventions: Array<{
    id: string;
    kind: "INFO" | "WARN" | "SOFT_BLOCK" | "SUGGEST_ALT";
    message: string;
    thresholdCrossed?: string;
  }>;
};

export type SizeRecommendationResponse = {
  recommendedSize: string;
  recommendedVariantId?: string;
  confidence: number;
  betweenSize: boolean;
  rationale: string;
  alternatives: Array<{
    variantId: string;
    label: string;
    fitScore: number;
    riskPenalty: number;
    composite: number;
  }>;
  measurementUnit?: "IN" | "CM";
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
  return base.replace(/\/$/, "");
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Invalid JSON from API", res.status, text);
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const data = await parseJson<T | { message?: string }>(res);
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: string }).message)
        : res.statusText;
    throw new ApiError(msg || "Request failed", res.status, data);
  }
  return data as T;
}

export const api = {
  getDecision: (body: FitConfidenceBody) =>
    request<DecisionResponse>("/decision", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getFitConfidence: (body: FitConfidenceBody) =>
    request<DecisionResponse>("/fit-confidence", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getReturnRisk: (body: ReturnRiskBody) =>
    request<ReturnRiskResponse>("/return-risk", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getSizeRecommendation: (body: SizeRecommendationBody) =>
    request<SizeRecommendationResponse>("/size-recommendation", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getAlternatives: (body: AlternativesBody) =>
    request<AlternativesResponse>("/alternatives", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
