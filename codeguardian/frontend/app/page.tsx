"use client";

export default function SecurityDashboard() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">CodeGuardian Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Security Score</h2>
          <p className="text-4xl font-bold text-green-400">92/100</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Open Findings</h2>
          <p className="text-4xl font-bold text-yellow-400">7</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Last Scan</h2>
          <p className="text-sm text-gray-400">2 minutes ago</p>
        </div>
      </div>
    </main>
  );
}
