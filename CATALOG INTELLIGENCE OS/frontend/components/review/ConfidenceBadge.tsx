"use client";

import { cn } from "@/lib/utils";

export default function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tier = value >= 0.85 ? "high" : value >= 0.7 ? "mid" : "low";
  const styles = {
    high: "bg-emerald-100 text-emerald-800 border-emerald-200",
    mid: "bg-amber-100 text-amber-900 border-amber-200",
    low: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums",
        styles[tier]
      )}
    >
      {pct}%
    </span>
  );
}
