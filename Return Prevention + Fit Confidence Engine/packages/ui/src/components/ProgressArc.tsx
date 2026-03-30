import React, { useMemo } from 'react';
import { colors } from '../tokens/colors';

export interface ProgressArcProps {
  /** Progress ∈ [0, 1] */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Label in center */
  label?: string;
  sublabel?: string;
  tone?: 'confidence' | 'risk' | 'neutral';
}

function toneColor(tone: ProgressArcProps['tone']): string {
  if (tone === 'confidence') return colors.semantic.confidence;
  if (tone === 'risk') return colors.semantic.risk;
  return colors.primary.indigo;
}

export function ProgressArc({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  tone = 'neutral',
}: ProgressArcProps): React.ReactElement {
  const v = Math.max(0, Math.min(1, value));
  const r = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - v);

  const stroke = toneColor(tone);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} role="img">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={colors.slate[200]}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {(label || sublabel) && (
        <text
          x="50%"
          y={sublabel ? '46%' : '50%'}
          dominantBaseline="middle"
          textAnchor="middle"
          fill={colors.slate[800]}
          fontSize={size * 0.16}
          fontWeight={600}
        >
          {label}
        </text>
      )}
      {sublabel && (
        <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill={colors.slate[500]} fontSize={size * 0.09}>
          {sublabel}
        </text>
      )}
    </svg>
  );
}
