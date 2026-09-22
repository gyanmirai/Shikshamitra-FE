import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

const STEP_WIDTHS = ['72%', '58%', '66%', '54%'];
const SUMMARY_WIDTHS = ['64%', '48%', '72%', '56%', '68%'];

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
        <Stack
          spacing={3}
          sx={{
            width: 208,
            p: 2,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: { xs: 'none', md: 'flex' },
          }}
        >
          {STEP_WIDTHS.map((width) => (
            <Stack key={width} direction="row" spacing={1.25} alignItems="center">
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton variant="text" width={width} height={24} animation="wave" />
            </Stack>
          ))}
        </Stack>

        <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 2.5 } }}>
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

        <Stack
          spacing={2}
          sx={{
            width: 248,
            p: 2,
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: { xs: 'none', lg: 'flex' },
          }}
        >
          <Skeleton variant="text" width="76%" height={26} animation="wave" />
          {SUMMARY_WIDTHS.map((width) => (
            <Stack key={width} direction="row" justifyContent="space-between" spacing={2}>
              <Skeleton variant="text" width="42%" height={22} animation="wave" />
              <Skeleton variant="text" width={width} height={22} animation="wave" />
            </Stack>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}
