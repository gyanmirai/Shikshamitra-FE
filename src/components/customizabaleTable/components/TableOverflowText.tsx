'use client';

import type { TypographyProps } from '@mui/material';

import { Typography } from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = Pick<TypographyProps, 'variant' | 'color' | 'fontWeight' | 'sx'> & {
  children: string | number;
  lines?: 1 | 2;
};

export function TableOverflowText({ children, lines = 1, sx, ...typographyProps }: Props) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isClipped, setIsClipped] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return undefined;

    const measure = () => {
      setIsClipped(
        element.clientWidth > 0 &&
          (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight)
      );
    };
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [children, lines]);

  return (
    <CustomTooltip
      title={isClipped ? <span>{children}</span> : ''}
      describeChild
      arrow
      disableInteractive
      disableFocusListener={!isClipped}
      disableHoverListener={!isClipped}
      disableTouchListener={!isClipped}
    >
      <Typography
        {...typographyProps}
        ref={textRef}
        component="span"
        noWrap={lines === 1}
        tabIndex={isClipped ? 0 : undefined}
        sx={[
          {
            display: lines === 1 ? 'block' : '-webkit-box',
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            ...(lines === 2 && {
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: lines,
              overflowWrap: 'anywhere',
            }),
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: -2,
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Typography>
    </CustomTooltip>
  );
}
