"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-800">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0 text-amber-600" />
        <span>
          <strong>Demo mode</strong> — API is not reachable. Showing sample data.
          Start the backend with <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">docker compose up -d</code> or set <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_API_URL</code>.
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 rounded p-1 hover:bg-amber-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
