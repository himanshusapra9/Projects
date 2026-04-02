export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <h1 className="text-5xl font-bold text-white mb-4">OmniResearch</h1>
      <p className="text-xl text-slate-300 mb-8 text-center max-w-2xl">
        Universal Open-Source Multi-Source Intelligence Agent. Search academic papers,
        web, GitHub, YouTube, podcasts, Reddit, and more — all in one place.
      </p>
      <a
        href="/research"
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
      >
        Start Research
      </a>
    </main>
  );
}
