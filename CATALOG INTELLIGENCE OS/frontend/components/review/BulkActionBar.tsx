"use client";

import { Button } from "@/components/ui/button";

export default function BulkActionBar({
  count,
  onAccept,
  onClear,
  accepting,
}: {
  count: number;
  onAccept: () => void;
  onClear: () => void;
  accepting?: boolean;
}) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:left-64">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">
          <span className="font-semibold text-slate-900">{count}</span> selected
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClear} disabled={accepting}>
            Clear
          </Button>
          <Button type="button" size="sm" onClick={onAccept} disabled={accepting}>
            {accepting ? "Accepting…" : "Bulk accept"}
          </Button>
        </div>
      </div>
    </div>
  );
}
