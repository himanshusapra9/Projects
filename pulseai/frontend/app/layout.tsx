import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "PulseAI — Customer Intelligence Platform",
  description:
    "Real-time customer signal analysis powered by Groq LLM. Sentiment, topics, churn prediction, cohort intelligence.",
};

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            P
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Pulse<span className="text-brand-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            Dashboard
          </Link>
          <Link
            href="/cohorts"
            className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            Cohorts
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            API Docs ↗
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
