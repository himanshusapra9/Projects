"use client";

import QualityRing from "@/components/shared/QualityRing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function QualityScoreCard({
  score,
  trend,
  trendLabel,
}: {
  score: number;
  trend?: number;
  trendLabel?: string;
}) {
  const up = trend !== undefined && trend >= 0;

  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Overall quality</CardTitle>
        <CardDescription>Weighted across completeness, conformity, consistency, and freshness.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <QualityRing score={score} size={96} strokeWidth={7} />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-3xl font-bold tracking-tight text-slate-900">{Math.round(score * 100)}</p>
          {trend !== undefined && (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                up ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
              }`}
            >
              {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(trend * 100).toFixed(1)} pts vs last week
            </div>
          )}
          {trendLabel && <p className="text-sm text-slate-500">{trendLabel}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
