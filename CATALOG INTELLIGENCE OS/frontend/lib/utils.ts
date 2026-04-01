import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatScore(value: number): string {
  return value.toFixed(2);
}

export function getQualityColor(score: number): string {
  if (score >= 0.9) return "text-emerald-500";
  if (score >= 0.75) return "text-blue-500";
  if (score >= 0.6) return "text-amber-500";
  return "text-red-500";
}

export function getQualityBgColor(score: number): string {
  if (score >= 0.9) return "bg-emerald-500";
  if (score >= 0.75) return "bg-blue-500";
  if (score >= 0.6) return "bg-amber-500";
  return "bg-red-500";
}

export function getQualityLabel(score: number): string {
  if (score >= 0.9) return "Excellent";
  if (score >= 0.75) return "Good";
  if (score >= 0.6) return "Fair";
  return "Poor";
}
