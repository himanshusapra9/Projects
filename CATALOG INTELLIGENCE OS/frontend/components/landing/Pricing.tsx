import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$499",
    period: "/mo",
    skuLimit: "Up to 10K SKUs",
    description: "For lean teams proving catalog lift on a focused assortment.",
    features: [
      "Feed & CSV ingest",
      "Taxonomy + attribute enrichment",
      "Quality scoring dashboard",
      "Email support",
    ],
    cta: "Start Starter",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$1,499",
    period: "/mo",
    skuLimit: "Up to 100K SKUs",
    description:
      "For scaling brands syndicating across site, ads, and marketplaces.",
    features: [
      "Everything in Starter",
      "Review queue & bulk approvals",
      "Entity resolution",
      "Slack + priority support",
      "Activation webhooks",
    ],
    cta: "Start Growth",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    skuLimit: "Unlimited scale",
    description: "For global catalogs, custom models, and security reviews.",
    features: [
      "Dedicated success engineer",
      "VPC / private deployment options",
      "Custom taxonomy & guardrails",
      "SLA + audit support",
      "SSO & advanced roles",
    ],
    cta: "Talk to Sales",
    highlighted: false,
  },
] as const;

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="border-t border-gray-200 bg-[#f8f9fa] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Simple pricing. Serious outcomes.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start with a pilot. Scale when enrichment becomes your default.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 shadow-sm transition",
                tier.highlighted
                  ? "border-brand-500/40 bg-white shadow-xl shadow-brand-900/10 ring-2 ring-brand-500/20"
                  : "border-gray-200 bg-white hover:shadow-md"
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-gray-500">{tier.period}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-brand-600">
                  {tier.skuLimit}
                </p>
                <p className="mt-3 text-sm text-gray-600">{tier.description}</p>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-gray-700">
                    <Check
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        tier.highlighted ? "text-brand-600" : "text-gray-400"
                      )}
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={cn(
                  "mt-10 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  tier.highlighted
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 focus-visible:outline-brand-500"
                    : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-gray-400"
                )}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
