import React from 'react';
import { colors } from '../tokens/colors';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/** Shimmer skeleton block; pair with reduced-motion preference in host app if needed. */
export function Skeleton({
  width = '100%',
  height = 14,
  borderRadius = 8,
  className,
  style,
}: SkeletonProps): React.ReactElement {
  const w = typeof width === 'number' ? `${width}px` : width;
  const h = typeof height === 'number' ? `${height}px` : height;
  const r = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        width: w,
        height: h,
        borderRadius: r,
        background: `linear-gradient(
          110deg,
          ${colors.slate[200]} 0%,
          ${colors.slate[100]} 45%,
          ${colors.slate[200]} 90%
        )`,
        backgroundSize: '200% 100%',
        animation: 'fc-skeleton-shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes fc-skeleton-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </span>
  );
}
