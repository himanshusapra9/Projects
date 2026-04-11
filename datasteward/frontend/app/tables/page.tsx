"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import StatCard from "@/components/StatCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface TableSummary {
  id: string;
  name: string;
  row_count: number;
  last_profiled: string;
  health: string;
  drift_status: string;
}

interface HealthData {
  tables_monitored: number;
  open_incidents: number;
  claude_available: boolean;
}

const healthColor: Record<string, string> = {
  healthy: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function RegisterModal({ open, onClose, onRegistered }: { open: boolean; onClose: () => void; onRegistered: () => void }) {
  const [name, setName] = useState("");
  const [connType, setConnType] = useState("demo");
  const [connStr, setConnStr] = useState("");
  const [schedule, setSchedule] = useState("0 * * * *");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API}/api/v1/tables/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          connection_string: connType === "demo" ? "demo://localhost/analytics" : connStr,
          schedule_cron: schedule,
        }),
      });
      onRegistered();
      onClose();
      setName("");
      setConnStr("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Register a Table</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="public.orders"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
            <select
              value={connType}
              onChange={(e) => setConnType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="demo">Mock / Demo</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="csv">CSV Upload</option>
            </select>
          </div>
          {connType === "postgresql" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection String</label>
              <input
                type="text"
                value={connStr}
                onChange={(e) => setConnStr(e.target.value)}
                placeholder="postgresql://user:pass@host:5432/db"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Schedule</label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="*/15 * * * *">Every 15 min</option>
              <option value="0 * * * *">Hourly</option>
              <option value="0 8 * * *">Daily</option>
            </select>
          </div>
          {connType === "demo" && (
            <p className="text-xs text-gray-400">Demo mode loads synthetic sample data — 30 days with injected anomalies.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
            <button type="submit" disabled={loading || !name} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:opacity-50">
              {loading ? "Registering…" : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-indigo-600 mb-4">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="currentColor" opacity="0.15" />
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 8l-4 2.5v4L12 17l4-2.5v-4L12 8z" fill="currentColor" opacity="0.4" />
      </svg>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Nothing to watch yet.</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        Register your first table and DataSteward will start learning what healthy looks like.
      </p>
      <button
        onClick={onRegister}
        className="px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
      >
        + Register Your First Table
      </button>
      <div className="mt-12 flex items-center gap-8 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
          Register table
        </div>
        <span className="text-gray-300">→</span>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
          DataSteward profiles it
        </div>
        <span className="text-gray-300">→</span>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
          Get alerted on anomalies
        </div>
      </div>
    </div>
  );
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tRes, hRes] = await Promise.all([
        fetch(`${API}/api/v1/tables`),
        fetch(`${API}/health`),
      ]);
      const tData = await tRes.json();
      const hData = await hRes.json();
      setTables(tData.tables || []);
      setHealth(hData);
    } catch {
      /* API may be down */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = tables.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const anomaliesToday = tables.filter((t) => t.health === "critical" || t.health === "warning").length;

  return (
    <AppNav>
      <RegisterModal open={modalOpen} onClose={() => setModalOpen(false)} onRegistered={fetchData} />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">Loading…</div>
      ) : tables.length === 0 ? (
        <EmptyState onRegister={() => setModalOpen(true)} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              + Register Table
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Tables Monitored" value={health?.tables_monitored ?? tables.length} />
            <StatCard title="Active Incidents" value={health?.open_incidents ?? 0} color="red" />
            <StatCard title="Avg Freshness" value="< 1h" color="green" subtitle="within SLA" />
            <StatCard title="Anomalies Today" value={anomaliesToday} color={anomaliesToday > 0 ? "red" : "green"} />
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tables…"
              className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Table Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Last Profiled</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Row Count</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Health</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Drift</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.last_profiled
                        ? new Date(t.last_profiled).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                      {formatNumber(t.row_count)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${healthColor[t.health] || healthColor.healthy}`}>
                        {t.health}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${t.drift_status === "Drift" ? "text-red-600" : "text-green-600"}`}>
                        {t.drift_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tables/${t.id}`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppNav>
  );
}
