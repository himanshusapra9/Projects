"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export type AlternativeProduct = {
  id: string;
  name: string;
  price: string;
  fitLabel: string;
  fitScore: number;
  returnRisk: "low" | "moderate" | "elevated";
  whyChip: string;
  imageColor?: string;
  imageUrl?: string;
};

const riskStyles: Record<
  AlternativeProduct["returnRisk"],
  string
> = {
  low: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  moderate: "bg-amber-50 text-amber-900 ring-amber-100",
  elevated: "bg-rose-50 text-rose-900 ring-rose-100",
};

export type AlternativesListProps = {
  products: AlternativeProduct[];
  onSelect?: (id: string) => void;
  className?: string;
};

export function AlternativesList({
  products,
  onSelect,
  className = "",
}: AlternativesListProps) {
  return (
    <section className={className} aria-labelledby="alt-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3
            id="alt-heading"
            className="font-serif text-xl font-normal text-navy-950"
          >
            Alternatives with stronger fit
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Curated for similar use cases—swipe to explore.
          </p>
        </div>
        <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-400 sm:inline">
          Horizontal scroll
        </span>
      </div>

      <div
        className="-mx-1 flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]"
        tabIndex={0}
        role="list"
        aria-label="Alternative products"
      >
        {products.map((p, i) => (
          <motion.article
            key={p.id}
            role="listitem"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 26 }}
            className="group relative w-[240px] shrink-0 overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => onSelect?.(p.id)}
              className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
                style={
                  !p.imageUrl && p.imageColor
                    ? { background: `linear-gradient(135deg, ${p.imageColor}, #e2e8f0)` }
                    : undefined
                }
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400">
                    Image
                  </div>
                )}
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-2xs font-semibold text-accent shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  {p.fitLabel}
                </span>
              </div>
              <div className="space-y-2 p-4">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-navy-950 group-hover:text-accent">
                  {p.name}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-2xs font-semibold text-accent ring-1 ring-indigo-100">
                    Fit {Math.round(p.fitScore)}%
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ${riskStyles[p.returnRisk]}`}
                  >
                    Return: {p.returnRisk}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">{p.price}</p>
                <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-2xs font-medium text-slate-600 ring-1 ring-slate-100">
                  {p.whyChip}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition group-hover:opacity-100">
                  View details
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </button>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
