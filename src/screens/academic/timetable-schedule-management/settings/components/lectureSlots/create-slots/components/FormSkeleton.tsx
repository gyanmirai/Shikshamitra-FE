import { Box, Grid, Stack, Skeleton } from '@mui/material';

export default function FormSkeleton() {
  return (
    <Box
      role="status"
      aria-label="Loading lecture slots"
      aria-busy="true"
      sx={{ minHeight: 0, overflowY: 'auto' }}
    >
      <Stack spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Skeleton width={220} height={36} />
        <Skeleton variant="rounded" height={68} />
        <Skeleton variant="rounded" height={72} />
        <Stack spacing={2} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Skeleton width={160} height={36} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="rounded" height={144} />
            </Grid>
          </Grid>
          <Skeleton width={160} height={36} />
          <Skeleton variant="rounded" height={240} />
        </Stack>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ px: { xs: 2, sm: 3 }, py: 1.5, borderTop: 1, borderColor: 'divider' }}
      >
        <Skeleton variant="rounded" width={80} height={30} />
        <Skeleton variant="rounded" width={80} height={30} />
      </Stack>
    </Box>
  );
}
