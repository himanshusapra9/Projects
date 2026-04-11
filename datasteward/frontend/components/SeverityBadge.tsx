"use client";

interface SeverityBadgeProps {
  severity: "critical" | "high" | "medium" | "low";
}

const styles: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-700",
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[severity] || styles.low}`}>
      {severity}
    </span>
  );
}
