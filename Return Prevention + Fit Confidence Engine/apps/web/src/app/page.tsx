import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  GitCompare,
  Layers,
  MessageCircleQuestion,
  MessageSquare,
  RefreshCw,
  Ruler,
  ScanSearch,
  Shield,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Split,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-2xs font-semibold uppercase tracking-wide text-accent">
      <Sparkles className="h-3 w-3" aria-hidden />
      {children}
    </span>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  highlighted,
}: {
  icon: typeof BarChart3;
  title: string;
  body: string;
  highlighted?: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm ring-1 ring-black/[0.03] transition ${
        highlighted
          ? "border-accent/25 ring-2 ring-accent/15 shadow-md shadow-indigo-100/40"
          : "border-slate-200/80 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-transparent opacity-100" />
      <div className="relative">
        <div
          className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${
            highlighted
              ? "bg-accent text-white ring-accent/30"
              : "bg-indigo-50 ring-indigo-100"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${highlighted ? "text-white" : "text-accent"}`}
            aria-hidden
          />
        </div>
        <h3 className="mb-2 text-base font-semibold text-navy-950">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{body}</p>
      </div>
    </article>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.03] sm:px-6">
      <span className="font-serif text-2xl font-normal tracking-tight text-navy-950 sm:text-3xl lg:text-4xl">
        {value}
      </span>
      <span className="text-center text-2xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

const howItWorksSteps = [
  {
    step: "01",
    icon: ShoppingBag,
    title: "Shopper lands on product page",
    body: "The engine ingests PDP context, variants, charts, and signals in real time.",
  },
  {
    step: "02",
    icon: ScanSearch,
    title: "Engine evaluates fit confidence and return risk",
    body: "Calibrated scoring combines measurements, reviews, behavior, and merchant rules.",
  },
  {
    step: "03",
    icon: Split,
    title: "System decides: recommend, clarify, or refine",
    body: "Strong evidence drives a direct pick; uncertainty triggers targeted questions or filters.",
  },
  {
    step: "04",
    icon: Activity,
    title: "Shopper sees evidence-grounded recommendation",
    body: "Best size, safer alternatives, and clear rationale — optimized for mobile.",
  },
  {
    step: "05",
    icon: RefreshCw,
    title: "System learns and improves from every interaction",
    body: "Purchases, returns, exchanges, and feedback continuously tune models and memory.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-light">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-surface-light/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition opacity-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow-sm">
              <ShieldCheck className="h-4.5 w-4.5 text-white" aria-hidden />
            </div>
            <span className="text-base font-semibold tracking-tight text-navy-950">
              FitConfidence
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-navy-950"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-navy-950"
            >
              How it works
            </a>
            <a
              href="#results"
              className="text-sm font-medium text-slate-600 transition hover:text-navy-950"
            >
              Results
            </a>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Try demo
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <Link
            href="/demo"
            className="inline-flex items-center rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white md:hidden"
          >
            Try demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[880px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100/45 via-violet-50/25 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-20 text-center sm:pt-28 lg:pt-32">
          <Badge>Pre-purchase AI engine</Badge>
          <h1 className="mt-6 font-serif text-4xl font-normal leading-[1.12] tracking-tight text-navy-950 sm:text-5xl lg:text-[3.25rem]">
            Stop returns before they happen.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            AI-powered fit confidence and return prevention for e-commerce. Help
            every shopper find the right product, right size, first time.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200/50 transition hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Try the live demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-6 py-3 text-sm font-semibold text-navy-950 shadow-sm ring-1 ring-black/[0.03] transition hover:border-slate-300 hover:shadow"
            >
              Merchant dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Social proof */}
      <section
        id="results"
        className="border-y border-slate-200/60 bg-white/60 py-14"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-5 lg:grid-cols-4">
          <MetricCard
            value="32%"
            label="Fewer preventable returns"
          />
          <MetricCard value="2.4×" label="Size confidence lift" />
          <MetricCard value="18%" label="Conversion uplift" />
          <MetricCard value="<200ms" label="API p95" />
        </div>
      </section>

      {/* The problem */}
      <section id="problem" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
              Returns cost merchants $816B annually. Most are preventable.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Ruler,
                title: "Wrong size, wrong fit",
                body: "52% of returns are size or fit related — the single largest preventable driver.",
              },
              {
                icon: TrendingUp,
                title: "No confidence to decide",
                body: "Shoppers order two or three sizes and return the extras, eroding margin and trust.",
              },
              {
                icon: Timer,
                title: "Post-purchase tools are too late",
                body: "Most solutions optimize returns management after the fact — not prevention at decision time.",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.03]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-100">
                  <card.icon
                    className="h-5 w-5 text-accent"
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg font-semibold text-navy-950">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-slate-200/60 bg-gradient-to-b from-indigo-50/30 via-slate-50/40 to-white py-20"
      >
        <div className="mx-auto max-w-4xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              Five steps from first impression to continuous improvement.
            </p>
          </div>
          <ol className="mt-14 space-y-10">
            {howItWorksSteps.map((item) => {
              const StepIcon = item.icon;
              return (
                <li key={item.step} className="flex gap-5 sm:gap-6">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
                      <StepIcon className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <span className="font-serif text-2xs font-semibold tabular-nums text-slate-400">
                      {item.step}
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-base font-semibold text-navy-950 sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
              Everything in one engine
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Fit intelligence, risk prediction, and merchant insights — built
              for production storefronts.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Target}
              title="Fit Confidence Scoring"
              body="Category-aware scores with uncertainty decomposition across apparel, footwear, and more."
            />
            <FeatureCard
              icon={Shield}
              title="Return Risk Prediction"
              body="Calibrated return-risk signals with driver breakdown before checkout."
            />
            <FeatureCard
              icon={Ruler}
              title="Smart Size Recommendation"
              body="Evidence-grounded picks using charts, reviews, brand bias, and shopper history."
            />
            <FeatureCard
              icon={GitCompare}
              title="Safer Alternatives"
              body="Surface lower-risk options when mismatch risk is high, with clear tradeoffs."
            />
            <FeatureCard
              icon={Brain}
              title="Memory & Learning"
              body="Self-learning from feedback and outcomes — session, user, and tenant memory with transparent controls."
              highlighted
            />
            <FeatureCard
              icon={MessageSquare}
              title="Community Feedback"
              body="Reddit-style enrichment as secondary evidence for real-world patterns like “runs small.”"
            />
            <FeatureCard
              icon={SlidersHorizontal}
              title="Smart Refinement Filters"
              body="Dynamic chips and filters that rerank instantly — hard constraints and soft preferences unified."
            />
            <FeatureCard
              icon={MessageCircleQuestion}
              title="Clarification Questions"
              body="Zero to three high-value questions only when they materially lift confidence."
            />
            <FeatureCard
              icon={BarChart3}
              title="Merchant Analytics"
              body="Return prevention metrics, calibration, A/B tests, and catalog health in one dashboard."
            />
          </div>
        </div>
      </section>

      {/* Self-learning */}
      <section className="border-y border-slate-200/60 bg-white py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
                The engine gets smarter with every interaction
              </h2>
              <ul className="mt-8 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Learns from purchases, returns, and exchanges
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Remembers user preferences across sessions
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Adapts to brand-specific sizing patterns
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Incorporates real-time user feedback
                </li>
              </ul>
            </div>
            <div
              className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 p-8 shadow-sm ring-1 ring-black/[0.03]"
              aria-hidden
            >
              <p className="text-center text-2xs font-semibold uppercase tracking-widest text-slate-500">
                Feedback loop
              </p>
              <div className="mx-auto mt-8 flex max-w-sm flex-col items-stretch gap-0 text-sm font-medium text-navy-950">
                {[
                  "User feedback",
                  "Model update",
                  "Better recommendations",
                  "Fewer returns",
                ].map((label, i) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="w-full rounded-lg bg-white/90 px-4 py-3 text-center shadow-sm ring-1 ring-slate-200/80">
                      {label}
                    </div>
                    {i < 3 && (
                      <div className="flex flex-col items-center py-2 text-accent">
                        <span className="text-lg leading-none">↓</span>
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-4 flex items-center justify-center gap-2 text-2xs font-semibold uppercase tracking-wide text-accent">
                  <RefreshCw className="h-3.5 w-3.5" />
                  cycle repeats
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section id="integration" className="py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
              Integration
            </h2>
            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              Ship your way — embed via API or use the full hosted product.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-black/[0.03]">
              <h3 className="text-lg font-semibold text-navy-950">API / SDK</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                REST and JavaScript SDK for scoring, recommendations, and
                events — embed anywhere in your stack.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  PDP, cart, and checkout hooks
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Tenant-scoped API keys
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Behavior and outcome event stream
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-black/[0.03]">
              <h3 className="text-lg font-semibold text-navy-950">
                Hosted SaaS
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Onboarding, widgets, dashboards, and analytics with a
                lightweight script embed for your storefront.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Merchant dashboard and ROI views
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Theming and configurable widgets
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Calibration and experimentation tools
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200/60 bg-gradient-to-b from-indigo-50/40 via-surface-light to-surface-light py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
            Ready to prevent returns?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            Explore the live demo or open the merchant dashboard to see fit
            intelligence in context.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200/50 transition hover:bg-indigo-500"
            >
              Try the live demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-6 py-3 text-sm font-semibold text-navy-950 shadow-sm ring-1 ring-black/[0.03] transition hover:border-slate-300"
            >
              Merchant dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-surface-light py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow-sm">
              <ShieldCheck className="h-4 w-4 text-white" aria-hidden />
            </div>
            <span className="text-sm font-semibold text-navy-950">
              FitConfidence
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <a href="/privacy" className="transition hover:text-navy-950">
              Privacy
            </a>
            <a href="/terms" className="transition hover:text-navy-950">
              Terms
            </a>
            <a href="/docs" className="transition hover:text-navy-950">
              Docs
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
