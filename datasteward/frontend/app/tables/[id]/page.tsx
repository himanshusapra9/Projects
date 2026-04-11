"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppNav from "@/components/AppNav";
import RowCountChart from "@/components/RowCountChart";
import SeverityBadge from "@/components/SeverityBadge";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Tab = "overview" | "columns" | "drift" | "anomalies" | "duplicates" | "incidents";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "columns", label: "Column Stats" },
  { key: "drift", label: "Drift" },
  { key: "anomalies", label: "Anomalies" },
  { key: "duplicates", label: "Duplicates" },
  { key: "incidents", label: "Incidents" },
];

interface TableDetail {
  id: string;
  name: string;
  row_count: number;
  last_profiled: string;
  health: string;
  drift_status: string;
  history: Array<{
    date: string;
    count: number;
    baseline_mean: number;
    baseline_upper: number;
    baseline_lower: number;
    is_anomaly: boolean;
  }>;
  column_stats: Array<{
    column: string;
    type: string;
    null_pct: number;
    unique_count: number;
    min: string;
    max: string;
    mean: string;
  }>;
  drift_results: Array<{
    column: string;
    ks_statistic: number;
    p_value: number;
    status: string;
  }>;
  anomalies: Array<{
    id: string;
    timestamp: string;
    type: string;
    description: string;
    severity: string;
  }>;
  duplicates: Array<{
    cluster_id: string;
    records: Array<Record<string, string>>;
  }>;
}

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
  linked_anomalies: string[];
}

export default function TableDetailPage() {
  const params = useParams();
  const tableId = params.id as string;
  const [table, setTable] = useState<TableDetail | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [rcaLoading, setRcaLoading] = useState<string | null>(null);
  const [rcaText, setRcaText] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, iRes] = await Promise.all([
          fetch(`${API}/api/v1/tables/${tableId}`),
          fetch(`${API}/api/v1/incidents`),
        ]);
        const tData = await tRes.json();
        const iData = await iRes.json();
        setTable(tData);
        setIncidents((iData.incidents || []).filter((i: Incident) =>
          i.title?.toLowerCase().includes(tData.name?.split(".").pop()?.toLowerCase() || "")
        ));
      } catch { /* ignore */ }
    };
    load();
  }, [tableId]);

  const handleGetAI = async (anomalyDesc: string, anomalyId: string) => {
    setRcaLoading(anomalyId);
    setRcaText((prev) => ({ ...prev, [anomalyId]: "" }));
    try {
      const res = await fetch(`${API}/api/v1/rca/stream?description=${encodeURIComponent(anomalyDesc)}`);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.chunk) {
                setRcaText((prev) => ({
                  ...prev,
                  [anomalyId]: (prev[anomalyId] || "") + parsed.chunk,
                }));
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch { /* ignore */ }
    setRcaLoading(null);
  };

  if (!table) {
    return (
      <AppNav>
        <div className="flex items-center justify-center py-24 text-gray-400">Loading…</div>
      </AppNav>
    );
  }

  return (
    <AppNav>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{table.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Last profiled: {table.last_profiled ? new Date(table.last_profiled).toLocaleString() : "Never"} · {table.row_count.toLocaleString()} rows
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Row Count — Last 30 Days</h3>
          <RowCountChart data={table.history} />
        </div>
      )}

      {/* COLUMN STATS TAB */}
      {activeTab === "columns" && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Column</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Null %</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Unique Count</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Min</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Max</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Mean</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(table.column_stats || []).map((c) => (
                <tr key={c.column} className={c.null_pct > 10 ? "bg-red-50" : ""}>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.column}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.type}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${c.null_pct > 10 ? "text-red-600 font-medium" : "text-gray-700"}`}>
                    {c.null_pct}%
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums">{c.unique_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-500 font-mono text-xs">{c.min}</td>
                  <td className="px-4 py-3 text-right text-gray-500 font-mono text-xs">{c.max}</td>
                  <td className="px-4 py-3 text-right text-gray-500 font-mono text-xs">{c.mean}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DRIFT TAB */}
      {activeTab === "drift" && (
        <div className="space-y-4">
          {(table.drift_results || []).map((d) => (
            <div key={d.column} className={`bg-white border rounded-lg p-5 shadow-sm ${d.status === "Drift" ? "border-red-200" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{d.column}</span>
                <span className={`text-sm font-semibold ${d.status === "Drift" ? "text-red-600" : "text-green-600"}`}>
                  {d.status}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-gray-500">
                <span>KS Statistic: <strong className="text-gray-700">{d.ks_statistic}</strong></span>
                <span>p-value: <strong className="text-gray-700">{d.p_value}</strong></span>
              </div>
            </div>
          ))}
          {(!table.drift_results || table.drift_results.length === 0) && (
            <p className="text-gray-400 text-center py-12">No drift results available</p>
          )}
        </div>
      )}

      {/* ANOMALIES TAB */}
      {activeTab === "anomalies" && (
        <div className="space-y-4">
          {(table.anomalies || []).map((a) => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-0.5">{a.type}</span>
                    <SeverityBadge severity={a.severity as "critical" | "high" | "medium" | "low"} />
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{a.description}</p>
                </div>
                <button
                  onClick={() => handleGetAI(a.description, a.id)}
                  disabled={rcaLoading === a.id}
                  className="shrink-0 ml-4 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 disabled:opacity-50"
                >
                  {rcaLoading === a.id ? "Analyzing…" : "Get AI Analysis"}
                </button>
              </div>
              {rcaText[a.id] && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                  {rcaText[a.id]}
                </div>
              )}
            </div>
          ))}
          {(!table.anomalies || table.anomalies.length === 0) && (
            <p className="text-gray-400 text-center py-12">No anomalies detected</p>
          )}
        </div>
      )}

      {/* DUPLICATES TAB */}
      {activeTab === "duplicates" && (
        <div className="space-y-6">
          {(table.duplicates || []).map((cluster) => (
            <div key={cluster.cluster_id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Cluster: {cluster.cluster_id}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {Object.keys(cluster.records[0] || {}).map((k) => (
                        <th key={k} className="text-left px-3 py-2 font-medium text-gray-500">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cluster.records.map((r, i) => (
                      <tr key={i} className="hover:bg-yellow-50">
                        {Object.values(r).map((v, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700 font-mono">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {(!table.duplicates || table.duplicates.length === 0) && (
            <p className="text-gray-400 text-center py-12">No duplicates detected</p>
          )}
        </div>
      )}

      {/* INCIDENTS TAB */}
      {activeTab === "incidents" && (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div key={inc.id} className={`bg-white border border-gray-200 border-l-4 rounded-lg p-4 shadow-sm ${
              inc.severity === "critical" ? "border-l-red-500" : inc.severity === "high" ? "border-l-orange-400" : "border-l-yellow-400"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{inc.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(inc.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={inc.severity as "critical" | "high" | "medium" | "low"} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inc.status === "open" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    {inc.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <p className="text-gray-400 text-center py-12">No incidents for this table</p>
          )}
        </div>
      )}
    </AppNav>
  );
}
