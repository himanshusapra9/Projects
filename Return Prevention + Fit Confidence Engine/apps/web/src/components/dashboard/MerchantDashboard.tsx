"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  CalendarRange,
  Layers,
  MessageSquareQuote,
  Package,
  Percent,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type DateRange = "7d" | "30d" | "90d";

const RETURN_REASONS = [
  { label: "Size too small", pct: 28, color: "bg-indigo-500" },
  { label: "Size too large", pct: 18, color: "bg-indigo-400" },
  { label: "Style mismatch", pct: 15, color: "bg-violet-500" },
  { label: "Quality expectation", pct: 12, color: "bg-slate-400" },
  { label: "Color mismatch", pct: 10, color: "bg-sky-500" },
  { label: "Other", pct: 17, color: "bg-slate-300" },
] as const;

const CATEGORY_ROWS = [
  {
    category: "Apparel",
    returnRate: "6.8%",
    fitConfidence: "87%",
    interventions: "342",
    engagement: "72%",
  },
  {
    category: "Footwear",
    returnRate: "11.2%",
    fitConfidence: "79%",
    interventions: "189",
    engagement: "64%",
  },
  {
    category: "Furniture",
    returnRate: "14.5%",
    fitConfidence: "72%",
    interventions: "56",
    engagement: "58%",
  },
  {
    category: "Beauty",
    returnRate: "5.1%",
    fitConfidence: "91%",
    interventions: "128",
    engagement: "76%",
  },
] as const;

const FEEDBACK_ITEMS = [
  {
    sentiment: "up" as const,
    product: "Slim-fit jacket",
    snippet: "Size recommendation was perfect for the slim-fit jacket",
  },
  {
    sentiment: "down" as const,
    product: "Classic denim jeans",
    snippet: "Said true to size but runs small",
  },
  {
    sentiment: "up" as const,
    product: "Running sneakers",
    snippet: "Between size guidance saved me from a return",
  },
  {
    sentiment: "up" as const,
    product: "Cotton crew tee",
    snippet: "Fit confidence matched my expectations",
  },
  {
    sentiment: "down" as const,
    product: "Leather ankle boots",
    snippet: "Narrow fit was not clear from the PDP",
  },
] as const;

const INSIGHTS = [
  "Brand X slim-fit jackets: 23% of users needed size up recommendation",
  "Standing-all-day shoes: comfort mismatch drops 31% when use-case question asked",
  "Sensitive skin products: community feedback reduces returns by 18%",
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function MerchantDashboard() {
  const [range, setRange] = useState<DateRange>("30d");

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.header
        variants={item}
        className="flex flex-col gap-4 border-b border-slate-200/90 pb-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-sm font-medium text-slate-500">Merchant Dashboard</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-navy-950 sm:text-4xl">
            Lumen Fashion
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <CalendarRange className="h-4 w-4 text-indigo-500" aria-hidden />
            FitConfidence return prevention analytics
          </p>
        </div>
        <div
          className="inline-flex rounded-xl border border-slate-200/90 bg-white p-1 shadow-sm"
          role="group"
          aria-label="Date range"
        >
          {(
            [
              { key: "7d" as const, label: "Last 7d" },
              { key: "30d" as const, label: "Last 30d" },
              { key: "90d" as const, label: "Last 90d" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                range === key
                  ? "bg-navy-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-navy-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Key metrics */}
      <motion.section variants={item} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Percent}
          title="Return rate"
          value="8.2%"
          sub={
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
              3.1% vs prior period
            </span>
          }
          hint="Lower is better"
        />
        <MetricCard
          icon={Package}
          title="Prevented returns"
          value="1,247"
          sub={<span className="text-slate-600">$62,350 saved in reverse logistics</span>}
          hint="Estimated impact"
        />
        <MetricCard
          icon={ShieldCheck}
          title="Fit confidence avg"
          value="84%"
          sub={
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              Up from 71%
            </span>
          }
          hint="Across PDP modules"
        />
        <MetricCard
          icon={BarChart3}
          title="Module engagement"
          value="67%"
          sub={<span className="text-slate-600">of PDP visits</span>}
          hint="Widget interactions"
        />
      </motion.section>

      {/* Return reasons */}
      <motion.section
        variants={item}
        className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-md"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-navy-950">Return reasons breakdown</h2>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-2xs font-medium uppercase tracking-wide text-indigo-700">
            Share of returns
          </span>
        </div>
        <ul className="space-y-4">
          {RETURN_REASONS.map((row) => (
            <li key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{row.label}</span>
                <span className="tabular-nums text-slate-500">{row.pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className={`h-full rounded-full ${row.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Category table */}
      <motion.section
        variants={item}
        className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" aria-hidden />
            <h2 className="font-serif text-xl text-navy-950">Category performance</h2>
          </div>
          <span className="text-sm text-slate-500">Selected range: {range}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-2xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Return rate</th>
                <th className="px-6 py-3">Fit confidence</th>
                <th className="px-6 py-3">Interventions</th>
                <th className="px-6 py-3">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_ROWS.map((row, i) => (
                <tr
                  key={row.category}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                >
                  <td className="px-6 py-3.5 font-medium text-navy-950">{row.category}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-700">{row.returnRate}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-700">{row.fitConfidence}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-700">{row.interventions}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-700">{row.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Recent feedback */}
      <motion.section
        variants={item}
        className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-md"
      >
        <div className="mb-5 flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-indigo-600" aria-hidden />
          <h2 className="font-serif text-xl text-navy-950">Recent feedback</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {FEEDBACK_ITEMS.map((fb) => (
            <li key={fb.product + fb.snippet} className="flex flex-wrap items-start gap-3 py-4 first:pt-0 last:pb-0">
              <span className="text-lg leading-none" aria-hidden>
                {fb.sentiment === "up" ? "👍" : "👎"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy-950">{fb.product}</p>
                <p className="mt-1 text-sm text-slate-600">&ldquo;{fb.snippet}&rdquo;</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Learning insights */}
      <motion.section
        variants={item}
        className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-indigo-50/40 p-6 shadow-md"
      >
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" aria-hidden />
          <h2 className="font-serif text-xl text-navy-950">Learning insights</h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Patterns the engine has surfaced from your catalog and shopper behavior.
        </p>
        <ul className="space-y-3">
          {INSIGHTS.map((text) => (
            <li
              key={text}
              className="flex gap-3 rounded-lg border border-indigo-100/80 bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-sm"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  sub,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  sub: ReactNode;
  hint: string;
}) {
  return (
    <motion.div
      variants={item}
      className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-md transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 font-serif text-3xl tracking-tight text-navy-950">{value}</p>
          <p className="mt-2 text-sm">{sub}</p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-4 text-2xs uppercase tracking-wide text-slate-400">{hint}</p>
    </motion.div>
  );
}
