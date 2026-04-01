"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCatalogHealth, useReviewQueueStats } from "@/hooks/useAnalytics";
import QualityScoreCard from "@/components/dashboard/QualityScoreCard";
import ReviewQueueSummary from "@/components/dashboard/ReviewQueueSummary";
import CategoryHealthTable from "@/components/dashboard/CategoryHealthTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const health = useCatalogHealth();
  const queue = useReviewQueueStats();

  const loading = health.isLoading || queue.isLoading;
  const err = health.isError || queue.isError;

  const h = health.data;
  const q = queue.data;

  const dist = h?.quality_distribution;
  const chartData = dist
    ? [
        { name: "Excellent", count: dist.excellent },
        { name: "Good", count: dist.good },
        { name: "Fair", count: dist.fair },
        { name: "Poor", count: dist.poor },
      ]
    : [
        { name: "Excellent", count: 0 },
        { name: "Good", count: 0 },
        { name: "Fair", count: 0 },
        { name: "Poor", count: 0 },
      ];

  const totalProducts = h?.total_products ?? 0;
  const pendingReviews = q?.total_pending ?? 0;
  const avgQuality = h?.overall_quality ?? 0;
  const slaAtRisk = q?.sla_at_risk ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Catalog health, review pressure, and quality distribution at a glance.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics…
        </div>
      )}

      {err && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base">Could not load live analytics</CardTitle>
            <CardDescription>Start the API or configure NEXT_PUBLIC_API_URL. Showing empty charts until data is available.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QualityScoreCard score={avgQuality || 0} trend={0.02} trendLabel="Trailing 7-day catalog average." />
        </div>
        <ReviewQueueSummary stats={q} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total products</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{totalProducts.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending reviews</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{pendingReviews.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg quality</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{Math.round((avgQuality || 0) * 100)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SLA at risk</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-amber-700">{slaAtRisk.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CategoryHealthTable rows={h?.by_category ?? []} />
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quality distribution</CardTitle>
              <CardDescription>Product counts by quality tier.</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number) => [v, "Products"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <AlertsPanel slaAtRisk={slaAtRisk} topIssues={h?.top_issues ?? []} />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
