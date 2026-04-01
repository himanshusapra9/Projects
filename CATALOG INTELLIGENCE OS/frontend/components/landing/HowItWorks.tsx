import {
  ArrowRight,
  Database,
  Rocket,
  SearchCheck,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    title: "Ingest",
    description:
      "Connect feeds, PIM exports, or APIs. CIOS normalizes messy supplier payloads into a reviewable baseline.",
    icon: Database,
  },
  {
    title: "Enrich",
    description:
      "AI proposes taxonomy, attributes, and copy with evidence—scoped to your rules and brand voice.",
    icon: Sparkles,
  },
  {
    title: "Review",
    description:
      "Merchandisers approve diffs in a focused queue. Exceptions route to experts; bulk fixes stay safe.",
    icon: SearchCheck,
  },
  {
    title: "Activate",
    description:
      "Publish to search indexes, channels, and partners with quality gates, versioning, and rollback.",
    icon: Rocket,
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-t border-white/5 bg-[#0a0a0f] py-20 text-white sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            From Messy Feed to{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-brand-400 bg-clip-text text-transparent">
              Activated Intelligence
            </span>{" "}
            in 4 Steps
          </h2>
          <p className="mt-4 text-lg text-white/60">
            A single pipeline from raw catalog to confident activation—without
            replacing your PIM overnight.
          </p>
        </div>

        <div className="mt-20 hidden lg:block">
          <div className="relative">
            <div className="absolute left-0 right-0 top-10 h-0.5 bg-gradient-to-r from-brand-600/0 via-brand-500/50 to-brand-600/0" />
            <div className="grid grid-cols-4 gap-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-brand-900/30 ring-1 ring-white/10">
                      <Icon className="h-9 w-9 text-brand-300" aria-hidden />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="pointer-events-none absolute left-[calc(50%+2.5rem)] top-10 hidden w-[calc(100%-5rem)] items-center xl:flex">
                        <ArrowRight className="h-4 w-4 text-white/25" />
                      </div>
                    )}
                    <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-brand-400/90">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-14 space-y-0 lg:hidden">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex gap-5 pb-12 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Icon className="h-7 w-7 text-brand-300" aria-hidden />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-gradient-to-b from-white/25 to-transparent" />
                  )}
                </div>
                <div className="pb-2 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-400/90">
                    Step {i + 1} · {step.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
