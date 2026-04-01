import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        gradient: "gradient 8s ease infinite",
        "hero-field-1": "heroFieldReveal 0.6s ease-out 0.2s both",
        "hero-field-2": "heroFieldReveal 0.6s ease-out 0.5s both",
        "hero-field-3": "heroFieldReveal 0.6s ease-out 0.8s both",
        "hero-field-4": "heroFieldReveal 0.6s ease-out 1.1s both",
        "hero-badge-1": "heroBadgePop 0.35s ease-out 0.9s both",
        "hero-badge-2": "heroBadgePop 0.35s ease-out 1.2s both",
        "hero-badge-3": "heroBadgePop 0.35s ease-out 1.5s both",
        "orb-float": "orbFloat 14s ease-in-out infinite",
        "bar-grow": "widthGrow 2.2s ease-out 0.3s both",
      },
      keyframes: {
        widthGrow: {
          from: { width: "0%" },
          to: { width: "94%" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        heroFieldReveal: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        heroBadgePop: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        orbFloat: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
