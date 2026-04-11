"use client";

import { useEffect, useState, useRef } from "react";

interface Metrics {
  total_signals_today: number;
  avg_sentiment_score: number;
  top_topic: string;
  high_urgency_count: number;
  anomalies_detected: number;
  active_customers: number;
}

interface Signal {
  text?: string;
  sentiment?: { label?: string; score?: number; reasoning?: string };
  topics?: string[];
  urgency_score?: number;
  analysis_mode?: string;
  processed_at?: string;
  source?: string;
}

function MetricCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-2xl p-6 glass-hover">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color || "text-white"}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function SentimentBadge({ label }: { label?: string }) {
  if (!label) return null;
  const colors: Record<string, string> = {
    positive: "bg-green-500/10 text-green-400 border-green-500/20",
    negative: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[label] || colors.neutral}`}>
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    total_signals_today: 0,
    avg_sentiment_score: 0,
    top_topic: "none",
    high_urgency_count: 0,
    anomalies_detected: 0,
    active_customers: 0,
  });
  const [signals, setSignals] = useState<Signal[]>([]);
  const [connected, setConnected] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/v1/stream/metrics");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.type) setMetrics(data);
      } catch {}
    };
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/v1/stream/signals");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "heartbeat") return;
        setSignals((prev) => [data, ...prev].slice(0, 100));
      } catch {}
    };
    return () => es.close();
  }, []);

  const sentimentPct = metrics.total_signals_today > 0
    ? Math.round((metrics.avg_sentiment_score + 1) * 50)
    : 50;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Live Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time signal analysis and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          <span className="text-xs text-gray-500">{connected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <MetricCard label="Signals Today" value={metrics.total_signals_today} color="text-brand-400" />
        <MetricCard
          label="Sentiment"
          value={`${sentimentPct}%`}
          sub={sentimentPct > 55 ? "Positive" : sentimentPct < 45 ? "Negative" : "Neutral"}
          color={sentimentPct > 55 ? "text-green-400" : sentimentPct < 45 ? "text-red-400" : "text-gray-300"}
        />
        <MetricCard label="Top Topic" value={metrics.top_topic} color="text-blue-400" />
        <MetricCard
          label="High Urgency"
          value={metrics.high_urgency_count}
          color={metrics.high_urgency_count > 0 ? "text-red-400" : "text-gray-400"}
        />
        <MetricCard label="Anomalies" value={metrics.anomalies_detected} color="text-yellow-400" />
        <MetricCard label="Customers" value={metrics.active_customers} color="text-indigo-400" />
      </div>

      {/* Sentiment Gauge */}
      <div className="glass rounded-2xl p-6 mb-10">
        <div className="text-sm font-semibold mb-3">Sentiment Distribution</div>
        <div className="h-4 rounded-full bg-gray-800 overflow-hidden flex">
          <div
            className="bg-green-500 transition-all duration-700"
            style={{ width: `${sentimentPct}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-700"
            style={{ width: `${100 - sentimentPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Positive {sentimentPct}%</span>
          <span>Negative {100 - sentimentPct}%</span>
        </div>
      </div>

      {/* Live Feed */}
      <div id="live-feed">
        <h2 className="text-xl font-bold mb-4">Live Signal Feed</h2>
        <div ref={feedRef} className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {signals.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-gray-500">No signals yet. Send a webhook or use the API to analyze text.</p>
              <p className="text-gray-600 text-sm mt-2">
                POST /api/v1/analyze with {"{"}&quot;text&quot;: &quot;your feedback&quot;{"}"}
              </p>
            </div>
          )}
          {signals.map((sig, i) => (
            <div key={i} className="glass glass-hover rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{sig.text || "—"}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <SentimentBadge label={sig.sentiment?.label} />
                    {sig.topics?.slice(0, 3).map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {t}
                      </span>
                    ))}
                    {sig.analysis_mode === "groq_enhanced" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        AI
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${(sig.urgency_score || 0) >= 7 ? "text-red-400" : (sig.urgency_score || 0) >= 4 ? "text-yellow-400" : "text-green-400"}`}>
                    {sig.urgency_score?.toFixed(1) ?? "—"}
                  </div>
                  <div className="text-[10px] text-gray-600">urgency</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
