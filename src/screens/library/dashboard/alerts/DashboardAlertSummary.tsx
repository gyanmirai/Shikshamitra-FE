import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Stack, Typography } from '@mui/material';

export function DashboardAlertSummary({ overview }: { overview?: LibraryDashboardOverview }) {
  const items = [
    {
      label: `${overview?.circulation.overdueIssues || 0} Overdue`,
      icon: 'solar:alarm-linear',
      color: 'error.main',
    },
    {
      label: `${overview?.reservations.activeReservations || 0} Reservations`,
      icon: 'solar:calendar-mark-linear',
      color: 'info.main',
    },
    {
      label: `${overview?.stockTotals.damagedCopies || 0} Damaged`,
      icon: 'solar:shield-warning-linear',
      color: 'warning.main',
    },
  ];
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        px: 1,
        py: 1.5,
        flexWrap: 'wrap',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {items.map((item) => (
        <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
          <Iconify icon={item.icon} width={16} sx={{ color: item.color }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
