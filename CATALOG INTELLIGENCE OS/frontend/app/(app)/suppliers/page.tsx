"use client";

import { Loader2, Shield, TrendingUp } from "lucide-react";
import { useSupplierQuality } from "@/hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfidenceBar from "@/components/shared/ConfidenceBar";

type Row = {
  id: string;
  name: string;
  quality: number;
  trust: number;
  products?: number;
};

function normalizeRows(data: unknown): Row[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)
      ? (data as { items: unknown[] }).items
      : data && typeof data === "object" && "suppliers" in data && Array.isArray((data as { suppliers: unknown }).suppliers)
        ? (data as { suppliers: unknown[] }).suppliers
        : [];

  return (list as Record<string, unknown>[]).map((r, i) => {
    let quality = Number(r.quality_score ?? r.quality ?? 0);
    let trust = Number(r.trust_score ?? r.trust ?? 0);
    if (quality > 1) quality /= 100;
    if (trust > 1) trust /= 100;
    return {
      id: String(r.supplier_id ?? r.id ?? i),
      name: String(r.supplier_name ?? r.name ?? "Supplier"),
      quality,
      trust,
      products: r.product_count != null ? Number(r.product_count) : undefined,
    };
  });
}

export default function SuppliersPage() {
  const q = useSupplierQuality();
  const rows = normalizeRows(q.data);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suppliers</h1>
        <p className="mt-1 text-sm text-slate-500">Feed quality and trust scores by supplier.</p>
      </div>

      {q.isLoading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading supplier analytics…
        </div>
      )}

      {q.isError && !q.isLoading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Unable to load supplier quality. Configure the API endpoint for analytics.
        </div>
      )}

      {!q.isLoading && rows.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No supplier data</CardTitle>
            <CardDescription>Connect supplier feeds or run analytics aggregation to populate this view.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {rows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((s) => (
            <Card key={s.id} className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    {s.products != null && (
                      <CardDescription>{s.products.toLocaleString()} products in scope</CardDescription>
                    )}
                  </div>
                  <Shield className="h-5 w-5 text-indigo-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" /> Quality
                    </span>
                    <span>{Math.round(s.quality * 100)}%</span>
                  </div>
                  <ConfidenceBar value={s.quality} />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Trust</span>
                    <span>{Math.round(s.trust * 100)}%</span>
                  </div>
                  <ConfidenceBar value={s.trust} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
