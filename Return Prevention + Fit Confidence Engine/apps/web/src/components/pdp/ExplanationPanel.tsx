"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";

export type EvidenceKind = "structured" | "reviews" | "preferences" | "community";

export type EvidenceBlock = {
  id: string;
  title: string;
  qualifier: string;
  bullets: string[];
  kind: EvidenceKind;
};

const kindMeta: Record<
  EvidenceKind,
  { icon: typeof BarChart3; accent: string; bg: string; ring: string }
> = {
  structured: {
    icon: BarChart3,
    accent: "text-indigo-700",
    bg: "bg-indigo-50",
    ring: "ring-indigo-100",
  },
  reviews: {
    icon: BookOpen,
    accent: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
  },
  preferences: {
    icon: UserCircle2,
    accent: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
  community: {
    icon: ShieldCheck,
    accent: "text-violet-700",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
  },
};

export type ExplanationPanelProps = {
  blocks: EvidenceBlock[];
  className?: string;
};

export function ExplanationPanel({ blocks, className = "" }: ExplanationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className={className} aria-labelledby="evidence-heading">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden />
        <h3
          id="evidence-heading"
          className="font-serif text-xl font-normal text-navy-950"
        >
          Why this recommendation
        </h3>
      </div>
      <p className="mb-5 max-w-prose text-sm leading-relaxed text-slate-500">
        Every recommendation is grounded in verifiable signals. Expand each
        source to see the evidence.
      </p>

      <div className="space-y-3">
        {blocks.map((block, i) => {
          const meta = kindMeta[block.kind] ?? kindMeta.structured;
          const Icon = meta.icon;
          const isOpen = expandedId === block.id;

          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 24 }}
              className={`overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm ring-1 ring-black/[0.03] transition ${
                isOpen ? "shadow-md" : ""
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpandedId(isOpen ? null : block.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.bg} ring-1 ${meta.ring}`}
                >
                  <Icon className={`h-4 w-4 ${meta.accent}`} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-navy-950">
                    {block.title}
                  </span>
                  <span className="block text-2xs font-medium text-slate-400">
                    {block.qualifier}
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2 border-t border-slate-100 px-4 py-3">
                      {block.bullets.map((b, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${meta.bg} ring-1 ${meta.ring}`}
                            aria-hidden
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
