"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export type RefinementChip = {
  id: string;
  label: string;
  ai?: boolean;
};

export type RefinementChipsProps = {
  chips: RefinementChip[];
  activeIds: string[];
  onToggle: (id: string) => void;
  className?: string;
};

export function RefinementChips({
  chips,
  activeIds,
  onToggle,
  className = "",
}: RefinementChipsProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="toolbar"
      aria-label="Refine results"
    >
      {chips.map((c, i) => {
        const on = activeIds.includes(c.id);
        return (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => onToggle(c.id)}
            aria-pressed={on}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.22 }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              on
                ? "border-indigo-300 bg-indigo-50 text-accent shadow-sm"
                : c.ai
                  ? "border-violet-200/80 bg-gradient-to-r from-violet-50/90 to-indigo-50/50 text-violet-950 hover:border-violet-300"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {c.ai ? (
              <Sparkles
                className="h-3.5 w-3.5 text-violet-500"
                aria-hidden
              />
            ) : null}
            {c.label}
            {c.ai ? (
              <span className="sr-only">AI suggested refinement</span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}
