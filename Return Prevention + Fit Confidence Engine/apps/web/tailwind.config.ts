import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          dark: "var(--color-surface-dark)",
          light: "var(--color-surface-light)",
        },
        confidence: {
          from: "var(--color-confidence-from)",
          to: "var(--color-confidence-to)",
        },
        caution: "var(--color-caution)",
        risk: "var(--color-risk-muted)",
        accent: "var(--color-accent)",
        navy: {
          DEFAULT: "#0A1628",
          50: "#f4f6f9",
          100: "#e8ecf2",
          200: "#d1dae6",
          300: "#a8b8cc",
          400: "#7890ad",
          500: "#5a7194",
          600: "#475a78",
          700: "#3b4a62",
          800: "#334053",
          900: "#2d3747",
          950: "#0A1628",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      spacing: {
        0.5: "2px",
        1.5: "6px",
        2.5: "10px",
        3.5: "14px",
        4.5: "18px",
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        glow: "0 0 0 1px rgba(99, 102, 241, 0.12), 0 24px 48px -12px rgba(10, 22, 40, 0.18)",
      },
      transitionDuration: {
        DEFAULT: "250ms",
        200: "200ms",
        300: "300ms",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
