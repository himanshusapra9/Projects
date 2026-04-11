import Link from "next/link";

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="currentColor" opacity="0.15" />
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 8l-4 2.5v4L12 17l4-2.5v-4L12 8z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 1 — Hero                                                  */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <ShieldIcon className="text-indigo-600" />
          <span className="text-lg font-semibold text-indigo-600">DataSteward</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
          Your pipeline said{" "}
          <span className="text-green-500">✓ Success</span>.
          <br />
          Your data was wrong.
        </h1>

        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          72% of data quality issues are discovered only after they&apos;ve
          affected business decisions. DataSteward catches them first.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/tables"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Get Started — Free
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            View Demo →
          </Link>
        </div>

        <p className="mt-12 text-sm text-gray-400">
          Used by data teams who can&apos;t afford $50K/yr for Monte Carlo.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 2 — The Problem                                           */
/* ------------------------------------------------------------------ */
const problems = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600">
        <path d="M13.73 21a2 2 0 01-3.46 0M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <line x1="1" y1="1" x2="23" y2="23" strokeWidth="1.5" />
      </svg>
    ),
    title: "Silent Failures",
    body: "A pipeline runs on time, returns expected row counts, passes checks — and still delivers corrupted data. You find out when sales asks why last month's revenue dropped 40%.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
    title: "Schema Drift",
    body: "An upstream team renames one column. Every dashboard breaks. Your on-call gets paged at 2am. Three hours later you find the cause was a one-word change in a table you don't own.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Stale Data, Fresh Problems",
    body: "Yesterday's data still hasn't loaded at noon. Someone makes a strategic decision based on data that's 18 hours old. You only hear about it in the Monday retro.",
  },
];

function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          The problems nobody talks about
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div key={p.title} className="border border-gray-200 rounded-lg p-6">
              <div className="mb-4">{p.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 3 — How It Works                                          */
/* ------------------------------------------------------------------ */
function HowItWorksRow({
  imageLeft,
  visual,
  title,
  body,
  stat,
}: {
  imageLeft: boolean;
  visual: React.ReactNode;
  title: string;
  body: string;
  stat: string;
}) {
  const textBlock = (
    <div className="flex-1">
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed mb-4">{body}</p>
      <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-3 py-1">
        {stat}
      </span>
    </div>
  );
  const visualBlock = (
    <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6 font-mono text-sm text-gray-600">
      {visual}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-10 items-center">
      {imageLeft ? (
        <>
          {visualBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {visualBlock}
        </>
      )}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
          How DataSteward works
        </h2>
        <div className="space-y-20">
          <HowItWorksRow
            imageLeft
            visual={
              <pre className="whitespace-pre leading-relaxed">{`Warehouse
  │
  ├─→ [ DataSteward ]
  │      │  profiles tables
  │      │  learns baselines
  │      │  detects anomalies
  │      ▼
  │   ┌──────────┐
  └── │ ✓ Normal │  or  ⚠ Alert →  Slack / PagerDuty
      └──────────┘`}</pre>
            }
            title="Continuous Table Profiling"
            body="DataSteward connects to your warehouse and profiles every table on a schedule. It learns what 'normal' looks like — row counts, column distributions, null rates, value ranges — and alerts you the moment something deviates."
            stat="Catches 94% of silent failures within minutes, not days"
          />
          <HowItWorksRow
            imageLeft={false}
            visual={
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded p-3 border border-gray-200">
                  <span>amount</span>
                  <span className="text-green-600 font-medium">KS: 0.031 · p=0.72 · OK</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded p-3 border border-red-200">
                  <span>lifetime_value</span>
                  <span className="text-red-600 font-medium">KS: 0.187 · p=0.003 · Drift</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Kolmogorov–Smirnov test results</p>
              </div>
            }
            title="Distribution Drift Detection"
            body="Using Kolmogorov–Smirnov statistical tests, DataSteward compares today's data distribution against your established baseline. When a feature distribution shifts — even subtly — you know before your ML model does."
            stat="Powered by scipy.stats — no black boxes"
          />
          <HowItWorksRow
            imageLeft
            visual={
              <div className="space-y-2 text-left">
                <div className="bg-white rounded p-3 border border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">DataSteward AI</p>
                  <p className="text-gray-800 text-sm">
                    <strong>Most likely cause:</strong> The ETL job for orders_raw
                    ran at 03:14 UTC but upstream API pagination changed, returning
                    only page 1 of 12.
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <strong>Recommendation:</strong> Check the API response at 03:14,
                    verify total_count header matches row count ingested.
                  </p>
                </div>
              </div>
            }
            title="AI Root Cause Analysis"
            body="When an anomaly fires, DataSteward generates a plain-English hypothesis: what broke, why it probably happened, and what to check first. Powered by Claude. No log-diving required."
            stat="From alert to hypothesis in < 30 seconds"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 4 — Features Grid                                         */
/* ------------------------------------------------------------------ */
const features = [
  { title: "Anomaly Detection", desc: "Row-count baselines (mean ± 2.5σ) + Isolation Forest" },
  { title: "Schema Drift Alerts", desc: "Instant notification when columns change type or disappear" },
  { title: "Duplicate Detection", desc: "MinHash LSH surfaces near-duplicate records automatically" },
  { title: "Freshness SLA Tracking", desc: "Define expected update windows; get paged when breached" },
  { title: "Incident Timeline", desc: "Every anomaly logged with severity, context, remediation" },
  { title: "AI Root Cause", desc: "Plain-English hypotheses from Claude, not raw stack traces" },
];

function FeaturesGrid() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 5 — Pricing                                               */
/* ------------------------------------------------------------------ */
function Pricing() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Simple pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-lg font-bold text-gray-900">Self-Hosted</h3>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">Free<span className="text-base font-normal text-gray-500">, forever</span></p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2"><span className="text-green-500">✓</span> Unlimited tables</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> All ML detectors</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Docker Compose deploy</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Incident management</li>
              <li className="flex gap-2 text-gray-400"><span>✗</span> AI root cause (bring your own API key)</li>
            </ul>
          </div>
          <div className="bg-indigo-600 rounded-lg p-8 text-white">
            <h3 className="text-lg font-bold">With AI</h3>
            <p className="mt-2 text-3xl font-extrabold">BYOK<span className="text-base font-normal text-indigo-200 ml-2">Bring your own Anthropic key</span></p>
            <ul className="mt-6 space-y-3 text-sm text-indigo-100">
              <li className="flex gap-2"><span className="text-white">✓</span> Everything in Self-Hosted</li>
              <li className="flex gap-2"><span className="text-white">✓</span> Claude-powered root cause</li>
              <li className="flex gap-2"><span className="text-white">✓</span> Natural language incident summaries</li>
              <li className="flex gap-2"><span className="text-white">✓</span> Remediation recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 6 — Quick Start                                           */
/* ------------------------------------------------------------------ */
function QuickStart() {
  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          From zero to monitoring in 5 minutes
        </h2>
        <div className="bg-gray-800 rounded-lg p-6 text-left font-mono text-sm text-gray-300 overflow-x-auto">
          <pre>{`git clone https://github.com/your-org/datasteward
cd datasteward
cp .env.example .env        # add ANTHROPIC_API_KEY (optional)
./setup.sh                  # installs everything, starts services
# open http://localhost:3000`}</pre>
        </div>
        <p className="mt-6 text-gray-400 text-sm">
          No vendor lock-in. Runs on your machine, your VPC, your rules.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 7 — Footer                                                */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="py-8 px-4 bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-400">
        <span>© 2025 DataSteward. Open source.</span>
        <div className="flex gap-4">
          <a href="https://github.com/your-org/datasteward" className="hover:text-gray-600">GitHub</a>
          <a href="/docs" className="hover:text-gray-600">Docs</a>
          <a href="http://localhost:8000/docs" className="hover:text-gray-600">API Reference</a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                              */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="bg-white">
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesGrid />
      <Pricing />
      <QuickStart />
      <Footer />
    </div>
  );
}
