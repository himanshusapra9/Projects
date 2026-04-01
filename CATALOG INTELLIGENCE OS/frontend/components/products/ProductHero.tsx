"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import QualityRing from "@/components/shared/QualityRing";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  published: "default",
  in_review: "secondary",
  draft: "outline",
  archived: "destructive",
};

export default function ProductHero({
  title,
  brand,
  categoryPath,
  qualityScore,
  status,
}: {
  title: string | null;
  brand: string | null;
  categoryPath: string[] | null;
  qualityScore: number;
  status: string;
}) {
  const path = categoryPath ?? [];
  const variant = STATUS_VARIANT[status] ?? "secondary";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={variant} className="capitalize">
              {status.replace(/_/g, " ")}
            </Badge>
            {brand && <span className="text-sm font-medium text-slate-500">{brand}</span>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title ?? "Untitled product"}</h1>
          {path.length > 0 && (
            <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Category path">
              <Link href="/taxonomy" className="hover:text-indigo-600">
                Taxonomy
              </Link>
              {path.map((seg, i) => (
                <span key={`${seg}-${i}`} className="flex items-center gap-1">
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                  <span className={i === path.length - 1 ? "font-medium text-slate-800" : ""}>{seg}</span>
                </span>
              ))}
            </nav>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-4 rounded-xl bg-slate-50 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Quality score</p>
            <p className="mt-1 text-sm text-slate-600">Holistic catalog signal</p>
          </div>
          <QualityRing score={qualityScore} size={88} strokeWidth={6} />
        </div>
      </div>
    </div>
  );
}
