import type { PaperProps } from '@mui/material/Paper';

import { useRef, useState, useEffect } from 'react';

import Popover from '@mui/material/Popover';
import { listClasses } from '@mui/material/List';
import { menuItemClasses } from '@mui/material/MenuItem';

import { StyledArrow } from './styles';
import { calculateAnchorOrigin } from './utils';

import type { CustomPopoverProps } from './types';

// ----------------------------------------------------------------------

export function CustomPopover({
  open,
  onClose,
  children,
  anchorEl,
  slotProps,
  ...other
}: CustomPopoverProps) {
  const arrowPlacement = slotProps?.arrow?.placement ?? 'top-right';

  const arrowSize = slotProps?.arrow?.size ?? 14;

  const arrowOffset = slotProps?.arrow?.offset ?? 17;

  const popoverRef = useRef<HTMLDivElement | null>(null);
  // 👇 Key to force Popover re-render on open or anchor change
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (open && anchorEl) {
      // Wait for layout to stabilize, then force a re-render
      requestAnimationFrame(() => setKey((prev) => prev + 1));
    }
  }, [open, anchorEl]);
  const { paperStyles, anchorOrigin, transformOrigin } = calculateAnchorOrigin(arrowPlacement);

  return (
    <Popover
      ref={popoverRef}
      key={key}
      disablePortal
      open={!!open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        ...slotProps,
        paper: {
          ...slotProps?.paper,
          sx: {
            ...paperStyles,
            overflow: 'inherit',
            [`& .${listClasses.root}`]: { minWidth: 140 },
            [`& .${menuItemClasses.root}`]: { gap: 2 },
            ...(slotProps?.paper as PaperProps)?.sx,
          },
        },
      }}
      {...other}
    >
      {!slotProps?.arrow?.hide && (
        <StyledArrow
          sx={slotProps?.arrow?.sx}
          placement={arrowPlacement}
          offset={arrowOffset}
          size={arrowSize}
        />
      )}

      {children}
    </Popover>
  );
}
