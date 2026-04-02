export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8 bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Research Results</h1>
      <p className="text-slate-400">Task ID: {params.id}</p>
      <div className="mt-8 p-6 bg-slate-800 rounded-lg">
        <p className="text-slate-300">Report will appear here when research is complete.</p>
      </div>
    </main>
  );
}
