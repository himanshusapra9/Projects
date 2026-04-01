"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ConfidenceBar from "@/components/shared/ConfidenceBar";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 10;

function normalizeProducts(data: unknown): Product[] {
  if (Array.isArray(data)) return data as Product[];
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: Product[] }).items;
  }
  return [];
}

export default function ProductsPage() {
  const [status, setStatus] = useState("");
  const [qualityMin, setQualityMin] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(() => {
    const p: Record<string, string> = { limit: String(PAGE_SIZE), offset: String((page - 1) * PAGE_SIZE) };
    if (status) p.status = status;
    if (qualityMin) p.quality_min = qualityMin;
    if (category) p.category = category;
    return p;
  }, [status, qualityMin, category, page]);

  const query = useProducts(params);
  const products = normalizeProducts(query.data);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (qualityMin) {
        const min = Number(qualityMin);
        if (!Number.isNaN(min) && p.quality_score < min) return false;
      }
      if (category && p.category_path) {
        const joined = p.category_path.join("/").toLowerCase();
        if (!joined.includes(category.toLowerCase())) return false;
      }
      return true;
    });
  }, [products, qualityMin, category]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
        <p className="mt-1 text-sm text-slate-500">Browse and drill into catalog items with quality context.</p>
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="in_review">In review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Min quality (0–1)</span>
            <input
              type="number"
              step="0.05"
              min={0}
              max={1}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={qualityMin}
              onChange={(e) => { setQualityMin(e.target.value); setPage(1); }}
              placeholder="e.g. 0.7"
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-slate-500">Category contains</span>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              placeholder="Filter path substring"
            />
          </label>
        </CardContent>
      </Card>

      {query.isLoading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading products…
        </div>
      )}

      {query.isError && !query.isLoading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load products. Verify NEXT_PUBLIC_API_URL and API availability.
        </div>
      )}

      {!query.isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="font-medium text-slate-800">No products found</p>
          <p className="mt-2 text-sm text-slate-500">Relax filters or ingest catalog data via the API.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Quality</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Attrs</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-900">{p.title ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.brand ?? "—"}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">{p.category_path?.join(" › ") ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="w-28">
                      <ConfidenceBar value={p.quality_score} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="capitalize">
                      {p.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{p.attribute_count}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${p.id}`}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((x) => Math.max(1, x - 1))}>
              Previous
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={filtered.length < PAGE_SIZE} onClick={() => setPage((x) => x + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
