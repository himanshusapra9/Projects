"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { QualityDimensions } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QualityBreakdown({ dimensions }: { dimensions: QualityDimensions }) {
  const radarData = [
    { dim: "Completeness", value: dimensions.completeness * 100 },
    { dim: "Conformity", value: dimensions.conformity * 100 },
    { dim: "Consistency", value: dimensions.consistency * 100 },
    { dim: "Freshness", value: dimensions.freshness * 100 },
  ];

  const barData = radarData.map((d) => ({ name: d.dim, score: Math.round(d.value) }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Dimension radar</CardTitle>
          <CardDescription>Relative strength across quality pillars (0–100).</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: "#64748b", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Dimension bars</CardTitle>
          <CardDescription>Numeric view for reporting and thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(v: number) => [`${v}`, "Score"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {(dimensions.missing_required?.length || dimensions.issues?.length) ? (
        <Card className="border-amber-200/80 bg-amber-50/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Issues & gaps</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {dimensions.missing_required && dimensions.missing_required.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase text-amber-800">Missing required</p>
                <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                  {dimensions.missing_required.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {dimensions.issues && dimensions.issues.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase text-amber-800">Issues</p>
                <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                  {dimensions.issues.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
