"use client";

import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#0a0a0f] text-white"
      aria-label="Hero"
    >
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-32 top-0 h-[520px] w-[520px] animate-orb-float rounded-full bg-brand-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] animate-pulse-slow rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" aria-hidden />
              AI-Native Commerce Intelligence
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[4.75rem]">
              Your Product Catalog is{" "}
              <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Costing You Revenue.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/70 sm:text-xl">
              30–60% of your products have wrong or missing attributes. That means
              zero-result searches, failed channel feeds, and shoppers who leave.
              CIOS classifies every SKU, extracts every attribute, flags every
              conflict, and tells you exactly why—with evidence.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="/ingest"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                Try It Free — No API Key Needed
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10"
              >
                How It Works
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>

            <dl className="mt-14 grid grid-cols-1 gap-6 border-t border-white/10 pt-10 sm:grid-cols-3">
              {[
                { label: "Accuracy", value: "94% accuracy" },
                { label: "Onboarding", value: "10× faster onboarding" },
                { label: "Returns", value: "3–12% return rate reduction" },
              ].map((item) => (
                <div key={item.label} className="animate-slide-up">
                  <dt className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-white">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero product card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none animate-slide-up">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-500/20 via-transparent to-violet-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f18]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                    Live enrichment preview
                  </p>
                  <p className="mt-1 font-mono text-sm text-brand-300">
                    SKU · WTR-BTL-32OZ-CLR
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                  Enriching…
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <HeroFieldRow
                  label="Title"
                  value="32oz Clear Glass Water Bottle — BPA Free"
                  className="animate-hero-field-1"
                  badge="98%"
                  badgeClass="animate-hero-badge-1"
                />
                <HeroFieldRow
                  label="Category"
                  value="Kitchen & Dining → Drinkware → Bottles"
                  className="animate-hero-field-2"
                  badge="96%"
                  badgeClass="animate-hero-badge-2"
                />
                <HeroFieldRow
                  label="Attributes"
                  value="Material: Glass · Capacity: 32oz · Color: Clear"
                  className="animate-hero-field-3"
                  badge="94%"
                  badgeClass="animate-hero-badge-3"
                />
                <div
                  className={cn(
                    "flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3",
                    "animate-hero-field-4"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white/90">
                      Quality score computed
                    </span>
                  </div>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-300">
                    0.94
                  </span>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[94%] animate-[widthGrow_2.2s_ease-out_0.3s_both] rounded-full bg-gradient-to-r from-brand-500 to-emerald-400" />
              </div>
              <p className="mt-2 text-right text-xs text-white/45">
                Pipeline confidence · 94%
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes widthGrow {
          from {
            width: 0%;
          }
          to {
            width: 94%;
          }
        }
      `}</style>
    </section>
  );
}

function HeroFieldRow({
  label,
  value,
  badge,
  badgeClass,
  className,
}: {
  label: string;
  value: string;
  badge: string;
  badgeClass?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-white/45">{label}</span>
        <span
          className={cn(
            "rounded-md bg-brand-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-300",
            badgeClass
          )}
        >
          {badge}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-snug text-white/90">{value}</p>
    </div>
  );
}
