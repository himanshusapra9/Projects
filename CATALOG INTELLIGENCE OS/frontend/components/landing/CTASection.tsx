export default function CTASection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden border-t border-white/10 bg-[#050508] py-24 text-white sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900/50 via-[#0a0a0f] to-violet-950/40" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-cyan-500/15 blur-[90px]" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Stop Losing Revenue to{" "}
          <span className="bg-gradient-to-r from-white via-brand-200 to-cyan-200 bg-clip-text text-transparent">
            Bad Catalog Data
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/65">
          Ship a pilot with your messiest category. See enriched SKUs, quality
          scores, and review-ready diffs—before you renegotiate another channel
          contract.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="mailto:hello@cios.example"
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 sm:w-auto"
          >
            Start Your Free Pilot
          </a>
        </div>
        <p className="mt-6 text-sm text-white/45">
          No credit card required. See results in 48 hours.
        </p>
      </div>
    </section>
  );
}
