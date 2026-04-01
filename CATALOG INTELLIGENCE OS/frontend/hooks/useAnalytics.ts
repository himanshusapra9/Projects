import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CatalogHealth, ReviewQueueStats } from "@/lib/types";

export function useCatalogHealth() {
  return useQuery<CatalogHealth>({
    queryKey: ["analytics", "catalogHealth"],
    queryFn: () => api.analytics.catalogHealth(),
  });
}

export function useReviewQueueStats() {
  return useQuery<ReviewQueueStats>({
    queryKey: ["analytics", "reviewQueueStats"],
    queryFn: () => api.analytics.reviewQueueStats(),
  });
}

export function useAttributeCoverage() {
  return useQuery({
    queryKey: ["analytics", "attributeCoverage"],
    queryFn: () => api.analytics.attributeCoverage(),
  });
}

export function useSupplierQuality() {
  return useQuery({
    queryKey: ["analytics", "supplierQuality"],
    queryFn: () => api.analytics.supplierQuality(),
  });
}
