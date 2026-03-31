import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#12121A",
        "surface-hover": "#1A1A26",
        border: "#1E1E2E",
        "border-light": "#2A2A3E",
        foreground: "#E4E4E7",
        "foreground-muted": "#71717A",
        accent: "#6366F1",
        "accent-hover": "#818CF8",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        "confidence-high": "#10B981",
        "confidence-medium": "#F59E0B",
        "confidence-low": "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
