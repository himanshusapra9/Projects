"use client";

import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAttributeCoverage, useCatalogHealth, useReviewQueueStats } from "@/hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function coverageRows(data: unknown): { key: string; pct: number }[] {
  if (!data) return [];
  if (typeof data === "object" && data !== null && "by_attribute" in data) {
    const m = (data as { by_attribute: Record<string, number> }).by_attribute;
    return Object.entries(m).map(([k, v]) => ({ key: k, pct: v <= 1 ? v * 100 : v }));
  }
  const arr = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null && "items" in data && Array.isArray((data as { items: unknown[] }).items)
      ? (data as { items: unknown[] }).items
      : [];
  return (arr as { attribute_key?: string; coverage_pct?: number; key?: string; pct?: number }[]).map((r, i) => {
    const key = r.attribute_key ?? r.key ?? `attr-${i}`;
    let v = Number(r.coverage_pct ?? r.pct ?? 0);
    if (!Number.isNaN(v) && v >= 0 && v <= 1) v *= 100;
    return { key, pct: v };
  });
}

export default function AnalyticsPage() {
  const health = useCatalogHealth();
  const coverage = useAttributeCoverage();
  const queue = useReviewQueueStats();

  const loading = health.isLoading || coverage.isLoading || queue.isLoading;
  const dist = health.data?.quality_distribution;
  const qualityBars = dist
    ? [
        { name: "Excellent", v: dist.excellent },
        { name: "Good", v: dist.good },
        { name: "Fair", v: dist.fair },
        { name: "Poor", v: dist.poor },
      ]
    : [];

  const covRows = coverageRows(coverage.data);
  const throughput = queue.data?.throughput_last_7d ?? 0;
  const lineData = [
    { day: "Mon", t: Math.max(0, throughput * 0.9) },
    { day: "Tue", t: Math.max(0, throughput * 1.05) },
    { day: "Wed", t: throughput },
    { day: "Thu", t: Math.max(0, throughput * 0.95) },
    { day: "Fri", t: Math.max(0, throughput * 1.1) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Quality mix, attribute coverage, and review throughput.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics…
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quality distribution</CardTitle>
            <CardDescription>Share of catalog by quality tier.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {qualityBars.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No distribution data. Connect catalog health analytics.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityBars} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="v" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Attribute coverage</CardTitle>
            <CardDescription>Fill rate for key attributes (normalized to 0–100).</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {covRows.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No coverage payload. Backend may return a different shape.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={covRows.slice(0, 12)} layout="vertical" margin={{ top: 8, right: 8, left: 80, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="key" width={72} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${Math.round(v)}%`, "Coverage"]} />
                  <Bar dataKey="pct" fill="#0ea5e9" radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Review throughput (illustrative)</CardTitle>
            <CardDescription>
              API provides aggregate throughput ({throughput.toLocaleString()} in last 7d). Series is scaled for visualization when daily
              breakdown is unavailable.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="t" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
