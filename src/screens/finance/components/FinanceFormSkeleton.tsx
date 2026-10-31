'use client';

import type { ReactNode } from 'react';

import { Box, Grid, Paper, Stack, Skeleton } from '@mui/material';

type Field = { columns?: number; md?: number; height?: number; toggle?: boolean };

export function FinanceFieldSkeleton({
  loading,
  label,
  children,
}: {
  loading: boolean;
  label: string;
  children: ReactNode;
}) {
  return loading ? (
    <FinanceFormSkeleton label={label}>
      <FinanceSkeletonFields fields={[{}]} />
    </FinanceFormSkeleton>
  ) : (
    children
  );
}

/** Layout primitives for fetch placeholders; never driven by a mutation state. */
export function FinanceSkeletonFields({ fields }: { fields: Field[] }) {
  return (
    <Grid container spacing={2} aria-hidden="true">
      {fields.map(({ columns = 12, md = columns, height = 40, toggle }, index) => (
        <Grid key={index} size={{ xs: 12, sm: columns, md }}>
          {toggle ? (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: height }}>
              <Skeleton variant="rounded" width={34} height={20} sx={{ borderRadius: 10 }} />
              <Skeleton width="50%" height={20} />
            </Stack>
          ) : (
            <Skeleton variant="rounded" height={height} />
          )}
        </Grid>
      ))}
    </Grid>
  );
}

export function FinanceSkeletonSection({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, minWidth: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} aria-hidden="true">
        <Skeleton variant="rounded" width={20} height={20} />
        <Skeleton width={180} height={24} sx={{ maxWidth: '65%' }} />
        <Skeleton variant="circular" width={14} height={14} />
        {action && <Box sx={{ ml: 'auto !important' }}>{action}</Box>}
      </Stack>
      <Stack spacing={2}>{children}</Stack>
    </Paper>
  );
}

export function FinanceSkeletonRows({
  columns = 4,
  rows = 3,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <Stack spacing={1.5} aria-hidden="true">
      {Array.from({ length: rows }, (_, row) => (
        <Box
          key={row}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: `repeat(${columns}, minmax(0, 1fr))` },
            gap: 1.5,
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} variant="rounded" height={40} />
          ))}
        </Box>
      ))}
    </Stack>
  );
}

export default function FinanceFormSkeleton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Stack
      role="status"
      aria-label={label}
      aria-busy
      spacing={2}
      sx={{
        minWidth: 0,
        '@media (prefers-reduced-motion: reduce)': { '& .MuiSkeleton-root': { animation: 'none' } },
      }}
    >
      {children}
    </Stack>
  );
}
