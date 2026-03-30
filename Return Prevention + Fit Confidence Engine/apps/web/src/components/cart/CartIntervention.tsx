"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shirt, X } from "lucide-react";
import { useState } from "react";

export type CartInterventionProps = {
  message?: string;
  suggestion?: string;
  onDismiss?: () => void;
  onAccept?: () => void;
  className?: string;
};

export function CartIntervention({
  message = "Heads up: based on your preferences, you may want to size up for a more relaxed drape.",
  suggestion = "Try Large instead of Medium — similar returns dropped 18% for your profile.",
  onDismiss,
  onAccept,
  className = "",
}: CartInterventionProps) {
  const [gone, setGone] = useState(false);

  if (gone) return null;

  return (
    <motion.div
      role="status"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className={`relative overflow-hidden rounded-lg border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white shadow-sm ring-1 ring-black/[0.03] ${className}`}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-300" aria-hidden />
      <div className="flex flex-col gap-3 p-4 pl-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-slate-200/80">
            <Shirt className="h-4 w-4 text-accent" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium leading-snug text-navy-950">
              {message}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {suggestion}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          <button
            type="button"
            onClick={() => {
              onDismiss?.();
              setGone(true);
            }}
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss suggestion"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3 sm:justify-end">
        <button
          type="button"
          onClick={() => {
            onDismiss?.();
            setGone(true);
          }}
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Keep my selection
        </button>
        <button
          type="button"
          onClick={() => {
            onAccept?.();
            setGone(true);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-navy-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Apply suggestion
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}
