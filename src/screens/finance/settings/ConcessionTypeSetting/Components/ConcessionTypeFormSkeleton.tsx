import { Box, Grid, Paper, Stack, Skeleton } from '@mui/material';

export default function ConcessionTypeFormSkeleton({
  documentCount = 1,
}: {
  documentCount?: number;
}) {
  return (
    <Grid
      container
      spacing={3}
      role="status"
      aria-label="Loading concession type details"
      aria-busy
      sx={{
        '@media (prefers-reduced-motion: reduce)': { '& .MuiSkeleton-root': { animation: 'none' } },
      }}
    >
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={40} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Skeleton width={140} height={28} />
            <Skeleton variant="rounded" width={104} height={30} />
          </Stack>
          <Stack spacing={2}>
            {Array.from({ length: Math.max(1, documentCount) }, (_, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
              >
                <Skeleton variant="rounded" height={40} sx={{ flex: '1 1 220px' }} />
                <Skeleton variant="rounded" height={40} sx={{ flex: '1 1 220px' }} />
                <Skeleton variant="rounded" height={48} sx={{ flex: '2 1 300px' }} />
                <Skeleton variant="rounded" width={120} height={30} />
                <Skeleton variant="circular" width={24} height={24} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="rounded" height={90} />
      </Grid>
    </Grid>
  );
}
