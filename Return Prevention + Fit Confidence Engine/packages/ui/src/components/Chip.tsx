import React from 'react';
import { colors } from '../tokens/colors';

export interface ChipProps {
  /** Visible label */
  children: React.ReactNode;
  /** Selected / applied state */
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Chip({
  children,
  active = false,
  onClick,
  disabled = false,
  className,
  style,
}: ChipProps): React.ReactElement {
  const interactive = typeof onClick === 'function' && !disabled;
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={{
        cursor: interactive ? 'pointer' : 'default',
        border: `1px solid ${active ? colors.primary.indigo : colors.slate[300]}`,
        background: active ? 'rgba(79, 70, 229, 0.1)' : colors.slate[50],
        color: active ? colors.primary.indigoDark : colors.slate[700],
        borderRadius: 999,
        padding: '6px 12px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        transition: 'background 120ms ease, border-color 120ms ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
