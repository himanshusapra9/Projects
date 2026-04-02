"use client";

import { useEffect, useState } from "react";

interface Experiment {
  exp_id: string;
  status: string;
  decision: string;
  val_loss: number | null;
  duration_seconds: number;
}

export default function DashboardPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${apiUrl}/api/v1/experiments`)
      .then((res) => res.json())
      .then(setExperiments)
      .catch(console.error);
  }, [apiUrl]);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">AutoMLab Dashboard</h1>
      <div className="grid gap-4">
        {experiments.map((exp) => (
          <div key={exp.exp_id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm">{exp.exp_id}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                exp.decision === "kept" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"
              }`}>
                {exp.decision}
              </span>
            </div>
            {exp.val_loss != null && (
              <p className="mt-2 text-sm text-gray-400">
                val_loss: <span className="text-white font-mono">{exp.val_loss.toFixed(4)}</span>
              </p>
            )}
          </div>
        ))}
        {experiments.length === 0 && (
          <p className="text-gray-500">No experiments yet. Start a run with `make run`.</p>
        )}
      </div>
    </main>
  );
}
