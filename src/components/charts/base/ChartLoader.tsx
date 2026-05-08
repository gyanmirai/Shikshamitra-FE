'use client';

import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  variant?: 'rectangular' | 'circular';
};

export function ChartLoader({ variant = 'rectangular', sx, ...other }: Props) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 'inherit',
        borderRadius: 'inherit',
        overflow: 'hidden',
        ...sx,
      }}
      {...other}
    >
      <Skeleton
        variant={variant}
        sx={{
          width: 1,
          height: 1,
          borderRadius: variant === 'circular' ? '50%' : 'inherit',
        }}
      />
    </Box>
  );
}
