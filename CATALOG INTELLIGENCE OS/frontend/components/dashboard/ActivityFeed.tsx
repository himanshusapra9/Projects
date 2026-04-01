"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { AuditLog } from "@/lib/types";

const DEMO: AuditLog[] = [
  {
    id: "demo-1",
    field_path: "attributes.color",
    before_value: { raw: "blk" },
    after_value: { canonical: "Black" },
    change_source: "normalization",
    confidence: 0.94,
    reviewed_by: "system",
    review_action: null,
    review_note: null,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "demo-2",
    field_path: "taxonomy",
    before_value: null,
    after_value: { path: ["Apparel", "Outerwear", "Jackets"] },
    change_source: "classifier",
    confidence: 0.88,
    reviewed_by: null,
    review_action: null,
    review_note: null,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "demo-3",
    field_path: "review.task",
    before_value: { status: "pending" },
    after_value: { status: "accepted" },
    change_source: "reviewer",
    confidence: null,
    reviewed_by: "alex@cios.com",
    review_action: "accept",
    review_note: "Matches supplier image",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function ActivityFeed({ entries }: { entries?: AuditLog[] }) {
  const list = entries && entries.length > 0 ? entries : DEMO;

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
        <CardDescription>Latest changes across attributes, taxonomy, and review.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {list.map((log) => (
            <li key={log.id} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{log.field_path}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {log.change_source}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700">
                  {log.reviewed_by ? (
                    <>
                      <span className="font-medium">{log.reviewed_by}</span> {log.review_action ?? "updated"}{" "}
                      {log.review_note && <span className="text-slate-500">— {log.review_note}</span>}
                    </>
                  ) : (
                    <>
                      Value updated
                      {log.confidence != null && (
                        <span className="text-slate-500"> · confidence {(log.confidence * 100).toFixed(0)}%</span>
                      )}
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-400">{formatTime(log.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
