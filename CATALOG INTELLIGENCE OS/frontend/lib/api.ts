const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const DEMO_MODE_HEADER = "x-cios-demo";

let _apiOnline: boolean | null = null;
export function setApiOnline(v: boolean) { _apiOnline = v; }
export function isApiOnline() { return _apiOnline !== false; }

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
    if (!res.ok) {
      setApiOnline(true);
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `API error: ${res.status}`);
    }
    setApiOnline(true);
    return res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network"))) {
      setApiOnline(false);
    }
    throw err;
  }
}

export const api = {
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<any>(`/api/v1/products${qs}`);
    },
    get: (id: string) => fetchAPI<any>(`/api/v1/products/${id}`),
    audit: (id: string) => fetchAPI<any>(`/api/v1/products/${id}/audit`),
  },
  review: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<any>(`/api/v1/review/tasks${qs}`);
    },
    accept: (taskId: string, body: { reviewer_id: string; note?: string }) =>
      fetchAPI<any>(`/api/v1/review/tasks/${taskId}/accept`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    reject: (taskId: string, body: { reviewer_id: string; note?: string }) =>
      fetchAPI<any>(`/api/v1/review/tasks/${taskId}/reject`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    edit: (taskId: string, body: { reviewer_id: string; corrected_value: any; note?: string }) =>
      fetchAPI<any>(`/api/v1/review/tasks/${taskId}/edit`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    bulkAccept: (body: { task_ids: string[]; reviewer_id: string }) =>
      fetchAPI<any>(`/api/v1/review/tasks/bulk_accept`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  analytics: {
    catalogHealth: () => fetchAPI<any>(`/api/v1/analytics/catalog_health`),
    attributeCoverage: () => fetchAPI<any>(`/api/v1/analytics/attribute_coverage`),
    reviewQueueStats: () => fetchAPI<any>(`/api/v1/analytics/review_queue_stats`),
    supplierQuality: () => fetchAPI<any>(`/api/v1/analytics/supplier_quality`),
  },
  taxonomy: {
    list: (parentId?: string) => {
      const qs = parentId ? `?parent_id=${parentId}` : "";
      return fetchAPI<any>(`/api/v1/taxonomy${qs}`);
    },
    get: (id: string) => fetchAPI<any>(`/api/v1/taxonomy/${id}`),
  },
  ingest: {
    single: (body: any) =>
      fetchAPI<any>(`/api/v1/ingest/single`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    status: (jobId: string) => fetchAPI<any>(`/api/v1/ingest/status/${jobId}`),
  },
  export: {
    product: (id: string, format?: string) =>
      fetchAPI<any>(`/api/v1/export/${id}?format=${format || "generic_json"}`),
  },
};
