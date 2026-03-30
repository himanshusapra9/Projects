/**
 * Brand + semantic palette. Use JS constants in components; inject cssVars string for global theme.
 */

export const colors = {
  primary: {
    navy: '#0b1224',
    white: '#f8fafc',
    indigo: '#4f46e5',
    indigoDark: '#3730a3',
  },
  semantic: {
    confidence: '#059669',
    caution: '#d97706',
    risk: '#e11d48',
    info: '#0284c7',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
} as const;

/** Flattened CSS custom property map for runtime theming. */
export const cssCustomProperties: Record<string, string> = {
  '--fc-primary-navy': colors.primary.navy,
  '--fc-primary-white': colors.primary.white,
  '--fc-accent-indigo': colors.primary.indigo,
  '--fc-accent-indigo-dark': colors.primary.indigoDark,
  '--fc-semantic-confidence': colors.semantic.confidence,
  '--fc-semantic-caution': colors.semantic.caution,
  '--fc-semantic-risk': colors.semantic.risk,
  '--fc-semantic-info': colors.semantic.info,
  ...Object.fromEntries(
    Object.entries(colors.slate).map(([k, v]) => [`--fc-slate-${k}`, v] as const),
  ),
};

/** Inject once in app root: `<style dangerouslySetInnerHTML={{ __html: cssVars }} />` */
export const cssVars = `:root {
${Object.entries(cssCustomProperties)
  .map(([k, v]) => `  ${k}: ${v};`)
  .join('\n')}
}`;
