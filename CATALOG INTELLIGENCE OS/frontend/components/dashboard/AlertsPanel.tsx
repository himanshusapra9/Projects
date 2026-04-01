"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Timer } from "lucide-react";

export default function AlertsPanel({
  slaAtRisk,
  topIssues,
}: {
  slaAtRisk: number;
  topIssues: Array<{ issue_type: string; affected_products: number; description: string }>;
}) {
  return (
    <Card className="border-amber-200/80 bg-amber-50/30 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Alerts & SLA
        </CardTitle>
        <CardDescription>Items requiring attention before they breach SLA.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-white/80 px-4 py-3">
          <Timer className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">{slaAtRisk} tasks at SLA risk</p>
            <p className="text-xs text-slate-500">Prioritize these in the review queue.</p>
          </div>
        </div>
        {topIssues.length > 0 && (
          <ul className="space-y-2">
            {topIssues.slice(0, 5).map((issue, i) => (
              <li key={i} className="rounded-md border border-slate-100 bg-white px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{issue.issue_type}</span>
                <span className="text-slate-500"> · {issue.affected_products.toLocaleString()} products</span>
                <p className="mt-0.5 text-xs text-slate-500">{issue.description}</p>
              </li>
            ))}
          </ul>
        )}
        {topIssues.length === 0 && slaAtRisk === 0 && (
          <p className="text-sm text-slate-500">No active alerts. Catalog health looks stable.</p>
        )}
      </CardContent>
    </Card>
  );
}
