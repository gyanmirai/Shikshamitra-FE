'use client';

import type { ReactNode } from 'react';

import { useRef } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Box, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import CustomTooltip from './index';

/** Keep the accessible hit target while positioning help against the visible icon. */
export function InfoTooltipIcon({
  title,
  label,
  disabled = false,
}: {
  title: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  return (
    <CustomTooltip
      title={title}
      describeChild
      arrow
      placement="right"
      slotProps={{
        popper: () => {
          const boundary = anchorRef.current?.closest('[role="dialog"]') ?? undefined;

          return {
            anchorEl: () => anchorRef.current!,
            modifiers: [
              {
                name: 'flip',
                options: { boundary, padding: 8, fallbackPlacements: ['left', 'top', 'bottom'] },
              },
              { name: 'preventOverflow', options: { boundary, padding: 8, altAxis: true } },
            ],
          };
        },
      }}
    >
      <IconButton
        aria-label={label}
        size="small"
        color="info"
        disabled={disabled}
        sx={{ width: 44, height: 44, flexShrink: 0 }}
      >
        <Box
          ref={anchorRef}
          component="span"
          sx={{ width: 16, height: 16, display: 'inline-flex', flexShrink: 0 }}
        >
          <Iconify icon={GlobalIcons.info} width={16} aria-hidden />
        </Box>
      </IconButton>
    </CustomTooltip>
  );
}
