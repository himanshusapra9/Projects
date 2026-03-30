"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useId } from "react";

export type EvidencePillProps = {
  icon: LucideIcon;
  children: React.ReactNode;
  detail?: string;
  className?: string;
};

export function EvidencePill({
  icon: Icon,
  children,
  detail,
  className = "",
}: EvidencePillProps) {
  const tipId = useId();

  return (
    <motion.span
      layout
      className={`group relative inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/[0.03] transition hover:border-indigo-200/80 hover:shadow ${className}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
      <span
        className="min-w-0 truncate"
        {...(detail ? { "aria-describedby": tipId } : {})}
      >
        {children}
      </span>
      {detail ? (
        <span id={tipId} role="tooltip" className="sr-only">
          {detail}
        </span>
      ) : null}
      {detail ? (
        <span
          className="pointer-events-none invisible absolute -top-1 left-1/2 z-10 w-64 -translate-x-1/2 -translate-y-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-normal leading-snug text-slate-600 opacity-0 shadow-md transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
          aria-hidden
        >
          {detail}
        </span>
      ) : null}
    </motion.span>
  );
}
