'use client';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

import { getDashboardSnapshotEmptyStateCopy } from '../hr-dashboard-preview-state';

type SnapshotQuickLink = {
  label: string;
  href: string;
  icon: string;
};

const defaultQuickLinks: SnapshotQuickLink[] = [
  {
    label: 'Attendance',
    href: hrPaths.attendance.markAttendance,
    icon: 'solar:calendar-mark-linear',
  },
  {
    label: 'Leave approvals',
    href: hrPaths.leaveManagement.approvals,
    icon: 'solar:clipboard-check-linear',
  },
  {
    label: 'Payroll',
    href: hrPaths.payroll.runPayroll,
    icon: 'solar:wallet-money-linear',
  },
];

export const HrDashboardSnapshotEmptyState = ({
  status,
  isRefreshing,
  quickLinks = defaultQuickLinks,
}: {
  status?: string;
  isRefreshing?: boolean;
  quickLinks?: SnapshotQuickLink[];
}) => {
  const state = getDashboardSnapshotEmptyStateCopy({ status, isRefreshing });

  return (
    <Card
      sx={{
        p: 3,
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: `${state.tone}.main`,
            bgcolor: `${state.tone}.lighter`,
          }}
        >
          <Iconify icon={state.icon} width={26} />
        </Box>
        <Box>
          <Typography variant="h6">{state.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {state.description}
          </Typography>
        </Box>
        {quickLinks.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {quickLinks.map((link) => (
              <Button
                key={`${link.href}-${link.label}`}
                component={Link}
                href={link.href}
                variant="outlined"
                size="small"
                startIcon={<Iconify icon={link.icon} />}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
};
