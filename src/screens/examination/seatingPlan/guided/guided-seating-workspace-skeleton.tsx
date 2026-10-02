import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

const STEP_WIDTHS = ['72%', '58%', '66%', '54%'];

export function GuidedSeatingWorkspaceSkeleton() {
  return (
    <Paper
      role="status"
      aria-busy="true"
      aria-label="Loading seating plan workspace"
      variant="outlined"
      sx={{
        flex: 1,
        minHeight: 520,
        overflow: 'hidden',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LinearProgress aria-label="Loading seating plan data" />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" spacing={1}>
            {STEP_WIDTHS.map((width) => (
              <Stack key={width} spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="text" width={width} height={24} animation="wave" />
              </Stack>
            ))}
          </Stack>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
              Loading seating plan workspace…
            </Typography>
            <Skeleton variant="text" width="68%" height={24} animation="wave" />
          </Box>
          <Skeleton variant="rounded" height={48} animation="wave" />
          <Stack spacing={1.25}>
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={58} animation="wave" />
            ))}
          </Stack>
          <Skeleton variant="text" width="34%" height={32} animation="wave" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Skeleton variant="rounded" height={64} sx={{ flex: 1 }} animation="wave" />
            <Skeleton variant="rounded" height={64} sx={{ flex: 1 }} animation="wave" />
          </Stack>
          <Skeleton variant="rounded" height={132} animation="wave" />
        </Stack>
      </Box>
    </Paper>
  );
}
