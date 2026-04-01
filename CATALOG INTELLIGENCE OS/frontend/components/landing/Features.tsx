import {
  Activity,
  Brain,
  GitBranch,
  Layers,
  ScanSearch,
  Share2,
} from "lucide-react";

const features = [
  {
    title: "Taxonomy Intelligence",
    description:
      "Map messy supplier categories to a clean, channel-ready taxonomy with confidence and audit trails.",
    icon: Layers,
    badge: "bg-purple-500/15 text-purple-300 ring-purple-500/30",
    iconBg: "bg-purple-500/20 text-purple-200",
  },
  {
    title: "Attribute Extraction",
    description:
      "Pull structured attributes from titles, bullets, and specs—normalized to your schema, not generic guesses.",
    icon: ScanSearch,
    badge: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
    iconBg: "bg-blue-500/20 text-blue-200",
  },
  {
    title: "Data Quality Scoring",
    description:
      "Every SKU gets a quality score with explainable signals so teams fix what actually moves metrics.",
    icon: Activity,
    badge: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    iconBg: "bg-emerald-500/20 text-emerald-200",
  },
  {
    title: "Entity Resolution",
    description:
      "Detect duplicates and near-duplicates across vendors, bundles, and regional variants automatically.",
    icon: GitBranch,
    badge: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
    iconBg: "bg-orange-500/20 text-orange-200",
  },
  {
    title: "Evidence-First AI",
    description:
      "Every enrichment cites sources and alternatives—built for merchandising trust and compliance reviews.",
    icon: Brain,
    badge: "bg-yellow-500/15 text-yellow-300 ring-yellow-500/30",
    iconBg: "bg-yellow-500/20 text-yellow-200",
  },
  {
    title: "Downstream Activation",
    description:
      "Push enriched data to search, ads, marketplaces, and feeds with guardrails and rollback.",
    icon: Share2,
    badge: "bg-pink-500/15 text-pink-300 ring-pink-500/30",
    iconBg: "bg-pink-500/20 text-pink-200",
  },
] as const;

export default function Features() {
  return (
    <section
      id="features"
      className="border-t border-gray-200 bg-[#f8f9fa] py-20 text-gray-900 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
            Platform capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything Your Catalog Needs to{" "}
            <span className="text-brand-600">Perform</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            One intelligence layer across enrichment, quality, and activation—
            designed for modern commerce teams.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-200/60"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${f.iconBg} ring-black/5`}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${f.badge}`}
                    >
                      Core
                    </span>
                    <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {f.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
