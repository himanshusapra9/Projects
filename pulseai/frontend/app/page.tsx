"use client";

import Link from "next/link";

const FEATURES = [
  {
    title: "Groq LLM Analysis",
    desc: "Real-time sentiment, topic classification, and pain point extraction powered by Llama 3.3 70B through Groq's ultra-fast inference.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Streaming",
    desc: "Server-Sent Events and WebSocket connections deliver live signal analysis to your dashboard the instant feedback arrives.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Customer Cohort Intelligence",
    desc: "Upload transaction data for automatic RFM segmentation, cohort retention analysis, and 7-day arrival forecasting.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Churn Prediction",
    desc: "Composite risk scoring blends LLM reasoning with heuristic urgency models to identify at-risk customers before they leave.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "Anomaly Detection",
    desc: "Isolation Forest models flag unusual spikes in feedback volume, sentiment shifts, and urgency — surfacing hidden crises early.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
  {
    title: "Multi-Channel Ingestion",
    desc: "Webhook connectors for Intercom, Zendesk, and custom platforms. Normalize feedback from any source into a unified pipeline.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
];

const TECH_STACK = [
  { name: "FastAPI", role: "Backend" },
  { name: "Groq", role: "LLM Inference" },
  { name: "Llama 3.3 70B", role: "AI Model" },
  { name: "Next.js 14", role: "Frontend" },
  { name: "scikit-learn", role: "ML Models" },
  { name: "Tailwind CSS", role: "Styling" },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/[0.05] blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-300 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Powered by Groq LLM — Llama 3.3 70B
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-slide-up">
            Customer signals,{" "}
            <span className="text-gradient">decoded in real time</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl animate-slide-up" style={{ animationDelay: "100ms" }}>
            PulseAI ingests feedback from every channel, applies LLM-powered analysis and ML models,
            and delivers actionable intelligence — sentiment, topics, churn risk, cohort insights —
            the moment it matters.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30 transition-all"
            >
              Open Dashboard
            </Link>
            <Link
              href="/cohorts"
              className="px-6 py-3 rounded-xl glass glass-hover text-gray-200 font-medium"
            >
              Try Cohort Analysis
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl glass glass-hover text-gray-200 font-medium"
            >
              Explore API ↗
            </a>
          </div>
        </div>
      </section>

      {/* Architecture diagram (simplified visual) */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="glass rounded-2xl p-8 animate-pulse-glow">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-sm">
            {[
              { label: "Ingest", sub: "Webhooks / CSV" },
              { label: "Analyze", sub: "Groq LLM + Heuristics" },
              { label: "Score", sub: "Urgency / Anomaly / RFM" },
              { label: "Stream", sub: "SSE + WebSocket" },
              { label: "Act", sub: "Dashboard / Alerts" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 md:flex-col md:gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-white">{step.label}</div>
                  <div className="text-gray-500 text-xs">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold mb-2">Platform Capabilities</h2>
        <p className="text-gray-400 mb-12 max-w-xl">
          Every layer of the pipeline is designed for speed, accuracy, and graceful degradation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass glass-hover rounded-2xl p-6 group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:border-brand-500/40 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold mb-2">Tech Stack</h2>
        <p className="text-gray-400 mb-10">Built with modern, production-ready technologies.</p>

        <div className="flex flex-wrap gap-3">
          {TECH_STACK.map((t) => (
            <div
              key={t.name}
              className="glass rounded-xl px-5 py-3 flex items-center gap-3"
            >
              <span className="font-semibold text-sm">{t.name}</span>
              <span className="text-xs text-gray-500">{t.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold mb-2">Quick Start</h2>
        <p className="text-gray-400 mb-10">Three commands to a running instance.</p>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-gray-500">terminal</span>
          </div>
          <pre className="p-6 text-sm leading-relaxed overflow-x-auto">
            <code className="text-gray-300">
              <span className="text-gray-500">{"# Clone and setup"}</span>{"\n"}
              <span className="text-brand-400">$</span>{" git clone https://github.com/himanshusapra9/Projects.git && cd Projects/pulseai\n"}
              <span className="text-brand-400">$</span>{" ./setup.sh\n"}
              <span className="text-gray-500">{"# Add your Groq API key to .env (optional — falls back to heuristics)"}</span>{"\n"}
              <span className="text-brand-400">$</span>{" ./run.sh\n\n"}
              <span className="text-green-400">{"✓ Backend  → http://127.0.0.1:8000"}</span>{"\n"}
              <span className="text-green-400">{"✓ Frontend → http://localhost:3000"}</span>{"\n"}
              <span className="text-green-400">{"✓ API Docs → http://127.0.0.1:8000/docs"}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold mb-2">API Endpoints</h2>
        <p className="text-gray-400 mb-10">RESTful API with real-time streaming support.</p>

        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
          {[
            { method: "GET", path: "/health", desc: "Health check + Groq status" },
            { method: "POST", path: "/api/v1/webhooks/{platform}", desc: "Ingest feedback (Intercom, Zendesk, custom)" },
            { method: "POST", path: "/api/v1/analyze", desc: "Analyze a signal in real-time" },
            { method: "GET", path: "/api/v1/insights", desc: "Recent processed signals" },
            { method: "POST", path: "/api/v1/customers/analyze", desc: "Cohort + RFM + forecast analysis" },
            { method: "GET", path: "/api/v1/customers/forecast", desc: "7-day arrival prediction" },
            { method: "GET", path: "/api/v1/stream/signals", desc: "SSE live signal stream" },
            { method: "GET", path: "/api/v1/stream/metrics", desc: "SSE aggregated metrics stream" },
            { method: "WS", path: "/ws/dashboard", desc: "WebSocket live dashboard feed" },
          ].map((ep) => (
            <div key={ep.path} className="flex items-center gap-4 px-6 py-4">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                  ep.method === "GET"
                    ? "bg-green-500/10 text-green-400"
                    : ep.method === "POST"
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-purple-500/10 text-purple-400"
                }`}
              >
                {ep.method}
              </span>
              <code className="text-sm text-gray-300 font-mono">{ep.path}</code>
              <span className="text-sm text-gray-500 ml-auto hidden sm:block">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>PulseAI — Customer Signal Intelligence Platform</span>
          <div className="flex gap-6">
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
              API Docs
            </a>
            <a href="https://github.com/himanshusapra9/Projects/tree/main/pulseai" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
