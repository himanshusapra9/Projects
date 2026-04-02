export default function DocsPage() {
  return (
    <main className="min-h-screen p-8 bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
      <div className="max-w-3xl space-y-4">
        <section className="p-4 bg-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">POST /api/v1/research</h2>
          <p className="text-slate-400">Start a new research task.</p>
        </section>
        <section className="p-4 bg-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">GET /api/v1/research/{"{id}"}/status</h2>
          <p className="text-slate-400">Check research task status.</p>
        </section>
        <section className="p-4 bg-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">GET /api/v1/research/{"{id}"}/export/{"{format}"}</h2>
          <p className="text-slate-400">Export results as CSV, PDF, JSON, or Markdown.</p>
        </section>
      </div>
    </main>
  );
}
