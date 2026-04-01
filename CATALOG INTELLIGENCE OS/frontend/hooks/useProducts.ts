"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS, SAMPLE_PRODUCT_DETAIL } from "@/lib/sampleData";

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.products.list(params),
    retry: 1,
    placeholderData: { products: SAMPLE_PRODUCTS, total: SAMPLE_PRODUCTS.length, page: 1, per_page: 20 },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => api.products.get(id),
    enabled: !!id,
    retry: 1,
    placeholderData: SAMPLE_PRODUCT_DETAIL[id] ?? null,
  });
}
