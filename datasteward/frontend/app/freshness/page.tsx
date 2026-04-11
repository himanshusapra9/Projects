"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface TableSummary {
  id: string;
  name: string;
  last_profiled: string;
}

export default function FreshnessPage() {
  const [tables, setTables] = useState<TableSummary[]>([]);

  useEffect(() => {
    fetch(`${API}/api/v1/tables`)
      .then((r) => r.json())
      .then((d) => setTables(d.tables || []))
      .catch(() => {});
  }, []);

  const getAge = (ts: string): string => {
    if (!ts) return "—";
    const diff = Date.now() - new Date(ts).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const isFresh = (ts: string): boolean => {
    if (!ts) return false;
    return Date.now() - new Date(ts).getTime() < 3600000;
  };

  return (
    <AppNav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Freshness SLA Tracking</h1>
      <p className="text-sm text-gray-500 mb-6">
        Monitor data freshness across all registered tables. Tables that exceed their SLA window are flagged.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Table</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Last Updated</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Age</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tables.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  {t.last_profiled ? new Date(t.last_profiled).toLocaleString() : "Never"}
                </td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">{getAge(t.last_profiled)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isFresh(t.last_profiled)
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {isFresh(t.last_profiled) ? "Fresh" : "Stale"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tables.length === 0 && (
        <p className="text-gray-400 text-center py-12">No tables registered yet</p>
      )}
    </AppNav>
  );
}
