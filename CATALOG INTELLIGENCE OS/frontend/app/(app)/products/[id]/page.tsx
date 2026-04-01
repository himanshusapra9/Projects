"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import ProductHero from "@/components/products/ProductHero";
import AttributeTable from "@/components/products/AttributeTable";
import QualityBreakdown from "@/components/products/QualityBreakdown";
import ReviewHistory from "@/components/products/ReviewHistory";
import type { ProductDetail } from "@/lib/types";

function defaultDimensions(): ProductDetail["quality_dimensions"] {
  return {
    completeness: 0,
    conformity: 0,
    consistency: 0,
    freshness: 0,
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const query = useProduct(id);

  const loading = query.isLoading;
  const err = query.isError;
  const data = query.data as ProductDetail | undefined;

  const dims = data?.quality_dimensions ?? defaultDimensions();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading product…
        </div>
      )}

      {err && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Failed to load this product. Check the ID and API connection.
        </div>
      )}

      {!loading && !err && data && (
        <>
          <ProductHero
            title={(data.identity?.title as string | undefined) ?? (data as { title?: string }).title ?? null}
            brand={(data.identity?.brand as string | undefined) ?? (data as { brand?: string }).brand ?? null}
            categoryPath={data.category_path}
            qualityScore={data.quality_score}
            status={data.status}
          />
          <QualityBreakdown dimensions={dims} />
          <AttributeTable attributes={data.attributes ?? []} />
          <ReviewHistory logs={data.audit_logs ?? []} />
        </>
      )}

      {!loading && !err && !data && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="font-medium text-slate-800">Product not found</p>
          <p className="mt-2 text-sm text-slate-500">No payload returned for this identifier.</p>
        </div>
      )}
    </div>
  );
}
