import React, { useId, useState } from 'react';
import { colors } from '../tokens/colors';
import { shadows } from '../tokens/shadows';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom';
  /** Delay before show (ms) */
  openDelay?: number;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  openDelay = 120,
}: TooltipProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const id = useId();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const show = (): void => {
    timer = setTimeout(() => setOpen(true), openDelay);
  };
  const hide = (): void => {
    if (timer) clearTimeout(timer);
    setOpen(false);
  };

  const props = children.props as {
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
  };
  const child = React.cloneElement(children, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      props.onBlur?.(e);
    },
  });

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {child}
      {open ? (
        <span
          id={id}
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(placement === 'top' ? { bottom: '100%', marginBottom: 8 } : { top: '100%', marginTop: 8 }),
            zIndex: 50,
            minWidth: 120,
            maxWidth: 280,
            padding: '8px 10px',
            borderRadius: 8,
            background: colors.slate[900],
            color: colors.slate[50],
            fontSize: '0.75rem',
            lineHeight: 1.45,
            boxShadow: shadows.lg,
            pointerEvents: 'none',
          }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
