"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EvidenceDrawer({
  open,
  onClose,
  evidence,
  title,
}: {
  open: boolean;
  onClose: () => void;
  evidence: Record<string, any>;
  title?: string;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="evidence-drawer-title" className="text-lg font-semibold text-slate-900">
            {title ?? "Evidence"}
          </h2>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-emerald-100">
            {JSON.stringify(evidence, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
}
