"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReviewQueueStats } from "@/lib/types";

export default function ReviewQueueSummary({ stats }: { stats: ReviewQueueStats | null | undefined }) {
  const byType = stats?.by_type ?? {};
  const byPriority = stats?.by_priority ?? {};
  const pending = stats?.total_pending ?? 0;

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Review queue</CardTitle>
        <CardDescription>{pending.toLocaleString()} tasks pending across types and priorities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">By type</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(byType).length === 0 ? (
              <span className="text-sm text-slate-400">No breakdown</span>
            ) : (
              Object.entries(byType).map(([k, v]) => (
                <Badge key={k} variant="secondary" className="font-normal">
                  {k.replace(/_/g, " ")} · {v}
                </Badge>
              ))
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">By priority</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(byPriority).length === 0 ? (
              <span className="text-sm text-slate-400">No breakdown</span>
            ) : (
              Object.entries(byPriority).map(([k, v]) => (
                <Badge key={k} variant="outline" className="font-normal capitalize">
                  {k} · {v}
                </Badge>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
