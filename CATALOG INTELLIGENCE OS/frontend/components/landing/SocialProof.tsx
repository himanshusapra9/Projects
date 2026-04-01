import { Star } from "lucide-react";

const testimonials = [
  {
    company: "Northline Supply Co.",
    logo: "NORTHLINE",
    quote:
      "We cut time-to-activate for new vendors by more than half. Search revenue on long-tail queries finally moved the needle.",
    metric: "+18% organic search revenue (90 days)",
    role: "VP E‑commerce",
    rating: 5,
  },
  {
    company: "BrightCart Retail",
    logo: "BRIGHTCART",
    quote:
      "The review queue turned our merchandisers into editors, not spreadsheet jockeys. Confidence scores made approvals fast.",
    metric: "−32% catalog-related support tickets",
    role: "Director of Product Data",
    rating: 5,
  },
  {
    company: "Atlas Outdoor",
    logo: "ATLAS",
    quote:
      "Syndication stopped breaking on attribute mismatches. We trust the evidence trail for seasonal launches.",
    metric: "4× faster seasonal SKU onboarding",
    role: "Head of Digital Ops",
    rating: 5,
  },
] as const;

export default function SocialProof() {
  return (
    <section className="border-t border-white/5 bg-[#0c0c12] py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Teams Shipping Faster with{" "}
            <span className="bg-gradient-to-r from-amber-200 to-brand-300 bg-clip-text text-transparent">
              Cleaner Catalogs
            </span>
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Fictional brands, real outcomes you can expect when intelligence sits
            on top of your product data.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.company}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-xl shadow-black/20 transition hover:border-white/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs font-bold tracking-[0.2em] text-white/90"
                  aria-label={t.company}
                >
                  {t.logo}
                </div>
                <div
                  className="flex gap-0.5"
                  aria-label={`${t.rating} out of 5 stars`}
                >
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
              <blockquote className="mt-6 text-base leading-relaxed text-white/80">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6">
                <p className="text-sm font-semibold text-brand-300">{t.metric}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-white/45">
                  {t.role} · {t.company}
                </p>
              </figcaption>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
