import { Clock, Package, RefreshCw, Search } from "lucide-react";

const problems = [
  {
    icon: Search,
    stat: "30–60%",
    title: "Search misses revenue",
    description:
      "Incomplete or wrong attributes mean shoppers never see the right products in site search and filters.",
    accent: "from-red-500/20 to-orange-500/10",
    statColor: "text-red-400",
  },
  {
    icon: RefreshCw,
    stat: "15–25%",
    title: "Misclassification drag",
    description:
      "Taxonomy drift and inconsistent categories break merchandising rules and channel syndication.",
    accent: "from-orange-500/20 to-amber-500/10",
    statColor: "text-orange-400",
  },
  {
    icon: Package,
    stat: "5–10%",
    title: "Duplicate & split SKUs",
    description:
      "Same product listed multiple ways fragments inventory signals and confuses personalization.",
    accent: "from-amber-500/20 to-yellow-500/10",
    statColor: "text-amber-400",
  },
  {
    icon: Clock,
    stat: "4 weeks",
    title: "Painful onboarding",
    description:
      "Manual cleanup and spreadsheet gymnastics delay launches while competitors ship faster.",
    accent: "from-rose-500/20 to-red-500/10",
    statColor: "text-rose-400",
  },
] as const;

export default function ProblemStatement() {
  return (
    <section
      id="problem"
      className="relative border-t border-white/5 bg-[#08080c] py-20 text-white sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-950/40 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            The Catalog Data Problem Costs You{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-300 bg-clip-text text-transparent">
              More Than You Think
            </span>
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Spreadsheets and legacy PIMs store data—they don’t reason about it.
            Without intelligence on top, errors compound across every channel.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br ${p.accent} blur-2xl transition group-hover:opacity-100`}
                />
                <div className="relative flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Icon className="h-7 w-7 text-white/90" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-mono text-4xl font-bold tabular-nums ${p.statColor}`}
                    >
                      {p.stat}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-16 max-w-3xl text-center text-base text-white/55">
          <span className="font-semibold text-white/80">PIMs manage records.</span>{" "}
          CIOS adds classification, enrichment, quality scoring, and activation—so
          your catalog becomes a revenue engine, not a maintenance backlog.
        </p>
      </div>
    </section>
  );
}
