'use client';

import { Box, Grid, Card, Stack, Skeleton } from '@mui/material';

export function StudentAnalyticsSkeleton() {
  return (
    <Stack spacing={1}>
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="circular" width={84} height={84} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="35%" height={28} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rectangular" height={8} sx={{ mt: 2, borderRadius: 1 }} />
          </Box>
        </Stack>
      </Card>
      <Grid container spacing={1}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="35%" height={34} />
              <Skeleton variant="text" width="80%" />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
