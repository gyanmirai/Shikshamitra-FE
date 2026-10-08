'use client';

import { Grid, Paper, Stack, Skeleton } from '@mui/material';

/** Preserve the policy panel's section and field geometry while data loads. */
export default function FinancePolicySkeleton({
  label = 'Loading policy details',
  sections = 3,
}: {
  label?: string;
  sections?: number;
}) {
  return (
    <Stack role="status" aria-label={label} aria-busy spacing={2}>
      {Array.from({ length: sections }, (_, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Skeleton variant="rounded" width={20} height={20} />
            <Skeleton width="35%" height={28} />
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Skeleton variant="rounded" height={72} />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Stack>
  );
}
