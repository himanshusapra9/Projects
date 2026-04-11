"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  color?: "red" | "green" | "indigo";
}

const trendArrows: Record<string, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

const trendColors: Record<string, string> = {
  red: "text-red-600",
  green: "text-green-600",
  indigo: "text-indigo-600",
};

export default function StatCard({ title, value, subtitle, trend, color = "indigo" }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[color]}`}>
            {trendArrows[trend]}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
