import { Box, Paper, Skeleton } from '@mui/material';

import EmployeeDashboardSkeleton from './employee-dashboard-skeleton';

export default function EmployeeViewSkeleton() {
  return (
    <Box role="status" aria-label="Loading staff profile">
      {/* Profile header card */}
      <Paper sx={{ p: 2, mb: 1, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0 }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Skeleton width={180} height={28} sx={{ maxWidth: '100%' }} />
              <Skeleton width={48} height={24} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                columnGap: 2,
                rowGap: 0.5,
                mt: 0.5,
              }}
            >
              <Skeleton width={180} height={22} sx={{ maxWidth: '100%' }} />
              <Skeleton width={100} height={22} sx={{ maxWidth: '100%' }} />
            </Box>
            <Skeleton width={360} height={22} sx={{ mt: 0.5, maxWidth: '100%' }} />
          </Box>
        </Box>
      </Paper>

      {/* Tabs skeleton */}
      <Paper elevation={2} sx={{ mb: 1, overflow: 'hidden' }}>
        <Box sx={{ px: 0.5, display: 'flex', gap: 0.5, overflow: 'hidden' }}>
          {Array.from({ length: 10 }, (_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                minHeight: 48,
                flexShrink: 0,
              }}
            >
              <Skeleton variant="circular" width={18} height={18} />
              <Skeleton width={76} height={22} />
            </Box>
          ))}
        </Box>
      </Paper>

      <EmployeeDashboardSkeleton />
    </Box>
  );
}
