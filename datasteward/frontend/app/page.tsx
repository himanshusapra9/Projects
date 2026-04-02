"use client";

export default function PipelineHealthPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">DataSteward — Pipeline Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Tables Monitored</h2>
          <p className="text-4xl font-bold text-blue-400">42</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Open Incidents</h2>
          <p className="text-4xl font-bold text-red-400">3</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Avg Quality Score</h2>
          <p className="text-4xl font-bold text-green-400">94.2</p>
        </div>
      </div>
    </main>
  );
}
