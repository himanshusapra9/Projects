"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlternativesBody,
  AlternativesResponse,
  ApiError,
  DecisionResponse,
  FitConfidenceBody,
  ReturnRiskBody,
  ReturnRiskResponse,
  SizeRecommendationBody,
  SizeRecommendationResponse,
  api,
} from "@/lib/api";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

function useApiQuery<T>(
  enabled: boolean,
  key: string,
  fetcher: () => Promise<T>,
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setState({ data: null, loading: false, error: err });
    }
  }, [enabled, fetcher]);

  useEffect(() => {
    void refetch();
  }, [key, refetch]);

  return { ...state, refetch };
}

export function useFitConfidence(body: FitConfidenceBody | null) {
  const enabled = body != null;
  const key = body
    ? `${body.tenant_id}:${body.session_id}:${body.product_id}:${body.variant_id ?? ""}`
    : "idle";
  const fetcher = useCallback(
    () => api.getFitConfidence(body!),
    [body],
  );
  const q = useApiQuery<DecisionResponse>(enabled, key, fetcher);
  return {
    decision: q.data,
    loading: q.loading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useReturnRisk(body: ReturnRiskBody | null) {
  const enabled = body != null;
  const key = body
    ? `${body.tenant_id}:${body.session_id}:${body.product_id}`
    : "idle";
  const fetcher = useCallback(() => api.getReturnRisk(body!), [body]);
  const q = useApiQuery<ReturnRiskResponse>(enabled, key, fetcher);
  return {
    profile: q.data,
    loading: q.loading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useSizeRecommendation(body: SizeRecommendationBody | null) {
  const enabled = body != null;
  const key = body
    ? `${body.tenant_id}:${body.session_id}:${body.product_id}`
    : "idle";
  const fetcher = useCallback(
    () => api.getSizeRecommendation(body!),
    [body],
  );
  const q = useApiQuery<SizeRecommendationResponse>(enabled, key, fetcher);
  return {
    recommendation: q.data,
    loading: q.loading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useAlternatives(body: AlternativesBody | null) {
  const enabled = body != null;
  const key = body
    ? `${body.tenant_id}:${body.session_id}:${body.product_id}:${body.limit ?? ""}`
    : "idle";
  const fetcher = useCallback(() => api.getAlternatives(body!), [body]);
  const q = useApiQuery<AlternativesResponse>(enabled, key, fetcher);
  return {
    alternatives: q.data?.alternatives ?? null,
    raw: q.data,
    loading: q.loading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useRiskLevelFromScore(riskScore: number | undefined) {
  return useMemo(() => {
    if (riskScore == null) return "moderate" as const;
    if (riskScore < 0.35) return "low" as const;
    if (riskScore < 0.6) return "moderate" as const;
    return "review" as const;
  }, [riskScore]);
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
