"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppNav from "@/components/AppNav";
import IncidentCard from "@/components/IncidentCard";
import SeverityBadge from "@/components/SeverityBadge";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  created_at: string;
  table_name: string;
  description: string;
  root_cause?: string;
}

type Filter = "all" | "open" | "resolved";

function IncidentsPageInner() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [rcaText, setRcaText] = useState("");
  const [rcaLoading, setRcaLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const fetchIncidents = async () => {
    try {
      let url = `${API}/api/v1/incidents?status=${filter}`;
      if (severityFilter) url += `&severity=${severityFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filter, severityFilter]);

  useEffect(() => {
    if (selectedId && incidents.length > 0) {
      const found = incidents.find((i) => i.id === selectedId);
      if (found) {
        handleViewRCA(found);
      }
    }
  }, [selectedId, incidents]);

  const handleViewRCA = async (incident: Incident) => {
    setSelectedIncident(incident);
    setPanelOpen(true);
    setRcaText("");
    setRcaLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/rca/stream?incident_id=${incident.id}`);
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
                setRcaText((prev) => prev + parsed.chunk);
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch { /* ignore */ }
    setRcaLoading(false);
  };

  const handlePatch = async (status: string) => {
    if (!selectedIncident) return;
    try {
      await fetch(`${API}/api/v1/incidents/${selectedIncident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchIncidents();
      setPanelOpen(false);
    } catch { /* ignore */ }
  };

  return (
    <AppNav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {(["all", "open", "resolved"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize ${
              filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((inc) => (
          <div key={inc.id} onClick={() => handleViewRCA(inc)} className="cursor-pointer">
            <IncidentCard incident={inc} />
          </div>
        ))}
      </div>

      {incidents.length === 0 && (
        <p className="text-gray-400 text-center py-12">No incidents found</p>
      )}

      {/* RCA Slide-in Panel */}
      {panelOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedIncident.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <SeverityBadge severity={selectedIncident.severity} />
                    <span className="text-xs text-gray-400">
                      {new Date(selectedIncident.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setPanelOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                  ×
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">{selectedIncident.description}</p>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {rcaLoading ? "Analyzing root cause…" : "Root Cause Analysis"}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap min-h-[100px] border border-gray-100">
                  {rcaText || (rcaLoading ? "Streaming analysis…" : "Click an incident to view root cause.")}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handlePatch("resolved")}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-500"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handlePatch("open")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Escalate
                </button>
                <button
                  onClick={() => handlePatch("snoozed")}
                  className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  Snooze 24h
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppNav>
  );
}

export default function IncidentsPage() {
  return (
    <Suspense fallback={<AppNav><div className="flex items-center justify-center py-24 text-gray-400">Loading…</div></AppNav>}>
      <IncidentsPageInner />
    </Suspense>
  );
}
