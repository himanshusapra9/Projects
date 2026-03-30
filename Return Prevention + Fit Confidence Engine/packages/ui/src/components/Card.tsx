import React from 'react';
import { colors } from '../tokens/colors';
import { shadows } from '../tokens/shadows';

export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

const elevationShadow: Record<CardElevation, string> = {
  none: shadows.none,
  sm: shadows.sm,
  md: shadows.md,
  lg: shadows.lg,
};

export interface CardProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  padding?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({
  children,
  elevation = 'md',
  padding = 20,
  className,
  style,
}: CardProps): React.ReactElement {
  const p = typeof padding === 'number' ? `${padding}px` : padding;
  return (
    <div
      className={className}
      style={{
        background: colors.primary.white,
        color: colors.slate[800],
        borderRadius: 14,
        border: `1px solid ${colors.slate[200]}`,
        boxShadow: elevationShadow[elevation],
        padding: p,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
