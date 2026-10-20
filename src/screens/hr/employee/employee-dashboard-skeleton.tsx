import { Box, Paper, Skeleton } from '@mui/material';

import { employeeMetricGridSx } from './profileDashboardComponent/ProfileOverview';

export default function EmployeeDashboardSkeleton() {
  return (
    <Box role="status" aria-label="Loading staff dashboard" sx={{ minWidth: 0 }}>
      <Box sx={employeeMetricGridSx}>
        {Array.from({ length: 4 }, (_, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Skeleton width="65%" height={22} />
            <Skeleton width="45%" height={28} sx={{ my: 0.75 }} />
            <Skeleton width="85%" height={18} />
          </Paper>
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
          gap: 1.5,
          mt: 1.5,
        }}
      >
        <Skeleton variant="rounded" height={380} />
        <Skeleton variant="rounded" height={380} />
      </Box>
      <Skeleton variant="rounded" height={80} sx={{ mt: 1.5 }} />
    </Box>
  );
}
