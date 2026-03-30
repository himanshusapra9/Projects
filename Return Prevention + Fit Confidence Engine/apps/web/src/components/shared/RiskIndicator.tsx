"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";

export type RiskLevel = "low" | "moderate" | "review";

const config: Record<
  RiskLevel,
  { label: string; detail: string; icon: typeof CheckCircle2; className: string }
> = {
  low: {
    label: "Low risk",
    detail:
      "Aligned with similar purchases that typically kept the item. Still verify measurements if between sizes.",
    icon: CheckCircle2,
    className:
      "border-emerald-200/80 bg-emerald-50/90 text-emerald-900 ring-emerald-100",
  },
  moderate: {
    label: "Moderate",
    detail:
      "Some signals suggest double-checking fit—our recommendation below is tuned to reduce swaps.",
    icon: Info,
    className:
      "border-amber-200/80 bg-amber-50/90 text-amber-950 ring-amber-100",
  },
  review: {
    label: "Review carefully",
    detail:
      "Limited data for this style or cut. Consider measurements or a quick clarification step.",
    icon: AlertTriangle,
    className:
      "border-rose-200/70 bg-rose-50/80 text-rose-950 ring-rose-100",
  },
};

export type RiskIndicatorProps = {
  level: RiskLevel;
  className?: string;
};

export function RiskIndicator({ level, className = "" }: RiskIndicatorProps) {
  const c = config[level];
  const Icon = c.icon;
  const tipId = `risk-tip-${level}`;

  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.div
        layout
        className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm ring-1 ring-inset transition-shadow duration-200 hover:shadow-md focus-within:shadow-md ${c.className}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <span
          className="border-b border-dotted border-current/35"
          tabIndex={0}
          aria-describedby={tipId}
        >
          {c.label}
        </span>
        <div
          id={tipId}
          role="tooltip"
          className="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-slate-200/90 bg-white p-3 text-left text-xs font-normal leading-relaxed text-slate-600 opacity-0 shadow-lg ring-1 ring-black/5 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        >
          {c.detail}
        </div>
      </motion.div>
    </div>
  );
}
