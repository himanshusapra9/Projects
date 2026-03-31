"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Loader2,
  MessageSquareQuote,
  Sparkles,
  Star,
  StarHalf,
  ThumbsDown,
  ThumbsUp,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { CartIntervention } from "@/components/cart/CartIntervention";
import { AlternativesList } from "@/components/pdp/AlternativesList";
import { ExplanationPanel } from "@/components/pdp/ExplanationPanel";
import { FitConfidenceModule } from "@/components/pdp/FitConfidenceModule";
import { SizeRecommendation } from "@/components/pdp/SizeRecommendation";
import { ClarificationFlow } from "@/components/shared/ClarificationFlow";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import { EvidencePill } from "@/components/shared/EvidencePill";
import { RiskIndicator } from "@/components/shared/RiskIndicator";
import { RefinementChips } from "@/components/search/RefinementChips";

const HEIGHTS = [
  "5'6\"",
  "5'7\"",
  "5'8\"",
  "5'9\"",
  "5'10\"",
  "5'11\"",
  "6'0\"",
  "6'1\"",
  "6'2\"",
];

const WEIGHTS = [
  "130–139 lbs",
  "140–149 lbs",
  "150–159 lbs",
  "160–169 lbs",
  "170–179 lbs",
  "180–189 lbs",
  "190–199 lbs",
  "200–209 lbs",
  "210–220 lbs",
];

const SIZE_OPTIONS_BASE = [
  { id: "s", label: "S", confidence: 62 },
  { id: "m", label: "M", confidence: 78 },
  { id: "l", label: "L", confidence: 71 },
  { id: "xl", label: "XL", confidence: 54 },
];

const SIZE_OPTIONS_ENRICHED = [
  { id: "s", label: "S", confidence: 72 },
  { id: "m", label: "M", confidence: 91 },
  { id: "l", label: "L", confidence: 84 },
  { id: "xl", label: "XL", confidence: 63 },
];

const EVIDENCE_BLOCKS = [
  {
    id: "structured",
    title: "Garment grading & construction",
    qualifier: "High confidence",
    bullets: [
      "Northline’s M block matches your chest and shoulder span within a half-inch.",
      "Ribbed hem and cuffs are spec’d for minimal shrink on cold wash—aligned with how you care for knits.",
    ],
    kind: "structured" as const,
  },
  {
    id: "reviews",
    title: "Verified buyer patterns",
    qualifier: "Strong signal",
    bullets: [
      "Recent reviews describe the torso as trim, not tight—consistent with a true-to-size Medium.",
      "Sleeve length feedback skews neutral; few exchanges cite arm length as the issue.",
    ],
    kind: "reviews" as const,
  },
  {
    id: "preferences",
    title: "Your saved preferences",
    qualifier: "Personalized",
    bullets: [
      "You’ve kept relaxed knits before; this crew sits between slim and easy—your stated sweet spot.",
      "Between sizes, you favor clean shoulders over extra drape—we weighted shoulder map accordingly.",
    ],
    kind: "preferences" as const,
  },
  {
    id: "community",
    title: "Community corroboration",
    qualifier: "Cross-checked",
    bullets: [
      "r/malefashionadvice threads echo a slightly snug chest in M for athletic builds—already reflected in your pick.",
      "No recurring theme on itchy fiber or neckline stretch—quality signals look stable.",
    ],
    kind: "community" as const,
  },
];

const ALT_PRODUCTS = [
  {
    id: "sunspel",
    name: "Sunspel Extra Fine Merino Crew · Charcoal",
    price: "$155",
    fitLabel: "Similar drape",
    fitScore: 89,
    returnRisk: "low" as const,
    whyChip: "Slightly roomier in the chest vs. this Northline block",
    imageColor: "#94a3b8",
  },
  {
    id: "theory",
    name: "Theory Hilles Wool-Cashmere Pullover · Stone",
    price: "$245",
    fitLabel: "Elevated handfeel",
    fitScore: 86,
    returnRisk: "moderate" as const,
    whyChip: "Trimmer sleeve—better if you prefer a sharper line",
    imageColor: "#cbd5e1",
  },
  {
    id: "norse",
    name: "Norse Projects Sigfred Merino · Navy",
    price: "$175",
    fitLabel: "Streetwear ease",
    fitScore: 83,
    returnRisk: "low" as const,
    whyChip: "Boxier shoulder; size down if you want less volume",
    imageColor: "#64748b",
  },
];

const FIT_MODULE_EVIDENCE = [
  {
    icon: MessageSquareQuote,
    text: "Reviews: true to size",
    detail: "Last 90 days: most verified buyers stayed in their usual knit size.",
  },
  {
    icon: Sparkles,
    text: "Matches your profile",
    detail:
      "Height, weight, and chest land in the brand’s core Medium grading curve.",
  },
  {
    icon: UserCircle2,
    text: "Similar shoppers",
    detail: "Profiles like yours kept Medium 78% of the time on merino crews.",
  },
];

const CLARIFICATION_QUESTIONS = [
  {
    id: "layer",
    prompt: "How will you mostly wear this sweater?",
    options: [
      { id: "solo", label: "On its own" },
      { id: "over-tee", label: "Over a tee" },
      { id: "under-jacket", label: "Under tailoring" },
    ],
  },
  {
    id: "drape",
    prompt: "When in doubt, you prefer…",
    options: [
      { id: "clean", label: "Cleaner shoulder line" },
      { id: "ease", label: "A touch more ease" },
      { id: "balanced", label: "Balanced" },
    ],
  },
];

const STYLE_CHIPS = [
  { id: "merino", label: "Merino" },
  { id: "layering", label: "Layering", ai: true },
  { id: "cold-wash", label: "Cold wash" },
  { id: "travel", label: "Travel knit", ai: true },
];

export default function DemoPage() {
  const [fitScore, setFitScore] = useState(78);
  const [sizeConfidence, setSizeConfidence] = useState(78);
  const [profileEnriched, setProfileEnriched] = useState(false);

  const [selectedColor, setSelectedColor] = useState<"navy" | "heather" | "forest">(
    "navy",
  );
  const [selectedSizeId, setSelectedSizeId] = useState("m");

  const [profileOpen, setProfileOpen] = useState(true);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [preferredFit, setPreferredFit] = useState<"slim" | "regular" | "relaxed">(
    "regular",
  );

  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const [feedback, setFeedback] = useState<null | "up" | "down">(null);
  const [helpedCount, setHelpedCount] = useState(3);

  const [styleChips, setStyleChips] = useState<string[]>(["merino", "layering"]);

  const sizes = useMemo(
    () => (profileEnriched ? SIZE_OPTIONS_ENRICHED : SIZE_OPTIONS_BASE),
    [profileEnriched],
  );

  const applyEnrichedFit = useCallback(() => {
    setFitScore(91);
    setSizeConfidence(91);
    setProfileEnriched(true);
  }, []);

  const handleSaveProfile = () => {
    if (!height || !weight || !chest.trim()) return;
    applyEnrichedFit();
  };

  const handleImport = () => {
    setImporting(true);
    setImportMenuOpen(false);
    window.setTimeout(() => {
      setHeight("5'10\"");
      setWeight("170–179 lbs");
      setChest("40");
      setPreferredFit("regular");
      applyEnrichedFit();
      setImporting(false);
    }, 1600);
  };

  const handleFeedback = (kind: "up" | "down") => {
    if (feedback !== null) return;
    setFeedback(kind);
    setHelpedCount((c) => c + 1);
  };

  const whyExplanation = profileEnriched
    ? "Your saved measurements and Northline’s grading put you squarely in Medium. Reviews note a trim—not tight—chest; if you often layer over a tee, Medium still clears comfortably."
    : "Based on general population signals, Medium is the strongest match. Add quick measurements or import a profile to lift confidence into the low-return band.";

  return (
    <div className="min-h-screen bg-surface-light text-navy-950">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-navy-950"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back to shop
          </Link>
          <span className="hidden text-2xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:inline">
            Northline · New arrivals
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">
        <nav
          className="mb-10 text-sm text-slate-500"
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-accent">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-slate-300">
              /
            </li>
            <li>
              <span className="transition hover:text-accent">Men</span>
            </li>
            <li aria-hidden className="text-slate-300">
              /
            </li>
            <li>
              <span className="transition hover:text-accent">Sweaters</span>
            </li>
            <li aria-hidden className="text-slate-300">
              /
            </li>
            <li className="font-medium text-navy-950">Merino Crewneck</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
          {/* Product imagery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gradient-to-br from-navy-950 via-slate-800 to-slate-600 shadow-lg ring-1 ring-black/5">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.12), transparent 50%)",
                }}
              />
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-emerald-800 shadow-md ring-1 ring-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                Great fit
              </div>
              <p className="absolute bottom-6 left-6 max-w-[12rem] font-serif text-lg italic text-white/90">
                Extra-fine merino · ribbed cuffs
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                "from-slate-700 to-slate-900",
                "from-indigo-900 to-slate-800",
                "from-slate-600 to-zinc-700",
                "from-slate-800 to-navy-950",
              ].map((g, i) => (
                <button
                  key={i}
                  type="button"
                  className={`relative aspect-square overflow-hidden rounded-sm bg-gradient-to-br ring-2 ring-offset-2 transition ${i === 0 ? "ring-navy-950" : "ring-transparent hover:ring-slate-300"}`}
                  aria-label={`Product view ${i + 1}`}
                >
                  <span className={`block h-full w-full bg-gradient-to-br ${g}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Product copy & modules */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Northline
              </p>
              <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-navy-950 sm:text-4xl">
                Merino Wool Crewneck Sweater
              </h1>
              <div className="mt-4 flex flex-wrap items-baseline gap-4">
                <span className="text-2xl font-medium tabular-nums text-navy-950">
                  $128
                </span>
                <span className="text-sm text-slate-500">Tax included where applicable</span>
              </div>

              <div
                className="mt-5 flex items-center gap-2"
                role="img"
                aria-label="4.6 out of 5 stars from 1247 reviews"
              >
                <div className="flex items-center gap-0.5 text-amber-500" aria-hidden>
                  {[1, 2, 3, 4].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                  <StarHalf className="h-4 w-4 fill-current" strokeWidth={0} />
                </div>
                <span className="text-sm font-medium text-navy-950">4.6</span>
                <span className="text-sm text-slate-500">(1,247 reviews)</span>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Color
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { id: "navy" as const, label: "Navy" },
                      { id: "heather" as const, label: "Heather Grey" },
                      { id: "forest" as const, label: "Forest" },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        selectedColor === c.id
                          ? "border-navy-950 bg-navy-950 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Highlights
                </p>
                <RefinementChips
                  chips={STYLE_CHIPS}
                  activeIds={styleChips}
                  onToggle={(id) =>
                    setStyleChips((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                    )
                  }
                />
              </div>
            </div>

            <FitConfidenceModule
              state="confident"
              score={fitScore}
              recommendedSize="M"
              sizeConfidence={sizeConfidence}
              riskLevel="low"
              whyExplanation={whyExplanation}
              evidence={FIT_MODULE_EVIDENCE}
              onCompareToggle={() => {}}
            />

            <SizeRecommendation
              sizes={sizes}
              selectedId={selectedSizeId}
              onSelect={setSelectedSizeId}
              brandTendency="true_to_size"
              fitNotes={[
                "Northline merino is spun for a clean shoulder line—expect a tailored crew, not a lounge silhouette.",
                "Hem hits at high hip on most wearers in M; size up if you prefer a longer drape over denim.",
              ]}
            />

            {/* Your Fit Profile */}
            <section className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm ring-1 ring-black/[0.03]">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50/80"
                aria-expanded={profileOpen}
              >
                <div className="flex items-center gap-4">
                  <span className="font-serif text-lg text-navy-950">Your Fit Profile</span>
                  {profileEnriched ? (
                    <ConfidenceMeter
                      score={fitScore}
                      size={52}
                      label="Profile"
                      aria-label={`Profile fit alignment ${fitScore} percent`}
                      className="scale-90"
                    />
                  ) : null}
                </div>
                <motion.span animate={{ rotate: profileOpen ? 180 : 0 }}>
                  <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {profileOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <div className="space-y-6 p-5 pt-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Quick measurements
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Height
                            <select
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy-950 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                              <option value="">Select</option>
                              {HEIGHTS.map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm font-medium text-slate-700">
                            Weight
                            <select
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy-950 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                              <option value="">Select</option>
                              {WEIGHTS.map((w) => (
                                <option key={w} value={w}>
                                  {w}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                            Chest (in.)
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="e.g. 40"
                              value={chest}
                              onChange={(e) => setChest(e.target.value)}
                              className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-accent/20"
                            />
                          </label>
                        </div>
                        <fieldset className="mt-4">
                          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Preferred fit
                          </legend>
                          <div className="mt-2 flex flex-wrap gap-3">
                            {(
                              [
                                { id: "slim" as const, label: "Slim" },
                                { id: "regular" as const, label: "Regular" },
                                { id: "relaxed" as const, label: "Relaxed" },
                              ] as const
                            ).map((f) => (
                              <label
                                key={f.id}
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                  preferredFit === f.id
                                    ? "border-accent bg-indigo-50 text-accent"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="pref-fit"
                                  className="sr-only"
                                  checked={preferredFit === f.id}
                                  onChange={() => setPreferredFit(f.id)}
                                />
                                {f.label}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setImportMenuOpen((v) => !v)}
                          disabled={importing}
                          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-navy-950 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {importing ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : null}
                          Import from store
                        </button>
                        <AnimatePresence>
                          {importMenuOpen && !importing && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
                              role="menu"
                            >
                              {[
                                "Import from Amazon",
                                "Import from Nordstrom",
                                "Import from Nike.com",
                              ].map((label) => (
                                <button
                                  key={label}
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-4 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-50"
                                  onClick={handleImport}
                                >
                                  {label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          className="rounded-md bg-navy-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          Save profile
                        </button>
                        <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                          Your profile improves recommendations across all products.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Feedback — after fit recommendation */}
            <section className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-black/[0.03]">
              <p className="font-medium text-navy-950">Was this helpful?</p>
              <p className="mt-1 text-sm text-slate-500">
                Your feedback trains the model for better recommendations.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleFeedback("up")}
                  disabled={feedback !== null}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50/50 disabled:opacity-50"
                >
                  <ThumbsUp className="h-4 w-4" aria-hidden />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback("down")}
                  disabled={feedback !== null}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-300 disabled:opacity-50"
                >
                  <ThumbsDown className="h-4 w-4" aria-hidden />
                  Not quite
                </button>
                <AnimatePresence mode="wait">
                  {feedback !== null && (
                    <motion.div
                      key="thanks"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100"
                      >
                        <Check className="h-4 w-4" aria-hidden />
                      </motion.span>
                      Thanks! This helps us learn your preferences
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="mt-4 text-2xs font-medium uppercase tracking-wide text-slate-400">
                You&apos;ve helped improve {helpedCount} recommendations
              </p>
            </section>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-navy-950 px-8 py-4 text-base font-semibold tracking-wide text-white shadow-md transition hover:bg-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Add to bag — $128
              </button>
              <RiskIndicator level="low" className="justify-center sm:justify-start" />
            </div>

            <p className="text-2xs text-slate-400">
              Complimentary returns within 30 days. Exclusions apply to personalized
              monograms.
            </p>
          </div>
        </div>

        {/* Below the fold */}
        <div className="mt-20 space-y-16 border-t border-slate-200/90 pt-16">
          <ExplanationPanel blocks={EVIDENCE_BLOCKS} />

          <ClarificationFlow
            questions={CLARIFICATION_QUESTIONS}
            onComplete={() => {
              if (!profileEnriched) applyEnrichedFit();
            }}
          />

          <AlternativesList products={ALT_PRODUCTS} onSelect={() => {}} />

          <section aria-labelledby="community-heading">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2
                id="community-heading"
                className="font-serif text-xl font-normal text-navy-950"
              >
                Community feedback
              </h2>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-violet-800 ring-1 ring-violet-100">
                Sourced from discussion
              </span>
            </div>
            <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-black/[0.03]">
              <div className="flex flex-wrap items-start gap-3">
                <EvidencePill
                  icon={MessageSquareQuote}
                  detail="Paraphrased for clarity; not endorsed by Reddit Inc."
                >
                  r/malefashionadvice
                </EvidencePill>
              </div>
              <blockquote className="mt-4 border-l-2 border-indigo-200 pl-4 font-serif text-lg leading-relaxed text-slate-800">
                &ldquo;Northline merino runs slightly snug in the chest—size up if you&apos;re
                between sizes.&rdquo;
              </blockquote>
              <p className="mt-3 text-sm text-slate-500">
                Frequently echoed in recent threads on merino layering and office
                wardrobes. Our Medium recommendation already factors a trim chest block.
              </p>
            </div>
          </section>

          <CartIntervention
            message="One more check before checkout"
            suggestion="If you plan to wear this over heavier oxford cloth, Large adds sleeve ease without drowning the shoulder—returns for your profile dropped 18% in testing."
          />
        </div>
      </main>
    </div>
  );
}
