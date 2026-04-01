"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn, formatPercent } from "@/lib/utils";

const score = 0.94;

export default function BeforeAfter() {
  const [mode, setMode] = useState<"before" | "after">("after");

  return (
    <section
      id="before-after"
      className="border-t border-gray-200 bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            See The <span className="text-brand-600">Difference</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Same SKU—before enrichment is a conversion leak. After CIOS, it’s
            structured, scored, and ready for every channel.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-md justify-center rounded-full border border-gray-200 bg-gray-50 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setMode("before")}
            className={cn(
              "relative flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition",
              mode === "before"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            Before
          </button>
          <button
            type="button"
            onClick={() => setMode("after")}
            className={cn(
              "relative flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition",
              mode === "after"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            After
          </button>
        </div>

        <div className="mx-auto mt-10 max-w-lg">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 transition-colors duration-500",
              mode === "before"
                ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50/80 shadow-red-100/50"
                : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50/80 shadow-emerald-100/50"
            )}
          >
            <div className="border-b border-black/5 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product card
                  </p>
                  <p className="font-mono text-sm text-gray-800">
                    SKU · HD-USB-C-HUB-7N1
                  </p>
                </div>
                {mode === "before" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Low quality
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Enriched
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 px-6 py-6">
              <FieldRow
                label="Title"
                mode={mode}
                beforeValue='usb hub "maybe 7 in 1??"'
                afterValue="7-in-1 USB-C Hub — HDMI 4K, 100W PD, SD/TF"
                beforeBad
              />
              <FieldRow
                label="Category"
                mode={mode}
                beforeValue="Electronics > ???"
                afterValue="Computers → Peripherals → USB Hubs"
                beforeBad
              />
              <FieldRow
                label="Key attributes"
                mode={mode}
                beforeValue="—"
                afterValue="Ports: 7 · PD: 100W · HDMI: 4K60 · Material: Aluminum"
                beforeBad
              />

              {mode === "after" && (
                <div className="flex items-center justify-center pt-4">
                  <div className="relative h-36 w-36">
                    <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-emerald-100"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="url(#qualityGrad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${score * 264} 264`}
                        className="transition-all duration-700"
                      />
                      <defs>
                        <linearGradient
                          id="qualityGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold tabular-nums text-gray-900">
                        {formatPercent(score)}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        Quality score
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {mode === "before" && (
                <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-800">
                  Missing structured attributes hurt search ranking and ad
                  relevance for this SKU cluster.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldRow({
  label,
  mode,
  beforeValue,
  afterValue,
  beforeBad,
}: {
  label: string;
  mode: "before" | "after";
  beforeValue: string;
  afterValue: string;
  beforeBad?: boolean;
}) {
  const isBefore = mode === "before";
  const value = isBefore ? beforeValue : afterValue;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        {isBefore && beforeBad && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
            Issue
          </span>
        )}
        {!isBefore && (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800">
            92–98%
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-1.5 rounded-lg border px-3 py-2.5 text-sm",
          isBefore
            ? "border-red-200/80 bg-white/80 text-gray-800 line-through decoration-red-300/80"
            : "border-emerald-200/80 bg-white/90 text-gray-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}
