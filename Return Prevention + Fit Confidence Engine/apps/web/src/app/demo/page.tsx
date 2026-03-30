"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FitConfidenceModule } from "@/components/pdp/FitConfidenceModule";
import { SizeRecommendation } from "@/components/pdp/SizeRecommendation";
import { AlternativesList } from "@/components/pdp/AlternativesList";
import { ExplanationPanel } from "@/components/pdp/ExplanationPanel";
import { CartIntervention } from "@/components/cart/CartIntervention";
import { RefinementChips } from "@/components/search/RefinementChips";
import { FitBadge } from "@/components/search/FitBadge";
import { ClarificationFlow } from "@/components/shared/ClarificationFlow";
import { EmbeddableWidget } from "@/components/widget/EmbeddableWidget";
import type { FitModuleState } from "@/components/pdp/FitConfidenceModule";

const products: Array<{
  id: string;
  name: string;
  state: FitModuleState;
  score: number;
}> = [
  { id: "p1", name: "Merino crewneck · Navy", state: "confident", score: 91 },
  { id: "p2", name: "Slim denim · Indigo", state: "uncertain", score: 68 },
  { id: "p3", name: "Trail runner · Graphite", state: "low-data", score: 55 },
  { id: "p4", name: "Oxford shirt · White", state: "loading", score: 0 },
];

const altProducts = [
  {
    id: "a1",
    name: "Relaxed crew · Heather",
    price: "$98",
    fitLabel: "Stronger match",
    fitScore: 93,
    returnRisk: "low" as const,
    whyChip: "More room in chest vs. current pick",
    imageColor: "#c7d2fe",
  },
  {
    id: "a2",
    name: "Tapered jean · Rinse",
    price: "$128",
    fitLabel: "Safer taper",
    fitScore: 87,
    returnRisk: "moderate" as const,
    whyChip: "Better leg opening for your profile",
    imageColor: "#bfdbfe",
  },
  {
    id: "a3",
    name: "Performance knit · Black",
    price: "$110",
    fitLabel: "Similar use case",
    fitScore: 84,
    returnRisk: "low" as const,
    whyChip: "Brand runs closer to tagged size",
    imageColor: "#e9d5ff",
  },
];

const evidenceBlocks = [
  {
    id: "1",
    title: "Structured catalog signals",
    qualifier: "High confidence",
    bullets: [
      "Chest grading aligns with your saved measurement band.",
      "SKU variant maps to a block you’ve kept before.",
    ],
    kind: "structured" as const,
  },
  {
    id: "2",
    title: "Review intelligence",
    qualifier: "Medium confidence",
    bullets: [
      "Recent reviews mention a slightly snug sleeve vs. torso.",
      "Negative themes rarely cite length—mostly body ease.",
    ],
    kind: "reviews" as const,
  },
  {
    id: "3",
    title: "Your preferences",
    qualifier: "Personalized",
    bullets: [
      "You chose relaxed knits on similar items.",
      "Between sizes, you prefer a touch more drape.",
    ],
    kind: "preferences" as const,
  },
];

export default function DemoPage() {
  const [productId, setProductId] = useState("p1");
  const [chips, setChips] = useState<string[]>(["lower-risk"]);

  const current = products.find((p) => p.id === productId) ?? products[0];

  const chipDefs = useMemo(
    () => [
      { id: "under-100", label: "Under $100" },
      { id: "lower-risk", label: "Lower return risk", ai: true },
      { id: "tts", label: "True to size" },
      { id: "clean", label: "Easy to clean" },
      { id: "value", label: "Best value", ai: true },
      { id: "travel", label: "Travel-friendly" },
    ],
    [],
  );

  const toggleChip = (id: string) => {
    setChips((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  };

  return (
    <div className="min-h-screen bg-surface-light">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-surface-light/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-navy-950">
              ← Back
            </Link>
            <h1 className="mt-1 font-serif text-2xl text-navy-950">Interactive demo</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProductId(p.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  productId === p.id
                    ? "border-indigo-300 bg-indigo-50 text-accent"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-5 py-10">
        <section className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Search preview
          </span>
          <FitBadge variant="great" />
          <FitBadge variant="check" />
        </section>

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Refinements
          </p>
          <RefinementChips
            chips={chipDefs}
            activeIds={chips}
            onToggle={toggleChip}
          />
        </section>

        <motion.section
          layout
          className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-8">
            <FitConfidenceModule
              state={current.state === "loading" ? "loading" : current.state}
              score={current.score}
              riskLevel={
                current.state === "uncertain"
                  ? "moderate"
                  : current.state === "low-data"
                    ? "review"
                    : "low"
              }
            />
            <SizeRecommendation
              sizes={[
                { id: "s", label: "S", confidence: 62 },
                { id: "m", label: "M", confidence: 91 },
                { id: "l", label: "L", confidence: 78 },
                { id: "xl", label: "XL", confidence: 54 },
              ]}
              selectedId="m"
              brandTendency={
                current.state === "uncertain" ? "runs_small" : "true_to_size"
              }
            />
            <ExplanationPanel blocks={evidenceBlocks} />
            <AlternativesList products={altProducts} />
            <CartIntervention />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Embeddable widget
              </p>
              <EmbeddableWidget
                productName={current.name}
                score={current.state === "loading" ? 72 : current.score}
                recommendedSize="M"
                theme="light"
              />
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Clarification
              </p>
              <ClarificationFlow
                questions={[
                  {
                    id: "q1",
                    prompt: "How do you like knits to feel?",
                    options: [
                      { id: "snug", label: "Closer to body" },
                      { id: "relaxed", label: "Relaxed drape" },
                      { id: "layer", label: "Room to layer" },
                    ],
                  },
                  {
                    id: "q2",
                    prompt: "Priority when between sizes?",
                    options: [
                      { id: "sleeve", label: "Sleeve length" },
                      { id: "torso", label: "Torso ease" },
                      { id: "balanced", label: "Balanced" },
                    ],
                  },
                ]}
                onComplete={() => {}}
              />
            </div>
          </aside>
        </motion.section>
      </main>
    </div>
  );
}
