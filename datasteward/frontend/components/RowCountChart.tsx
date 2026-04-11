"use client";

import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  date: string;
  count: number;
  baseline_mean: number;
  baseline_upper: number;
  baseline_lower: number;
  is_anomaly: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(d: string): string {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function AnomalyDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: DataPoint };
  if (!payload?.is_anomaly) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#EF4444" stroke="#fff" strokeWidth={2} />;
}

export default function RowCountChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="baselineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#E0E7FF" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13 }}
          formatter={(value) => [formatNumber(Number(value)), ""]}
          labelFormatter={(label) => formatDate(String(label))}
        />
        <Area
          dataKey="baseline_upper"
          stroke="none"
          fill="url(#baselineFill)"
          fillOpacity={1}
          isAnimationActive={false}
        />
        <Area
          dataKey="baseline_lower"
          stroke="none"
          fill="#FFFFFF"
          fillOpacity={1}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#4F46E5"
          strokeWidth={2}
          dot={<AnomalyDot />}
          activeDot={{ r: 4, stroke: "#4F46E5", fill: "#fff" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
