"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useId, useState } from "react";

export type FilterSection = {
  id: string;
  title: string;
  options: { id: string; label: string; count?: number; ai?: boolean }[];
};

export type FilterSidebarProps = {
  sections: FilterSection[];
  applied: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
  onClear: () => void;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function AccordionSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const btnId = useId();

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        id={btnId}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-navy-950 transition hover:text-accent"
      >
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterSidebar({
  sections,
  applied,
  onChange,
  onClear,
  className = "",
  mobileOpen,
  onMobileClose,
}: FilterSidebarProps) {
  const toggle = useCallback(
    (sectionId: string, optionId: string) => {
      const cur = applied[sectionId] ?? [];
      const has = cur.includes(optionId);
      const nextList = has
        ? cur.filter((x) => x !== optionId)
        : [...cur, optionId];
      onChange({ ...applied, [sectionId]: nextList });
    },
    [applied, onChange],
  );

  const summary = Object.entries(applied).flatMap(([k, v]) =>
    v.map((id) => ({ section: k, id })),
  );

  const panel = (
    <aside
      className={`flex h-full flex-col bg-white ${className}`}
      aria-label="Filters"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" aria-hidden />
          <span className="text-sm font-semibold text-navy-950">Filters</span>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {sections.map((sec) => (
          <AccordionSection key={sec.id} title={sec.title}>
            <ul className="space-y-2" role="list">
              {sec.options.map((opt) => {
                const active = (applied[sec.id] ?? []).includes(opt.id);
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => toggle(sec.id, opt.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition ${
                        active
                          ? "bg-indigo-50 font-medium text-accent ring-1 ring-indigo-200/80"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {opt.label}
                        {opt.ai ? (
                          <Sparkles
                            className="h-3.5 w-3.5 text-violet-500"
                            aria-label="AI suggested"
                          />
                        ) : null}
                      </span>
                      {opt.count != null ? (
                        <span className="text-xs text-slate-400">{opt.count}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </AccordionSection>
        ))}
      </div>

      <div className="border-t border-slate-100 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Applied
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {summary.length === 0 ? (
            <span className="text-sm text-slate-400">No filters yet</span>
          ) : (
            summary.map(({ section, id }) => (
              <span
                key={`${section}-${id}`}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {id}
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-slate-200"
                  aria-label={`Remove ${id}`}
                  onClick={() => toggle(section, id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Clear all
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden w-80 shrink-0 lg:block">{panel}</div>
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden"
              aria-label="Close overlay"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm shadow-lg lg:hidden"
            >
              {panel}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
