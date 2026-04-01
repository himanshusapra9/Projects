"use client";

import { useState } from "react";
import { Upload, Brain, ClipboardCheck, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    num: "01",
    icon: Upload,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-400/10",
    borderColor: "border-sky-400/30",
    title: "Ingest — any format, any supplier",
    what: "Upload a CSV, call the REST API, or connect a supplier feed. CIOS accepts raw, messy data exactly as received — no pre-cleaning required.",
    detail: "Column aliases are auto-mapped (e.g. \"product_title\" → title). Missing fields are flagged, not rejected. Every raw record is preserved for audit.",
    stat: "4-week onboarding → same day",
  },
  {
    num: "02",
    icon: Brain,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-400/10",
    borderColor: "border-violet-400/30",
    title: "Enrich — classify, extract, resolve",
    what: "Three-stage AI pipeline runs on every SKU: (1) regex + unit conversion, (2) dictionary normalization with 65+ aliases, (3) LLM extraction for gaps.",
    detail: "Every value carries a confidence score and cites the exact evidence — which words matched, which pattern fired, which model inferred it.",
    stat: "94% attribute accuracy vs. manual",
  },
  {
    num: "03",
    icon: BarChart3,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
    title: "Score — four-dimensional quality",
    what: "Each product receives a 0–100 quality score across Completeness (40%), Conformity (30%), Consistency (20%), and Freshness (10%).",
    detail: "High-confidence extractions are auto-approved. Low-confidence items go to the Review Queue with SLA deadlines. Reviewers see the AI's exact evidence before deciding.",
    stat: "3–12% reduction in returns",
  },
  {
    num: "04",
    icon: ClipboardCheck,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    title: "Review — human-in-the-loop",
    what: "Merchandisers accept, reject, or correct AI suggestions from a purpose-built queue. Every decision is logged with before/after values and reviewer identity.",
    detail: "Bulk accept up to 500 tasks in one click. Filter by task type, priority, confidence band, or category. SLA deadlines ensure nothing sits too long.",
    stat: "15–25% taxonomy error rate → <2%",
  },
  {
    num: "05",
    icon: Zap,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-400/10",
    borderColor: "border-rose-400/30",
    title: "Activate — export to any channel",
    what: "Generate clean, structured feeds in Google Shopping, Meta Catalog, Amazon SP, JSON, or CSV format with one click per product.",
    detail: "Only published (quality-approved) products appear in feeds. Downstream channel errors caused by bad data are eliminated at the source.",
    stat: "5–10% duplicate SKU rate → ~0%",
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="how-it-works" className="border-t border-gray-100 bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">How It Works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Five steps from messy data<br className="hidden sm:block" /> to channel-ready products
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Every step is automated, audited, and reversible. You keep full control.
          </p>
        </div>

        {/* Step selector pills */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-all",
                active === i
                  ? "border-brand-500 bg-brand-600 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              )}
            >
              {s.num} {s.title.split("—")[0].trim()}
            </button>
          ))}
        </div>

        {/* Active step detail */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className={cn("rounded-2xl border-2 bg-white p-8 shadow-sm transition-all", step.borderColor)}>
            <div className="flex items-start gap-5">
              <div className={cn("rounded-xl p-3", step.iconBg)}>
                <step.icon className={cn("h-7 w-7", step.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-bold uppercase tracking-widest", step.iconColor)}>
                  Step {step.num}
                </p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-base text-gray-700">{step.what}</p>
                <p className="mt-2 text-sm text-gray-500">{step.detail}</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">{step.stat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/ingest"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
          >
            Start with your own data — free
          </a>
          <p className="mt-3 text-sm text-gray-400">No account required. Use CSV, API, or sample data.</p>
        </div>
      </div>
    </section>
  );
}
