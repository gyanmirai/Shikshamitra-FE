'use client';

import { styled } from '@mui/material/styles';
import { Box, Stack, Skeleton, Typography } from '@mui/material';

import { dailyStatus } from '../operational-dashboard-state';

// Keep placeholder geometry local to this dashboard and honour reduced motion.
export const DashboardSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: Number(theme.shape.borderRadius) / 2,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    '&::after': { animation: 'none' },
  },
}));

export function AttendanceSkeleton() {
  return (
    <Box aria-hidden="true" data-testid="attendance-skeleton" sx={{ mt: 2 }}>
      <DashboardSkeleton width={190} height={32} />
      <Box
        sx={{
          height: 210,
          mt: 1,
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-around',
          pb: 3,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {Array.from({ length: 7 }, (_, day) => (
          <DashboardSkeleton key={day} width="7%" height="70%" />
        ))}
      </Box>
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        columnGap={2}
        rowGap={0.75}
        sx={{ pt: 1.5 }}
      >
        {Object.entries(dailyStatus)
          .filter(([key]) => key !== 'Present')
          .map(([key, { label }]) => (
            <Stack key={key} direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {label}:
              </Typography>
              <DashboardSkeleton width={20} height={18} />
            </Stack>
          ))}
      </Stack>
      <DashboardSkeleton width="65%" height={18} sx={{ mt: 1 }} />
    </Box>
  );
}

export function PayrollSkeleton() {
  return (
    <Stack aria-hidden="true" data-testid="payroll-skeleton" spacing={1.5}>
      <DashboardSkeleton variant="text" width={120} height={22} />
      <Box>
        <DashboardSkeleton width={100} height={40} />
        <Typography variant="body2" color="text.secondary">
          staff reviewed or locked
        </Typography>
      </Box>
      <Box sx={{ minHeight: { xs: 72, sm: 50 } }}>
        <DashboardSkeleton width={110} height={24} />
        <DashboardSkeleton variant="text" width="85%" height={22} sx={{ mt: 0.5 }} />
      </Box>
      <DashboardSkeleton height={8} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 1.5,
          pt: 1.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {['Reviewed', 'Locked', 'Pending'].map((label) => (
          <Box key={label}>
            <DashboardSkeleton width={36} height={28} />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
