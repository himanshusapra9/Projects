"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function scoreToHue(score: number): number {
  const s = Math.max(0, Math.min(100, score));
  return 12 + (s / 100) * 108;
}

export type ConfidenceMeterProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  "aria-label"?: string;
};

export function ConfidenceMeter({
  score,
  size = 120,
  strokeWidth = 8,
  className = "",
  label,
  "aria-label": ariaLabel,
}: ConfidenceMeterProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useMotionValue(0);
  const springProgress = useSpring(progress, { stiffness: 80, damping: 18 });
  const strokeDashoffset = useTransform(
    springProgress,
    [0, 100],
    [circumference, 0],
  );

  useEffect(() => {
    progress.set(score);
  }, [score, progress]);

  const hue = scoreToHue(score);

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className}`}
      role="img"
      aria-label={
        ariaLabel ?? `Fit confidence ${Math.round(score)} percent${label ? `. ${label}` : ""}`
      }
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-slate-200"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={`hsl(${hue} 72% 42%)`}
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-semibold tabular-nums tracking-tight text-navy-950"
          style={{ fontSize: size * 0.22 }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          {Math.round(score)}
        </motion.span>
        {label && (
          <span className="mt-0.5 max-w-[7rem] text-center text-2xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
