import { Box, Grid, Stack, Skeleton } from '@mui/material';

import FinanceFormSkeleton, { FinanceSkeletonRows } from './FinanceFormSkeleton';

export function FinanceListSkeleton({
  label,
  columns = 1,
  rows = 3,
}: {
  label: string;
  columns?: number;
  rows?: number;
}) {
  return (
    <FinanceFormSkeleton label={label}>
      <FinanceSkeletonRows columns={columns} rows={rows} />
    </FinanceFormSkeleton>
  );
}

export function FinancePageSkeleton({ label = 'Loading Finance' }: { label?: string }) {
  return (
    <FinanceFormSkeleton label={label}>
      <Stack direction="row" justifyContent="space-between" spacing={2} aria-hidden="true">
        <Skeleton width={180} height={36} />
        <Skeleton variant="rounded" width={112} height={36} />
      </Stack>
      <Skeleton variant="rounded" width="min(100%, 320px)" height={40} aria-hidden="true" />
      <FinanceSkeletonRows columns={4} rows={6} />
    </FinanceFormSkeleton>
  );
}

export function FinanceDashboardSkeleton() {
  return (
    <FinanceFormSkeleton label="Loading Finance dashboard">
      <Skeleton width={180} height={36} aria-hidden="true" />
      <Grid container spacing={2} aria-hidden="true">
        {[0, 1, 2, 3].map((card) => (
          <Grid key={card} size={{ xs: 6, md: 3 }}>
            <Skeleton variant="rounded" height={112} />
          </Grid>
        ))}
        {[0, 1].map((chart) => (
          <Grid key={chart} size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={260} />
          </Grid>
        ))}
      </Grid>
    </FinanceFormSkeleton>
  );
}

export function FinanceDocumentSkeleton({ label }: { label: string }) {
  return (
    <FinanceFormSkeleton label={label}>
      <Box
        aria-hidden="true"
        sx={{
          width: '100%',
          maxWidth: 560,
          mx: 'auto',
          minHeight: 240,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Skeleton width="45%" height={32} />
          <Skeleton width="65%" />
          <Skeleton variant="rounded" height={80} />
          <Skeleton width="75%" />
          <Skeleton width="55%" />
        </Stack>
      </Box>
    </FinanceFormSkeleton>
  );
}
