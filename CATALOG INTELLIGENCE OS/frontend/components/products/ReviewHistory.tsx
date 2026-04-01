"use client";

import { GitBranch } from "lucide-react";
import type { AuditLog } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ReviewHistory({ logs }: { logs: AuditLog[] }) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Audit timeline</CardTitle>
        <CardDescription>Chronological record of field-level changes and review actions.</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">No audit entries for this product yet.</p>
        ) : (
          <ol className="relative space-y-6 border-l border-slate-200 pl-6">
            {logs.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute -left-[29px] flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-indigo-600 shadow-sm">
                  <GitBranch className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-600">{log.field_path}</span>
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-medium uppercase text-slate-500 ring-1 ring-slate-200">
                      {log.change_source}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {log.review_action && (
                      <span className="font-medium capitalize">{log.review_action}</span>
                    )}
                    {log.reviewed_by && <span className="text-slate-500"> by {log.reviewed_by}</span>}
                    {log.review_note && <span className="mt-1 block text-slate-600">“{log.review_note}”</span>}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">{formatTime(log.created_at)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
