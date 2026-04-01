"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How accurate is CIOS enrichment out of the box?",
    a: "Pilot customers typically see high-90s precision on structured attributes when grounded in your taxonomy and review policies. We measure per-field agreement with human merchandisers and tune thresholds before anything goes live.",
  },
  {
    q: "Can CIOS integrate with our existing PIM or MDM?",
    a: "Yes. Ingest from CSV, SFTP, or APIs and write enriched payloads back to your system of record. CIOS is an intelligence layer—it doesn’t require you to rip out your PIM on day one.",
  },
  {
    q: "What’s included in pricing as we scale SKUs?",
    a: "Plans are based on catalog size tiers and activation endpoints. Enterprise adds private networking, custom models, and SLAs. We’ll align to your channels and refresh cadence during onboarding.",
  },
  {
    q: "How do you make AI decisions trustworthy for merchandisers?",
    a: "Every proposal carries evidence: source text, alternative interpretations, and confidence. Review queues let experts override in bulk while preserving an audit trail for compliance.",
  },
  {
    q: "How is customer data secured?",
    a: "Encryption in transit and at rest, role-based access, and optional dedicated environments for regulated industries. We support security questionnaires and DPA workflows for Enterprise.",
  },
  {
    q: "How long does onboarding take?",
    a: "Most teams connect a feed and see first enriched SKUs within days. Full taxonomy alignment and channel activation depend on catalog complexity—typically 2–6 weeks for broad coverage.",
  },
] as const;

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-gray-200 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Straight answers about accuracy, trust, and rollout.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 transition hover:border-gray-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
