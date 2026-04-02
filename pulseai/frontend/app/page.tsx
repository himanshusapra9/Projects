"use client";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">PulseAI Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Insight Cards</h2>
          <p className="text-gray-400">Customer signal clusters</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Daily Briefing</h2>
          <p className="text-gray-400">AI-generated product briefing</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Roadmap Priority</h2>
          <p className="text-gray-400">Data-driven feature priority</p>
        </div>
      </div>
    </main>
  );
}
