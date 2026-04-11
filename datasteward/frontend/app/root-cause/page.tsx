"use client";

import { useState } from "react";
import AppNav from "@/components/AppNav";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function RootCausePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch(`${API}/api/v1/rca/stream?description=${encodeURIComponent(input)}`);
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
                setResult((prev) => prev + parsed.chunk);
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <AppNav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Root Cause Analysis</h1>
      <p className="text-sm text-gray-500 mb-6">
        Describe an anomaly or paste an error message for AI-powered root cause analysis.
      </p>

      <div className="max-w-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="e.g. Row count in orders table dropped 70% overnight. The ETL job completed successfully but data appears incomplete…"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          className="mt-3 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Analyzing…" : "Analyze with AI →"}
        </button>
      </div>

      {result && (
        <div className="mt-8 max-w-2xl bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Analysis Result</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </AppNav>
  );
}
