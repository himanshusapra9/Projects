"use client";

import { useState } from "react";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState("standard");

  return (
    <main className="min-h-screen p-8 bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">New Research</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your research query..."
          className="w-full h-32 p-4 bg-slate-800 border border-slate-600 rounded-lg text-white resize-none"
        />
        <div className="flex items-center gap-4">
          <label className="text-slate-300">Depth:</label>
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
          >
            <option value="quick">Quick (2 min)</option>
            <option value="standard">Standard (8 min)</option>
            <option value="deep">Deep (25 min)</option>
          </select>
          <button className="ml-auto px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Start Research
          </button>
        </div>
      </div>
    </main>
  );
}
