import Hero from "@/components/landing/Hero";
import ProblemStatement from "@/components/landing/ProblemStatement";
import HowItWorks from "@/components/landing/HowItWorks";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Features from "@/components/landing/Features";
import SocialProof from "@/components/landing/SocialProof";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";

/**
 * Outcome bridge — appears between Problem and HowItWorks.
 * Shows POSITIVE proof stats (what CIOS achieves) to pivot from
 * problem to solution. Deliberately different numbers from the
 * problem cards above so there is zero repetition.
 */
function OutcomeBridge() {
  const outcomes = [
    { value: "94%",   label: "attribute extraction accuracy",       detail: "vs. industry avg of ~60% with manual processes" },
    { value: "10×",   label: "faster new supplier onboarding",      detail: "days instead of weeks, no spreadsheet cleanup" },
    { value: "<2%",   label: "taxonomy misclassification after CIOS", detail: "down from the 15–25% industry average" },
    { value: "~0%",   label: "duplicate SKU rate after entity resolution", detail: "down from the typical 5–10% in legacy PIMs" },
  ];
  return (
    <div className="border-t border-white/5 bg-[#08080c] pb-16 pt-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-brand-400">
          What changes after CIOS
        </p>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {outcomes.map(({ value, label, detail }) => (
            <div key={value} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
              <p className="text-4xl font-extrabold tabular-nums text-white sm:text-5xl">{value}</p>
              <p className="mt-2 text-sm font-medium text-white/80">{label}</p>
              <p className="mt-1 text-xs text-white/35">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Mid-page CTA strip — appears after Before/After to capture
 * visitors who are convinced before reading Features/Pricing.
 */
function TryItBanner() {
  return (
    <div className="bg-gradient-to-r from-brand-600 to-violet-600 py-14">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          See CIOS work on your own catalog data
        </h2>
        <p className="mt-3 text-base text-white/80">
          Upload a CSV, type in a single SKU, or explore with our built-in sample
          dataset. No account, no API key, no setup required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/ingest"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5
                       text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
          >
            Upload a CSV
          </a>
          <a
            href="/ingest?mode=sample"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30
                       bg-white/10 px-8 py-3.5 text-base font-semibold text-white
                       backdrop-blur-sm transition hover:bg-white/20"
          >
            Explore sample data
          </a>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* 1. Hook — problem + preview */}
      <Hero />

      {/* 2. Problem — why this is expensive */}
      <ProblemStatement />

      {/* 3. Outcome bridge — proof that CIOS solves it */}
      <OutcomeBridge />

      {/* 4. Process — exactly how it works, step by step */}
      <HowItWorks />

      {/* 5. Visual proof — same SKU before vs after */}
      <BeforeAfter />

      {/* 6. Mid-page CTA — capture convinced visitors early */}
      <TryItBanner />

      {/* 7. Capabilities — the full feature set */}
      <Features />

      {/* 8. Social proof — customers and metrics */}
      <SocialProof />

      {/* 9. Pricing */}
      <Pricing />

      {/* 10. Objection handling */}
      <FAQ />

      {/* 11. Final CTA */}
      <CTASection />
    </>
  );
}
