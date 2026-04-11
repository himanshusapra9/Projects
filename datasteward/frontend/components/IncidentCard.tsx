"use client";

import Link from "next/link";
import SeverityBadge from "./SeverityBadge";

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  created_at: string;
  table_name: string;
}

const borderColors: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-400",
  medium: "border-l-yellow-400",
  low: "border-l-gray-300",
};

export default function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Link href={`/incidents?id=${incident.id}`}>
      <div className={`bg-white border border-gray-200 border-l-4 ${borderColors[incident.severity]} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{incident.title}</p>
            <p className="mt-1 text-xs text-gray-500">{incident.table_name}</p>
          </div>
          <SeverityBadge severity={incident.severity} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {new Date(incident.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${incident.status === "open" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {incident.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
