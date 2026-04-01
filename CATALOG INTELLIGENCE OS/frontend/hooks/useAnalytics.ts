"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  SAMPLE_CATALOG_HEALTH,
  SAMPLE_REVIEW_QUEUE_STATS,
  SAMPLE_SUPPLIER_QUALITY,
  SAMPLE_ATTRIBUTE_COVERAGE,
} from "@/lib/sampleData";

export function useCatalogHealth() {
  return useQuery({
    queryKey: ["catalogHealth"],
    queryFn: () => api.analytics.catalogHealth(),
    retry: 1,
    placeholderData: SAMPLE_CATALOG_HEALTH,
  });
}

export function useReviewQueueStats() {
  return useQuery({
    queryKey: ["reviewQueueStats"],
    queryFn: () => api.analytics.reviewQueueStats(),
    retry: 1,
    placeholderData: SAMPLE_REVIEW_QUEUE_STATS,
  });
}

export function useSupplierQuality() {
  return useQuery({
    queryKey: ["supplierQuality"],
    queryFn: () => api.analytics.supplierQuality(),
    retry: 1,
    placeholderData: SAMPLE_SUPPLIER_QUALITY,
  });
}

export function useAttributeCoverage() {
  return useQuery({
    queryKey: ["attributeCoverage"],
    queryFn: () => api.analytics.attributeCoverage(),
    retry: 1,
    placeholderData: SAMPLE_ATTRIBUTE_COVERAGE,
  });
}
