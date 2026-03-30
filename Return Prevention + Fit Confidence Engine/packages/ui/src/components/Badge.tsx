import React from 'react';
import { colors } from '../tokens/colors';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantStyles: Record<
  BadgeVariant,
  { bg: string; fg: string; border: string }
> = {
  success: {
    bg: 'rgba(5, 150, 105, 0.12)',
    fg: colors.semantic.confidence,
    border: 'rgba(5, 150, 105, 0.35)',
  },
  warning: {
    bg: 'rgba(217, 119, 6, 0.12)',
    fg: colors.semantic.caution,
    border: 'rgba(217, 119, 6, 0.35)',
  },
  danger: {
    bg: 'rgba(225, 29, 72, 0.1)',
    fg: colors.semantic.risk,
    border: 'rgba(225, 29, 72, 0.35)',
  },
  info: {
    bg: 'rgba(2, 132, 199, 0.1)',
    fg: colors.semantic.info,
    border: 'rgba(2, 132, 199, 0.35)',
  },
  neutral: {
    bg: colors.slate[100],
    fg: colors.slate[700],
    border: colors.slate[200],
  },
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'neutral', className, style }: BadgeProps): React.ReactElement {
  const v = variantStyles[variant];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.border}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
