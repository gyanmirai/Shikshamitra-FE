'use client';

import type { ReactNode } from 'react';

import { Box, Skeleton } from '@mui/material';

import { useDeferredRender } from '../hooks/useDeferredRender';

export function DeferredDashboardSection({ children }: { children: ReactNode }) {
  const { targetRef, shouldRender } = useDeferredRender();

  return (
    <Box
      ref={targetRef}
      sx={{ minHeight: 390, contentVisibility: 'auto', containIntrinsicSize: '390px' }}
    >
      {shouldRender ? children : <Skeleton variant="rounded" height={390} />}
    </Box>
  );
}
