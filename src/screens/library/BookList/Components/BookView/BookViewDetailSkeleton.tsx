import { Box, Grid, Card, Skeleton } from '@mui/material';

export function BookViewDetailSkeleton() {
  return (
    <>
      <Box sx={{ bgcolor: 'background.paper', width: '100%', mb: 1, p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={180} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            {['60%', '40%', '50%', '35%', '45%'].map((width) => (
              <Skeleton key={width} variant="text" width={width} height={24} sx={{ mb: 1 }} />
            ))}
          </Grid>
        </Grid>
      </Box>
      <Card sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((id) => (
            <Grid key={id} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Card>
    </>
  );
}
