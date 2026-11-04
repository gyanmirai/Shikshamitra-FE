import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Stack, Skeleton } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function SubjectOverviewSkeleton() {
  return (
    <Box
      role="status"
      aria-label="Loading subject overview"
      sx={{ height: 1, p: { xs: 1.5, sm: 2 } }}
    >
      <Scrollbar sx={{ height: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2}>
              {[0, 1, 2, 3].map((key) => (
                <FormSectionCard key={key} title={<Skeleton width={180} height={44} />}>
                  <Skeleton width="90%" />
                  <Skeleton width="65%" />
                </FormSectionCard>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <FormSectionCard title={<Skeleton width={160} height={44} />}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton width="65%" height={40} />
              </Stack>
            </FormSectionCard>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
}
