/**
 * Design tokens for the Discovery Copilot design system.
 *
 * Visual language: Premium commerce meets AI clarity.
 * Inspired by: Apple clarity, Linear polish, Stripe sharpness.
 * Avoids: chatbot aesthetic, enterprise density, template-marketplace look.
 */

export const colors = {
  background: {
    primary: '#FAFAF9',    // warm off-white — softer than pure white
    secondary: '#F5F5F4',  // stone-100
    tertiary: '#E7E5E4',   // stone-200
    elevated: '#FFFFFF',
    inverse: '#1C1917',    // stone-900
  },
  foreground: {
    primary: '#1C1917',    // stone-900 — sharp, high contrast
    secondary: '#57534E',  // stone-600
    tertiary: '#A8A29E',   // stone-400
    inverse: '#FAFAF9',
    muted: '#D6D3D1',      // stone-300
  },
  accent: {
    primary: '#18181B',    // zinc-900 — dark accent for primary CTA
    primaryHover: '#27272A',
    secondary: '#F59E0B',  // amber-500 — warm gold for badges/highlights
    secondaryHover: '#D97706',
  },
  semantic: {
    success: '#059669',    // emerald-600
    successSoft: '#ECFDF5',
    warning: '#D97706',    // amber-600
    warningSoft: '#FFFBEB',
    danger: '#DC2626',     // red-600
    dangerSoft: '#FEF2F2',
    info: '#2563EB',       // blue-600
    infoSoft: '#EFF6FF',
  },
  badge: {
    bestPick: { bg: '#18181B', text: '#FFFFFF' },
    bestValue: { bg: '#EFF6FF', text: '#1D4ED8' },
    lowReturnRisk: { bg: '#ECFDF5', text: '#047857' },
    topRated: { bg: '#FFFBEB', text: '#B45309' },
    useCase: { bg: '#F5F3FF', text: '#6D28D9' },
    budgetFriendly: { bg: '#ECFDF5', text: '#047857' },
  },
  border: {
    default: '#E7E5E4',    // stone-200
    subtle: '#F5F5F4',     // stone-100
    strong: '#D6D3D1',     // stone-300
    focus: '#18181B',
  },
} as const;

export const typography = {
  fontFamily: {
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    base: '0.875rem', // 14px
    md: '0.9375rem',  // 15px
    lg: '1.0625rem',  // 17px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.15',
    snug: '1.3',
    normal: '1.5',
    relaxed: '1.625',
  },
  letterSpacing: {
    tighter: '-0.03em',
    tight: '-0.02em',
    normal: '-0.011em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const spacing = {
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem',       // 128px
} as const;

export const radius = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.25rem', // 20px
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.03)',
  card: '0 1px 3px 0 rgb(0 0 0 / 0.03), 0 0 0 1px rgb(0 0 0 / 0.02)',
  cardHover: '0 8px 24px -4px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.03)',
  bestPick: '0 0 0 2px #18181B, 0 8px 24px -4px rgb(0 0 0 / 0.12)',
} as const;

export const motion = {
  duration: {
    instant: '50ms',
    fast: '100ms',
    normal: '200ms',
    smooth: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.2, 0, 0, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  framer: {
    fadeUp: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: [0.2, 0, 0, 1] } },
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25 } },
    scaleIn: { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3, ease: [0.2, 0, 0, 1] } },
    stagger: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
} as const;

export const layout = {
  maxWidth: '1280px',
  contentMaxWidth: '720px',
  sidebarWidth: '320px',
  headerHeight: '64px',
  searchBarMaxWidth: '640px',
} as const;
