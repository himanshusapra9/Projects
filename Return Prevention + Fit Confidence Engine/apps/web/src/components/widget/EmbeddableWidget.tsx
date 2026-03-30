"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import { EvidencePill } from "@/components/shared/EvidencePill";
import { MessageSquareQuote, Sparkles } from "lucide-react";

export type EmbeddableWidgetTheme = "light" | "dark" | "inherit";

export type EmbeddableWidgetProps = {
  productName?: string;
  score?: number;
  recommendedSize?: string;
  theme?: EmbeddableWidgetTheme;
  className?: string;
};

const themeVars: Record<
  Exclude<EmbeddableWidgetTheme, "inherit">,
  React.CSSProperties
> = {
  light: {
    ["--w-bg" as string]: "#fafbfc",
    ["--w-fg" as string]: "#0f172a",
    ["--w-muted" as string]: "#64748b",
    ["--w-border" as string]: "rgba(15, 23, 42, 0.08)",
  },
  dark: {
    ["--w-bg" as string]: "#0a1628",
    ["--w-fg" as string]: "#f8fafc",
    ["--w-muted" as string]: "#94a3b8",
    ["--w-border" as string]: "rgba(248, 250, 252, 0.1)",
  },
};

/**
 * Self-contained widget shell suitable for embedding (e.g. shadow DOM host).
 * Pass theme + CSS variables for merchant white-labeling.
 */
export function EmbeddableWidget({
  productName = "Merino crewneck",
  score = 88,
  recommendedSize = "M",
  theme = "light",
  className = "",
}: EmbeddableWidgetProps) {
  const style = useMemo(() => {
    if (theme === "inherit") return undefined;
    return themeVars[theme];
  }, [theme]);

  return (
    <motion.div
      layout
      style={style}
      className={`embed-fit-widget rounded-lg border bg-[var(--w-bg,#fafbfc)] p-4 shadow-md ring-1 ring-black/[0.04] ${className}`}
    >
      <div
        className="flex items-start justify-between gap-4 border-b pb-4"
        style={{ borderColor: "var(--w-border, rgba(15,23,42,0.08))" }}
      >
        <div>
          <p
            className="text-2xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--w-muted, #64748b)" }}
          >
            Fit confidence
          </p>
          <p
            className="mt-1 text-sm font-semibold leading-snug"
            style={{ color: "var(--w-fg, #0f172a)" }}
          >
            {productName}
          </p>
        </div>
        <ConfidenceMeter score={score} size={88} label="Match" />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div>
          <p
            className="text-2xs font-medium uppercase tracking-wide"
            style={{ color: "var(--w-muted, #64748b)" }}
          >
            Size
          </p>
          <p
            className="font-serif text-2xl tabular-nums"
            style={{ color: "var(--w-fg, #0f172a)" }}
          >
            {recommendedSize}
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-2xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
          Low return risk
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <EvidencePill
          icon={MessageSquareQuote}
          detail="Recent reviews mention a slim sleeve."
        >
          Reviews: slim sleeve
        </EvidencePill>
        <EvidencePill icon={Sparkles} detail="You prefer relaxed knits.">
          Pref: relaxed
        </EvidencePill>
      </div>
    </motion.div>
  );
}
