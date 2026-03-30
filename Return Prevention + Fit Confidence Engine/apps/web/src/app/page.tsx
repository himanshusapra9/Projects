import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  GitCompare,
  Layers,
  LineChart,
  MessageSquareQuote,
  Ruler,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-accent">
      <Sparkles className="h-3 w-3" aria-hidden />
      {children}
    </span>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BarChart3;
  title: string;
  body: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-emerald-50/20 opacity-0 transition group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
          <Icon className="h-5 w-5 text-accent" aria-hidden />
        </div>
        <h3 className="mb-2 text-base font-semibold text-navy-950">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{body}</p>
      </div>
    </article>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-6 py-5 shadow-sm ring-1 ring-black/[0.03]">
      <span className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
        {value}
      </span>
      <span className="text-center text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-light">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-surface-light/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <ShieldCheck className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-navy-950">
              FitConfidence
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-navy-950">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-navy-950">
              How it works
            </a>
            <a href="#metrics" className="text-sm font-medium text-slate-600 transition hover:text-navy-950">
              Results
            </a>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Live demo
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white md:hidden"
          >
            Demo
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100/50 via-violet-50/30 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-20 text-center sm:pt-28 lg:pt-32">
          <Badge>Pre-purchase return prevention</Badge>
          <h1 className="mt-6 font-serif text-4xl font-normal leading-[1.15] tracking-tight text-navy-950 sm:text-5xl lg:text-6xl">
            Help shoppers choose right.{" "}
            <span className="text-accent">Prevent returns</span> before they
            happen.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            The AI decision engine that evaluates fit confidence, mismatch risk,
            and return likelihood before purchase — so merchants reduce
            preventable returns and shoppers buy with confidence.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200/50 transition hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Try the interactive demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-navy-950 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              See how it works
            </a>
          </div>
        </div>
      </header>

      {/* ── Metrics ── */}
      <section id="metrics" className="border-y border-slate-200/60 bg-white/50 py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-5 sm:grid-cols-4">
          <MetricCard value="32%" label="Fewer preventable returns" />
          <MetricCard value="2.4×" label="Size confidence lift" />
          <MetricCard value="18%" label="Conversion uplift" />
          <MetricCard value="<200ms" label="API p95 latency" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge>Capabilities</Badge>
            <h2 className="mt-5 font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
              Everything you need to prevent returns before checkout
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              A unified engine that combines product intelligence, review
              analysis, behavioral learning, and community signals into
              actionable decisions.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Target}
              title="Fit Confidence Scoring"
              body="Category-aware scoring across apparel, footwear, furniture, beauty, travel gear, and accessories with between-size distribution and uncertainty decomposition."
            />
            <FeatureCard
              icon={Shield}
              title="Return Risk Prediction"
              body="17-factor return-risk model with preventable driver decomposition, calibrated thresholds, and mitigation suggestions for each product context."
            />
            <FeatureCard
              icon={Ruler}
              title="Size Recommendation"
              body="Evidence-grounded size picks using chart alignment, review-derived bias, brand tendencies, and shopper measurement history."
            />
            <FeatureCard
              icon={GitCompare}
              title="Safer Alternatives"
              body="When mismatch risk is high, the system surfaces lower-risk alternatives with comparative fit summaries and price tradeoffs."
            />
            <FeatureCard
              icon={Brain}
              title="Memory and Learning"
              body="Session, user, and tenant-level preference memory with exponential decay, conflict resolution, and transparent user controls."
            />
            <FeatureCard
              icon={MessageSquareQuote}
              title="Community Feedback"
              body="Optional Reddit-style enrichment labeled as secondary evidence — surfaces real-world patterns like 'runs small' or 'hard to clean'."
            />
            <FeatureCard
              icon={Layers}
              title="Smart Refinement"
              body="AI-generated refinement chips and dynamic category filters that rerank results instantly — hard filters and soft preferences unified."
            />
            <FeatureCard
              icon={Zap}
              title="Clarification Questions"
              body="Ask 0–3 high-value questions only when they materially improve confidence — using expected information gain to minimize shopper effort."
            />
            <FeatureCard
              icon={LineChart}
              title="Merchant Dashboard"
              body="Return prevention analytics, calibration tools, A/B testing console, catalog health scores, and ROI measurement in a hosted dashboard."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="border-y border-slate-200/60 bg-gradient-to-b from-slate-50/80 to-white py-20"
      >
        <div className="mx-auto max-w-4xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge>Architecture</Badge>
            <h2 className="mt-5 font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
              How FitConfidence works
            </h2>
          </div>
          <div className="mt-14 space-y-10">
            {[
              {
                step: "01",
                title: "Shopper lands on a product page",
                body: "The engine ingests product attributes, variant data, size charts, review intelligence, and community signals in real time.",
              },
              {
                step: "02",
                title: "Fit confidence and return risk are evaluated",
                body: "Category-specific scoring combines measurement alignment, review-derived bias, behavioral priors, and merchant rules into calibrated confidence and risk scores.",
              },
              {
                step: "03",
                title: "The system decides: recommend, clarify, or refine",
                body: "If evidence is strong, recommend directly. If uncertainty is high, ask 1–3 targeted questions. If catalog options are broad, suggest refinement filters.",
              },
              {
                step: "04",
                title: "Shopper sees an evidence-grounded recommendation",
                body: "Best size, best variant, safer alternatives, tradeoff explanations, and community feedback — all displayed in a premium, mobile-first interface.",
              },
              {
                step: "05",
                title: "The system learns and improves",
                body: "Every purchase, return, exchange, and filter interaction feeds back into scoring models, memory, and calibration — reducing risk over time.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-sm font-semibold text-white shadow-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-navy-950">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integration ── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge>Integration</Badge>
            <h2 className="mt-5 font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
              Two ways to deploy
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.03]">
              <BarChart3 className="mb-3 h-6 w-6 text-accent" aria-hidden />
              <h3 className="mb-2 text-lg font-semibold text-navy-950">
                API / SDK Embedded
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Integrate fit confidence, size recommendation, and return-risk
                scoring directly into your storefront via REST API or JS SDK.
                Works with Shopify, Magento, BigCommerce, and custom platforms.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  PDP, search, cart, and checkout hooks
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Tenant-scoped auth with API keys
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Behavior event tracking SDK
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.03]">
              <Layers className="mb-3 h-6 w-6 text-accent" aria-hidden />
              <h3 className="mb-2 text-lg font-semibold text-navy-950">
                Hosted SaaS
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Full hosted product with merchant onboarding, catalog
                ingestion, configurable widgets, dashboards, and analytics.
                One-line script embed for storefronts.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Merchant dashboard with ROI tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  A/B testing and calibration console
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Theming and design customization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-slate-200/60 bg-gradient-to-b from-slate-50 to-surface-light py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
            Ready to prevent returns before they happen?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            See the engine in action with your own product catalog. Start with
            the interactive demo or integrate in under a day.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200/50 transition hover:bg-indigo-500"
            >
              Try the demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-navy-950 shadow-sm transition hover:border-slate-300"
            >
              Merchant dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/60 bg-surface-light py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-navy-950">FitConfidence</span>
          </div>
          <p className="text-xs text-slate-500">
            Return Prevention + Fit Confidence Engine. Built for merchants who
            care about customer experience.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="#" className="transition hover:text-navy-950">Privacy</a>
            <a href="#" className="transition hover:text-navy-950">Terms</a>
            <a href="#" className="transition hover:text-navy-950">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
