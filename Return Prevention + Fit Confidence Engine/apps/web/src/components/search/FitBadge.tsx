"use client";

import { motion } from "framer-motion";
import { useId } from "react";

export type FitBadgeVariant = "great" | "good" | "check" | "risk";

const styles: Record<
  FitBadgeVariant,
  { label: string; className: string; detail: string }
> = {
  great: {
    label: "Great fit",
    className:
      "bg-emerald-50 text-emerald-900 ring-emerald-100/90 border-emerald-200/60",
    detail: "Strong alignment with your profile and recent reviews.",
  },
  good: {
    label: "Good fit",
    className:
      "bg-indigo-50 text-indigo-950 ring-indigo-100/90 border-indigo-200/60",
    detail: "Solid match—minor preference tradeoffs possible.",
  },
  check: {
    label: "Check size",
    className:
      "bg-amber-50 text-amber-950 ring-amber-100/90 border-amber-200/60",
    detail: "Worth confirming measurements or reading fit notes.",
  },
  risk: {
    label: "Higher return risk",
    className:
      "bg-rose-50 text-rose-950 ring-rose-100/80 border-rose-200/50",
    detail: "Elevated mismatch signals—consider alternatives or a quick quiz.",
  },
};

export type FitBadgeProps = {
  variant: FitBadgeVariant;
  className?: string;
};

export function FitBadge({ variant, className = "" }: FitBadgeProps) {
  const s = styles[variant];
  const tipId = useId();

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`group relative inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide shadow-sm ring-1 ${s.className} ${className}`}
    >
      <span aria-describedby={tipId} tabIndex={0} className="truncate">
        {s.label}
      </span>
      <span id={tipId} role="tooltip" className="sr-only">
        {s.detail}
      </span>
      <span
        className="pointer-events-none invisible absolute -top-1 left-1/2 z-20 w-56 -translate-x-1/2 -translate-y-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-normal normal-case leading-snug tracking-normal text-slate-600 opacity-0 shadow-md transition group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
        aria-hidden
      >
        {s.detail}
      </span>
    </motion.span>
  );
}
