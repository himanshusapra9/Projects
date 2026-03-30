"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  GitCompare,
  MessageSquareQuote,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useId, useState } from "react";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import { EvidencePill } from "@/components/shared/EvidencePill";
import { RiskIndicator, type RiskLevel } from "@/components/shared/RiskIndicator";

export type FitModuleState = "loading" | "confident" | "uncertain" | "low-data";

export type FitConfidenceModuleProps = {
  state?: FitModuleState;
  score?: number;
  recommendedSize?: string;
  sizeConfidence?: number;
  riskLevel?: RiskLevel;
  whyExplanation?: string;
  evidence?: Array<{ icon: typeof MessageSquareQuote; text: string; detail?: string }>;
  onCompareToggle?: (on: boolean) => void;
  className?: string;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] ${className}`}
      aria-hidden
    />
  );
}

export function FitConfidenceModule({
  state = "confident",
  score = 86,
  recommendedSize = "M",
  sizeConfidence = 91,
  riskLevel = "low",
  whyExplanation =
    "Your measurements and this brand’s profile point to Medium. Reviews skew slightly snug in the chest—if you prefer drape, consider Large.",
  evidence = [
    {
      icon: MessageSquareQuote,
      text: "Reviews say runs small",
      detail: "Last 90 days: 62% of verified reviews mention snug torso.",
    },
    {
      icon: Sparkles,
      text: "From your preferences",
      detail: "You chose a relaxed fit on similar knits.",
    },
    {
      icon: UserCircle2,
      text: "From similar shoppers",
      detail: "Buyers with your profile kept M 78% of the time.",
    },
  ],
  onCompareToggle,
  className = "",
}: FitConfidenceModuleProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [compareOn, setCompareOn] = useState(false);
  const whyId = useId();

  const showMeter = state !== "loading";
  const displayScore =
    state === "uncertain" ? Math.min(score, 72) : state === "low-data" ? 58 : score;

  return (
    <motion.article
      layout
      className={`relative overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-md ring-1 ring-black/[0.04] ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 22 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-emerald-50/30" />
      <div className="relative p-6 sm:p-7">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Fit confidence
            </p>
            <h2 className="mt-1 font-serif text-2xl font-normal tracking-tight text-navy-950 sm:text-3xl">
              Sized for you—not the average.
            </h2>
            {state === "low-data" && (
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600">
                We’re still learning this style. Answer two quick questions to sharpen
                this score.
              </p>
            )}
            {state === "uncertain" && (
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600">
                Mixed signals between reviews and inventory. See evidence below—we’ll
                guide the tradeoff.
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            {state === "loading" ? (
              <div className="flex h-[120px] w-[120px] items-center justify-center">
                <SkeletonBlock className="h-28 w-28 rounded-full" />
              </div>
            ) : (
              <motion.div
                key={state}
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <ConfidenceMeter
                  score={displayScore}
                  size={120}
                  label="Match"
                  aria-label={`Fit confidence score ${displayScore}`}
                />
              </motion.div>
            )}
            {showMeter && (
              <RiskIndicator level={riskLevel} className="sm:self-end" />
            )}
          </div>
        </header>

        <div className="mt-8 grid gap-6 border-t border-slate-100 pt-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Recommended size
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-navy-950">
                {state === "loading" ? "—" : recommendedSize}
              </span>
              {!showMeter ? (
                <SkeletonBlock className="h-6 w-24 rounded-full" />
              ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                  {sizeConfidence}% size confidence
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={compareOn}
              onClick={() => {
                setCompareOn((v) => !v);
                onCompareToggle?.(!compareOn);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                compareOn
                  ? "border-indigo-200 bg-indigo-50 text-accent"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <GitCompare className="h-4 w-4" aria-hidden />
              Quick compare
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            aria-expanded={whyOpen}
            aria-controls={whyId}
            onClick={() => setWhyOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-md border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-left text-sm font-medium text-navy-950 transition hover:bg-slate-50"
          >
            <span>Why this size?</span>
            <motion.span animate={{ rotate: whyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {whyOpen && (
              <motion.div
                id={whyId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <p className="border-x border-b border-slate-200/80 bg-white px-4 py-3 text-sm leading-relaxed text-slate-600">
                  {whyExplanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Evidence
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state === "loading"
              ? [1, 2, 3].map((i) => (
                  <SkeletonBlock key={i} className="h-8 w-40 rounded-full" />
                ))
              : evidence.map((e, i) => (
                  <motion.div
                    key={e.text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <EvidencePill icon={e.icon} detail={e.detail}>
                      {e.text}
                    </EvidencePill>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
