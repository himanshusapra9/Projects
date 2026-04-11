"use client";

import { useState, useCallback } from "react";

interface RFMSegment {
  customer_id: string;
  recency_days: number;
  frequency: number;
  monetary_total: number;
  rfm_score: number;
  segment: string;
}

interface Cohort {
  cohort_month: string;
  size: number;
  retention_rates: Record<string, number>;
  avg_transactions: number;
  avg_revenue: number;
  behavior_distribution: Record<string, number>;
}

interface ForecastDay {
  date: string;
  predicted_count: number;
  confidence_interval: number[];
}

interface AnalysisResult {
  cohorts: Cohort[];
  rfm_segments: RFMSegment[];
  arrival_forecast: { forecast: ForecastDay[]; trend: string; peak_day: string };
  behavioral_insights: Record<string, unknown>[];
  at_risk_customers: RFMSegment[];
  summary: {
    total_analyzed: number;
    champions_pct: number;
    at_risk_pct: number;
    predicted_arrivals_7d: number;
  };
}

const SEGMENT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  champions: { bg: "bg-green-500/10", text: "text-green-400", bar: "bg-green-500" },
  loyal: { bg: "bg-blue-500/10", text: "text-blue-400", bar: "bg-blue-500" },
  at_risk: { bg: "bg-yellow-500/10", text: "text-yellow-400", bar: "bg-yellow-500" },
  lost: { bg: "bg-red-500/10", text: "text-red-400", bar: "bg-red-500" },
  new: { bg: "bg-teal-500/10", text: "text-teal-400", bar: "bg-teal-500" },
};

function parseCSV(text: string) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = vals[i] || ""));
    return row;
  });

  const grouped: Record<string, { email?: string; first_seen: string; transactions: { amount: number; timestamp: string; product: string }[]; feedback: string[] }> = {};

  for (const row of rows) {
    const cid = row.customer_id || row.id || "";
    if (!cid) continue;
    if (!grouped[cid]) {
      grouped[cid] = {
        email: row.email || undefined,
        first_seen: row.first_seen || new Date().toISOString().slice(0, 10),
        transactions: [],
        feedback: [],
      };
    }
    const amount = parseFloat(row.transaction_amount || row.amount || row.total_spend || "0");
    const date = row.transaction_date || row.last_seen || row.first_seen || new Date().toISOString();
    const product = row.product || "";
    if (amount > 0) {
      grouped[cid].transactions.push({ amount, timestamp: date, product });
    }
  }

  return Object.entries(grouped).map(([customer_id, data]) => ({
    customer_id,
    ...data,
  }));
}

export default function CohortsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const text = await file.text();
      const customers = parseCSV(text);
      if (customers.length === 0) {
        setError("No valid customer rows found. Check CSV format.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/v1/customers/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API ${res.status}: ${body.slice(0, 200)}`);
      }

      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const maxForecast = result
    ? Math.max(...result.arrival_forecast.forecast.map((f) => f.confidence_interval[1] || f.predicted_count), 1)
    : 1;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Customer Cohort Intelligence</h1>
      <p className="text-gray-500 mb-10">Upload a CSV to get RFM segmentation, cohort retention, and arrival forecasts.</p>

      {/* Upload Zone */}
      <div
        className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all mb-10 ${dragOver ? "border-brand-500 bg-brand-500/[0.06]" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Analyzing customers...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-brand-400" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-gray-300 font-medium">Drop CSV here or click to upload</p>
            <p className="text-xs text-gray-600 mt-2">
              Expected columns: customer_id, email, first_seen, transaction_amount, transaction_date, product
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="glass border-red-500/30 rounded-xl p-4 mb-8 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Demo Button */}
      {!result && !loading && (
        <div className="text-center mb-10">
          <button
            className="px-6 py-3 rounded-xl glass glass-hover text-gray-300 text-sm font-medium"
            onClick={() => {
              const demoCSV = `customer_id,email,first_seen,transaction_amount,transaction_date,product
CUST001,alice@example.com,2024-01-15,99.00,2024-01-15,Pro Plan
CUST001,alice@example.com,2024-01-15,99.00,2024-02-15,Pro Plan
CUST001,alice@example.com,2024-01-15,99.00,2024-03-15,Pro Plan
CUST002,bob@example.com,2024-02-01,29.00,2024-02-01,Starter
CUST002,bob@example.com,2024-02-01,29.00,2024-03-01,Starter
CUST003,carol@example.com,2024-01-20,149.00,2024-01-20,Enterprise
CUST003,carol@example.com,2024-01-20,149.00,2024-02-20,Enterprise
CUST003,carol@example.com,2024-01-20,149.00,2024-03-20,Enterprise
CUST003,carol@example.com,2024-01-20,149.00,2024-04-20,Enterprise
CUST004,dave@example.com,2024-03-01,29.00,2024-03-01,Starter
CUST005,eve@example.com,2024-01-10,99.00,2024-01-10,Pro Plan
CUST006,frank@example.com,2024-02-15,29.00,2024-02-15,Starter
CUST006,frank@example.com,2024-02-15,29.00,2024-03-15,Starter
CUST007,grace@example.com,2024-03-05,149.00,2024-03-05,Enterprise
CUST007,grace@example.com,2024-03-05,149.00,2024-04-05,Enterprise
CUST008,hank@example.com,2024-01-25,99.00,2024-01-25,Pro Plan
CUST008,hank@example.com,2024-01-25,99.00,2024-02-25,Pro Plan
CUST009,ivy@example.com,2024-02-10,29.00,2024-02-10,Starter
CUST010,jack@example.com,2024-03-15,99.00,2024-03-15,Pro Plan`;
              const blob = new Blob([demoCSV], { type: "text/csv" });
              const file = new File([blob], "demo.csv", { type: "text/csv" });
              handleFile(file);
            }}
          >
            Try with demo data
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customers</div>
              <div className="text-3xl font-bold text-brand-400">{result.summary.total_analyzed}</div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Champions</div>
              <div className="text-3xl font-bold text-green-400">{result.summary.champions_pct}%</div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">At Risk</div>
              <div className="text-3xl font-bold text-red-400">{result.summary.at_risk_pct}%</div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Predicted 7d</div>
              <div className="text-3xl font-bold text-indigo-400">{result.summary.predicted_arrivals_7d}</div>
            </div>
          </div>

          {/* RFM Segments */}
          <section>
            <h2 className="text-xl font-bold mb-4">RFM Segments</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(
                result.rfm_segments.reduce<Record<string, number>>((acc, s) => {
                  acc[s.segment] = (acc[s.segment] || 0) + 1;
                  return acc;
                }, {}),
              ).map(([seg, count]) => {
                const pct = Math.round((count / Math.max(result.rfm_segments.length, 1)) * 100);
                const colors = SEGMENT_COLORS[seg] || SEGMENT_COLORS.new;
                return (
                  <div key={seg} className={`${colors.bg} rounded-xl p-5 border border-white/[0.05]`}>
                    <div className={`text-2xl font-bold ${colors.text}`}>{count}</div>
                    <div className="text-sm font-medium capitalize mt-1">{seg.replace("_", " ")}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{pct}%</div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full rounded-full ${colors.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Cohort Table */}
          <section>
            <h2 className="text-xl font-bold mb-4">Cohort Retention</h2>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Cohort</th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Size</th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Month 1</th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Month 2</th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Month 3</th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Avg Txns</th>
                      <th className="text-right px-5 py-3 text-gray-500 font-medium">Avg Rev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cohorts.map((c) => (
                      <tr key={c.cohort_month} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-3 font-medium">{c.cohort_month}</td>
                        <td className="px-5 py-3 text-center">{c.size}</td>
                        {["1", "2", "3"].map((m) => {
                          const rate = c.retention_rates[m] ?? 0;
                          return (
                            <td key={m} className="px-5 py-3 text-center">
                              <span className={rate > 50 ? "text-green-400" : rate > 20 ? "text-yellow-400" : "text-red-400"}>
                                {rate}%
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-5 py-3 text-center">{c.avg_transactions}</td>
                        <td className="px-5 py-3 text-right">${c.avg_revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Arrival Forecast */}
          <section>
            <h2 className="text-xl font-bold mb-1">7-Day Arrival Forecast</h2>
            <p className="text-sm text-gray-500 mb-4">
              Trend: <span className={result.arrival_forecast.trend === "growing" ? "text-green-400" : result.arrival_forecast.trend === "declining" ? "text-red-400" : "text-gray-400"}>
                {result.arrival_forecast.trend}
              </span> — Peak: {result.arrival_forecast.peak_day}
            </p>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-end gap-2 h-48">
                {result.arrival_forecast.forecast.map((f) => {
                  const pct = (f.predicted_count / maxForecast) * 100;
                  return (
                    <div key={f.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs text-gray-400 font-medium">{f.predicted_count}</div>
                      <div className="w-full relative flex-1 flex items-end">
                        <div
                          className="w-full bg-brand-500/30 rounded-t-lg relative overflow-hidden transition-all duration-500"
                          style={{ height: `${Math.max(pct, 4)}%` }}
                        >
                          <div className="absolute inset-0 bg-brand-500/40 rounded-t-lg" />
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-600">{f.date.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* At-Risk Customers */}
          {result.at_risk_customers.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">At-Risk Customers</h2>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer ID</th>
                        <th className="text-center px-5 py-3 text-gray-500 font-medium">Segment</th>
                        <th className="text-center px-5 py-3 text-gray-500 font-medium">Last Seen</th>
                        <th className="text-center px-5 py-3 text-gray-500 font-medium">RFM Score</th>
                        <th className="text-right px-5 py-3 text-gray-500 font-medium">Total Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.at_risk_customers.map((c) => (
                        <tr key={c.customer_id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <td className="px-5 py-3 font-mono text-sm">{c.customer_id}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.segment === "lost" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                              {c.segment}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center text-gray-400">{c.recency_days}d ago</td>
                          <td className="px-5 py-3 text-center">{c.rfm_score}/5</td>
                          <td className="px-5 py-3 text-right">${c.monetary_total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Reset */}
          <div className="text-center pt-4">
            <button
              onClick={() => { setResult(null); setError(null); }}
              className="px-6 py-3 rounded-xl glass glass-hover text-gray-300 text-sm font-medium"
            >
              Analyze Another Dataset
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
