"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Heart,
  Loader2,
  MessageSquareQuote,
  Package,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  StarHalf,
  ThumbsDown,
  ThumbsUp,
  Truck,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FitConfidenceModule } from "@/components/pdp/FitConfidenceModule";
import { SizeRecommendation } from "@/components/pdp/SizeRecommendation";
import { AlternativesList } from "@/components/pdp/AlternativesList";
import { ExplanationPanel } from "@/components/pdp/ExplanationPanel";
import { CartIntervention } from "@/components/cart/CartIntervention";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import { RiskIndicator } from "@/components/shared/RiskIndicator";
import { EvidencePill } from "@/components/shared/EvidencePill";

/* ─── Types ─── */
type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: { rating: number; comment: string; reviewerName: string; date: string }[];
  returnPolicy: string;
  images: string[];
  thumbnail: string;
};

type UserProfile = {
  name: string;
  gender: "men" | "women" | "neutral";
  height: string;
  weight: string;
  chest: string;
  shoeSize: string;
  fitPreference: "slim" | "regular" | "relaxed";
  skinSensitivity: "none" | "mild" | "sensitive";
};

type FeedbackRecord = { productId: number; helpful: boolean };

type View = "onboarding" | "browse" | "pdp";

const FASHION_CATEGORIES: Record<string, string[]> = {
  men: ["mens-shirts", "mens-shoes", "mens-watches", "sunglasses"],
  women: ["tops", "womens-dresses", "womens-shoes", "womens-bags", "womens-jewellery", "sunglasses"],
  neutral: ["tops", "mens-shirts", "womens-dresses", "mens-shoes", "womens-shoes", "sunglasses", "beauty", "furniture", "skin-care"],
};

const CATEGORY_LABELS: Record<string, string> = {
  "mens-shirts": "Shirts",
  "mens-shoes": "Shoes",
  "mens-watches": "Watches",
  tops: "Tops",
  "womens-dresses": "Dresses",
  "womens-shoes": "Shoes",
  "womens-bags": "Bags",
  "womens-jewellery": "Jewellery",
  sunglasses: "Sunglasses",
  beauty: "Beauty",
  furniture: "Furniture",
  "skin-care": "Skincare",
};

function fitScoreForProduct(p: DummyProduct, profile: UserProfile | null): number {
  if (!profile) return 55;
  let base = 62;
  if (profile.chest) base += 12;
  if (profile.height) base += 5;
  if (profile.weight) base += 4;
  if (profile.shoeSize && p.category.includes("shoes")) base += 8;
  const ratingBoost = Math.max(0, (p.rating - 3) * 5);
  base += ratingBoost;
  const reviewPenalty = p.reviews.some((r) => r.comment.toLowerCase().includes("disappoint")) ? -6 : 0;
  base += reviewPenalty;
  if (p.stock < 10) base -= 3;
  return Math.min(96, Math.max(42, base + (p.id % 7)));
}

function returnRiskForProduct(p: DummyProduct): "low" | "moderate" | "review" {
  if (p.rating >= 4.2 && p.stock > 20) return "low";
  if (p.rating >= 3.5) return "moderate";
  return "review";
}

/* ─── Onboarding Step ─── */
function OnboardingView({
  onComplete,
}: {
  onComplete: (profile: UserProfile) => void;
}) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    gender: "neutral",
    height: "",
    weight: "",
    chest: "",
    shoeSize: "",
    fitPreference: "regular",
    skinSensitivity: "none",
  });
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const simulateImport = (store: string) => {
    setImporting(store);
    setTimeout(() => {
      setProfile((p) => ({
        ...p,
        height: "5'10\"",
        weight: "175",
        chest: "40",
        shoeSize: "10",
        fitPreference: "regular",
      }));
      setImporting(null);
      setImported(true);
    }, 2200);
  };

  const canProceed = profile.name.trim().length > 0;

  return (
    <div className="min-h-screen bg-surface-light">
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-navy-950">FitConfidence</span>
          </Link>
          <span className="text-xs font-medium text-slate-400">Live Demo</span>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
            <UserCircle2 className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight text-navy-950 sm:text-4xl">
            Tell us about yourself
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Share a few details so we can analyze fit confidence and return risk
            on real products. Nothing is stored—this is a live demo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 space-y-6"
        >
          {/* Name + Gender */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-navy-950">Basics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Your name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Alex"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Shopping for</label>
                <div className="flex gap-2">
                  {(["men", "women", "neutral"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set("gender", g)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition ${
                        profile.gender === g
                          ? "border-indigo-300 bg-indigo-50 text-accent"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {g === "neutral" ? "All" : g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-navy-950">
                <Ruler className="mr-2 inline h-4 w-4 text-accent" />
                Measurements
                <span className="ml-2 text-xs font-normal text-slate-400">(optional — improves accuracy)</span>
              </h2>
              {imported && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> Imported
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Height</label>
                <select
                  value={profile.height}
                  onChange={(e) => set("height", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-950 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Select</option>
                  {["5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"","6'4\""].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Weight (lbs)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  placeholder="175"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Chest (in.)</label>
                <input
                  type="number"
                  value={profile.chest}
                  onChange={(e) => set("chest", e.target.value)}
                  placeholder="40"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Shoe size (US)</label>
                <input
                  type="text"
                  value={profile.shoeSize}
                  onChange={(e) => set("shoeSize", e.target.value)}
                  placeholder="10"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Preferred fit</label>
              <div className="flex gap-2">
                {(["slim", "regular", "relaxed"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => set("fitPreference", f)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                      profile.fitPreference === f
                        ? "border-indigo-300 bg-indigo-50 text-accent"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Import from Store */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6">
            <h2 className="mb-1 text-sm font-semibold text-navy-950">
              <Upload className="mr-2 inline h-4 w-4 text-accent" />
              Import from your favorite store
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              Auto-fill your measurements from past orders
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "amazon", label: "Amazon", color: "bg-orange-50 border-orange-200 text-orange-900" },
                { id: "nordstrom", label: "Nordstrom", color: "bg-slate-50 border-slate-300 text-slate-900" },
                { id: "nike", label: "Nike.com", color: "bg-slate-900 border-slate-800 text-white" },
                { id: "asos", label: "ASOS", color: "bg-blue-50 border-blue-200 text-blue-900" },
              ].map((store) => (
                <button
                  key={store.id}
                  type="button"
                  disabled={importing !== null}
                  onClick={() => simulateImport(store.id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:shadow-sm disabled:opacity-50 ${store.color}`}
                >
                  {importing === store.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {importing === store.id ? "Importing..." : store.label}
                </button>
              ))}
            </div>
          </div>

          {/* Proceed */}
          <motion.button
            type="button"
            disabled={!canProceed}
            onClick={() => onComplete(profile)}
            whileHover={canProceed ? { scale: 1.01 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-base font-semibold text-white shadow-md shadow-indigo-200/50 transition hover:bg-indigo-500 disabled:opacity-40 disabled:shadow-none"
          >
            Browse products with fit analysis
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}

/* ─── Product Card ─── */
function ProductCard({
  product,
  fitScore,
  risk,
  onClick,
}: {
  product: DummyProduct;
  fitScore: number;
  risk: "low" | "moderate" | "review";
  onClick: () => void;
}) {
  const riskStyles = {
    low: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    moderate: "bg-amber-50 text-amber-900 ring-amber-100",
    review: "bg-rose-50 text-rose-900 ring-rose-100",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-2xs font-semibold text-accent shadow-sm ring-1 ring-black/5 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {fitScore}% fit
          </span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ${riskStyles[risk]}`}>
            {risk === "low" ? "Low risk" : risk === "moderate" ? "Check fit" : "Review carefully"}
          </span>
        </div>
        {product.discountPercentage > 10 && (
          <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-2xs font-semibold text-white">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-2xs font-medium uppercase tracking-wide text-slate-400">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-navy-950 group-hover:text-accent">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-navy-950">${product.price.toFixed(2)}</span>
          {product.discountPercentage > 5 && (
            <span className="text-xs text-slate-400 line-through">
              ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
            />
          ))}
          <span className="ml-1 text-2xs text-slate-500">
            ({product.reviews.length})
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Browse View ─── */
function BrowseView({
  profile,
  products,
  loading,
  onSelectProduct,
  onEditProfile,
}: {
  profile: UserProfile;
  products: DummyProduct[];
  loading: boolean;
  onSelectProduct: (p: DummyProduct) => void;
  onEditProfile: () => void;
}) {
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(cats)];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-surface-light">
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-navy-950">FitConfidence</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
            >
              <UserCircle2 className="h-3.5 w-3.5" />
              {profile.name}
            </button>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-slate-200/60 bg-gradient-to-b from-indigo-50/40 to-transparent py-8">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Live product analysis
          </p>
          <h1 className="mt-1 font-serif text-2xl tracking-tight text-navy-950 sm:text-3xl">
            Browse with fit confidence, {profile.name}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-600">
            Every product below is pulled live from an open API. Fit scores and
            return-risk are computed using your profile.
          </p>

          {/* Category tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                  activeCategory === cat
                    ? "border-indigo-300 bg-indigo-50 text-accent"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {cat === "all" ? "All" : CATEGORY_LABELS[cat] ?? cat.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="mt-4 text-sm text-slate-500">
              Fetching live products and computing fit scores...
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                fitScore={fitScoreForProduct(p, profile)}
                risk={returnRiskForProduct(p)}
                onClick={() => onSelectProduct(p)}
              />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="py-20 text-center text-sm text-slate-500">
            No products in this category. Try &ldquo;All&rdquo;.
          </p>
        )}
      </main>
    </div>
  );
}

/* ─── PDP View ─── */
function PDPView({
  product,
  profile,
  allProducts,
  feedback,
  onBack,
  onFeedback,
  onSelectProduct,
}: {
  product: DummyProduct;
  profile: UserProfile;
  allProducts: DummyProduct[];
  feedback: FeedbackRecord[];
  onBack: () => void;
  onFeedback: (rec: FeedbackRecord) => void;
  onSelectProduct: (p: DummyProduct) => void;
}) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const fitScore = fitScoreForProduct(product, profile);
  const risk = returnRiskForProduct(product);
  const helpedCount = feedback.length;

  const sizes = useMemo(() => {
    if (product.category.includes("shoes")) {
      return [
        { id: "8", label: "US 8", confidence: fitScore - 18 },
        { id: "9", label: "US 9", confidence: fitScore - 5 },
        { id: "10", label: "US 10", confidence: fitScore + 2 },
        { id: "11", label: "US 11", confidence: fitScore - 10 },
      ].map((s) => ({ ...s, confidence: Math.min(98, Math.max(30, s.confidence)) }));
    }
    return [
      { id: "s", label: "S", confidence: Math.min(96, fitScore - 12) },
      { id: "m", label: "M", confidence: Math.min(98, fitScore + 3) },
      { id: "l", label: "L", confidence: Math.min(96, fitScore - 3) },
      { id: "xl", label: "XL", confidence: Math.min(90, fitScore - 20) },
    ].map((s) => ({ ...s, confidence: Math.max(30, s.confidence) }));
  }, [fitScore, product.category]);

  const bestSize = sizes.reduce((a, b) => (a.confidence > b.confidence ? a : b));

  const alts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 3)
      .map((p) => ({
        id: String(p.id),
        name: p.title,
        price: `$${p.price.toFixed(2)}`,
        fitLabel: fitScoreForProduct(p, profile) > fitScore ? "Stronger match" : "Similar fit",
        fitScore: fitScoreForProduct(p, profile),
        returnRisk: returnRiskForProduct(p) === "review" ? "elevated" as const : returnRiskForProduct(p) as "low" | "moderate",
        whyChip: p.rating > product.rating ? "Higher rated by buyers" : "Similar style, different cut",
        imageUrl: p.thumbnail,
        imageColor: "#c7d2fe",
      }));
  }, [allProducts, product, profile, fitScore]);

  const reviewInsights = useMemo(() => {
    const positive = product.reviews.filter((r) => r.rating >= 4);
    const negative = product.reviews.filter((r) => r.rating <= 2);
    return { positive, negative, total: product.reviews.length };
  }, [product.reviews]);

  const evidenceBlocks = useMemo(() => [
    {
      id: "1",
      title: "Product specifications",
      qualifier: `${product.brand} · ${product.sku}`,
      bullets: [
        `Weight: ${product.weight}oz, Dimensions: ${product.dimensions.width}×${product.dimensions.height}×${product.dimensions.depth}`,
        `${product.availabilityStatus} · ${product.stock} units in stock`,
        `Return policy: ${product.returnPolicy}`,
      ],
      kind: "structured" as const,
    },
    {
      id: "2",
      title: `Verified buyer reviews (${reviewInsights.total})`,
      qualifier: `${reviewInsights.positive.length} positive, ${reviewInsights.negative.length} critical`,
      bullets: product.reviews.slice(0, 3).map((r) => `"${r.comment}" — ${r.reviewerName} (${r.rating}/5)`),
      kind: "reviews" as const,
    },
    {
      id: "3",
      title: "Your profile match",
      qualifier: "Personalized",
      bullets: [
        profile.chest ? `Your chest measurement (${profile.chest}") factored into sizing` : "Add chest measurement for better sizing",
        `Fit preference: ${profile.fitPreference}`,
        profile.shoeSize && product.category.includes("shoes") ? `Your shoe size (US ${profile.shoeSize}) aligned to brand chart` : "Profile data used for confidence scoring",
      ],
      kind: "preferences" as const,
    },
  ], [product, profile, reviewInsights]);

  const giveFeedback = (helpful: boolean) => {
    setFeedbackGiven(helpful);
    onFeedback({ productId: product.id, helpful });
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Powered by</span>
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-navy-950">FitConfidence</span>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-5 py-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <button type="button" onClick={onBack} className="hover:text-navy-950">Products</button>
          <ChevronRight className="h-3 w-3" />
          <span className="capitalize">{product.category.replace(/-/g, " ")}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-navy-950">{product.title}</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_440px]">
          {/* Left: Images */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              <img
                src={product.images[selectedImg] ?? product.thumbnail}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-accent shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  {fitScore}% fit match
                </span>
              </div>
              <button type="button" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white">
                <Heart className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImg(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedImg === i ? "border-accent" : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Title + Price */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{product.brand}</p>
              <h1 className="mt-1 font-serif text-2xl tracking-tight text-navy-950">{product.title}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xl font-semibold text-navy-950">${product.price.toFixed(2)}</span>
                {product.discountPercentage > 5 && (
                  <span className="text-sm text-slate-400 line-through">
                    ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  if (i < Math.floor(product.rating)) return <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />;
                  if (i === Math.floor(product.rating) && product.rating % 1 >= 0.3) return <StarHalf key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />;
                  return <Star key={i} className="h-4 w-4 text-slate-200" />;
                })}
                <span className="ml-1 text-sm text-slate-500">
                  {product.rating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.description}</p>
            </div>

            {/* Fit Confidence */}
            <FitConfidenceModule
              state={fitScore >= 80 ? "confident" : fitScore >= 65 ? "uncertain" : "low-data"}
              score={fitScore}
              recommendedSize={bestSize.label}
              sizeConfidence={bestSize.confidence}
              riskLevel={risk}
              whyExplanation={`Based on your profile (${profile.fitPreference} fit preference${profile.chest ? `, ${profile.chest}" chest` : ""}) and ${reviewInsights.total} verified reviews. ${reviewInsights.negative.length > 0 ? `${reviewInsights.negative.length} buyer(s) noted concerns.` : "Buyers are largely satisfied."}`}
              evidence={[
                { icon: MessageSquareQuote, text: `${reviewInsights.positive.length} positive reviews`, detail: reviewInsights.positive[0]?.comment ?? "Good feedback from buyers" },
                { icon: Sparkles, text: `${profile.fitPreference} fit preference`, detail: "Your saved preference applied to scoring" },
                { icon: UserCircle2, text: `Profile: ${profile.name}`, detail: profile.chest ? `${profile.chest}" chest, ${profile.height || "height not set"}` : "Add measurements for better accuracy" },
              ]}
            />

            {/* Size */}
            <SizeRecommendation
              sizes={sizes}
              selectedId={bestSize.id}
              brandTendency={product.rating >= 4 ? "true_to_size" : "runs_small"}
              fitNotes={product.reviews.slice(0, 2).map((r) => `"${r.comment}" — ${r.reviewerName}`)}
            />

            {/* Feedback */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-950">Was this recommendation helpful?</h3>
              <p className="mt-1 text-xs text-slate-500">Your feedback trains the model for better results</p>
              {feedbackGiven === null ? (
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => giveFeedback(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <ThumbsUp className="h-4 w-4" /> Yes, helpful
                  </button>
                  <button
                    type="button"
                    onClick={() => giveFeedback(false)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ThumbsDown className="h-4 w-4" /> Not quite
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100"
                >
                  <Check className="h-4 w-4" />
                  Thanks! This helps us learn your preferences.
                </motion.div>
              )}
              {helpedCount > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  You&apos;ve helped improve {helpedCount} recommendation{helpedCount > 1 ? "s" : ""} this session
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setAddedToCart(true)}
                disabled={addedToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-950 py-4 text-base font-semibold text-white shadow-md transition hover:bg-navy-900 disabled:bg-emerald-600"
              >
                {addedToCart ? (
                  <><Check className="h-5 w-5" /> Added to cart</>
                ) : (
                  <><ShoppingBag className="h-5 w-5" /> Add to cart — ${product.price.toFixed(2)}</>
                )}
              </button>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> {product.shippingInformation}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> {product.returnPolicy}
                </span>
              </div>
              <RiskIndicator level={risk} className="flex justify-center" />
            </div>
          </div>
        </div>

        {/* Below the fold */}
        <div className="mt-12 space-y-10">
          <ExplanationPanel blocks={evidenceBlocks} />

          {/* Community Feedback */}
          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-violet-500" />
              <h3 className="font-serif text-xl text-navy-950">Community feedback</h3>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-2xs font-semibold text-violet-700 ring-1 ring-violet-100">
                Secondary signal
              </span>
            </div>
            <div className="space-y-3">
              {product.reviews.map((r, i) => (
                <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{r.reviewerName}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5">
                      {r.rating}/5 <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">&ldquo;{r.comment}&rdquo;</p>
                </div>
              ))}
              <p className="text-2xs text-slate-400">
                Community feedback is used as secondary evidence only and does not override structured data.
              </p>
            </div>
          </section>

          {alts.length > 0 && (
            <AlternativesList
              products={alts}
              onSelect={(id) => {
                const p = allProducts.find((x) => String(x.id) === id);
                if (p) onSelectProduct(p);
              }}
            />
          )}

          <CartIntervention
            message={`${profile.name}, based on your profile the ${bestSize.label} is your best match. ${fitScore < 80 ? "Consider the alternatives above if you want a safer pick." : "This looks like a strong fit."}`}
            suggestion={fitScore >= 80
              ? `Your fit confidence is ${fitScore}% — you can buy with confidence.`
              : `Consider trying ${sizes.find((s) => s.id !== bestSize.id && s.confidence > 60)?.label ?? "a different size"} as well.`}
          />
        </div>
      </main>
    </div>
  );
}

/* ─── Main Page ─── */
export default function DemoPage() {
  const [view, setView] = useState<View>("onboarding");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<DummyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DummyProduct | null>(null);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);

  const fetchProducts = useCallback(async (gender: UserProfile["gender"]) => {
    setLoading(true);
    try {
      const cats = FASHION_CATEGORIES[gender] ?? FASHION_CATEGORIES.neutral;
      const fetches = cats.map((cat) =>
        fetch(`https://dummyjson.com/products/category/${cat}?limit=8`)
          .then((r) => r.json())
          .then((d) => (d.products ?? []) as DummyProduct[])
          .catch(() => [] as DummyProduct[])
      );
      const results = await Promise.all(fetches);
      setProducts(results.flat());
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(
    (p: UserProfile) => {
      setProfile(p);
      setView("browse");
      void fetchProducts(p.gender);
    },
    [fetchProducts],
  );

  const selectProduct = useCallback((p: DummyProduct) => {
    setSelectedProduct(p);
    setView("pdp");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const addFeedback = useCallback((rec: FeedbackRecord) => {
    setFeedback((prev) => [...prev, rec]);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {view === "onboarding" && (
        <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <OnboardingView onComplete={completeOnboarding} />
        </motion.div>
      )}
      {view === "browse" && profile && (
        <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BrowseView
            profile={profile}
            products={products}
            loading={loading}
            onSelectProduct={selectProduct}
            onEditProfile={() => setView("onboarding")}
          />
        </motion.div>
      )}
      {view === "pdp" && profile && selectedProduct && (
        <motion.div key="pdp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <PDPView
            product={selectedProduct}
            profile={profile}
            allProducts={products}
            feedback={feedback}
            onBack={() => setView("browse")}
            onFeedback={addFeedback}
            onSelectProduct={selectProduct}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
