"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight, Ruler, Shirt } from "lucide-react";
import { useState } from "react";

export type SizeOption = {
  id: string;
  label: string;
  confidence: number;
};

export type SizeRecommendationProps = {
  sizes: SizeOption[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  brandTendency?: "runs_small" | "true_to_size" | "runs_large";
  fitNotes?: string[];
  className?: string;
};

const tendencyCopy: Record<
  NonNullable<SizeRecommendationProps["brandTendency"]>,
  { label: string; sub: string }
> = {
  runs_small: {
    label: "Brand tends snug",
    sub: "This label often fits smaller than tagged—your pick reflects that.",
  },
  true_to_size: {
    label: "Mostly true to size",
    sub: "Across similar items, tagged size matched expectations.",
  },
  runs_large: {
    label: "Roomier cut",
    sub: "Extra ease in body and sleeve—size down if you prefer trim.",
  },
};

export function SizeRecommendation({
  sizes,
  selectedId,
  onSelect,
  brandTendency = "true_to_size",
  fitNotes = [
    "Torso runs short vs. similar tees you kept.",
    "Sleeve hem sits above wrist for most in M.",
  ],
  className = "",
}: SizeRecommendationProps) {
  const [betweenOpen, setBetweenOpen] = useState(false);
  const [active, setActive] = useState(selectedId ?? sizes[0]?.id ?? "");

  const pick = (id: string) => {
    setActive(id);
    onSelect?.(id);
  };

  const t = tendencyCopy[brandTendency];

  return (
    <section
      className={`rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm ${className}`}
      aria-labelledby="size-rec-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            id="size-rec-heading"
            className="font-serif text-xl font-normal text-navy-950"
          >
            Choose your size
          </h3>
          <p className="text-sm text-slate-500">
            Confidence overlay reflects return-safe fit, not popularity.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
          <Shirt className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          {t.label}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{t.sub}</p>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Size options"
      >
        {sizes.map((s, i) => {
          const isSel = s.id === active;
          const overlay = Math.round(s.confidence);
          return (
            <motion.button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              onClick={() => pick(s.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 26 }}
              className={`relative min-w-[3.5rem] overflow-hidden rounded-md border px-4 py-3 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isSel
                  ? "border-indigo-300 bg-indigo-50/80 text-navy-950 shadow-sm"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
              }`}
            >
              <span className="block text-lg font-semibold tabular-nums tracking-tight">
                {s.label}
              </span>
              <span
                className={`mt-1 block text-2xs font-medium uppercase tracking-wide ${
                  overlay >= 80
                    ? "text-emerald-700"
                    : overlay >= 60
                      ? "text-amber-700"
                      : "text-slate-500"
                }`}
              >
                {overlay}% match
              </span>
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-confidence-from to-confidence-to"
                initial={{ width: 0 }}
                animate={{ width: `${overlay}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-dashed border-slate-200 bg-slate-50/50 p-4">
        <button
          type="button"
          onClick={() => setBetweenOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left text-sm font-medium text-navy-950"
          aria-expanded={betweenOpen}
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-accent" aria-hidden />
            Between sizes?
          </span>
          <span className="text-xs font-normal text-slate-500">
            {betweenOpen ? "Hide" : "Guidance"}
          </span>
        </button>
        {betweenOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 space-y-2 text-sm text-slate-600"
          >
            <p>
              Prefer a locked-in feel—choose the smaller. Want drape and layering room—go
              one up. Your saved preference prioritizes{" "}
              <span className="font-medium text-slate-800">toe room</span> on footwear
              and <span className="font-medium text-slate-800">ease</span> on knits.
            </p>
            <p className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Ruler className="h-3.5 w-3.5" aria-hidden />
              Add chest &amp; sleeve for a tighter prediction—takes 10 seconds.
            </p>
          </motion.div>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Review-derived fit notes
        </p>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          {fitNotes.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-300" />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
